import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { Subscription, filter } from 'rxjs';
import { WebPhoneLine } from 'src/app/features/santral/models/webphone.models';
import { WebPhoneService } from 'src/app/features/santral/services/webphone.service';

@Component({
  selector: 'app-persistent-phone-dock',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (shouldShow()) {
      <aside class="kws-persistent-phone" dir="rtl">
        <button type="button" class="kws-persistent-phone-main" (click)="openPhonePage()">
          <span class="kws-persistent-phone-icon" [class.is-ringing]="isRinging()">
            <i class="mdi" [class.mdi-phone-ring]="isRinging()" [class.mdi-phone-in-talk-outline]="!isRinging()"></i>
          </span>

          <span class="kws-persistent-phone-copy">
            <small>{{ statusText() }}</small>
            <strong>{{ activeLine()?.name || 'تماس تلفنی' }}</strong>
            <b dir="ltr">{{ activeLine()?.number || '—' }}</b>
          </span>
        </button>

        <div class="kws-persistent-phone-actions">
          <button type="button" class="is-open" (click)="openPhonePage()">
            <i class="mdi mdi-open-in-app"></i>
            {{ isRinging() ? 'مشاهده و پاسخ' : 'باز کردن تلفن' }}
          </button>

          <button type="button" class="is-end" (click)="hangup($event)">
            <i class="mdi mdi-phone-hangup"></i>
            قطع تماس
          </button>
        </div>
      </aside>
    }
  `,
  styles: [`
    :host { position: relative; z-index: 1090; }

    .kws-persistent-phone {
      position: fixed;
      left: 18px;
      bottom: 18px;
      width: min(360px, calc(100vw - 36px));
      padding: 12px;
      border-radius: 18px;
      border: 1px solid rgba(37, 99, 235, .22);
      background: rgba(255, 255, 255, .97);
      box-shadow: 0 22px 60px rgba(15, 23, 42, .22);
      backdrop-filter: blur(16px);
      animation: kws-phone-dock-enter .22s ease-out;
    }

    .kws-persistent-phone-main {
      width: 100%;
      padding: 0;
      border: 0;
      background: transparent;
      display: flex;
      align-items: center;
      gap: 11px;
      text-align: right;
    }

    .kws-persistent-phone-icon {
      width: 48px;
      height: 48px;
      flex: 0 0 48px;
      display: grid;
      place-items: center;
      border-radius: 15px;
      color: #fff;
      background: linear-gradient(135deg, #2563eb, #1d4ed8);
      box-shadow: 0 10px 24px rgba(37, 99, 235, .28);
    }

    .kws-persistent-phone-icon.is-ringing {
      background: linear-gradient(135deg, #f59e0b, #d97706);
      animation: kws-phone-dock-ring 1s infinite;
    }

    .kws-persistent-phone-icon i { font-size: 25px; }

    .kws-persistent-phone-copy {
      min-width: 0;
      display: flex;
      flex: 1;
      flex-direction: column;
      gap: 1px;
    }

    .kws-persistent-phone-copy small { color: #64748b; font-size: 10px; font-weight: 850; }
    .kws-persistent-phone-copy strong {
      color: #0f172a;
      font-size: 14px;
      font-weight: 950;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .kws-persistent-phone-copy b { color: #1d4ed8; font-size: 16px; font-weight: 1000; }

    .kws-persistent-phone-actions {
      margin-top: 10px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }

    .kws-persistent-phone-actions button {
      min-height: 36px;
      border: 0;
      border-radius: 11px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      color: #fff;
      font-size: 11px;
      font-weight: 900;
    }

    .kws-persistent-phone-actions .is-open { background: #2563eb; }
    .kws-persistent-phone-actions .is-end { background: #dc2626; }

    :host-context([data-bs-theme="dark"]) .kws-persistent-phone {
      background: rgba(15, 23, 42, .97);
      border-color: rgba(96, 165, 250, .24);
    }
    :host-context([data-bs-theme="dark"]) .kws-persistent-phone-copy strong { color: #e2e8f0; }

    @media (max-width: 576px) {
      .kws-persistent-phone { left: 10px; right: 10px; bottom: 10px; width: auto; }
    }

    @keyframes kws-phone-dock-enter {
      from { opacity: 0; transform: translateY(12px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes kws-phone-dock-ring {
      0%, 100% { transform: rotate(0); }
      20% { transform: rotate(-7deg); }
      40% { transform: rotate(7deg); }
      60% { transform: rotate(-4deg); }
      80% { transform: rotate(4deg); }
    }
  `]
})
export class PersistentPhoneDockComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  protected readonly webPhoneService = inject(WebPhoneService);

  private readonly currentUrl = signal(this.router.url);
  private routerSubscription?: Subscription;

  ngOnInit(): void {
    this.routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.currentUrl.set(this.router.url));
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  activeLine(): WebPhoneLine | null {
    return this.webPhoneService.lines().find(line => line.status === 'incoming')
      ?? this.webPhoneService.lines().find(line => line.status === 'active' || line.status === 'held')
      ?? this.webPhoneService.lines().find(line => !!line.session)
      ?? null;
  }

  shouldShow(): boolean {
    return !!this.activeLine() && !this.currentUrl().includes('/santral/santral-phone');
  }

  isRinging(): boolean {
    const status = this.activeLine()?.status;
    return status === 'incoming' || status === 'ringing';
  }

  statusText(): string {
    const line = this.activeLine();
    if (!line) {
      return '';
    }

    if (line.status === 'incoming' || line.status === 'ringing') {
      return 'تماس ورودی';
    }
    if (line.status === 'held') {
      return 'تماس در انتظار';
    }
    if (line.status === 'dialing') {
      return 'در حال شماره‌گیری';
    }
    return 'تماس فعال';
  }

  openPhonePage(): void {
    void this.router.navigate(['/santral/santral-phone']);
  }

  hangup(event: Event): void {
    event.stopPropagation();
    const line = this.activeLine();
    if (!line?.session) {
      return;
    }

    try {
      line.session.terminate();
    } catch {
      // Session events normally clear the line. This fallback keeps the dock usable.
      this.webPhoneService.updateLine(line.index, {
        session: null,
        status: 'ended',
        held: false,
        muted: false
      });
    }
  }
}
