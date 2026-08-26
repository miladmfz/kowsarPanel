import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-dashboard-page-header',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row mb-3">
      <div class="col-12">
        <div class="page-title-box kws-page-head">
          <div>
            <h4 class="page-title mb-1">داشبورد سانترال</h4>
            <div class="text-muted small">
              گزارش فارسی تماس‌ها، عملکرد داخلی‌ها، تماس‌های بی‌پاسخ و ضبط مکالمات
            </div>
          </div>

          <div class="kws-page-actions">
            <div class="kws-date-preview">
              <i class="mdi mdi-calendar-month-outline"></i>
              از {{ filterFa?.startdate || '-' }} تا {{ filterFa?.enddate || '-' }}
            </div>

            <button
              type="button"
              class="btn btn-outline-secondary kws-refresh-btn"
              (click)="loadFull.emit()"
              [disabled]="recentLoading || missedLoading">
              <i class="mdi mdi-database-search-outline"></i>
              بارگذاری کامل برای جستجو
            </button>

            <button
              type="button"
              class="btn btn-primary kws-refresh-btn"
              (click)="refresh.emit()"
              [disabled]="loading">
              <i class="mdi mdi-refresh" [class.kws-spin]="loading"></i>
              بروزرسانی
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardPageHeaderComponent {
  @Input() filterFa: any = {};
  @Input() loading = false;
  @Input() recentLoading = false;
  @Input() missedLoading = false;

  @Output() refresh = new EventEmitter<void>();
  @Output() loadFull = new EventEmitter<void>();
}
