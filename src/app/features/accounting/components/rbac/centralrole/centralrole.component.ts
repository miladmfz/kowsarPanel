import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { CentralRoleConfiguration, CentralRoleOption } from 'src/app/auth-kowsar/auth-api.models';
import { AuthKowsarWebApiService } from 'src/app/auth-kowsar/services/AuthKowsarWebApi.service';

@Component({
  selector: 'app-centralrole',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './centralrole.component.html',
  styleUrl: './centralrole.component.css',
})
export class CentralroleComponent implements OnInit {
  protected readonly configuration = signal<CentralRoleConfiguration | null>(null);
  protected readonly selectedRoleRefs = signal<ReadonlySet<number>>(new Set<number>());
  protected readonly loading = signal(false);
  protected readonly saving = signal(false);
  protected readonly notice = signal('');
  protected readonly error = signal('');

  protected readonly dirty = computed(() => {
    const configuration = this.configuration();
    if (!configuration) return false;
    const selected = this.selectedRoleRefs();
    return configuration.roles.some(role => !role.locked && role.enabled !== selected.has(role.roleCode));
  });

  protected readonly enabledCount = computed(() => this.selectedRoleRefs().size);

  private readonly api = inject(AuthKowsarWebApiService);
  private readonly destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.clearMessages();
    this.api.GetCurrentCentralRoleConfiguration().pipe(
      finalize(() => this.loading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: configuration => this.applyConfiguration(configuration),
      error: error => this.error.set(this.errorMessage(error, 'دریافت نقش‌های Central انجام نشد.')),
    });
  }

  protected toggle(role: CentralRoleOption, event: Event): void {
    if (role.locked) return;
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set(this.selectedRoleRefs());
    checked ? next.add(role.roleCode) : next.delete(role.roleCode);
    this.selectedRoleRefs.set(next);
    this.clearMessages();
  }

  protected save(): void {
    const configuration = this.configuration();
    if (!configuration || !this.dirty() || this.saving()) return;
    if (!window.confirm('تغییر Roleهای Central روی ورودهای بعدی کاربران اثر می‌گذارد. ذخیره شود؟')) return;

    this.saving.set(true);
    this.clearMessages();
    this.api.UpdateCurrentCentralRoleConfiguration({
      enabledRoleRefs: [...this.selectedRoleRefs()].sort((left, right) => left - right),
      expectedVersion: configuration.version,
    }).pipe(
      finalize(() => this.saving.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: saved => {
        this.applyConfiguration(saved);
        this.notice.set('Roleهای Central با موفقیت ذخیره شدند. کاربران برای دریافت Claimهای جدید باید دوباره وارد شوند.');
      },
      error: error => this.error.set(this.errorMessage(error, 'ذخیره Roleهای Central انجام نشد.')),
    });
  }

  protected isPilotRole(role: CentralRoleOption): boolean {
    return role.roleName === 'REPORT_VIEWER';
  }

  private applyConfiguration(configuration: CentralRoleConfiguration): void {
    this.configuration.set(configuration);
    this.selectedRoleRefs.set(new Set(configuration.roles.filter(role => role.enabled).map(role => role.roleCode)));
  }

  private clearMessages(): void {
    this.notice.set('');
    this.error.set('');
  }

  private errorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse && error.status === 409)
      return 'تنظیمات توسط درخواست دیگری تغییر کرده است؛ بازخوانی کنید و دوباره تصمیم بگیرید.';
    if (error instanceof HttpErrorResponse && error.status === 403)
      return 'فقط Admin می‌تواند Roleهای Central را تغییر دهد.';
    return fallback;
  }
}
