import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SantralBaseFilter } from '../../../services/santralapi.service';

@Component({
  selector: 'app-dashboard-filter-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="card kws-filter-card kws-dashboard-filter-clean">
      <div class="card-body">

        <div class="kws-dashboard-filter-head">
          <div class="kws-dashboard-filter-title-mini">
            <span class="kws-filter-mini-icon">
              <i class="mdi mdi-filter-variant"></i>
            </span>
            <div>
              <strong>فیلتر گزارش</strong>
              <small>تغییر فیلتر فقط گزارش همین بخش را دوباره از API می‌خواند.</small>
            </div>
          </div>

          <div class="kws-dashboard-filter-actions-top">
            <button type="button" class="btn btn-success kws-run-report-btn" (click)="load.emit()" [disabled]="loading">
              <i class="mdi mdi-magnify"></i>
              <span>نمایش گزارش</span>
            </button>

            <button type="button" class="btn btn-light kws-reset-filter-btn" (click)="reset.emit()" [disabled]="loading" title="حذف فیلترها">
              <i class="mdi mdi-filter-remove-outline"></i>
            </button>
          </div>
        </div>

        <div class="kws-dashboard-filter-main">
          <div class="kws-dashboard-main-search">
            <label class="kws-filter-inline-label">جستجو</label>
            <div class="kws-dashboard-input-wrap">
              <i class="mdi mdi-magnify"></i>
              <input
                type="text"
                class="form-control"
                placeholder="شماره، مقصد، DID، مسیر تماس..."
                [(ngModel)]="filter.SearchTarget"
                [disabled]="loading"
                (keydown.enter)="load.emit()">
            </div>
          </div>

          <div class="kws-dashboard-main-dates">
            <button type="button" class="kws-dashboard-date-chip" (click)="setToday.emit()" [disabled]="loading">
              <i class="mdi mdi-calendar-today-outline"></i>
              امروز
            </button>

            <button type="button" class="kws-dashboard-date-chip" (click)="setLastDay.emit()" [disabled]="loading">
              روز قبل
            </button>

            <button type="button" class="kws-dashboard-date-chip" (click)="setLast7Days.emit()" [disabled]="loading">
              ۷ روز اخیر
            </button>

            <button type="button" class="kws-dashboard-date-chip" (click)="setLast30Days.emit()" [disabled]="loading">
              ۳۰ روز اخیر
            </button>
          </div>

          <details class="kws-dashboard-more-filter" dir="rtl">
            <summary>
              <i class="mdi mdi-tune-variant"></i>
              <span>فیلتر بیشتر</span>
              <i class="mdi mdi-chevron-down kws-dashboard-more-chevron"></i>
            </summary>

            <div class="kws-dashboard-more-body">
              <div class="kws-dashboard-more-grid">

                <div class="kws-dashboard-filter-field">
                  <label class="form-label">از تاریخ شمسی</label>
                  <input
                    type="text"
                    class="form-control kws-date-input"
                    placeholder="۱۴۰۵/۰۴/۱۰"
                    inputmode="numeric"
                    dir="ltr"
                    [(ngModel)]="filterFa.startdate"
                    [disabled]="loading"
                    (keydown.enter)="load.emit()">
                </div>

                <div class="kws-dashboard-filter-field">
                  <label class="form-label">تا تاریخ شمسی</label>
                  <input
                    type="text"
                    class="form-control kws-date-input"
                    placeholder="۱۴۰۵/۰۴/۱۱"
                    inputmode="numeric"
                    dir="ltr"
                    [(ngModel)]="filterFa.enddate"
                    [disabled]="loading"
                    (keydown.enter)="load.emit()">
                </div>

                <div class="kws-dashboard-filter-field">
                  <label class="form-label">داخلی / سری داخلی</label>
                  <div class="kws-dashboard-input-wrap">
                    <i class="mdi mdi-phone-dial-outline"></i>
                    <input
                      type="text"
                      class="form-control"
                      placeholder="مثلاً ۴۰۲ یا ۴xx برای سری ۴۰۰"
                      [(ngModel)]="filter.extension"
                      [disabled]="loading"
                      (keydown.enter)="load.emit()">
                  </div>
                </div>

                <div class="kws-dashboard-filter-field">
                  <label class="form-label">نوع تماس</label>
                  <select class="form-select" [(ngModel)]="filter.CallType" [disabled]="loading">
                    @for (item of callTypeOptions; track item.value) {
                      <option [value]="item.value">{{ item.title }}</option>
                    }
                  </select>
                </div>

                <div class="kws-dashboard-filter-field">
                  <label class="form-label">وضعیت تماس</label>
                  <select class="form-select" [(ngModel)]="filter.disposition" [disabled]="loading">
                    @for (item of dispositionOptions; track item.value) {
                      <option [value]="item.value">{{ item.title }}</option>
                    }
                  </select>
                </div>

                <div class="kws-dashboard-more-actions">
                  <button type="button" class="btn btn-success" (click)="load.emit()" [disabled]="loading">
                    <i class="mdi mdi-magnify"></i>
                    اعمال
                  </button>

                  <button type="button" class="btn btn-outline-secondary" (click)="reset.emit()" [disabled]="loading" title="حذف فیلترها">
                    <i class="mdi mdi-filter-remove-outline"></i>
                  </button>
                </div>
              </div>

              <div class="kws-dashboard-section-line">
                <span>نوع تماس</span>
              </div>

              <div class="kws-dashboard-chip-scroll">
                @for (item of callTypeOptions; track item.value) {
                  <button
                    type="button"
                    class="kws-dashboard-filter-chip"
                    [class.active]="isCallTypeActive(item.value)"
                    [disabled]="loading"
                    (click)="selectCallType(item.value)">
                    <span>{{ item.title }}</span>
                    <small>{{ formatCount(getCallTypeCount(item.value)) }}</small>
                  </button>
                }
              </div>

              <div class="kws-dashboard-section-line">
                <span>وضعیت تماس</span>
              </div>

              <div class="kws-dashboard-chip-scroll">
                @for (item of dispositionOptions; track item.value) {
                  <button
                    type="button"
                    class="kws-dashboard-filter-chip status"
                    [class.active]="isDispositionActive(item.value)"
                    [disabled]="loading"
                    (click)="selectDisposition(item.value)">
                    <span>{{ item.title }}</span>
                    <small>{{ formatCount(getDispositionCount(item.value)) }}</small>
                  </button>
                }
              </div>

              <div class="kws-dashboard-section-line">
                <span>دسته‌بندی سری داخلی‌ها</span>
              </div>

              <div class="kws-dashboard-series-row">
                @for (item of extensionSeriesOptions; track item.value) {
                  <button
                    type="button"
                    class="kws-dashboard-series-chip"
                    [class.active]="isExtensionSeriesActive(item.value)"
                    [disabled]="loading"
                    (click)="selectExtensionSeries(item.value)">
                    <span>{{ item.title }}</span>
                    <small>{{ item.hint }}</small>
                  </button>
                }
              </div>
            </div>
          </details>
        </div>

        <div class="kws-dashboard-active-filters">
          <span class="kws-active-filter-pill">
            <i class="mdi mdi-calendar-range"></i>
            {{ filterFa.startdate || '-' }} تا {{ filterFa.enddate || '-' }}
          </span>

          @if (filter.extension) {
            <span class="kws-active-filter-pill blue">
              <i class="mdi mdi-phone-outline"></i>
              {{ getExtensionFilterTitle(filter.extension) }}
            </span>
          }

          @if (filter.CallType) {
            <span class="kws-active-filter-pill green">
              <i class="mdi mdi-phone-classic"></i>
              {{ getCallTypeTitle(filter.CallType) }}
            </span>
          }

          @if (filter.disposition) {
            <span class="kws-active-filter-pill orange">
              <i class="mdi mdi-list-status"></i>
              {{ getDispositionTitle(filter.disposition) }}
            </span>
          }
        </div>
      </div>
    </div>
  `
})
export class DashboardFilterCardComponent {
  @Input() filter: SantralBaseFilter = {};
  @Input() filterFa: any = {};
  @Input() loading = false;
  @Input() callTypeOptions: any[] = [];
  @Input() dispositionOptions: any[] = [];
  @Input() summary: any = {};
  @Input() callTypesStats: any[] = [];

  @Output() load = new EventEmitter<void>();
  @Output() reset = new EventEmitter<void>();
  @Output() setToday = new EventEmitter<void>();
  @Output() setLastDay = new EventEmitter<void>();
  @Output() setLast7Days = new EventEmitter<void>();
  @Output() setLast30Days = new EventEmitter<void>();

  readonly extensionSeriesOptions = [
    { value: '', title: 'همه سری‌ها', hint: 'همه' },
    { value: '1xx', title: 'سری ۱۰۰', hint: '۱xx' },
    { value: '2xx', title: 'سری ۲۰۰', hint: '۲xx' },
    { value: '3xx', title: 'سری ۳۰۰', hint: '۳xx' },
    { value: '4xx', title: 'سری ۴۰۰', hint: '۴xx' },
    { value: '5xx', title: 'سری ۵۰۰', hint: '۵xx' },
    { value: '6xx', title: 'سری ۶۰۰', hint: '۶xx' },
    { value: '7xx', title: 'سری ۷۰۰', hint: '۷xx' }
  ];

  selectCallType(value: string): void {
    if (this.loading) {
      return;
    }

    this.filter.CallType = (value ?? '') as SantralBaseFilter['CallType'];
    this.load.emit();
  }

  selectDisposition(value: string): void {
    if (this.loading) {
      return;
    }

    this.filter.disposition = (value ?? '') as SantralBaseFilter['disposition'];
    this.load.emit();
  }

  selectExtensionSeries(value: string): void {
    if (this.loading) {
      return;
    }

    // مقدارهای سری را به شکل 1xx / 2xx / 4xx می‌فرستیم
    // تا بک‌اند بتواند آن را به Prefix مثل 2% تبدیل کند.
    this.filter.extension = value ?? '';
    this.load.emit();
  }

  isCallTypeActive(value: string): boolean {
    return String(this.filter.CallType ?? '') === String(value ?? '');
  }

  isDispositionActive(value: string): boolean {
    return String(this.filter.disposition ?? '') === String(value ?? '');
  }

  isExtensionSeriesActive(value: string): boolean {
    return this.normalizeSeriesValue(this.filter.extension) === this.normalizeSeriesValue(value);
  }


  getExtensionFilterTitle(value: string | undefined): string {
    const normalized = this.normalizeSeriesValue(value);
    const series = this.extensionSeriesOptions.find(item => this.normalizeSeriesValue(item.value) === normalized && item.value);

    if (series) {
      return `داخلی: ${series.title}`;
    }

    return `داخلی: ${value || '-'}`;
  }

  private normalizeSeriesValue(value: any): string {
    return String(value ?? '')
      .trim()
      .toLowerCase()
      .replace(/[×]/g, 'x')
      .replace(/[۰-۹]/g, char => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(char)))
      .replace(/[٠-٩]/g, char => String('٠١٢٣٤٥٦٧٨٩'.indexOf(char)));
  }

  getCallTypeTitle(value: string): string {
    const normalized = this.normalize(value);
    const row = (this.callTypeOptions ?? []).find(item => this.normalize(item?.value) === normalized);
    return row?.title ?? value;
  }

  getDispositionTitle(value: string): string {
    const normalized = this.normalize(value);
    const row = (this.dispositionOptions ?? []).find(item => this.normalize(item?.value) === normalized);
    return row?.title ?? value;
  }

  getCallTypeCount(value: string): number | null {
    if (!value) {
      return this.toNumber(this.summary?.total_calls);
    }

    const normalized = this.normalize(value);
    const row = (this.callTypesStats ?? []).find(item =>
      this.normalize(item?.call_type ?? item?.CallType ?? item?.type ?? item?.name) === normalized
    );

    if (!row) {
      return null;
    }

    return this.toNumber(row?.call_count ?? row?.count ?? row?.total_calls);
  }

  getDispositionCount(value: string): number | null {
    const normalized = this.normalize(value);

    if (!normalized) {
      return this.toNumber(this.summary?.total_calls);
    }

    if (normalized === 'ANSWERED') {
      return this.toNumber(this.summary?.answered_calls);
    }

    if (normalized === 'NOANSWER' || normalized === 'NO ANSWER') {
      return this.toNumber(this.summary?.no_answer_calls);
    }

    if (normalized === 'BUSY') {
      return this.toNumber(this.summary?.busy_calls);
    }

    if (normalized === 'FAILED') {
      return this.toNumber(this.summary?.failed_calls);
    }

    if (normalized === 'CONGESTION') {
      const direct = this.toNumber(this.summary?.congestion_calls ?? this.summary?.network_error_calls);
      return direct > 0 ? direct : null;
    }

    return null;
  }

  formatCount(value: number | null): string {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
      return '-';
    }

    return Number(value).toLocaleString('fa-IR');
  }

  private toNumber(value: any): number {
    const normalized = String(value ?? '0')
      .replace(/[۰-۹]/g, char => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(char)))
      .replace(/[٠-٩]/g, char => String('٠١٢٣٤٥٦٧٨٩'.indexOf(char)))
      .replace(/,/g, '')
      .trim();

    const num = Number(normalized);
    return Number.isFinite(num) ? num : 0;
  }

  private normalize(value: any): string {
    return String(value ?? '')
      .trim()
      .replace(/[_-]/g, ' ')
      .replace(/\s+/g, ' ')
      .toUpperCase();
  }
}
