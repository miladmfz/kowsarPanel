import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { BiWebApiService } from '../../../services/BiWebApi/BiWebApi.service';
import { BiDashboard, BiManagementPack } from '../../../services/BiWebApi/bi.models';

@Component({
  selector: 'app-bi-home', standalone: true, imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bi-home.component.html', styleUrl: './bi-home.component.scss',
})
export class BiHomeComponent {
  protected readonly permissions = inject(PermissionService);
  private readonly api = inject(BiWebApiService);
  private readonly router = inject(Router);
  protected readonly dashboards = signal<BiDashboard[]>([]);
  protected readonly packs = signal<BiManagementPack[]>([]);
  protected readonly loading = signal(true);
  protected readonly busyKey = signal('');
  protected readonly error = signal('');
  protected search = '';

  protected readonly filteredDashboards = computed(() => {
    const query = this.search.trim().toLocaleLowerCase('fa');
    return this.dashboards().filter(item => !query || `${item.title} ${item.packKey ?? ''}`.toLocaleLowerCase('fa').includes(query));
  });
  protected readonly favorites = computed(() => this.filteredDashboards().filter(item => item.isFavorite));
  protected readonly templates = computed(() => this.filteredDashboards().filter(item => item.isTemplate && item.publishState === 'Published'));
  protected readonly shared = computed(() => this.filteredDashboards().filter(item => !item.isOwner && !item.isTemplate));
  protected readonly owned = computed(() => this.filteredDashboards().filter(item => item.isOwner && !item.isTemplate));
  protected readonly recent = computed(() => this.filteredDashboards().filter(item => item.lastViewedAt)
    .sort((a, b) => (b.lastViewedAt ?? '').localeCompare(a.lastViewedAt ?? '')).slice(0, 6));
  protected readonly filteredPacks = computed(() => {
    const query = this.search.trim().toLocaleLowerCase('fa');
    return this.packs().filter(item => !query || `${item.title} ${item.domain} ${item.description}`.toLocaleLowerCase('fa').includes(query));
  });

  constructor() { this.load(); }

  protected install(pack: BiManagementPack): void {
    if (!this.permissions.canEditOwnBiDashboard) return;
    if (pack.isInstalled && pack.dashboardCode) { this.open(pack.dashboardCode); return; }
    this.busyKey.set(pack.packKey); this.error.set('');
    this.api.installManagementPack(pack.packKey).subscribe({
      next: dashboard => this.router.navigate(['/accounting/gozareshat/bi/workspace'], { queryParams: { dashboard: dashboard.dashboardCode } }),
      error: error => { this.error.set(error?.error?.error ?? error?.error?.Error ?? 'نصب Pack انجام نشد.'); this.busyKey.set(''); },
    });
  }

  protected toggleFavorite(dashboard: BiDashboard, event: Event): void {
    event.preventDefault(); event.stopPropagation();
    this.busyKey.set(`favorite-${dashboard.dashboardCode}`);
    this.api.setFavorite(dashboard.dashboardCode, !dashboard.isFavorite).subscribe({
      next: updated => { this.dashboards.update(items => items.map(item => item.dashboardCode === updated.dashboardCode ? updated : item)); this.busyKey.set(''); },
      error: () => { this.error.set('تغییر علاقه‌مندی انجام نشد.'); this.busyKey.set(''); },
    });
  }

  protected open(dashboardCode: number): void {
    this.router.navigate(['/accounting/gozareshat/bi/workspace'], { queryParams: { dashboard: dashboardCode } });
  }

  protected metricTitle(key: string): string {
    const labels: Record<string, string> = {
      'sales.net': 'فروش خالص', 'sales.invoice_count': 'تعداد فاکتور', 'sales.average_invoice': 'میانگین فاکتور', 'sales.return_rate': 'نرخ برگشت',
      'cash.net_flow': 'جریان نقد خالص', 'cash.received_amount': 'مبلغ دریافت', 'cash.receive_count': 'تعداد دریافت', 'cash.payment_count': 'تعداد پرداخت', 'cash.inflow_outflow_ratio': 'نسبت دریافت به پرداخت',
      'inventory.net_quantity': 'گردش خالص کالا', 'inventory.receipt_quantity': 'مقدار ورود', 'inventory.issue_quantity': 'مقدار خروج', 'inventory.issue_receipt_ratio': 'نسبت خروج به ورود',
      'purchase.net_amount': 'خرید خالص', 'purchase.invoice_count': 'تعداد سند خرید', 'purchase.average_invoice': 'میانگین خرید', 'purchase.return_rate': 'نرخ برگشت خرید',
      'operations.quote_amount': 'مبلغ پیش‌فاکتور', 'operations.conversion_rate': 'نرخ تبدیل', 'operations.quote_count': 'تعداد پیش‌فاکتور', 'operations.converted_count': 'تعداد تبدیل‌شده', 'operations.unconverted_count': 'تبدیل‌نشده',
    };
    return labels[key] ?? key;
  }

  private load(): void {
    forkJoin({ dashboards: this.api.getDashboards(), packs: this.api.getManagementPacks() }).subscribe({
      next: result => { this.dashboards.set(result.dashboards); this.packs.set(result.packs); this.loading.set(false); },
      error: error => { this.error.set(error?.error?.error ?? error?.error?.Error ?? 'بارگذاری BI Home انجام نشد.'); this.loading.set(false); },
    });
  }
}
