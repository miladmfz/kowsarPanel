import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralPhonebookComponent } from '../santral-phonebook.component';

@Component({
  selector: 'app-phonebook-unknown-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  @if (vm.activeTab() === 'unknown') {

  <div class="unknown-filter-card">
    <div class="unknown-filter-grid">

      <div>
        <label class="form-label">از تاریخ شمسی</label>
        <input
          type="text"
          class="form-control kws-date-input"
          placeholder="۱۴۰۵/۰۴/۱۰"
          inputmode="numeric"
          dir="ltr"
          [ngModel]="vm.unknownStartDate()"
          (ngModelChange)="vm.onUnknownStartDateChange($event)" />
      </div>

      <div>
        <label class="form-label">تا تاریخ شمسی</label>
        <input
          type="text"
          class="form-control kws-date-input"
          placeholder="۱۴۰۵/۰۴/۱۰"
          inputmode="numeric"
          dir="ltr"
          [ngModel]="vm.unknownEndDate()"
          (ngModelChange)="vm.onUnknownEndDateChange($event)" />
      </div>

      <div class="unknown-search-field">
        <label class="form-label">جستجو</label>

        <div class="kws-search-box">
          <i class="mdi mdi-magnify"></i>

          <input type="text" class="form-control" placeholder="جستجو در شماره‌های ناشناس..."
            [ngModel]="vm.unknownSearchText()" (ngModelChange)="vm.onUnknownSearchChange($event)" />
        </div>
      </div>

      <div class="unknown-load-action">
        <button type="button" class="btn btn-primary" (click)="vm.loadUnknownNumbers()" [disabled]="vm.loadingUnknown()">
          <i class="mdi mdi-filter-outline" [class.kws-spin]="vm.loadingUnknown()"></i>
          اعمال فیلتر
        </button>
      </div>

    </div>
  </div>

  <div class="phonebook-toolbar">
    <div class="unknown-summary">
      شماره‌هایی که تماس داشته‌اند ولی در دفتر تلفن CallerID ثبت نشده‌اند
    </div>

    <div class="kws-count-box">
      {{ vm.filteredUnknownNumbers().length }} شماره
    </div>
  </div>

  <div class="phonebook-card">

    @if (vm.loadingUnknown()) {
    <div class="kws-loading">
      <span class="spinner-border spinner-border-sm"></span>
      در حال دریافت شماره‌های ناشناس...
    </div>
    }

    @if (!vm.loadingUnknown() && vm.filteredUnknownNumbers().length === 0) {
    <div class="kws-empty">
      <i class="mdi mdi-check-circle-outline"></i>
      شماره ناشناسی برای نمایش وجود ندارد
    </div>
    }

    @if (!vm.loadingUnknown() && vm.filteredUnknownNumbers().length > 0) {
    <div class="table-responsive kws-table-wrap">
      <table class="table kws-unknown-table align-middle">
        <thead>
          <tr>
            <th>شماره</th>
            <th>وضعیت آخر</th>
            <th>جزئیات آخرین تماس</th>
            <th>آمار تماس‌ها</th>
            <th>تاریخ تماس</th>
            <th class="text-center kws-action-col">عملیات</th>
          </tr>
        </thead>

        <tbody>
          @for (item of vm.filteredUnknownNumbers(); track item.number_raw) {
          <tr>
            <td>
              <div class="unknown-number-box">
                <span class="unknown-number">
                  {{ item.number_raw || '-' }}
                </span>

                @if (item.number_normal && item.number_normal !== item.number_raw) {
                <small>
                  {{ item.number_normal }}
                </small>
                }
              </div>
            </td>

            <td>
              <span class="kws-status-badge" [class.success]="vm.getUnknownStatusClass(item) === 'success'"
                [class.warning]="vm.getUnknownStatusClass(item) === 'warning'"
                [class.busy]="vm.getUnknownStatusClass(item) === 'busy'"
                [class.danger]="vm.getUnknownStatusClass(item) === 'danger'">
                {{ item.last_disposition_fa || '-' }}
              </span>

              <div class="unknown-duration">
                مکالمه آخر:
                <strong>{{ item.last_billsec_fa || '۰ ثانیه' }}</strong>
              </div>
            </td>

            <td>
              <div class="unknown-route-box">
                <div class="unknown-route-line">
                  <span>خط ورودی</span>
                  <strong>{{ item.last_did || '-' }}</strong>
                </div>

                <div class="unknown-route-line">
                  <span>مقصد</span>
                  <strong>{{ item.last_dst || '-' }}</strong>
                </div>

                <div class="unknown-route-line">
                  <span>پاسخگو</span>
                  <strong>{{ item.last_answered_by || '-' }}</strong>
                </div>
              </div>
            </td>

            <td>
              <div class="unknown-stats">
                <div class="unknown-stat-item">
                  <span>کل</span>
                  <strong>{{ item.call_count || 0 }}</strong>
                </div>

                <div class="unknown-stat-item success">
                  <span>پاسخ</span>
                  <strong>{{ item.answered_count || 0 }}</strong>
                </div>

                <div class="unknown-stat-item danger">
                  <span>بی‌پاسخ</span>
                  <strong>{{ item.missed_count || 0 }}</strong>
                </div>
              </div>
            </td>

            <td>
              <div class="unknown-date-box">
                <div>
                  <span>آخرین</span>
                  <strong class="kws-ltr-text">
                    {{ vm.displayJalaliDateTime(item.last_call_date) }}
                  </strong>
                </div>

                <div>
                  <span>اولین</span>
                  <strong class="kws-ltr-text">
                    {{ vm.displayJalaliDateTime(item.first_call_date) }}
                  </strong>
                </div>
              </div>
            </td>

            <td class="text-center kws-action-col">
              <div class="unknown-action-stack">
                <button type="button" class="btn btn-sm kws-details-btn" (click)="vm.openDetails(item)">
                  <i class="mdi mdi-history"></i>
                  <span>جزئیات</span>
                </button>

                <button type="button" class="btn btn-sm kws-add-from-unknown-btn" (click)="vm.openAddFromUnknown(item)">
                  <i class="mdi mdi-plus-circle-outline"></i>
                  <span>افزودن</span>
                </button>
              </div>
            </td>
          </tr>
          }
        </tbody>
      </table>
    </div>
    }

  </div>
  }
`
})
export class PhonebookUnknownTabComponent {
  @Input({ required: true }) vm!: SantralPhonebookComponent;
}
