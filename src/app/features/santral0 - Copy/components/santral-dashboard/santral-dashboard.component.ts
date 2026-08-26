import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  ViewEncapsulation,
  Component,
  OnInit,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { firstValueFrom } from 'rxjs';

import {
  addDaysToGregorianDate,
  cleanSantralText,
  formatGregorianDateInput,
  secondsToFaText,
  toFaNumber as sharedToFaNumber,
  toSantralNumber
} from '../../shared/utils/santral-format.util';
import {
  displayJalaliDate as sharedDisplayJalaliDate,
  displayJalaliDateTime as sharedDisplayJalaliDateTime,
  gregorianDateToJalaliText,
  jalaliTextToGregorianDate
} from '../../shared/utils/santral-date.util';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';

import {
  SantralBaseFilter,
  SantralWebApiService
} from '../../services/santralapi.service';

import { DashboardPageHeaderComponent } from './partials/dashboard-page-header.component';
import { DashboardFilterCardComponent } from './partials/dashboard-filter-card.component';
import { DashboardStatCardsComponent } from './partials/dashboard-stat-cards.component';
import { DashboardAnalyticsPanelsComponent } from './partials/dashboard-analytics-panels.component';
import { DashboardCallsGridCardComponent } from './partials/dashboard-calls-grid-card.component';
import { DashboardAudioPanelComponent } from './partials/dashboard-audio-panel.component';

import {
  getCallTypeBadgeClass as sharedGetCallTypeBadgeClass,
  getCallTypeIcon as sharedGetCallTypeIcon,
  getCallTypeTextClass as sharedGetCallTypeTextClass,
  getCallTypeTitle as sharedGetCallTypeTitle,
  getDispositionBadgeClass as sharedGetDispositionBadgeClass,
  getDispositionIcon as sharedGetDispositionIcon,
  getDispositionTextClass as sharedGetDispositionTextClass,
  getDispositionTitle as sharedGetDispositionTitle
} from '../../shared/utils/santral-status.util';
import { DashboardLoadingStateComponent } from './partials/dashboard-loading-state.component';

@Component({
  selector: 'app-santral-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
    DashboardPageHeaderComponent,
    DashboardFilterCardComponent,
    DashboardStatCardsComponent,
    DashboardAnalyticsPanelsComponent,
    DashboardCallsGridCardComponent,
    DashboardAudioPanelComponent,
    DashboardLoadingStateComponent
  ],
  templateUrl: './santral-dashboard.component.html',
  styleUrls: [
    './santral-dashboard.component.css',
    './styles/santral-dashboard.layout.css',
    './styles/santral-dashboard.cards.css',
    './styles/santral-dashboard.analytics.css',
    './styles/santral-dashboard.grid.css',
    './styles/santral-dashboard.audio.css'
  ],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SantralDashboardComponent
  extends AgGridBaseComponent
  implements OnInit {

  private readonly santralApi = inject(SantralWebApiService);
  private readonly cdr = inject(ChangeDetectorRef);

  private requestId = 0;

  loading = false;
  primaryLoading = false;
  recentLoading = false;
  missedLoading = false;

  errorMessage = '';

  get dashboardBusy(): boolean {
    return this.loading || this.primaryLoading || this.recentLoading || this.missedLoading;
  }

  filter: SantralBaseFilter = this.createLastDayFilter();

  filterFa = {
    startdate: this.gregorianToJalaliText(this.filter.startdate ?? ''),
    enddate: this.gregorianToJalaliText(this.filter.enddate ?? '')
  };

  summary: any = {};
  dailyStats: any[] = [];
  hourlyStats: any[] = [];
  callTypes: any[] = [];
  topCallers: any[] = [];
  topReceivers: any[] = [];

  recentCalls: any[] = [];
  missedCalls: any[] = [];

  recentGridRows = signal<any[]>([]);
  missedGridRows = signal<any[]>([]);
  audioModalVisible = signal(false);
  audioUrl = signal('');
  audioTitle = signal('');
  recentTotal = 0;
  recentLogicalTotal = 0;
  missedTotal = 0;
  missedLogicalTotal = 0;

  /**
   * تعداد رکوردی که از API می‌گیریم.
   * چون paging سمت سرور فعلاً نمی‌خوای، برای جستجوی AG Grid باید تعداد بیشتری بگیریم.
   */
  recentLimit = 5000;
  missedLimit = 5000;

  /**
   * وقتی کاربر خواست «همه» را برای جستجو بگیرد.
   * این عدد باید با max limit سمت PHP هم هماهنگ باشد.
   */
  fullLoadLimit = 50000;

  recentFullLoaded = false;
  missedFullLoaded = false;

  /**
   * تعداد ردیف در هر صفحه داخل خود AG Grid.
   * این pagination سمت کلاینت است، نه API.
   */
  recentPageSize = 20;
  missedPageSize = 20;

  recentQuickFilter = '';
  missedQuickFilter = '';

  selectedRecordingUrl = '';
  selectedRecordingTitle = '';

  override defaultColDef: any = {
    sortable: true,
    filter: true,
    floatingFilter: true,
    resizable: true,
    minWidth: 120,
    cellClass: 'text-center',
    headerClass: 'text-center',
    tooltipValueGetter: (params: any) => params.value
  };

  readonly callTypeOptions = [
    { value: '', title: 'همه تماس‌ها' },
    { value: 'Incoming', title: 'ورودی' },
    { value: 'Outgoing', title: 'خروجی' },
    { value: 'Internal', title: 'داخلی' },
    { value: 'IVR', title: 'منوی صوتی' },
    { value: 'RingGroup', title: 'گروه زنگ' },
    { value: 'Transfer', title: 'انتقالی' },
    { value: 'Other', title: 'سایر' }
  ];

  readonly dispositionOptions = [
    { value: '', title: 'همه وضعیت‌ها' },
    { value: 'ANSWERED', title: 'پاسخ داده شده' },
    { value: 'NO ANSWER', title: 'بی‌پاسخ' },
    { value: 'BUSY', title: 'اشغال' },
    { value: 'FAILED', title: 'ناموفق' },
    { value: 'CONGESTION', title: 'اختلال شبکه' }
  ];

  readonly limitOptions = [
    { value: 500, title: 'دریافت ۵۰۰ رکورد' },
    { value: 1000, title: 'دریافت ۱۰۰۰ رکورد' },
    { value: 3000, title: 'دریافت ۳۰۰۰ رکورد' },
    { value: 5000, title: 'دریافت ۵۰۰۰ رکورد' },
    { value: 10000, title: 'دریافت ۱۰ هزار رکورد' },
    { value: 50000, title: 'دریافت کامل برای جستجو' }
  ];

  readonly pageSizeOptions = [
    { value: 10, title: '۱۰ ردیف' },
    { value: 20, title: '۲۰ ردیف' },
    { value: 50, title: '۵۰ ردیف' },
    { value: 100, title: '۱۰۰ ردیف' }
  ];

  constructor() {
    super();

    this.gridOptions = {
      ...(this.gridOptions ?? {}),

      context: { componentParent: this },

      enableRtl: true,
      animateRows: true,
      pagination: true,

      /**
       * مهم:
       * توی Base مقدار paginationAutoPageSize برابر true بود.
       * اگر true بماند، paginationPageSize دستی درست اعمال نمی‌شود.
       */
      paginationAutoPageSize: false,

      paginationPageSize: 20,

      rowHeight: 42,
      headerHeight: 42,
      floatingFiltersHeight: 34,

      suppressCellFocus: false,
      enableCellTextSelection: true,
      ensureDomOrder: true,
      onCellDoubleClicked: (params: any) => this.copyGridCellValue(params),

      defaultColDef: {
        ...(this.gridOptions?.defaultColDef ?? {}),
        flex: 1,
        sortable: true,
        resizable: true,
        filter: 'agSetColumnFilter',
        floatingFilter: true,
        minWidth: 120,
        cellStyle: { textAlign: 'center' },
        tooltipValueGetter: (params: any) => params.value
      }
    };
  }

  private copyGridCellValue(params: any): void {
    const raw = params?.valueFormatted ?? params?.value ?? '';
    const text = String(raw).trim();

    if (!text || typeof navigator === 'undefined' || !navigator.clipboard) {
      return;
    }

    navigator.clipboard.writeText(text).catch(() => undefined);
  }

  ngOnInit(): void {
    this.initGridColumns();
    this.loadDashboard();
  }

  private initGridColumns(): void {

    const plainRenderer = (params: any) => {
      return `
      <span class="kws-grid-plain-text">
        ${params.value || '-'}
      </span>
    `;
    };

    const dateRenderer = (params: any) => {
      return `
      <span class="kws-grid-plain-text kws-grid-date-text">
        ${params.value || '-'}
      </span>
    `;
    };

    const durationRenderer = (params: any) => {
      return `
      <span class="kws-grid-plain-text kws-grid-duration-text">
        ${params.value || '-'}
      </span>
    `;
    };

    const statusRenderer = (params: any) => {
      const cls = this.getDispositionTextClass(params.data?.disposition);
      const icon = this.getDispositionIcon(params.data?.disposition);

      return `
      <span class="kws-state-text ${cls}">
        <i class="${icon}"></i>
        ${params.value || '-'}
      </span>
    `;
    };

    const callTypeRenderer = (params: any) => {
      const cls = this.getCallTypeTextClass(params.data?.call_type);
      const icon = this.getCallTypeIcon(params.data?.call_type);

      return `
      <span class="kws-state-text ${cls}">
        <i class="${icon}"></i>
        ${params.value || '-'}
      </span>
    `;
    };

    const followRenderer = (params: any) => {
      const ok = Number(params.data?.called_back) === 1;

      if (ok) {
        return `
        <span class="kws-state-text kws-text-success">
          <i class="mdi mdi-check-circle-outline"></i>
          تماس گرفته شده
        </span>
      `;
      }

      return `
      <span class="kws-state-text kws-text-warning">
        <i class="mdi mdi-alert-circle-outline"></i>
        نیاز به پیگیری
      </span>
    `;
    };

    const recordingRenderer = (params: any) => {
      if (!params.data?.recordingfile) {
        return `<span class="kws-grid-muted-text">ندارد</span>`;
      }

      return `
      <button type="button" class="kws-recording-play" title="پخش مکالمه">
        <i class="mdi mdi-play"></i>
      </button>
    `;
    };

    this.column_name_1 = [
      {
        field: 'calldate_start_fa',
        headerName: 'زمان شروع',
        minWidth: 185,
        sort: 'desc',
        filter: 'agTextColumnFilter'
      },
      {
        field: 'src_name_or_number',
        headerName: 'تماس‌گیرنده',
        tooltipValueGetter: (params: any) => params.data?.src || '',
        filterValueGetter: (params: any) => `${params.data?.src_name_or_number || ''} ${params.data?.src || ''}`,
        minWidth: 160,
        filter: 'agTextColumnFilter',
        cellClass: 'text-center fw-bold'
      },
      {
        field: 'dst_name_or_number',
        headerName: 'مقصد',
        tooltipValueGetter: (params: any) => params.data?.dst_original || params.data?.dst || '',
        filterValueGetter: (params: any) => `${params.data?.dst_name_or_number || ''} ${params.data?.dst_original || params.data?.dst || ''}`,
        minWidth: 110,
        filter: 'agTextColumnFilter'
      },
      {
        field: 'attempted_extension_fa',
        headerName: 'داخلی تلاش‌شده',
        minWidth: 135,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: any) => {
          const value = params.value || '-';

          if (value === '-') {
            return `<span class="text-muted">-</span>`;
          }

          return `<span class="kws-attempt-ext">${value}</span>`;
        }
      },
      {
        field: 'dst_display',
        headerName: 'مسیر تماس',
        minWidth: 210,
        filter: 'agTextColumnFilter'
      },
      {
        field: 'disposition_fa',
        headerName: 'وضعیت',
        minWidth: 150,
        filter: 'agSetColumnFilter',
        cellRenderer: (params: any) => {
          const cls = this.getDispositionClass(params.data?.disposition);
          return `<span class="kws-status-badge ${cls}">${params.value ?? '-'}</span>`;
        }
      },
      {
        field: 'called_back_fa',
        headerName: 'پیگیری',
        minWidth: 150,
        filter: 'agSetColumnFilter',
        cellRenderer: (params: any) => {
          const ok = Number(params.data?.called_back) === 1;
          const cls = ok ? 'kws-follow-ok' : 'kws-follow-wait';
          return `<span class="${cls}">${params.value ?? 'نیاز به پیگیری'}</span>`;
        }
      },
      {
        field: 'did',
        headerName: 'خط ورودی',
        minWidth: 130,
        filter: 'agTextColumnFilter'
      },
      {
        field: 'duration_fa',
        headerName: 'مدت کل',
        minWidth: 120,
        filter: 'agTextColumnFilter'
      },
      this.recordingColumnDef()
    ] as ColDef[];

    this.columnDefs2 = [
      {
        field: 'calldate_start_fa',
        headerName: 'زمان شروع',
        minWidth: 185,
        sort: 'desc',
        filter: 'agTextColumnFilter'
      },
      {
        field: 'answer_calldate_fa',
        headerName: 'زمان پاسخ',
        minWidth: 185,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: any) => {
          const value = params.value || '-';
          return value === '-'
            ? `<span class="text-muted">-</span>`
            : `<span>${value}</span>`;
        }
      },
      {
        field: 'src_name_or_number',
        headerName: 'مبدأ',
        tooltipValueGetter: (params: any) => params.data?.src || '',
        filterValueGetter: (params: any) => `${params.data?.src_name_or_number || ''} ${params.data?.src || ''}`,
        minWidth: 110,
        filter: 'agTextColumnFilter',
        cellClass: 'text-center fw-bold'
      },
      {
        field: 'dst_name_or_number',
        headerName: 'مقصد',
        tooltipValueGetter: (params: any) => params.data?.dst_original || params.data?.dst || '',
        filterValueGetter: (params: any) => `${params.data?.dst_name_or_number || ''} ${params.data?.dst_original || params.data?.dst || ''}`,
        minWidth: 110,
        filter: 'agTextColumnFilter'
      },
      {
        field: 'answered_by_display',
        headerName: 'پاسخگو',
        minWidth: 120,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: any) => {
          const value = params.value || '-';

          if (value === '-') {
            return `<span class="text-muted">-</span>`;
          }

          return `<span class="kws-answer-ext">${value}</span>`;
        }
      },
      {
        field: 'dst_display',
        headerName: 'مسیر تماس',
        minWidth: 210,
        filter: 'agTextColumnFilter',
        cellRenderer: (params: any) => {
          const value = params.value || '-';
          return `<span class="kws-call-route">${value}</span>`;
        }
      },
      {
        field: 'call_type_fa',
        headerName: 'نوع تماس',
        minWidth: 140,
        filter: 'agSetColumnFilter',
        cellRenderer: (params: any) => {
          const cls = this.getCallTypeClass(params.data?.call_type);
          return `<span class="kws-type-badge ${cls}">${params.value ?? '-'}</span>`;
        }
      },
      {
        field: 'disposition_fa',
        headerName: 'وضعیت تماس',
        minWidth: 150,
        filter: 'agSetColumnFilter',
        cellRenderer: (params: any) => {
          const cls = this.getDispositionClass(params.data?.disposition);
          return `<span class="kws-status-badge ${cls}">${params.value ?? '-'}</span>`;
        }
      },
      {
        field: 'billsec_fa',
        headerName: 'زمان مکالمه',
        minWidth: 130,
        filter: 'agTextColumnFilter'
      },
      {
        field: 'duration_fa',
        headerName: 'مدت کل',
        minWidth: 120,
        filter: 'agTextColumnFilter'
      },
      {
        field: 'did',
        headerName: 'DID',
        minWidth: 120,
        filter: 'agTextColumnFilter'
      },
      this.recordingColumnDef()
    ] as ColDef[];
  }
  getDispositionTextClass(value: string): string {
    return sharedGetDispositionTextClass(value);
  }

  getCallTypeTextClass(value: string): string {
    return sharedGetCallTypeTextClass(value);
  }
  getDispositionIcon(value: string): string {
    return sharedGetDispositionIcon(value);
  }

  getCallTypeIcon(value: string): string {
    return sharedGetCallTypeIcon(value);
  }
  override onGridReady(params: any, index: number): void {
    super.onGridReady(params, index);

    const api: any = params.api;

    try {
      api.setGridOption('paginationAutoPageSize', false);

      if (index === 1) {
        api.setGridOption('paginationPageSize', this.missedPageSize);
        this.updateGridData(1, this.missedGridRows());
      }

      if (index === 2) {
        api.setGridOption('paginationPageSize', this.recentPageSize);
        this.updateGridData(2, this.recentGridRows());
      }
    } catch { }

    setTimeout(() => {
      try {
        if (api && !api.isDestroyed?.()) {
          api.sizeColumnsToFit();
        }
      } catch { }
    }, 100);
  }

  async loadDashboard(): Promise<void> {
    if (!this.syncJalaliDatesToGregorian()) {
      return;
    }

    const currentRequestId = ++this.requestId;

    this.loading = true;
    this.primaryLoading = true;
    this.recentLoading = false;
    this.missedLoading = false;
    this.errorMessage = '';

    this.recentFullLoaded = false;
    this.missedFullLoaded = false;

    this.clearData();
    this.notifyView();

    const cleanFilter = this.cleanFilter(this.filter);

    try {
      const dashboardRes: any = await firstValueFrom(
        this.santralApi.GetDashboard(cleanFilter, false)
      );

      if (currentRequestId !== this.requestId) {
        return;
      }

      const dashboard = dashboardRes ?? {};

      this.summary = dashboard.summary ?? {};
      this.dailyStats = dashboard.daily ?? [];
      this.hourlyStats = dashboard.hourly ?? [];
      this.callTypes = dashboard.call_types ?? [];
      this.topCallers = dashboard.top_callers ?? [];
      this.topReceivers = dashboard.top_receivers ?? [];

      this.primaryLoading = false;
      this.notifyView();

    } catch (err: any) {
      if (currentRequestId !== this.requestId) {
        return;
      }

      console.error('Santral dashboard error:', err);

      this.errorMessage = this.extractErrorMessage(err);
      this.primaryLoading = false;
      this.loading = false;
      this.notifyView();

      return;
    }

    await this.loadMissedCalls(currentRequestId);
    await this.loadRecentCalls(currentRequestId);

    if (currentRequestId === this.requestId) {
      this.loading = false;
      this.notifyView();
    }
  }

  async loadMissedCalls(parentRequestId?: number): Promise<void> {
    if (!this.syncJalaliDatesToGregorian()) {
      return;
    }

    const currentRequestId = parentRequestId ?? this.requestId;
    const cleanFilter = this.cleanFilter(this.filter);

    this.missedLoading = true;
    this.notifyView();

    try {
      const missedRes: any = await firstValueFrom(
        this.santralApi.GetMissedCalls({
          ...cleanFilter,
          page: 1,
          limit: this.missedLimit
        }, false)
      );

      if (currentRequestId !== this.requestId) {
        return;
      }

      this.missedCalls = missedRes?.missed_calls ?? [];
      this.missedTotal = Number(
        missedRes?.loaded_rows ??
        missedRes?.total ??
        this.missedCalls.length
      );
      this.missedLogicalTotal = Number(
        missedRes?.logical_total ??
        missedRes?.total ??
        this.missedCalls.length
      );

      const rows = this.missedCalls.map(row => this.mapMissedRow(row));

      this.missedGridRows.set(rows);
      this.updateGridData(1, rows);
      this.applyGridQuickFilter(1, this.missedQuickFilter);

      this.missedFullLoaded =
        this.missedLimit >= this.fullLoadLimit ||
        this.missedCalls.length < this.missedLimit;

    } catch (err: any) {
      if (currentRequestId !== this.requestId) {
        return;
      }

      console.error('Santral missed calls error:', err);

    } finally {
      if (currentRequestId === this.requestId) {
        this.missedLoading = false;
        this.notifyView();
      }
    }
  }

  async loadRecentCalls(parentRequestId?: number): Promise<void> {
    if (!this.syncJalaliDatesToGregorian()) {
      return;
    }

    const currentRequestId = parentRequestId ?? this.requestId;
    const cleanFilter = this.cleanFilter(this.filter);

    this.recentLoading = true;
    this.notifyView();

    try {
      const recentRes: any = await firstValueFrom(
        this.santralApi.GetCdr({
          ...cleanFilter,
          page: 1,
          limit: this.recentLimit,
          sort: 'calldate',
          dir: 'DESC'
        }, false)
      );

      if (currentRequestId !== this.requestId) {
        return;
      }

      this.recentCalls = recentRes?.cdr ?? [];
      this.recentTotal = Number(
        recentRes?.loaded_rows ??
        recentRes?.raw_total ??
        recentRes?.total ??
        this.recentCalls.length
      );
      this.recentLogicalTotal = Number(
        recentRes?.logical_total ??
        recentRes?.total ??
        this.recentCalls.length
      );

      const rows = this.recentCalls.map(row => this.mapRecentRow(row));

      this.recentGridRows.set(rows);
      this.updateGridData(2, rows);
      this.applyGridQuickFilter(2, this.recentQuickFilter);

      this.recentFullLoaded =
        this.recentLimit >= this.fullLoadLimit ||
        this.recentCalls.length < this.recentLimit;

    } catch (err: any) {
      if (currentRequestId !== this.requestId) {
        return;
      }

      console.error('Santral recent calls error:', err);

    } finally {
      if (currentRequestId === this.requestId) {
        this.recentLoading = false;
        this.notifyView();
      }
    }
  }

  async loadMissedCallsFull(): Promise<void> {
    this.missedLimit = this.fullLoadLimit;
    this.missedFullLoaded = false;
    await this.loadMissedCalls();
  }

  async loadRecentCallsFull(): Promise<void> {
    this.recentLimit = this.fullLoadLimit;
    this.recentFullLoaded = false;
    await this.loadRecentCalls();
  }

  async loadBothGridsFull(): Promise<void> {
    this.recentLimit = this.fullLoadLimit;
    this.missedLimit = this.fullLoadLimit;

    await this.loadMissedCalls();
    await this.loadRecentCalls();
  }

  changeMissedLimit(limit: any): void {
    this.missedLimit = Number(limit) || 5000;
    this.missedFullLoaded = false;
    this.loadMissedCalls();
  }

  changeRecentLimit(limit: any): void {
    this.recentLimit = Number(limit) || 5000;
    this.recentFullLoaded = false;
    this.loadRecentCalls();
  }

  changeMissedPageSize(size: any): void {
    this.missedPageSize = Number(size) || 20;

    const api: any = this.gridApi1;

    if (!api || api.isDestroyed?.()) {
      return;
    }

    api.setGridOption('paginationAutoPageSize', false);
    api.setGridOption('paginationPageSize', this.missedPageSize);
  }

  changeRecentPageSize(size: any): void {
    this.recentPageSize = Number(size) || 20;

    const api: any = this.gridApi2;

    if (!api || api.isDestroyed?.()) {
      return;
    }

    api.setGridOption('paginationAutoPageSize', false);
    api.setGridOption('paginationPageSize', this.recentPageSize);
  }

  applyMissedQuickFilter(): void {
    this.applyGridQuickFilter(1, this.missedQuickFilter);
  }

  applyRecentQuickFilter(): void {
    this.applyGridQuickFilter(2, this.recentQuickFilter);
  }

  private applyGridQuickFilter(index: number, value: string): void {
    const api: any = index === 1 ? this.gridApi1 : this.gridApi2;

    if (!api || api.isDestroyed?.()) {
      return;
    }

    api.setGridOption('quickFilterText', this.cleanText(value));
  }

  clearMissedQuickFilter(): void {
    this.missedQuickFilter = '';
    this.applyMissedQuickFilter();
  }

  clearRecentQuickFilter(): void {
    this.recentQuickFilter = '';
    this.applyRecentQuickFilter();
  }

  exportMissedCsv(): void {
    this.gridApi1?.exportDataAsCsv?.({
      fileName: 'missed-calls.csv'
    });
  }

  exportRecentCsv(): void {
    this.gridApi2?.exportDataAsCsv?.({
      fileName: 'recent-calls.csv'
    });
  }

  refresh(): void {
    this.loadDashboard();
  }

  resetFilter(): void {
    this.filter = this.createLastDayFilter();

    this.filterFa = {
      startdate: this.gregorianToJalaliText(this.filter.startdate ?? ''),
      enddate: this.gregorianToJalaliText(this.filter.enddate ?? '')
    };

    this.recentLimit = 5000;
    this.missedLimit = 5000;
    this.recentFullLoaded = false;
    this.missedFullLoaded = false;

    this.clearRecording();
    this.loadDashboard();
  }

  setToday(): void {
    const today = new Date();

    this.filter.startdate = this.formatDate(today);
    this.filter.enddate = this.formatDate(today);

    this.recentFullLoaded = false;
    this.missedFullLoaded = false;

    this.syncGregorianDatesToJalali();
    this.clearRecording();
    this.loadDashboard();
  }

  setLastDay(): void {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayText = this.formatDate(yesterday);

    this.filter.startdate = yesterdayText;
    this.filter.enddate = yesterdayText;

    this.recentFullLoaded = false;
    this.missedFullLoaded = false;

    this.syncGregorianDatesToJalali();
    this.clearRecording();
    this.loadDashboard();
  }

  setLast7Days(): void {
    const today = new Date();

    this.filter.startdate = this.addDays(today, -7);
    this.filter.enddate = this.formatDate(today);

    this.recentFullLoaded = false;
    this.missedFullLoaded = false;

    this.syncGregorianDatesToJalali();
    this.clearRecording();
    this.loadDashboard();
  }

  setLast30Days(): void {
    const today = new Date();

    this.filter.startdate = this.addDays(today, -30);
    this.filter.enddate = this.formatDate(today);

    this.recentFullLoaded = false;
    this.missedFullLoaded = false;

    this.syncGregorianDatesToJalali();
    this.clearRecording();
    this.loadDashboard();
  }



  clearRecording(): void {
    this.selectedRecordingUrl = '';
    this.selectedRecordingTitle = '';
    this.notifyView();
  }

  get totalCalls(): number {
    return this.toNumber(this.summary?.total_calls);
  }

  get answeredCalls(): number {
    return this.toNumber(this.summary?.answered_calls);
  }

  get noAnswerCalls(): number {
    return this.toNumber(this.summary?.no_answer_calls);
  }

  get busyCalls(): number {
    return this.toNumber(this.summary?.busy_calls);
  }

  get failedCalls(): number {
    return this.toNumber(this.summary?.failed_calls);
  }

  get recordedCalls(): number {
    return this.toNumber(this.summary?.recorded_calls);
  }

  get answerRate(): number {
    return this.toNumber(this.summary?.answer_rate);
  }

  get maxHourlyCount(): number {
    return this.getMax(this.hourlyStats, 'call_count');
  }

  get maxDailyCount(): number {
    return this.getMax(this.dailyStats, 'total_calls');
  }

  get maxCallTypeCount(): number {
    return this.getMax(this.callTypes, 'call_count');
  }

  get maxTopCallerCount(): number {
    return this.getMax(this.topCallers, 'call_count');
  }

  get maxTopReceiverCount(): number {
    return this.getMax(this.topReceivers, 'call_count');
  }

  get missedSearchHint(): string {
    if (this.missedFullLoaded) {
      return 'جستجوی داخل گرید روی همه رکوردهای دریافت‌شده انجام می‌شود.';
    }

    return `جستجوی داخل گرید فقط روی ${this.toFaNumber(this.missedTotal)} رکورد بارگذاری‌شده انجام می‌شود. برای جستجوی کامل، دکمه بارگذاری کامل را بزن.`;
  }

  get recentSearchHint(): string {
    if (this.recentFullLoaded) {
      return 'جستجوی داخل گرید روی همه رکوردهای دریافت‌شده انجام می‌شود.';
    }

    return `جستجوی داخل گرید فقط روی ${this.toFaNumber(this.recentTotal)} رکورد بارگذاری‌شده انجام می‌شود. برای جستجوی کامل، دکمه بارگذاری کامل را بزن.`;
  }

  barWidth(value: any, max: number): string {
    const num = this.toNumber(value);

    if (max <= 0 || num <= 0) {
      return '0%';
    }

    const percent = Math.max((num / max) * 100, 5);
    return `${percent}%`;
  }

  formatSeconds(value: any): string {
    return secondsToFaText(value);
  }

  formatHour(hour: any): string {
    const value = String(hour ?? '0').padStart(2, '0');
    return this.toFaNumber(`${value}:00`);
  }

  displayJalaliDate(value: any): string {
    return sharedDisplayJalaliDate(value);
  }

  displayJalaliDateTime(value: any): string {
    return sharedDisplayJalaliDateTime(value);
  }

  getDispositionTitle(value: string): string {
    return sharedGetDispositionTitle(value);
  }

  getDispositionClass(value: string): string {
    return sharedGetDispositionBadgeClass(value);
  }

  getCallTypeTitle(value: string): string {
    return sharedGetCallTypeTitle(value);
  }

  getCallTypeClass(value: string): string {
    return sharedGetCallTypeBadgeClass(value);
  }

  private mapRecentRow(row: any): any {
    const mapped = {
      ...row,
      calldate_fa: row?.calldate_start_fa || this.displayJalaliDateTime(row?.calldate),
      disposition_fa: this.getDispositionTitle(row?.disposition),
      call_type_fa: this.getCallTypeTitle(row?.call_type),
      billsec_fa: row?.billsec_fa || this.formatSeconds(row?.billsec),
      duration_fa: row?.duration_fa || this.formatSeconds(row?.duration),
    };

    const canPlay = this.canPlayRecording(mapped);

    return {
      ...mapped,
      has_recording: canPlay ? 1 : 0,
      recording_url: canPlay ? mapped.recording_url : '',
      recording_state: this.getRecordingState(mapped)
    };
  }

  private mapMissedRow(row: any): any {
    return {
      ...row,
      calldate_fa: row?.calldate_start_fa || this.displayJalaliDateTime(row?.calldate),
      disposition_fa: this.getDispositionTitle(row?.disposition),
      duration_fa: row?.duration_fa || this.formatSeconds(row?.duration),
      called_back_fa: Number(row?.called_back) === 1 ? 'تماس گرفته شده' : 'نیاز به پیگیری',

      has_recording: 0,
      recording_url: '',
      recording_state: '-'
    };
  }

  private clearData(): void {
    this.summary = {};
    this.dailyStats = [];
    this.hourlyStats = [];
    this.callTypes = [];
    this.topCallers = [];
    this.topReceivers = [];

    this.recentCalls = [];
    this.missedCalls = [];

    this.recentGridRows.set([]);
    this.missedGridRows.set([]);

    this.recentTotal = 0;
    this.missedTotal = 0;

    this.updateGridData(1, []);
    this.updateGridData(2, []);
  }

  private createLastDayFilter(): SantralBaseFilter {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const yesterdayText = this.formatDate(yesterday);

    return {
      startdate: yesterdayText,
      enddate: yesterdayText,
      SearchTarget: '',
      disposition: '',
      extension: '',
      CallType: ''
    };
  }

  private cleanFilter(filter: SantralBaseFilter): SantralBaseFilter {
    return {
      startdate: this.cleanText(filter.startdate),
      enddate: this.cleanText(filter.enddate),
      SearchTarget: this.cleanText(filter.SearchTarget),
      disposition: filter.disposition ?? '',
      extension: this.cleanText(filter.extension),
      src: this.cleanText(filter.src),
      dst: this.cleanText(filter.dst),
      did: this.cleanText(filter.did),
      CallType: filter.CallType ?? ''
    };
  }

  private cleanText(value: any): string {
    return cleanSantralText(value);
  }

  private toNumber(value: any): number {
    return toSantralNumber(value);
  }

  private getMax(rows: any[], field: string): number {
    if (!Array.isArray(rows) || rows.length === 0) {
      return 1;
    }

    const values = rows.map(row => this.toNumber(row?.[field]));
    return Math.max(...values, 1);
  }

  private syncGregorianDatesToJalali(): void {
    this.filterFa = {
      startdate: this.toFaNumber(this.gregorianToJalaliText(this.filter.startdate ?? '')),
      enddate: this.toFaNumber(this.gregorianToJalaliText(this.filter.enddate ?? ''))
    };

    this.notifyView();
  }

  private syncJalaliDatesToGregorian(): boolean {
    this.errorMessage = '';

    const start = this.jalaliTextToGregorian(this.filterFa.startdate);
    const end = this.jalaliTextToGregorian(this.filterFa.enddate);

    if (!start || !end) {
      this.errorMessage = 'تاریخ را به‌صورت شمسی و با فرمت درست وارد کنید. نمونه: ۱۴۰۵/۰۴/۱۰';
      this.notifyView();
      return false;
    }

    if (start > end) {
      this.errorMessage = 'تاریخ شروع نباید بزرگ‌تر از تاریخ پایان باشد.';
      this.notifyView();
      return false;
    }

    this.filter.startdate = start;
    this.filter.enddate = end;

    return true;
  }

  private jalaliTextToGregorian(value: string): string {
    return jalaliTextToGregorianDate(value);
  }

  private gregorianToJalaliText(value: string): string {
    return gregorianDateToJalaliText(value);
  }

  private toFaNumber(value: any): string {
    return sharedToFaNumber(value);
  }

  private formatDate(date: Date): string {
    return formatGregorianDateInput(date);
  }

  private addDays(date: Date, days: number): string {
    return addDaysToGregorianDate(date, days);
  }

  private extractErrorMessage(err: any): string {
    if (err?.error?.ErrDesc) {
      return err.error.ErrDesc;
    }

    if (err?.error?.message) {
      return err.error.message;
    }

    if (err?.status === 0) {
      return 'ارتباط با سرور سانترال برقرار نشد یا خطای CORS وجود دارد.';
    }

    return 'خطا در دریافت اطلاعات سانترال.';
  }

  private notifyView(): void {
    this.cdr.markForCheck();
  }

  playRecording(row: any): void {
    if (!this.canPlayRecording(row)) {
      window.alert('فایل ضبط فقط برای تماس پاسخ‌داده‌شده قابل پخش است');
      return;
    }

    const url = row?.recording_url;

    const src = row?.src_name_or_number || row?.src || '-';
    const dst = row?.dst_name_or_number || row?.dst_display || row?.dst || '-';
    const date = row?.calldate_start_fa || row?.calldate_fa || '';

    this.audioTitle.set(`ضبط تماس ${src} به ${dst} - ${date}`);
    this.audioUrl.set(url);
    this.audioModalVisible.set(true);
  }

  closeAudioModal(): void {
    this.audioModalVisible.set(false);
    this.audioUrl.set('');
    this.audioTitle.set('');
  }


  canPlayRecording(row: any): boolean {
    const disposition = String(row?.disposition ?? '').trim().toUpperCase();

    const billsec = Number(row?.billsec ?? row?.billsec_seconds ?? 0);

    const hasRecording =
      Number(row?.has_recording) === 1 &&
      !!row?.recording_url;

    return disposition === 'ANSWERED' && billsec > 0 && hasRecording;
  }

  getRecordingState(row: any): string {
    const disposition = String(row?.disposition ?? '').trim().toUpperCase();

    if (disposition !== 'ANSWERED') {
      return '-';
    }

    const billsec = Number(row?.billsec ?? row?.billsec_seconds ?? 0);

    if (billsec <= 0) {
      return '-';
    }

    return this.canPlayRecording(row) ? 'دارد' : 'ندارد';
  }

  private recordingColumnDef(): ColDef {
    return {
      field: 'recording_state',
      headerName: 'ضبط',
      minWidth: 105,
      filter: 'agSetColumnFilter',
      cellRenderer: (params: any) => {
        const row = params.data;

        if (!this.canPlayRecording(row)) {
          return `<span class="kws-recording-empty">-</span>`;
        }

        return `
        <button type="button" class="btn btn-sm kws-recording-play-btn">
          <i class="mdi mdi-play-circle-outline"></i>
          پخش
        </button>
      `;
      },
      onCellClicked: (params: any) => {
        if (this.canPlayRecording(params.data)) {
          this.playRecording(params.data);
        }
      }
    } as ColDef;
  }






}