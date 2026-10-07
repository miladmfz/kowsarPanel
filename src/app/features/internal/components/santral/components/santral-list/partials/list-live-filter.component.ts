import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralListComponent } from '../santral-list.component';

@Component({
  selector: 'app-list-live-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <!-- Compact Toolbar + Filters -->
  <div class="kws-live-control-panel">

    <div class="kws-live-toolbar">
      <div class="kws-live-actions">

        <button type="button" class="btn kws-toolbar-btn kws-select-btn" (click)="vm.openManageModal()"
          title="انتخاب داخلی‌ها">
          <i class="mdi mdi-playlist-edit"></i>
          <span>انتخاب داخلی‌ها</span>
        </button>

        <button type="button" class="btn kws-toolbar-btn kws-auto-btn" [class.active]="vm.autoRefresh()"
          (click)="vm.toggleAutoRefresh()"
          [title]="vm.autoRefresh() ? 'بروزرسانی خودکار فعال' : 'بروزرسانی خودکار غیرفعال'">
          <i class="mdi" [ngClass]="vm.autoRefresh() ? 'mdi-timer-sync-outline' : 'mdi-timer-off-outline'"></i>
          <span>{{ vm.autoRefresh() ? 'خودکار' : 'خودکار خاموش' }}</span>
        </button>

        <button type="button" class="btn kws-toolbar-btn" (click)="vm.refresh()"
          [disabled]="vm.requestInProgress()" title="بروزرسانی">
          <i class="mdi mdi-refresh" [class.kws-spin]="vm.requestInProgress()"></i>
          <span>بروزرسانی</span>
        </button>

        <button type="button" class="btn kws-toolbar-btn ghost" (click)="vm.changeSupervisorExtension()"
          title="خواندن داخلی مدیر از Session">
          <i class="mdi mdi-account-tie-voice-outline"></i>
          <span>مدیر: {{ vm.supervisorExtension() || '-' }}</span>
        </button>

      </div>

      <div class="kws-live-meta">
        <span>
          نمایش
          <strong>{{ vm.filteredCount() }}</strong>
          از
          <strong>{{ vm.totalCount() }}</strong>
        </span>
        <span class="dot"></span>
        <span>
          بروزرسانی:
          <strong>{{ vm.lastUpdateText() || '-' }}</strong>
        </span>
        @if (vm.requestInProgress()) {
        <span class="kws-loading-inline">
          <span class="spinner-border spinner-border-sm"></span>
        </span>
        }
      </div>
    </div>

    <div class="kws-filter-card kws-filter-card-clean">

      <div class="kws-filter-main-line">
        <div class="kws-filter-search">
          <div class="kws-input-wrap">
            <i class="mdi mdi-magnify"></i>
            <input type="text" class="form-control" placeholder="جستجو: داخلی، نام، وضعیت، طرف مقابل، IP..."
              [ngModel]="vm.searchText()" (ngModelChange)="vm.searchText.set($event)">
          </div>
        </div>

        <div class="kws-status-chip-line">
          @for (tab of vm.statusTabs; track tab.id) {
          <button type="button" class="kws-filter-chip" [class.active]="vm.statusFilter() === tab.id"
            (click)="vm.setStatusFilter(tab.id)">
            <i [class]="'mdi ' + tab.icon"></i>
            <span>{{ tab.title }}</span>
          </button>
          }
        </div>

        <details class="kws-filter-more" dir="rtl">
   <summary>
  <i class="mdi mdi-tune-variant"></i>
  <span>فیلتر بیشتر</span>
  <i class="mdi mdi-chevron-down kws-more-chevron"></i>
</summary>

          <div class="kws-filter-more-body">
            <div class="kws-filter-extra-grid">

              <div class="kws-filter-field">
                <label class="form-label">فیلتر دستی داخلی‌ها</label>
                <div class="kws-input-wrap">
                  <i class="mdi mdi-phone-dial-outline"></i>
                  <input type="text" class="form-control" placeholder="مثلاً: 409,406,401"
                    [ngModel]="vm.extensionText()" (ngModelChange)="vm.extensionText.set($event)"
                    (keyup.enter)="vm.applyManualExtensionFilter()">
                </div>
              </div>

              <div class="kws-filter-field small">
                <label class="form-label">فاصله بروزرسانی</label>
                <select class="form-select" [ngModel]="vm.refreshSeconds()"
                  (ngModelChange)="vm.changeRefreshSeconds($event)">
                  <option [ngValue]="3">هر ۳ ثانیه</option>
                  <option [ngValue]="5">هر ۵ ثانیه</option>
                  <option [ngValue]="10">هر ۱۰ ثانیه</option>
                  <option [ngValue]="15">هر ۱۵ ثانیه</option>
                  <option [ngValue]="30">هر ۳۰ ثانیه</option>
                </select>
              </div>

              <div class="kws-filter-actions">
                <button type="button" class="btn btn-primary" (click)="vm.applyManualExtensionFilter()">
                  اعمال
                </button>

                <button type="button" class="btn btn-outline-secondary" (click)="vm.clearAllFilters()" title="حذف فیلترها">
                  <i class="mdi mdi-filter-remove-outline"></i>
                </button>
              </div>

            </div>

            <div class="kws-tabs-row series">
              @for (tab of vm.seriesTabs(); track tab.id) {
              <button type="button" class="kws-series-chip" [class.active]="vm.seriesFilter() === tab.id"
                (click)="vm.setSeriesFilter(tab.id)">
                <span>{{ tab.title }}</span>
                <small>{{ tab.count }}</small>
              </button>
              }
            </div>
          </div>
        </details>
      </div>

    </div>
  </div>
`
})
export class ListLiveFilterComponent {
  @Input({ required: true }) vm!: SantralListComponent;
}
