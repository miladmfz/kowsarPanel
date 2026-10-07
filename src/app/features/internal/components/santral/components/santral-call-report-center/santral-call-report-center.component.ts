import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import {
  SantralCallReportFacet,
  SantralCallReportResponse,
  SantralCallReportSummary,
  SantralLogicalCallRow,
  SantralLogicalCallTraceResponse,
  SantralPagedFilter,
  SantralWebApiService
} from '../../services/santralapi.service';
import {
  displayJalaliDateTime,
  gregorianDateToJalaliText,
  jalaliTextToGregorianDate
} from '../../shared/utils/santral-date.util';
import {
  secondsToFaText,
  toFaNumber
} from '../../shared/utils/santral-format.util';
import {
  getCallRouteTitle,
  getCallTypeTitle,
  getDispositionTitle,
  getRouteTypeTitle
} from '../../shared/utils/santral-status.util';

type SortDirection = 'ASC' | 'DESC';
type ReportSortField =
  | 'calldate'
  | 'extension'
  | 'call_type'
  | 'route_type'
  | 'disposition'
  | 'peer_number'
  | 'duration'
  | 'billsec'
  | 'did'
  | 'legs_count';

interface ReportFilterForm {
  startdateFa: string;
  enddateFa: string;
  SearchTarget: string;
  extension: string;
  CallType: string;
  RouteType: string;
  disposition: string;
  did: string;
  src: string;
  dst: string;
}

@Component({
  selector: 'app-santral-call-report-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './santral-call-report-center.component.html',
  styleUrl: './santral-call-report-center.component.css'
})
export class SantralCallReportCenterComponent implements OnInit {
  private readonly api = inject(SantralWebApiService);
  private readonly notification = inject(NotificationService);

  readonly callTypeOptions = [
    { value: '', label: 'همه جهت‌ها' },
    { value: 'Incoming', label: 'ورودی' },
    { value: 'Outgoing', label: 'خروجی' },
    { value: 'Internal', label: 'داخلی' }
  ];

  readonly routeTypeOptions = [
    { value: '', label: 'همه مسیرها' },
    { value: 'Direct', label: 'مستقیم' },
    { value: 'RingGroup', label: 'گروه زنگ' },
    { value: 'Forward', label: 'فوروارد' },
    { value: 'Transfer', label: 'انتقال مکالمه' },
    { value: 'IVR', label: 'منوی صوتی' }
  ];

  readonly dispositionOptions = [
    { value: '', label: 'همه نتایج' },
    { value: 'ANSWERED', label: 'پاسخ داده شده' },
    { value: 'NO ANSWER', label: 'بی‌پاسخ' },
    { value: 'BUSY', label: 'اشغال' },
    { value: 'FAILED', label: 'ناموفق' },
    { value: 'CONGESTION', label: 'اختلال' }
  ];

  filter: ReportFilterForm = this.defaultFilter();
  records: SantralLogicalCallRow[] = [];
  summary: SantralCallReportSummary = this.emptySummary();
  callTypeFacets: SantralCallReportFacet[] = [];
  routeTypeFacets: SantralCallReportFacet[] = [];
  dispositionFacets: SantralCallReportFacet[] = [];

  loading = false;
  exporting = false;
  errorMessage = '';
  advancedFilters = false;

  page = 1;
  limit = 50;
  total = 0;
  totalPages = 0;
  sort: ReportSortField = 'calldate';
  dir: SortDirection = 'DESC';

  rawRowsScanned = 0;
  scanLimit = 50000;
  scanTruncated = false;
  engine = '';
  lastUpdate = '';

  traceVisible = false;
  traceLoading = false;
  traceError = '';
  traceRow: SantralLogicalCallRow | null = null;
  trace: SantralLogicalCallTraceResponse | null = null;

  ngOnInit(): void {
    this.loadReport(true);
  }

  loadReport(resetPage = false): void {
    if (resetPage) {
      this.page = 1;
    }

    const filter = this.buildApiFilter();
    if (!filter) {
      return;
    }

    this.loading = true;
    this.errorMessage = '';

    this.api.GetCallReportCenter(filter, false)
      .pipe(finalize(() => this.loading = false))
      .subscribe({
        next: (res: SantralCallReportResponse) => {
          if (Number(res?.ErrCode) !== 0) {
            this.errorMessage = res?.ErrDesc || 'دریافت گزارش تماس ناموفق بود.';
            this.notification.error(this.errorMessage);
            return;
          }

          this.records = Array.isArray(res?.records) ? res.records : [];
          this.summary = res?.summary ?? this.emptySummary();
          this.callTypeFacets = Array.isArray(res?.facets?.call_types) ? res.facets.call_types : [];
          this.routeTypeFacets = Array.isArray(res?.facets?.route_types) ? res.facets.route_types : [];
          this.dispositionFacets = Array.isArray(res?.facets?.dispositions) ? res.facets.dispositions : [];

          this.page = Number(res?.pagination?.page || this.page);
          this.limit = Number(res?.pagination?.limit || this.limit);
          this.total = Number(res?.pagination?.total || 0);
          this.totalPages = Number(res?.pagination?.total_pages || 0);

          this.rawRowsScanned = Number(res?.quality?.raw_rows_scanned || 0);
          this.scanLimit = Number(res?.quality?.scan_limit || this.scanLimit);
          this.scanTruncated = Number(res?.quality?.scan_truncated || 0) === 1;
          this.engine = String(res?.quality?.engine || 'logical-v4');
          this.lastUpdate = this.nowText();
        },
        error: (err) => {
          console.error('getCallReportCenter error:', err);
          this.records = [];
          this.errorMessage = 'ارتباط با سرویس گزارش تماس برقرار نشد.';
          this.notification.error(this.errorMessage);
        }
      });
  }

  clearFilters(): void {
    this.filter = this.defaultFilter();
    this.page = 1;
    this.sort = 'calldate';
    this.dir = 'DESC';
    this.loadReport(true);
  }

  toggleAdvancedFilters(): void {
    this.advancedFilters = !this.advancedFilters;
  }

  setSummaryFilter(disposition: string): void {
    this.filter.disposition = this.filter.disposition === disposition ? '' : disposition;
    this.loadReport(true);
  }

  setCallTypeFacet(type: string): void {
    this.filter.CallType = this.filter.CallType === type ? '' : type;
    this.loadReport(true);
  }

  setRouteTypeFacet(type: string): void {
    this.filter.RouteType = this.filter.RouteType === type ? '' : type;
    this.loadReport(true);
  }

  changePage(nextPage: number): void {
    if (nextPage < 1 || (this.totalPages > 0 && nextPage > this.totalPages) || nextPage === this.page) {
      return;
    }

    this.page = nextPage;
    this.loadReport(false);
  }

  changePageSize(): void {
    this.page = 1;
    this.loadReport(false);
  }

  sortBy(field: ReportSortField): void {
    if (this.sort === field) {
      this.dir = this.dir === 'ASC' ? 'DESC' : 'ASC';
    } else {
      this.sort = field;
      this.dir = field === 'calldate' ? 'DESC' : 'ASC';
    }

    this.page = 1;
    this.loadReport(false);
  }

  sortIcon(field: ReportSortField): string {
    if (this.sort !== field) {
      return 'mdi mdi-swap-vertical text-muted';
    }
    return this.dir === 'ASC' ? 'mdi mdi-arrow-up' : 'mdi mdi-arrow-down';
  }

  openTrace(row: SantralLogicalCallRow): void {
    if (!row?.call_key) {
      return;
    }

    this.traceVisible = true;
    this.traceLoading = true;
    this.traceError = '';
    this.traceRow = row;
    this.trace = null;

    this.api.GetLogicalCallTrace(row.call_key, row.extension || '', false)
      .pipe(finalize(() => this.traceLoading = false))
      .subscribe({
        next: (res) => {
          if (Number(res?.ErrCode) !== 0) {
            this.traceError = res?.ErrDesc || 'جزئیات تماس دریافت نشد.';
            return;
          }
          this.trace = res;
        },
        error: (err) => {
          console.error('getLogicalCallTrace error:', err);
          this.traceError = 'دریافت Legهای خام تماس ناموفق بود.';
        }
      });
  }

  closeTrace(): void {
    this.traceVisible = false;
    this.traceRow = null;
    this.trace = null;
    this.traceError = '';
  }

  exportCsv(): void {
    const filter = this.buildApiFilter();
    if (!filter || this.exporting) {
      return;
    }

    this.exporting = true;

    this.api.ExportCallReportCsv(filter, false)
      .pipe(finalize(() => this.exporting = false))
      .subscribe({
        next: (blob) => {
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = `santral-call-report-${filter.startdate || 'from'}-${filter.enddate || 'to'}.csv`;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          URL.revokeObjectURL(url);
          this.notification.success('خروجی CSV گزارش تماس آماده شد.');
        },
        error: (err) => {
          console.error('exportCallReportCsv error:', err);
          this.notification.error('خروجی CSV ساخته نشد.');
        }
      });
  }

  playRecording(row: SantralLogicalCallRow): void {
    if (!row?.recordingfile) {
      this.notification.warning('برای این تماس فایل ضبط وجود ندارد.');
      return;
    }

    this.api.PlayRecording(row.recordingfile, false).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        window.setTimeout(() => URL.revokeObjectURL(url), 60000);
      },
      error: (err) => {
        console.error('playRecording error:', err);
        this.notification.error('پخش فایل ضبط تماس ناموفق بود.');
      }
    });
  }

  callRoute(row: SantralLogicalCallRow): string {
    return getCallRouteTitle(row);
  }

  callTypeTitle(value: string): string {
    return getCallTypeTitle(value);
  }

  routeTypeTitle(value: string): string {
    return getRouteTypeTitle(value);
  }

  dispositionTitle(value: string): string {
    return getDispositionTitle(value);
  }

  dispositionClass(value: string): string {
    switch (String(value || '').toUpperCase()) {
      case 'ANSWERED': return 'is-success';
      case 'NO ANSWER': return 'is-warning';
      case 'BUSY': return 'is-danger';
      case 'FAILED':
      case 'CONGESTION': return 'is-dark';
      default: return 'is-muted';
    }
  }

  routeClass(value: string): string {
    switch (String(value || '')) {
      case 'RingGroup': return 'is-ring';
      case 'Forward': return 'is-forward';
      case 'Transfer': return 'is-transfer';
      case 'IVR': return 'is-ivr';
      default: return 'is-direct';
    }
  }

  routeIcon(value: string): string {
    switch (String(value || '')) {
      case 'RingGroup': return 'mdi mdi-account-group-outline';
      case 'Forward': return 'mdi mdi-call-made';
      case 'Transfer': return 'mdi mdi-call-split';
      case 'IVR': return 'mdi mdi-menu-open';
      default: return 'mdi mdi-phone-outline';
    }
  }

  callTypeIcon(value: string): string {
    switch (String(value || '')) {
      case 'Incoming': return 'mdi mdi-phone-incoming-outline';
      case 'Outgoing': return 'mdi mdi-phone-outgoing-outline';
      case 'Internal': return 'mdi mdi-phone-classic';
      default: return 'mdi mdi-phone-outline';
    }
  }

  formatNumber(value: number | string): string {
    return toFaNumber(Number(value || 0).toLocaleString('en-US'));
  }

  formatPercent(value: number | string): string {
    const n = Number(value || 0);
    return `${toFaNumber(Number.isFinite(n) ? n.toFixed(1) : '0')}٪`;
  }

  secondsText(value: number | string): string {
    return secondsToFaText(value);
  }

  dateTimeText(value: string): string {
    return displayJalaliDateTime(value);
  }

  activeFilterCount(): number {
    return [
      this.filter.SearchTarget,
      this.filter.extension,
      this.filter.CallType,
      this.filter.RouteType,
      this.filter.disposition,
      this.filter.did,
      this.filter.src,
      this.filter.dst
    ].filter(x => String(x || '').trim() !== '').length;
  }

  trackByCallKey(index: number, row: SantralLogicalCallRow): string {
    return row?.call_key || `${index}`;
  }

  private buildApiFilter(): SantralPagedFilter | null {
    const startdate = jalaliTextToGregorianDate(this.filter.startdateFa);
    const enddate = jalaliTextToGregorianDate(this.filter.enddateFa);

    if (!startdate || !enddate) {
      this.notification.warning('تاریخ شروع و پایان را به‌صورت شمسی وارد کنید؛ نمونه: ۱۴۰۵/۰۶/۲۱');
      return null;
    }

    if (startdate > enddate) {
      this.notification.warning('تاریخ شروع نباید بعد از تاریخ پایان باشد.');
      return null;
    }

    return {
      page: this.page,
      limit: this.limit,
      sort: this.sort,
      dir: this.dir,
      startdate,
      enddate,
      SearchTarget: this.filter.SearchTarget.trim(),
      extension: this.filter.extension.trim(),
      CallType: this.filter.CallType as any,
      RouteType: this.filter.RouteType as any,
      disposition: this.filter.disposition as any,
      did: this.filter.did.trim(),
      src: this.filter.src.trim(),
      dst: this.filter.dst.trim(),
      scanLimit: this.scanLimit
    };
  }

  private defaultFilter(): ReportFilterForm {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 6);

    return {
      startdateFa: toFaNumber(gregorianDateToJalaliText(this.dateInput(start))),
      enddateFa: toFaNumber(gregorianDateToJalaliText(this.dateInput(end))),
      SearchTarget: '',
      extension: '',
      CallType: '',
      RouteType: '',
      disposition: '',
      did: '',
      src: '',
      dst: ''
    };
  }

  private emptySummary(): SantralCallReportSummary {
    return {
      total_calls: 0,
      answered_calls: 0,
      no_answer_calls: 0,
      busy_calls: 0,
      failed_calls: 0,
      recorded_calls: 0,
      total_duration: 0,
      total_billsec: 0,
      avg_duration: 0,
      avg_billsec: 0,
      answer_rate: 0
    };
  }

  private dateInput(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  private nowText(): string {
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date());
  }
}
