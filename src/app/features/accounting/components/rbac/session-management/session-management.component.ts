import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { AuthSessionRecord } from 'src/app/auth-kowsar/auth-api.models';
import { AuthKowsarWebApiService } from 'src/app/auth-kowsar/services/AuthKowsarWebApi.service';

@Component({
  selector: 'app-session-management',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './session-management.component.html',
  styleUrl: './session-management.component.css',
})
export class SessionManagementComponent implements OnInit {
  readonly sessions = signal<AuthSessionRecord[]>([]);
  readonly loading = signal(false);
  readonly includeInactive = signal(false);
  readonly revokingSessionId = signal('');
  readonly revokingSubject = signal('');

  private readonly api = inject(AuthKowsarWebApiService);
  private readonly notifications = inject(NotificationService);
  private readonly storage = inject(SessionStorageService);
  private readonly router = inject(Router);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.api.GetAuthSessions(this.includeInactive(), 300)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: response => this.sessions.set(response.sessions ?? []),
        error: () => this.notifications.error('دریافت نشست‌های ورود ناموفق بود.'),
      });
  }

  toggleInactive(event: Event): void {
    this.includeInactive.set((event.target as HTMLInputElement).checked);
    this.load();
  }

  revoke(session: AuthSessionRecord): void {
    if (!window.confirm(`نشست ${session.displayName || session.subject} قطع شود؟`)) return;

    this.revokingSessionId.set(session.sessionId);
    this.api.RevokeAuthSession(session.sessionId)
      .pipe(finalize(() => this.revokingSessionId.set('')))
      .subscribe({
        next: () => {
          this.notifications.success('نشست انتخاب‌شده قطع شد.');
          if (session.sessionId === this.storage.authSessionId) {
            this.storage.clearAuthentication();
            void this.router.navigateByUrl(this.storage.loginRoute);
            return;
          }
          this.load();
        },
        error: () => this.notifications.error('قطع نشست ناموفق بود.'),
      });
  }

  revokeAll(session: AuthSessionRecord): void {
    if (!window.confirm(`همه نشست‌های ${session.displayName || session.subject} قطع شوند؟`)) return;

    this.revokingSubject.set(session.subject);
    this.api.RevokeAllAuthSessions(session.subject)
      .pipe(finalize(() => this.revokingSubject.set('')))
      .subscribe({
        next: () => {
          this.notifications.success('همه نشست‌های کاربر قطع شدند.');
          if (session.subject === this.storage.authSubject) {
            this.storage.clearAuthentication();
            void this.router.navigateByUrl(this.storage.loginRoute);
            return;
          }
          this.load();
        },
        error: () => this.notifications.error('قطع نشست‌های کاربر ناموفق بود.'),
      });
  }

  isCurrent(session: AuthSessionRecord): boolean {
    return session.sessionId === this.storage.authSessionId;
  }

  deviceLabel(session: AuthSessionRecord): string {
    const agent = session.userAgent ?? '';
    const browser = agent.includes('Edg/') ? 'Edge'
      : agent.includes('Chrome/') ? 'Chrome'
        : agent.includes('Firefox/') ? 'Firefox'
          : agent.includes('Safari/') ? 'Safari'
            : 'مرورگر ناشناس';
    const system = agent.includes('Windows') ? 'Windows'
      : agent.includes('Android') ? 'Android'
        : /iPhone|iPad/.test(agent) ? 'iOS'
          : agent.includes('Mac OS') ? 'macOS'
            : agent.includes('Linux') ? 'Linux'
              : 'سیستم ناشناس';
    return `${browser} / ${system}`;
  }

  statusLabel(status: AuthSessionRecord['status']): string {
    if (status === 'ACTIVE') return 'فعال';
    if (status === 'REVOKED') return 'قطع‌شده';
    return 'منقضی';
  }
}
