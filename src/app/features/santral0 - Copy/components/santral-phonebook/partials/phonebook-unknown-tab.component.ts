import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import type { ColDef, GridOptions, GridSizeChangedEvent } from 'ag-grid-community';
import type { SantralPhonebookComponent } from '../santral-phonebook.component';
import { PhonebookUnknownActionsRendererComponent } from './phonebook-unknown-actions-renderer.component';
import { PhonebookUnknownNumberRendererComponent } from './phonebook-unknown-number-renderer.component';
import { PhonebookUnknownRouteRendererComponent } from './phonebook-unknown-route-renderer.component';
import { PhonebookUnknownStatsRendererComponent } from './phonebook-unknown-stats-renderer.component';
import { PhonebookUnknownStatusRendererComponent } from './phonebook-unknown-status-renderer.component';

@Component({
  selector: 'app-phonebook-unknown-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,

  ],
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
      شماره‌هایی که در دفتر تلفن نیستند؛ هر linkedid فقط یک تماس واقعی حساب می‌شود
    </div>

    <div class="kws-count-box">
      {{ vm.filteredUnknownNumbers().length }} شماره
    </div>
  </div>

  <section class="kws-batch-kowsar-panel" [class.open]="vm.batchKowsarPanelOpen()">
    <header class="kws-batch-kowsar-header">
      <div class="kws-batch-kowsar-title">
        <span class="kws-batch-kowsar-icon"><i class="mdi mdi-database-search-outline"></i></span>
        <div>
          <h5>بررسی گروهی شماره‌ها در کوثر</h5>
          <p>تا ۳۰۰ شماره ناشناس را یک‌جا با تلفن، موبایل و فکس Address مقایسه می‌کند؛ هیچ جدول جدیدی ساخته نمی‌شود.</p>
        </div>
      </div>

      <div class="kws-batch-kowsar-actions">
        <button type="button" class="btn btn-outline-secondary" (click)="vm.toggleBatchKowsarPanel()">
          <i class="mdi" [class.mdi-chevron-down]="!vm.batchKowsarPanelOpen()"
            [class.mdi-chevron-up]="vm.batchKowsarPanelOpen()"></i>
          {{ vm.batchKowsarPanelOpen() ? 'بستن' : 'نمایش بخش' }}
        </button>

        <button type="button" class="btn btn-primary" (click)="vm.searchUnknownNumbersInKowsar()"
          [disabled]="vm.batchKowsarLoading() || vm.unknownNumbers().length === 0">
          @if (vm.batchKowsarLoading()) {
            <span class="spinner-border spinner-border-sm"></span>
            در حال بررسی
          } @else {
            <i class="mdi mdi-playlist-search"></i>
            بررسی {{ vm.toFaNumber(vm.unknownNumbers().length) }} شماره
          }
        </button>
      </div>
    </header>

    @if (vm.batchKowsarPanelOpen()) {
      <div class="kws-batch-kowsar-body">
        @if (!vm.batchKowsarHasSearched()) {
          <div class="kws-batch-kowsar-placeholder">
            <i class="mdi mdi-format-list-checks"></i>
            <div>
              <strong>هنوز بررسی گروهی اجرا نشده</strong>
              <span>بعد از اجرا فقط شماره‌هایی که در Address کوثر پیدا شده‌اند در این لیست نمایش داده می‌شوند.</span>
            </div>
          </div>
        }

        @if (vm.batchKowsarHasSearched()) {
          <div class="kws-batch-summary-grid">
            <div class="kws-batch-summary-item">
              <span>بررسی‌شده</span>
              <strong>{{ vm.toFaNumber(vm.batchKowsarRequestedCount()) }}</strong>
            </div>
            <div class="kws-batch-summary-item success">
              <span>شماره پیدا شده</span>
              <strong>{{ vm.toFaNumber(vm.batchKowsarFoundCount()) }}</strong>
            </div>
            <div class="kws-batch-summary-item info">
              <span>نتیجه قابل انتخاب</span>
              <strong>{{ vm.toFaNumber(vm.batchKowsarResults().length) }}</strong>
            </div>
            <div class="kws-batch-summary-item muted">
              <span>پیدا نشده</span>
              <strong>{{ vm.toFaNumber(vm.batchKowsarNotFoundCount()) }}</strong>
            </div>
            @if (vm.batchKowsarErrorCount() > 0) {
              <div class="kws-batch-summary-item danger">
                <span>بررسی‌نشده به علت خطا</span>
                <strong>{{ vm.toFaNumber(vm.batchKowsarErrorCount()) }}</strong>
              </div>
            }
          </div>

          <div class="kws-batch-result-toolbar">
            <div>
              <strong>{{ vm.toFaNumber(vm.batchKowsarUniqueMatchedCount()) }} شماره دارای نتیجه</strong>
              <span>برای شماره‌های چندنتیجه‌ای، مرکز درست را انتخاب کن.</span>
            </div>

            <div class="kws-search-box kws-batch-result-search">
              <i class="mdi mdi-magnify"></i>
              <input type="text" class="form-control" placeholder="جستجو در نتیجه‌های پیدا شده..."
                [ngModel]="vm.batchKowsarQuery()" (ngModelChange)="vm.onBatchKowsarQueryChange($event)" />
            </div>
          </div>

          @if (vm.batchKowsarLoading()) {
            <div class="kws-batch-kowsar-loading">
              <span class="spinner-border spinner-border-sm"></span>
              شماره‌ها در چند بسته کوچک بررسی می‌شوند؛ صفحه را نبندید...
            </div>
          } @else if (vm.filteredBatchKowsarResults().length === 0) {
            <div class="kws-batch-kowsar-empty">
              <i class="mdi mdi-database-off-outline"></i>
              نتیجه‌ای برای نمایش وجود ندارد
            </div>
          } @else {
            <div class="table-responsive kws-batch-table-wrap">
              <table class="table kws-batch-kowsar-table align-middle">
                <thead>
                  <tr>
                    <th>شماره ناشناس</th>
                    <th>مرکز پیدا شده</th>
                    <th>محل تطابق</th>
                    <th>نوع تطابق</th>
                    <th class="text-center">عملیات</th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of vm.filteredBatchKowsarResults(); track item.number + '|' + item.central_code + '|' + item.matched_field + '|' + item.address_ref) {
                    <tr>
                      <td>
                        <strong class="kws-batch-number">{{ item.number }}</strong>
                      </td>
                      <td>
                        <div class="kws-batch-central-cell">
                          <strong>{{ item.display_name || ('مرکز ' + item.central_code) }}</strong>
                          <span>
                            CentralCode: {{ item.central_code }}
                            @if (item.customer_code) { · CustomerCode: {{ item.customer_code }} }
                          </span>
                        </div>
                      </td>
                      <td>
                        <div class="kws-batch-match-cell">
                          <span>{{ item.matched_field || '-' }}</span>
                          <strong class="kws-inline-ltr">{{ item.matched_value || '-' }}</strong>
                        </div>
                      </td>
                      <td>
                        <span class="kws-batch-match-type" [class.exact]="item.match_type === 'EXACT'">
                          {{ vm.batchMatchTypeFa(item.match_type) }}
                        </span>
                      </td>
                      <td class="text-center">
                        <div class="kws-batch-row-actions">
                          <button type="button" class="btn btn-sm btn-outline-primary"
                            (click)="vm.openBatchKowsarFullSearch(item)">
                            <i class="mdi mdi-magnify-plus-outline"></i>
                            جستجوی کامل
                          </button>

                          <button type="button" class="btn btn-sm btn-success"
                            (click)="vm.addBatchKowsarResultToPhonebook(item)"
                            [disabled]="vm.batchKowsarSavingKey() !== ''">
                            @if (vm.batchKowsarSavingKey() === vm.batchKowsarSaveKey(item)) {
                              <span class="spinner-border spinner-border-sm"></span>
                            } @else {
                              <i class="mdi mdi-account-plus-outline"></i>
                            }
                            افزودن به دفتر تلفن
                          </button>
                        </div>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }
        }
      </div>
    }
  </section>

  <div class="phonebook-card kws-unknown-grid-card">

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
      <div class="kws-phonebook-grid-note kws-unknown-grid-note">
        <span>
          <i class="mdi mdi-table-large"></i>
          اطلاعات اصلی همیشه دیده می‌شوند؛ جزئیات کامل و عملیات داخل پنجره جزئیات قرار دارند.
        </span>
        <span>هر صفحه ۱۱ شماره</span>
      </div>

      <div class="kws-unknown-grid-shell">
        <ag-grid-angular
          class="ag-theme-quartz kws-unknown-ag-grid"
          [rowData]="vm.filteredUnknownNumbers()"
          [columnDefs]="columnDefs"
          [defaultColDef]="defaultColDef"
          [gridOptions]="gridOptions"
          [pagination]="true"
          [paginationPageSize]="11"
          [paginationPageSizeSelector]="pageSizeOptions"
          [animateRows]="true"
          [enableRtl]="true"
          (gridSizeChanged)="onGridSizeChanged($event)">
        </ag-grid-angular>
      </div>
    }

  </div>
  }
`
})
export class PhonebookUnknownTabComponent {
  @Input({ required: true }) vm!: SantralPhonebookComponent;

  readonly pageSizeOptions = [11, 20, 50, 100];

  readonly defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    minWidth: 110,
    suppressHeaderMenuButton: false
  };

  readonly columnDefs: ColDef[] = [
    {
      headerName: 'شماره',
      colId: 'number',
      field: 'number_raw',
      pinned: 'right',
      width: 180,
      minWidth: 165,
      maxWidth: 210,
      lockPinned: true,
      cellClass: 'kws-unknown-ag-number-cell',
      cellRenderer: PhonebookUnknownNumberRendererComponent
    },
    {
      headerName: 'آخرین وضعیت',
      colId: 'status',
      field: 'last_disposition_fa',
      width: 180,
      minWidth: 165,
      cellClass: 'kws-unknown-ag-status-cell',
      cellRenderer: PhonebookUnknownStatusRendererComponent,
      cellRendererParams: { host: this }
    },
    {
      headerName: 'آمار تماس‌ها',
      colId: 'stats',
      width: 230,
      minWidth: 210,
      sortable: false,
      filter: false,
      cellClass: 'kws-unknown-ag-stats-cell',
      cellRenderer: PhonebookUnknownStatsRendererComponent,
      cellRendererParams: { host: this }
    },
    {
      headerName: 'جزئیات آخرین تماس',
      colId: 'route',
      flex: 1,
      minWidth: 290,
      sortable: false,
      filter: false,
      cellClass: 'kws-unknown-ag-route-cell',
      cellRenderer: PhonebookUnknownRouteRendererComponent
    },
    {
      headerName: 'آخرین تماس',
      colId: 'lastCall',
      field: 'last_call_date',
      width: 190,
      minWidth: 175,
      cellClass: 'kws-unknown-ag-date-cell',
      valueFormatter: params => this.vm?.displayJalaliDateTime(params.value) || '-'
    },
    {
      headerName: 'عملیات',
      colId: 'actions',
      pinned: 'left',
      width: 118,
      minWidth: 104,
      maxWidth: 135,
      lockPinned: true,
      sortable: false,
      filter: false,
      resizable: false,
      suppressMovable: true,
      cellClass: 'kws-unknown-ag-actions-cell',
      cellRenderer: PhonebookUnknownActionsRendererComponent,
      cellRendererParams: { host: this }
    }
  ];

  readonly gridOptions: GridOptions = {
    enableRtl: true,
    rowHeight: 84,
    headerHeight: 48,
    animateRows: true,
    suppressCellFocus: true,
    ensureDomOrder: true,
    pagination: true,
    paginationPageSize: 11,
    paginationPageSizeSelector: this.pageSizeOptions,
    getRowId: params => String(params.data?.number_raw || params.data?.number_normal || ''),
    overlayNoRowsTemplate: '<span>شماره ناشناسی برای نمایش وجود ندارد</span>',
    enableBrowserTooltips: true,
    tooltipShowDelay: 250,
    tooltipHideDelay: 1000
  };

  onGridSizeChanged(event: GridSizeChangedEvent): void {
    const width = Number(event.clientWidth || 0);

    event.api.setColumnsVisible(['route'], width >= 1050);
    event.api.setColumnsVisible(['lastCall'], width >= 760);
    event.api.setColumnsVisible(['stats'], width >= 600);
  }
}
