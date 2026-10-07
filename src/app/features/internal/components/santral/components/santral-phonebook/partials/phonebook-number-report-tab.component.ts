import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralPhonebookComponent } from '../santral-phonebook.component';

@Component({
  selector: 'app-phonebook-number-report-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  @if (vm.activeTab() === 'report') {
    <section class="number-report-card">
      <div class="number-report-head">
        <div>
          <h5>گزارش ارتباط با یک شماره</h5>
          <p>شماره یا نام مخاطب را انتخاب کنید تا تماس‌های واقعی، پاسخگوها و گروه‌های زنگ نمایش داده شود.</p>
        </div>
      </div>

      <div class="number-report-filter">
        <div class="number-report-query">
          <label class="form-label">شماره یا نام مخاطب</label>
          <div class="kws-search-box">
            <i class="mdi mdi-account-search-outline"></i>
            <input type="text" class="form-control"
              placeholder="مثلاً 0912... یا نام مخاطب"
              [ngModel]="vm.numberReportQuery()"
              (ngModelChange)="vm.onNumberReportQueryChange($event)"
              (keyup.enter)="vm.runNumberReport()" />
          </div>
        </div>

        <div>
          <label class="form-label">از تاریخ شمسی</label>
          <input type="text" class="form-control kws-date-input" dir="ltr"
            [ngModel]="vm.unknownStartDate()"
            (ngModelChange)="vm.onUnknownStartDateChange($event)" />
        </div>

        <div>
          <label class="form-label">تا تاریخ شمسی</label>
          <input type="text" class="form-control kws-date-input" dir="ltr"
            [ngModel]="vm.unknownEndDate()"
            (ngModelChange)="vm.onUnknownEndDateChange($event)" />
        </div>

        <button type="button" class="btn btn-primary number-report-run"
          (click)="vm.runNumberReport()" [disabled]="vm.loadingDetails()">
          @if (vm.loadingDetails()) { <span class="spinner-border spinner-border-sm"></span> }
          @else { <i class="mdi mdi-chart-timeline-variant"></i> }
          نمایش گزارش
        </button>
      </div>

      <div class="number-report-contact-list">
        <div class="number-report-list-title">
          <strong>انتخاب از دفتر تلفن</strong>
          <span>{{ vm.numberReportSuggestions().length }} نتیجه</span>
        </div>

        @if (vm.numberReportSuggestions().length === 0) {
          <div class="kws-empty compact">مخاطبی مطابق جستجو پیدا نشد؛ می‌توانید شماره را مستقیم وارد کنید.</div>
        } @else {
          <div class="number-report-contact-grid">
            @for (item of vm.numberReportSuggestions(); track item.Id) {
              <button type="button" class="number-report-contact" (click)="vm.openContactDetails(item)">
                <i class="mdi mdi-account-circle-outline"></i>
                <span>
                  <strong>{{ item.Name || 'بدون نام' }}</strong>
                  <small>{{ item.Number }}</small>
                </span>
                <i class="mdi mdi-chevron-left"></i>
              </button>
            }
          </div>
        }
      </div>
    </section>
  }
  `
})
export class PhonebookNumberReportTabComponent {
  @Input({ required: true }) vm!: SantralPhonebookComponent;
}
