import { CommonModule } from '@angular/common';
import { Component, ViewEncapsulation, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';

import {
  SantralLiveExtension,
  SantralSpyMode,
  SantralWebApiService
} from '../../services/santralapi.service';

type KwsStatusFilter =
  | 'all'
  | 'busy'
  | 'idle'
  | 'offline'
  | 'ringing'
  | 'online';

type KwsSeriesFilter =
  | 'all'
  | 'selected'
  | string;

import { ListLiveSummaryComponent } from './partials/list-live-summary.component';
import { ListLiveFilterComponent } from './partials/list-live-filter.component';
import { ListLiveContentComponent } from './partials/list-live-content.component';
import { ListManageModalComponent } from './partials/list-manage-modal.component';

@Component({
  selector: 'app-santral-list',
  templateUrl: './santral-list.component.html',
  styleUrls: ['./santral-list.component.css'],
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ListLiveSummaryComponent,
    ListLiveFilterComponent,
    ListLiveContentComponent,
    ListManageModalComponent
  ],
})
export class SantralListComponent implements OnInit, OnDestroy {

  readonly vm = this;

  private readonly santralApi = inject(SantralWebApiService);
  private readonly session = inject(SessionStorageService);

  private readonly selectedStorageKey = 'kowsar_santral_selected_extensions';
  supervisorExtension = signal('');
  spyInProgressExtension = signal('');
  spyInProgressMode = signal<SantralSpyMode | ''>('');

  title = signal('وضعیت زنده داخلی‌های سانترال');
  hangupInProgressExtension = signal('');
  loading = signal(false);
  firstLoading = signal(true);
  errorMessage = signal('');

  records = signal<SantralLiveExtension[]>([]);
  lastUpdateText = signal('');

  searchText = signal('');
  extensionText = signal('');

  statusFilter = signal<KwsStatusFilter>('all');
  seriesFilter = signal<KwsSeriesFilter>('all');

  selectedExtensions = signal<string[]>([]);
  manageModalVisible = signal(false);
  manageSearchText = signal('');

  autoRefresh = signal(true);
  refreshSeconds = signal(5);

  requestInProgress = signal(false);
  private pendingRefresh = false;

  private timerId: ReturnType<typeof setInterval> | null = null;
  private destroyed = false;

  statusTabs = [
    { id: 'all' as KwsStatusFilter, title: 'همه', icon: 'mdi-view-grid-outline' },
    { id: 'busy' as KwsStatusFilter, title: 'در حال مکالمه', icon: 'mdi-phone-in-talk-outline' },
    { id: 'idle' as KwsStatusFilter, title: 'آزاد', icon: 'mdi-phone-check-outline' },
    { id: 'offline' as KwsStatusFilter, title: 'قطع / آفلاین', icon: 'mdi-phone-off-outline' },
    { id: 'online' as KwsStatusFilter, title: 'آنلاین‌ها', icon: 'mdi-access-point-check' },
  ];

  seriesTabs = computed(() => {
    const prefixes = new Set<string>();

    this.records().forEach(item => {
      const ext = String(item.extension ?? '').trim();

      if (/^[0-9]{3,}$/.test(ext)) {
        prefixes.add(ext.substring(0, 1));
      }
    });

    const result = Array.from(prefixes)
      .sort((a, b) => Number(a) - Number(b))
      .map(prefix => ({
        id: prefix,
        title: `سری ${prefix}00`,
        count: this.records().filter(x => String(x.extension ?? '').startsWith(prefix)).length
      }));

    return [
      { id: 'all', title: 'همه سری‌ها', count: this.records().length },
      { id: 'selected', title: 'منتخب من', count: this.selectedExtensions().length },
      ...result
    ];
  });

  filteredRecords = computed(() => {
    const q = this.cleanText(this.searchText()).toLowerCase();
    const extManual = this.getManualExtensionList();
    const selected = this.selectedExtensions();
    const status = this.statusFilter();
    const series = this.seriesFilter();

    return this.records().filter(item => {
      const ext = String(item.extension ?? '').trim();

      if (extManual.length > 0 && !extManual.includes(ext)) {
        return false;
      }

      if (series === 'selected') {
        if (!selected.includes(ext)) {
          return false;
        }
      } else if (series !== 'all') {
        if (!ext.startsWith(series)) {
          return false;
        }
      }

      if (!this.matchStatus(item, status)) {
        return false;
      }

      if (!q) {
        return true;
      }

      const call = this.getMainCall(item);

      return [
        item.extension,
        item.name,
        item.state_fa,
        item.peer_status,
        item.ip_address,
        item.peer_number,
        item.peer_name,
        item.peer_display,
        item.duration,
        item.call_direction,
        call?.peer_number,
        call?.peer_name,
        call?.peer_display,
        call?.caller,
        call?.caller_contact_name,
        call?.connected,
        call?.channel
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q);
    });
  });

  modalRecords = computed(() => {
    const q = this.cleanText(this.manageSearchText()).toLowerCase();

    if (!q) {
      return this.records();
    }

    return this.records().filter(item =>
      [
        item.extension,
        item.name,
        item.state_fa,
        item.peer_status,
        item.ip_address
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  });

  totalCount = computed(() => this.records().length);

  busyCount = computed(() =>
    this.records().filter(x => this.isBusy(x)).length
  );

  idleCount = computed(() =>
    this.records().filter(x => this.isIdle(x)).length
  );

  offlineCount = computed(() =>
    this.records().filter(x => this.isOffline(x)).length
  );

  onlineCount = computed(() =>
    this.records().filter(x => this.isRegistered(x)).length
  );

  filteredCount = computed(() => this.filteredRecords().length);

  ngOnInit(): void {
    this.syncSupervisorExtensionFromSession(false);
    this.loadSelectedExtensions();
    this.loadLiveStatus(true);
    this.startAutoRefresh();
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.stopAutoRefresh();
  }

  loadLiveStatus(showLocalLoading: boolean = false): void {
    if (this.requestInProgress()) {
      this.pendingRefresh = true;
      return;
    }

    this.requestInProgress.set(true);

    if (showLocalLoading) {
      this.loading.set(true);
    }

    this.errorMessage.set('');

    this.santralApi.GetExtensionsLiveStatus(undefined, false)
      .pipe(
        finalize(() => {
          this.requestInProgress.set(false);
          this.loading.set(false);

          if (this.destroyed) {
            return;
          }

          if (this.pendingRefresh) {
            this.pendingRefresh = false;

            setTimeout(() => {
              if (!this.destroyed) {
                this.loadLiveStatus(false);
              }
            }, 100);
          }
        })
      )
      .subscribe({
        next: (res) => {
          this.records.set(res?.extensions ?? []);
          this.lastUpdateText.set(this.formatNow());
          this.firstLoading.set(false);
        },
        error: (err) => {
          console.error('getExtensionsLiveStatus error:', err);
          this.errorMessage.set('خطا در دریافت وضعیت زنده سانترال');
          this.firstLoading.set(false);
        }
      });
  }

  refresh(): void {
    this.loadLiveStatus(true);
  }

  setStatusFilter(value: KwsStatusFilter): void {
    this.statusFilter.set(value);
  }

  setSeriesFilter(value: KwsSeriesFilter): void {
    this.seriesFilter.set(value);
  }

  applyManualExtensionFilter(): void {
    this.searchText.set(this.searchText());
  }

  clearAllFilters(): void {
    this.searchText.set('');
    this.extensionText.set('');
    this.statusFilter.set('all');
    this.seriesFilter.set('all');
  }

  openManageModal(): void {
    this.manageSearchText.set('');
    this.manageModalVisible.set(true);
  }

  closeManageModal(): void {
    this.manageModalVisible.set(false);
  }

  isSelected(extension: string): boolean {
    return this.selectedExtensions().includes(String(extension));
  }

  toggleSelected(extension: string): void {
    const ext = String(extension ?? '').trim();

    if (!ext) {
      return;
    }

    const current = [...this.selectedExtensions()];

    if (current.includes(ext)) {
      this.selectedExtensions.set(current.filter(x => x !== ext));
    } else {
      current.push(ext);
      current.sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
      this.selectedExtensions.set(current);
    }

    this.saveSelectedExtensions();
  }

  selectVisibleModalRecords(): void {
    const current = new Set(this.selectedExtensions());

    this.modalRecords().forEach(item => {
      const ext = String(item.extension ?? '').trim();

      if (ext) {
        current.add(ext);
      }
    });

    const list = Array.from(current).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    this.selectedExtensions.set(list);
    this.saveSelectedExtensions();
  }

  clearSelectedExtensions(): void {
    this.selectedExtensions.set([]);
    this.saveSelectedExtensions();
  }

  showOnlySelected(): void {
    this.seriesFilter.set('selected');
    this.statusFilter.set('all');
    this.closeManageModal();
  }

  toggleAutoRefresh(): void {
    this.autoRefresh.update(v => !v);

    if (this.autoRefresh()) {
      this.startAutoRefresh();
    } else {
      this.stopAutoRefresh();
    }
  }

  changeRefreshSeconds(value: any): void {
    const sec = Number(value);

    if (!Number.isFinite(sec) || sec < 3) {
      this.refreshSeconds.set(3);
    } else if (sec > 60) {
      this.refreshSeconds.set(60);
    } else {
      this.refreshSeconds.set(sec);
    }

    this.restartAutoRefresh();
  }

  private startAutoRefresh(): void {
    this.stopAutoRefresh();

    if (!this.autoRefresh()) {
      return;
    }

    this.timerId = setInterval(() => {
      this.loadLiveStatus(false);
    }, this.refreshSeconds() * 1000);
  }

  private stopAutoRefresh(): void {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }

  private restartAutoRefresh(): void {
    if (this.autoRefresh()) {
      this.startAutoRefresh();
    }
  }

  private matchStatus(item: SantralLiveExtension, status: KwsStatusFilter): boolean {
    switch (status) {
      case 'busy':
        return this.isBusy(item);

      case 'idle':
        return this.isIdle(item);

      case 'offline':
        return this.isOffline(item);

      case 'ringing':
        return this.isRinging(item);

      case 'online':
        return this.isRegistered(item);

      default:
        return true;
    }
  }

  private getManualExtensionList(): string[] {
    const value = this.cleanText(this.extensionText());

    if (!value) {
      return [];
    }

    return value
      .replace(/،/g, ',')
      .split(',')
      .map(x => this.cleanText(x))
      .filter(x => x !== '');
  }

  private loadSelectedExtensions(): void {
    try {
      const raw = localStorage.getItem(this.selectedStorageKey);

      if (!raw) {
        this.selectedExtensions.set([]);
        return;
      }

      const parsed = JSON.parse(raw);

      if (!Array.isArray(parsed)) {
        this.selectedExtensions.set([]);
        return;
      }

      const list = parsed
        .map(x => String(x ?? '').trim())
        .filter(x => x !== '')
        .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

      this.selectedExtensions.set(list);
    } catch {
      this.selectedExtensions.set([]);
    }
  }

  private saveSelectedExtensions(): void {
    try {
      localStorage.setItem(
        this.selectedStorageKey,
        JSON.stringify(this.selectedExtensions())
      );
    } catch { }
  }

  getMainCall(item: SantralLiveExtension): any {
    return item?.calls?.length ? item.calls[0] : null;
  }

  isBusy(item: SantralLiveExtension): boolean {
    return Number(item?.is_on_call) === 1;
  }

  isRegistered(item: SantralLiveExtension): boolean {
    return Number(item?.is_registered ?? 1) === 1;
  }

  isOffline(item: SantralLiveExtension): boolean {
    return !this.isBusy(item) && !this.isRegistered(item);
  }

  isIdle(item: SantralLiveExtension): boolean {
    return !this.isBusy(item) && this.isRegistered(item) && !this.isRinging(item);
  }

  isRinging(item: SantralLiveExtension): boolean {
    return item?.state === 'Ringing' || item?.state === 'Ring';
  }

  getStatusClass(item: SantralLiveExtension): string {
    if (this.isBusy(item)) {
      return 'kws-live-busy';
    }

    if (this.isRinging(item)) {
      return 'kws-live-ringing';
    }

    if (this.isOffline(item)) {
      return 'kws-live-offline';
    }

    return 'kws-live-idle';
  }

  getStatusIcon(item: SantralLiveExtension): string {
    if (this.isBusy(item)) {
      return 'mdi mdi-phone-in-talk-outline';
    }

    if (this.isRinging(item)) {
      return 'mdi mdi-phone-ring-outline';
    }

    if (this.isOffline(item)) {
      return 'mdi mdi-phone-off-outline';
    }

    return 'mdi mdi-phone-check-outline';
  }

  getStatusTitle(item: SantralLiveExtension): string {
    if (this.isBusy(item)) {
      return item.state_fa || 'در حال مکالمه';
    }

    if (this.isRinging(item)) {
      return item.state_fa || 'در حال زنگ خوردن';
    }

    if (this.isOffline(item)) {
      return item.state_fa || 'قطع / آفلاین';
    }

    return item.state_fa || 'آزاد';
  }

  getDirectionTitle(value?: string): string {
    switch (value) {
      case 'Incoming':
        return 'ورودی';

      case 'Outgoing':
        return 'خروجی';

      case 'Internal':
        return 'داخلی';

      default:
        return value || '-';
    }
  }

  getDirectionClass(value?: string): string {
    switch (value) {
      case 'Incoming':
        return 'kws-dir-incoming';

      case 'Outgoing':
        return 'kws-dir-outgoing';

      case 'Internal':
        return 'kws-dir-internal';

      default:
        return 'kws-dir-default';
    }
  }

  getPeerNumber(item: SantralLiveExtension): string {
    const call = this.getMainCall(item);
    const extension = this.cleanText(item?.extension);
    const direction = this.getCallDirection(item);

    const itemPeerNumber = this.cleanText(item?.peer_number);
    const callPeerNumber = this.cleanText(call?.peer_number);

    if (itemPeerNumber && itemPeerNumber !== extension) {
      return this.resolvePeerDisplay(
        itemPeerNumber,
        this.cleanText(item?.peer_contact_name),
        this.cleanText(item?.peer_extension_name),
        this.cleanText(item?.peer_name),
        this.cleanText(item?.peer_display),
        extension,
        direction
      );
    }

    if (callPeerNumber && callPeerNumber !== extension) {
      return this.resolvePeerDisplay(
        callPeerNumber,
        this.cleanText(call?.peer_contact_name),
        this.cleanText(call?.peer_extension_name),
        this.cleanText(call?.peer_name),
        this.cleanText(call?.peer_display),
        extension,
        direction
      );
    }

    return '-';
  }

  private resolvePeerDisplay(
    peerNumber: string,
    contactName: string,
    extensionName: string,
    peerName: string,
    peerDisplay: string,
    ownExtension: string,
    direction: string
  ): string {
    if (contactName) {
      return contactName;
    }

    if (extensionName) {
      return extensionName;
    }

    const amiName = peerName || peerDisplay;
    const isInvalidAmiName =
      !amiName
      || amiName === peerNumber
      || amiName === ownExtension
      || /^CID\s*:/i.test(amiName);

    /*
     * در تماس خروجی ناشناس، CallerIDName ممکن است CID:412 باشد.
     * وقتی شماره در PhoneBook نیست باید خود شماره مقصد نمایش داده شود.
     */
    if (direction === 'Outgoing' || isInvalidAmiName) {
      return peerNumber;
    }

    return amiName;
  }

  getDuration(item: SantralLiveExtension): string {
    const call = this.getMainCall(item);
    return item.duration || call?.duration || '-';
  }

  getCallDirection(item: SantralLiveExtension): string {
    const call = this.getMainCall(item);
    return item.call_direction || call?.call_direction || '';
  }

  getPeerStatus(item: SantralLiveExtension): string {
    return item.peer_status || '-';
  }

  getIpAddress(item: SantralLiveExtension): string {
    const ip = item.ip_address || '';

    if (!ip || ip === '-none-' || ip === '(Unspecified)' || ip === '0.0.0.0') {
      return '-';
    }

    return item.ip_port ? `${ip}:${item.ip_port}` : ip;
  }

  trackByExtension(index: number, item: SantralLiveExtension): string {
    return item.extension ?? String(index);
  }

  private cleanText(value: any): string {
    if (value === null || value === undefined) {
      return '';
    }

    return String(value).trim().replace(/\s+/g, ' ');
  }

  private formatNow(): string {
    const d = new Date();

    return d.toLocaleTimeString('fa-IR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  hangupCall(item: SantralLiveExtension): void {
    if (!item || !this.isBusy(item)) {
      return;
    }

    const extension = item.extension;
    const peer = this.getPeerNumber(item);

    const message = peer && peer !== '-'
      ? `مکالمه داخلی ${extension} با ${peer} قطع شود؟`
      : `مکالمه داخلی ${extension} قطع شود؟`;

    if (!window.confirm(message)) {
      return;
    }

    this.hangupInProgressExtension.set(extension);

    this.santralApi.HangupExtensionCall(extension, true)
      .pipe(
        finalize(() => {
          this.hangupInProgressExtension.set('');
        })
      )
      .subscribe({
        next: (res) => {
          if (Number(res?.ErrCode) === 0) {
            this.loadLiveStatus(true);
          } else {
            window.alert(res?.ErrDesc || 'قطع مکالمه ناموفق بود');
          }
        },
        error: (err) => {
          console.error('hangupExtensionCall error:', err);
          window.alert('خطا در قطع مکالمه');
        }
      });
  }


  private getSupervisorExtension(): string {
    return this.syncSupervisorExtensionFromSession(true);
  }

  private syncSupervisorExtensionFromSession(showMessage: boolean): string {
    const extension = this.readSupervisorExtensionFromSession();

    this.supervisorExtension.set(extension);

    if (!extension && showMessage) {
      window.alert('داخلی کاربر / ناظر داخل Session پیدا نشد');
    }

    return extension;
  }

  private readSupervisorExtensionFromSession(): string {
    const clean = this.cleanText(this.session.manager);

    if (/^[0-9]{2,8}$/.test(clean)) {
      return clean;
    }

    return '';
  }


  changeSupervisorExtension(): void {
    const extension = this.syncSupervisorExtensionFromSession(true);

    if (extension) {
      window.alert(`داخلی مدیر از Session خوانده شد: ${extension}`);
    }
  }


  getSpyModeTitle(mode: SantralSpyMode): string {
    switch (mode) {
      case 'listen':
        return 'فقط گوش دادن';

      case 'whisper':
        return 'Whisper';

      case 'barge':
        return 'Barge';

      default:
        return mode;
    }
  }


  spyCall(item: SantralLiveExtension, mode: SantralSpyMode): void {
    if (!item || !this.isBusy(item)) {
      return;
    }

    const supervisorExtension = this.getSupervisorExtension();

    if (!supervisorExtension) {
      return;
    }

    const targetExtension = item.extension;
    const peer = this.getPeerNumber(item);

    let message = '';

    if (mode === 'listen') {
      message = `فقط گوش دادن به تماس داخلی ${targetExtension}${peer && peer !== '-' ? ' با ' + peer : ''} انجام شود؟`;
    } else if (mode === 'whisper') {
      message = `حالت Whisper برای داخلی ${targetExtension} فعال شود؟\nمدیر فقط با کارمند صحبت می‌کند و مشتری نمی‌شنود.`;
    } else {
      message = `حالت Barge برای داخلی ${targetExtension} فعال شود؟\nمدیر وارد مکالمه می‌شود و هر دو طرف صدای مدیر را می‌شنوند.`;
    }

    if (!window.confirm(message)) {
      return;
    }

    this.spyInProgressExtension.set(targetExtension);
    this.spyInProgressMode.set(mode);

    this.santralApi.SpyExtensionCall(
      targetExtension,
      supervisorExtension,
      mode,
      true
    )
      .pipe(
        finalize(() => {
          this.spyInProgressExtension.set('');
          this.spyInProgressMode.set('');
        })
      )
      .subscribe({
        next: (res) => {
          if (Number(res?.ErrCode) === 0) {
            window.alert(res?.ErrDesc || 'درخواست مانیتور تماس ارسال شد');
          } else {
            window.alert(res?.ErrDesc || 'مانیتور تماس ناموفق بود');
          }
        },
        error: (err) => {
          console.error('spyExtensionCall error:', err);
          window.alert('خطا در اجرای مانیتور تماس');
        }
      });
  }


  isSpyLoading(item: SantralLiveExtension, mode: SantralSpyMode): boolean {
    return this.spyInProgressExtension() === item.extension && this.spyInProgressMode() === mode;
  }
}