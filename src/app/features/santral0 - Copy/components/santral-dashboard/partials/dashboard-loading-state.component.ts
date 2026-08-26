import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-dashboard-loading-state',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (busy) {
      <div class="kws-dashboard-loading-state" role="status" aria-live="polite">
        <div class="kws-dashboard-loading-head">
          <div class="kws-dashboard-loading-icon">
            <span class="spinner-border spinner-border-sm"></span>
          </div>

          <div class="kws-dashboard-loading-text">
            <strong>{{ currentTitle }}</strong>
            <span>{{ currentSubtitle }}</span>
          </div>
        </div>

        <div class="kws-dashboard-loading-progress">
          <div [style.width]="progressWidth"></div>
        </div>

        <div class="kws-dashboard-loading-steps">
          <span [class.active]="primaryLoading" [class.done]="!primaryLoading && (recentLoading || missedLoading)">
            <i class="mdi mdi-chart-box-outline"></i>
            آمار اصلی
          </span>

          <span [class.active]="missedLoading">
            <i class="mdi mdi-phone-missed-outline"></i>
            تماس‌های پیگیری
          </span>

          <span [class.active]="recentLoading">
            <i class="mdi mdi-history"></i>
            آخرین تماس‌ها
          </span>
        </div>
      </div>
    }
  `
})
export class DashboardLoadingStateComponent {
  @Input() busy = false;
  @Input() primaryLoading = false;
  @Input() missedLoading = false;
  @Input() recentLoading = false;

  get currentTitle(): string {
    if (this.primaryLoading) {
      return 'در حال آماده‌سازی آمار داشبورد...';
    }

    if (this.missedLoading) {
      return 'در حال دریافت تماس‌های نیازمند پیگیری...';
    }

    if (this.recentLoading) {
      return 'در حال دریافت آخرین تماس‌ها...';
    }

    return 'در حال بروزرسانی داشبورد...';
  }

  get currentSubtitle(): string {
    if (this.primaryLoading) {
      return 'لطفاً چند لحظه صبر کنید؛ صفحه خراب نشده و گزارش در حال پردازش است.';
    }

    if (this.missedLoading || this.recentLoading) {
      return 'اطلاعات جدول‌ها در حال بارگذاری است. می‌توانید منتظر بمانید تا گزارش کامل شود.';
    }

    return 'درخواست شما ثبت شده و سیستم در حال دریافت اطلاعات است.';
  }

  get progressWidth(): string {
    if (this.primaryLoading) {
      return '34%';
    }

    if (this.missedLoading) {
      return '68%';
    }

    if (this.recentLoading) {
      return '92%';
    }

    return '18%';
  }
}
