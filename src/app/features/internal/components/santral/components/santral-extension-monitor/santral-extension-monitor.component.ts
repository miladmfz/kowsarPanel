import { CommonModule } from '@angular/common';
import {
  Component,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
  computed,
  inject,
  signal
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import {
  SantralExtensionLogicalCall,
  SantralExtensionMonitorItem,
  SantralExtensionMonitorSnapshotResponse,
  SantralExtensionReportResponse,
  SantralWebApiService
} from '../../services/santralapi.service';

type DetailTab = 'summary' | 'statuses' | 'calls' | 'events';

@Component({
  selector: 'app-santral-extension-monitor',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './santral-extension-monitor.component.html',
  styleUrls: ['./santral-extension-monitor.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SantralExtensionMonitorComponent implements OnInit, OnDestroy {
  private readonly api = inject(SantralWebApiService);

  loading = signal(false);
  requestInProgress = signal(false);
  errorMessage = signal('');
  lastUpdateText = signal('');

  response = signal<SantralExtensionMonitorSnapshotResponse | null>(null);
  items = signal<SantralExtensionMonitorItem[]>([]);
  searchText = signal('');
  statusFilter = signal('all');

  autoRefresh = signal(false);
  refreshSeconds = signal(30);
  private timerId: ReturnType<typeof setInterval> | null = null;
  private destroyed = false;

  detailVisible = signal(false);
  selectedItem = signal<SantralExtensionMonitorItem | null>(null);
  detailTab = signal<DetailTab>('summary');
  reportLoading = signal(false);
  reportError = signal('');
  report = signal<SantralExtensionReportResponse | null>(null);
  reportStartDate = signal(this.dateInput(-7));
  reportEndDate = signal(this.dateInput(0));
  expandedCallKey = signal('');

  readonly statusOptions = [
    { value: 'all', title: 'همه وضعیت‌ها' },
    { value: 'ready', title: 'آماده پاسخگویی' },
    { value: 'on_call', title: 'در حال مکالمه' },
    { value: 'ringing', title: 'در حال زنگ خوردن' },
    { value: 'dnd_suspected', title: 'احتمال رد تماس / DND' },
    { value: 'noanswer_warning', title: 'بی‌پاسخ مکرر' },
    { value: 'short_drop', title: 'وصل و قطع سریع' },
    { value: 'offline', title: 'قطع / آفلاین' }
  ];

  readonly filteredItems = computed(() => {
    const query = this.searchText().trim().toLowerCase();
    const status = this.statusFilter();

    return this.items().filter(item => {
      if (status !== 'all' && item.health_code !== status) {
        return false;
      }

      if (!query) {
        return true;
      }

      return [
        item.extension,
        item.name,
        item.health_title,
        item.peer_status,
        item.ip_address,
        item.device_state_fa,
        item.peer_number,
        item.last_event_title,
        item.last_dial_status_fa,
        item.last_hangup_cause_txt
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  });

  ngOnInit(): void {
    this.loadSnapshot(true);
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopTimer();
  }

  loadSnapshot(showLoading = false): void {
    if (this.requestInProgress()) {
      return;
    }

    this.requestInProgress.set(true);
    this.errorMessage.set('');

    if (showLoading) {
      this.loading.set(true);
    }

    this.api.GetExtensionMonitorSnapshot(undefined, false)
      .pipe(finalize(() => {
        this.requestInProgress.set(false);
        this.loading.set(false);
      }))
      .subscribe({
        next: response => {
          this.response.set(response);
          this.items.set(response?.items ?? []);
          this.lastUpdateText.set(this.nowText());
        },
        error: error => {
          console.error('getExtensionMonitorSnapshot error:', error);
          this.errorMessage.set('دریافت فهرست داخلی‌ها ناموفق بود.');
        }
      });
  }

  setAutoRefresh(enabled: boolean): void {
    this.autoRefresh.set(enabled);
    this.restartTimer();
  }

  setRefreshSeconds(value: number | string): void {
    this.refreshSeconds.set(Math.max(10, Number(value) || 30));
    this.restartTimer();
  }

  openDetails(item: SantralExtensionMonitorItem): void {
    this.selectedItem.set(item);
    this.detailVisible.set(true);
    this.detailTab.set('summary');
    this.expandedCallKey.set('');
    this.loadReport();
  }

  closeDetails(): void {
    this.detailVisible.set(false);
    this.selectedItem.set(null);
    this.report.set(null);
    this.reportError.set('');
    this.expandedCallKey.set('');
  }

  setDetailTab(tab: DetailTab): void {
    this.detailTab.set(tab);
  }

  loadReport(): void {
    const item = this.selectedItem();

    if (!item || this.reportLoading()) {
      return;
    }

    this.reportLoading.set(true);
    this.reportError.set('');

    this.api.GetExtensionMonitorReport(
      item.extension,
      this.reportStartDate(),
      this.reportEndDate(),
      1000,
      false
    )
      .pipe(finalize(() => this.reportLoading.set(false)))
      .subscribe({
        next: response => this.report.set(response),
        error: error => {
          console.error('getExtensionMonitorReport error:', error);
          this.reportError.set('دریافت گزارش کامل این داخلی ناموفق بود.');
        }
      });
  }

  toggleCall(call: SantralExtensionLogicalCall): void {
    this.expandedCallKey.set(
      this.expandedCallKey() === call.call_key ? '' : call.call_key
    );
  }

  acknowledge(item: SantralExtensionMonitorItem, event?: Event): void {
    event?.stopPropagation();

    this.api.AcknowledgeExtensionMonitor(item.extension, false)
      .subscribe({
        next: () => {
          this.loadSnapshot(false);
          if (this.detailVisible()) {
            this.loadReport();
          }
        },
        error: error => {
          console.error('acknowledgeExtensionMonitor error:', error);
          this.errorMessage.set('تایید هشدار داخلی ذخیره نشد.');
        }
      });
  }

  copy(value: unknown, event?: Event): void {
    event?.stopPropagation();
    const text = String(value ?? '').trim();

    if (!text) {
      return;
    }

    navigator.clipboard?.writeText(text).catch(() => undefined);
  }

  itemStatusClass(item: SantralExtensionMonitorItem): string {
    return `extension-card-status extension-card-status--${item.health_class || 'warning'}`;
  }

  periodStatusClass(statusClass: string): string {
    return `period-status period-status--${statusClass || 'unknown'}`;
  }

  callStatusClass(status: string): string {
    const value = String(status ?? '').toUpperCase();

    if (value === 'ANSWERED') {
      return 'call-status call-status--answered';
    }

    if (value === 'BUSY') {
      return 'call-status call-status--busy';
    }

    if (value === 'NO ANSWER' || value === 'NOANSWER') {
      return 'call-status call-status--missed';
    }

    return 'call-status call-status--failed';
  }

  daemonTitle(): string {
    const monitor = this.response()?.monitor;

    if (!monitor) {
      return 'وضعیت اسکریپت نامشخص است';
    }

    return monitor.daemon_online
      ? `اسکریپت ثبت وضعیت فعال است؛ آخرین ضربان ${monitor.last_heartbeat_at || '-'}`
      : 'اسکریپت ثبت وضعیت فعال نیست؛ تاریخچه وضعیت‌های کوتاه ثبت نمی‌شود.';
  }

  trackCall(index: number, call: SantralExtensionLogicalCall): string {
    return call.call_key || String(index);
  }

  private restartTimer(): void {
    this.stopTimer();

    if (!this.autoRefresh() || this.destroyed) {
      return;
    }

    this.timerId = setInterval(
      () => this.loadSnapshot(false),
      this.refreshSeconds() * 1000
    );
  }

  private stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private nowText(): string {
    return new Intl.DateTimeFormat('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).format(new Date());
  }

  private dateInput(offsetDays: number): string {
    const date = new Date();
    date.setDate(date.getDate() + offsetDays);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}
