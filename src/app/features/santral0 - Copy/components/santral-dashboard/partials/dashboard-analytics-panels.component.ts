import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { displayJalaliDate } from '../../../shared/utils/santral-date.util';
import { secondsToFaText } from '../../../shared/utils/santral-format.util';
import {
  getCallTypeBadgeClass,
  getCallTypeTitle
} from '../../../shared/utils/santral-status.util';

@Component({
  selector: 'app-dashboard-analytics-panels',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="row g-3 mb-3">
      <div class="col-xl-6">
        <div class="card h-100">
          <div class="card-body">
            <div class="kws-section-title">
              <div>
                <h5>ترافیک تماس بر اساس ساعت</h5>
                <span>شلوغ‌ترین ساعت‌های تماس در بازه انتخابی</span>
              </div>
              <i class="mdi mdi-clock-outline"></i>
            </div>

            @if (primaryLoading) {
              <div class="kws-skeleton-chart">
                @for (row of skeletonRows; track row) {
                  <span></span>
                }
              </div>
            }

            @if (!primaryLoading && hourlyStats.length === 0) {
              <div class="kws-empty">اطلاعاتی برای نمایش وجود ندارد</div>
            }

            @if (hourlyStats.length > 0) {
              <div class="kws-bar-list">
                @for (item of hourlyStats; track $index) {
                  <div class="kws-bar-row">
                    <div class="kws-bar-label">{{ formatHour(item) }}</div>
                    <div class="kws-bar-track">
                      <div class="kws-bar-fill" [style.width]="barWidth(item.call_count, maxHourlyCount)"></div>
                    </div>
                    <div class="kws-bar-value">{{ item.call_count | number }}</div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <div class="col-xl-6">
        <div class="card h-100">
          <div class="card-body">
            <div class="kws-section-title">
              <div>
                <h5>تفکیک نوع تماس</h5>
                <span>ورودی، خروجی، داخلی، منوی صوتی و انتقالی</span>
              </div>
              <i class="mdi mdi-chart-donut"></i>
            </div>

            @if (primaryLoading) {
              <div class="kws-skeleton-list">
                @for (row of skeletonRows; track row) {
                  <span></span>
                }
              </div>
            }

            @if (!primaryLoading && callTypes.length === 0) {
              <div class="kws-empty">اطلاعاتی برای نمایش وجود ندارد</div>
            }

            @if (callTypes.length > 0) {
              <div class="kws-type-list">
                @for (item of callTypes; track $index) {
                  <div class="kws-type-row">
                    <div class="kws-type-head">
                      <span class="kws-type-badge" [ngClass]="getCallTypeClass(item.call_type)">
                        {{ getCallTypeTitle(item.call_type) }}
                      </span>
                      <strong>{{ item.call_count | number }}</strong>
                    </div>

                    <div class="kws-type-progress">
                      <div [style.width]="barWidth(item.call_count, maxCallTypeCount)"></div>
                    </div>

                    <div class="kws-type-sub">
                      پاسخ داده شده: {{ item.answered_calls | number }}
                      -
                      زمان مکالمه: {{ formatSeconds(item.total_billsec) }}
                    </div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>

    <div class="row g-3 mb-3">
      <div class="col-xl-6">
        <div class="card h-100">
          <div class="card-body">
            <div class="kws-section-title">
              <div>
                <h5>گزارش روزانه تماس‌ها</h5>
                <span>تاریخ‌ها به‌صورت شمسی نمایش داده می‌شوند</span>
              </div>
              <i class="mdi mdi-calendar-month-outline"></i>
            </div>

            @if (primaryLoading) {
              <div class="kws-skeleton-chart">
                @for (row of skeletonRows; track row) {
                  <span></span>
                }
              </div>
            }

            @if (!primaryLoading && dailyStats.length === 0) {
              <div class="kws-empty">اطلاعاتی برای نمایش وجود ندارد</div>
            }

            @if (dailyStats.length > 0) {
              <div class="kws-daily-list">
                @for (item of dailyStats; track $index) {
                  <div class="kws-daily-row">
                    <div class="kws-daily-date">{{ displayJalaliDate(item.call_date) }}</div>
                    <div class="kws-daily-track">
                      <div [style.width]="barWidth(item.total_calls, maxDailyCount)"></div>
                    </div>
                    <div class="kws-daily-count">{{ item.total_calls | number }}</div>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card h-100">
          <div class="card-body">
            <div class="kws-section-title compact">
              <div>
                <h5>بیشترین تماس‌گیرنده</h5>
                <span>شماره‌های پرتکرار</span>
              </div>
              <i class="mdi mdi-account-voice"></i>
            </div>

            @if (primaryLoading) {
              <div class="kws-skeleton-rank">
                @for (row of skeletonRows; track row) {
                  <span></span>
                }
              </div>
            }

            @if (!primaryLoading && topCallers.length === 0) {
              <div class="kws-empty">موردی یافت نشد</div>
            }

            @if (topCallers.length > 0) {
              <div class="kws-rank-list">
                @for (item of topCallers; track $index; let i = $index) {
                  <div class="kws-rank-row">
                    <span class="kws-rank-no">{{ i + 1 }}</span>
                    <div class="kws-rank-info">
                      <strong>{{ item.src || '-' }}</strong>
                      <div class="kws-rank-track">
                        <div [style.width]="barWidth(item.call_count, maxTopCallerCount)"></div>
                      </div>
                    </div>
                    <span class="kws-rank-count">{{ item.call_count | number }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6">
        <div class="card h-100">
          <div class="card-body">
            <div class="kws-section-title compact">
              <div>
                <h5>بیشترین مقصد</h5>
                <span>داخلی یا شماره مقصد</span>
              </div>
              <i class="mdi mdi-phone-forward-outline"></i>
            </div>

            @if (primaryLoading) {
              <div class="kws-skeleton-rank">
                @for (row of skeletonRows; track row) {
                  <span></span>
                }
              </div>
            }

            @if (!primaryLoading && topReceivers.length === 0) {
              <div class="kws-empty">موردی یافت نشد</div>
            }

            @if (topReceivers.length > 0) {
              <div class="kws-rank-list">
                @for (item of topReceivers; track $index; let i = $index) {
                  <div class="kws-rank-row">
                    <span class="kws-rank-no">{{ i + 1 }}</span>
                    <div class="kws-rank-info">
                      <strong>{{ item.dst || '-' }}</strong>
                      <div class="kws-rank-track">
                        <div [style.width]="barWidth(item.call_count, maxTopReceiverCount)"></div>
                      </div>
                    </div>
                    <span class="kws-rank-count">{{ item.call_count | number }}</span>
                  </div>
                }
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardAnalyticsPanelsComponent {
  readonly skeletonRows = [1, 2, 3, 4, 5, 6];
  @Input() primaryLoading = false;
  @Input() hourlyStats: any[] = [];
  @Input() callTypes: any[] = [];
  @Input() dailyStats: any[] = [];
  @Input() topCallers: any[] = [];
  @Input() topReceivers: any[] = [];
  @Input() maxHourlyCount = 0;
  @Input() maxCallTypeCount = 0;
  @Input() maxDailyCount = 0;
  @Input() maxTopCallerCount = 0;
  @Input() maxTopReceiverCount = 0;

  barWidth(value: any, max: number): string {
    const current = Number(value) || 0;
    const base = Number(max) || 0;

    if (base <= 0 || current <= 0) {
      return '0%';
    }

    return `${Math.max(5, Math.round((current / base) * 100))}%`;
  }

  formatSeconds(value: any): string {
    return secondsToFaText(value);
  }

  formatHour(item: any): string {
    const rawHour = this.pickHourValue(item);
    const value = Number(rawHour);

    if (!Number.isFinite(value)) {
      return '-';
    }

    const normalizedHour = Math.max(0, Math.min(23, Math.trunc(value)));
    return `${normalizedHour.toString().padStart(2, '0')}:00`;
  }

  private pickHourValue(item: any): any {
    if (item == null) {
      return null;
    }

    return item.hour
      ?? item.call_hour
      ?? item.CallHour
      ?? item.callHour
      ?? item.HOUR
      ?? item.hour_key
      ?? null;
  }

  displayJalaliDate(value: any): string {
    return displayJalaliDate(value);
  }

  getCallTypeTitle(value: string): string {
    return getCallTypeTitle(value);
  }

  getCallTypeClass(value: string): string {
    return getCallTypeBadgeClass(value);
  }
}
