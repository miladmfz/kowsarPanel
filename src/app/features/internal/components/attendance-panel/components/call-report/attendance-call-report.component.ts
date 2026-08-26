import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  inject,
  signal,
} from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridReadyEvent } from 'ag-grid-community';
import { Subscription, catchError, finalize, forkJoin, of } from 'rxjs';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import type {
  SantralDisposition,
  SantralFollowupDirection,
  SantralFollowupItem,
} from 'src/app/features/santral/models/santral-api.models';
import { SantralWebApiService } from 'src/app/features/santral/services/santralapi.service';
import { CustomerListModalComponent } from '../customer-list-modal/customer-list-modal.component';

type AttendanceCallReportMode = 'full' | 'summary' | 'followup';
type PhonebookSaveMode = 'manual' | 'customer';

type PhonebookCustomerMeta = {
  centralRef: string;
  customerCode: string;
  addressRef: string;
};
type CallMetricKey =
  | 'total'
  | 'answered'
  | 'no-answer'
  | 'busy'
  | 'talk-time'
  | 'answer-rate'
  | 'slot-7'
  | 'slot-8'
  | 'slot-9'
  | 'slot-10';

@Component({
  selector: 'app-attendance-call-report',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridModule, CustomerListModalComponent],
  templateUrl: './attendance-call-report.component.html',
  styleUrls: ['./attendance-call-report.component.css'],
})
export class AttendanceCallReportComponent
  extends AgGridBaseComponent
  implements OnChanges, OnDestroy {

  @Input() extension = '';
  @Input() personName = '';
  @Input() darkMode = false;
  @Input() compact = false;
  @Input() mode: AttendanceCallReportMode = 'full';

  private readonly santralApi = inject(SantralWebApiService);
  private readonly baseRepo = inject(KowsarBaseWebApi);
  private readonly notificationService = inject(NotificationService);
  private readonly session = inject(SessionStorageService);
  private requestSub?: Subscription;
  private detailSub?: Subscription;

  loading = signal(false);
  errorMessage = signal('');
  summary = signal<any>({});
  followupRows = signal<any[]>([]);
  incomingFollowupRows = signal<any[]>([]);
  outgoingFollowupRows = signal<any[]>([]);
  activeFollowupDirection = signal<SantralFollowupDirection>('incoming');
  lastUpdate = signal('');

  followupDetailModalOpen = signal(false);
  selectedFollowup = signal<any | null>(null);
  followupAttemptRows = signal<any[]>([]);

  detailModalOpen = signal(false);
  detailLoading = signal(false);
  detailError = signal('');
  detailTitle = signal('');
  detailDescription = signal('');
  detailValue = signal('');
  detailRows = signal<any[]>([]);
  detailMetric = signal<CallMetricKey>('total');

  phonebookModalOpen = signal(false);
  phonebookSaving = signal(false);
  phonebookForm = signal({
    number: '',
    name: '',
    explain: '',
  });
  phonebookRegisteredBy = signal('');
  phonebookSaveMode = signal<PhonebookSaveMode>('manual');
  phonebookCustomerModalOpen = signal(false);
  phonebookCustomerLoading = signal(false);
  phonebookCustomerRows = signal<any[]>([]);
  phonebookSelectedCustomer = signal<any | null>(null);
  phonebookCustomerResolving = signal(false);
  phonebookCustomerMeta = signal<PhonebookCustomerMeta>({
    centralRef: '',
    customerCode: '',
    addressRef: '',
  });

  readonly pageSize = 7;
  readonly detailPageSize = 10;

  readonly columnDefs: ColDef[] = [
    {
      field: 'display_name',
      headerName: 'مخاطب / شماره',
      minWidth: 200,
      flex: 1.4,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const name = this.escapeHtml(params?.data?.contact_name || '');
        const number = this.escapeHtml(params?.data?.number || '-');
        const isRingGroup = Number(params?.data?.is_ringgroup || 0) === 1;
        const ringGroupNumber = this.escapeHtml(params?.data?.ringgroup_number || '');
        const ringGroupName = this.escapeHtml(params?.data?.ringgroup_name || '');
        const ringGroupLabel = ringGroupName || (ringGroupNumber ? `گروه ${ringGroupNumber}` : 'گروه زنگ');
        const ringGroupBadge = isRingGroup
          ? `<small class="attendance-followup-ringgroup"><i class="fas fa-users"></i>${ringGroupLabel}</small>`
          : '';

        if (!name || name === number) {
          return `<div class="attendance-followup-peer"><strong>${number}</strong>${ringGroupBadge}</div>`;
        }

        return `<div class="attendance-followup-peer"><strong>${name}</strong><small>${number}</small>${ringGroupBadge}</div>`;
      },
    },
    {
      field: 'attempt_count',
      headerName: 'تعداد تلاش',
      width: 115,
      minWidth: 105,
      filter: 'agNumberColumnFilter',
      cellRenderer: (params: any) => {
        const value = this.formatNumber(params?.value);
        return `<span class="attendance-followup-attempt-count">${value}</span>`;
      },
    },
    {
      field: 'first_attempt_fa',
      headerName: 'اولین تلاش',
      minWidth: 155,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'last_attempt_fa',
      headerName: 'آخرین تلاش',
      minWidth: 155,
      sort: 'desc',
      filter: 'agTextColumnFilter',
      comparator: (_valueA: any, _valueB: any, nodeA: any, nodeB: any) =>
        String(nodeA?.data?.last_attempt || '').localeCompare(String(nodeB?.data?.last_attempt || '')),
    },
    {
      field: 'last_disposition_fa',
      headerName: 'آخرین نتیجه',
      minWidth: 125,
      filter: 'agSetColumnFilter',
      cellRenderer: (params: any) => {
        const value = this.escapeHtml(params?.value || 'نیاز به پیگیری');
        const cssClass = this.detailDispositionClass(params?.data?.last_disposition);
        return `<span class="attendance-call-detail-status ${cssClass}">${value}</span>`;
      },
    },
    {
      headerName: 'عملیات',
      width: 105,
      minWidth: 100,
      maxWidth: 115,
      pinned: 'left',
      sortable: false,
      filter: false,
      floatingFilter: false,
      cellRenderer: (params: any) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'attendance-followup-detail-btn';
        button.title = 'نمایش تلاش‌های این دوره';
        button.innerHTML = '<i class="fas fa-list-ul"></i><span>جزئیات</span>';
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          this.openFollowupDetails(params?.data);
        });
        return button;
      },
    },
  ];

  readonly detailColumnDefs: ColDef[] = [
    {
      field: 'calldate_display',
      headerName: 'زمان تماس',
      minWidth: 160,
      sort: 'desc',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'call_type_display',
      headerName: 'نوع تماس',
      minWidth: 115,
      filter: 'agSetColumnFilter',
    },
    {
      field: 'peer_display',
      headerName: 'طرف مقابل',
      minWidth: 190,
      flex: 1.2,
      filter: 'agTextColumnFilter',
      cellRenderer: (params: any) => {
        const rawNumber = this.cleanText(params?.data?.peer_number);
        const number = this.escapeHtml(rawNumber || '-');
        const contactName = this.cleanText(params?.data?.peer_contact_name);
        const extensionName = this.cleanText(params?.data?.peer_extension_name);
        const displayName = this.escapeHtml(contactName || extensionName);

        if (displayName && displayName !== number) {
          return `<div class="attendance-detail-peer"><strong>${displayName}</strong><small>${number}</small></div>`;
        }

        if (this.isExternalPeerNumber(rawNumber)) {
          return `<div class="attendance-detail-peer is-unknown"><strong>${number}</strong><small>در دفتر تلفن ثبت نشده</small></div>`;
        }

        return `<div class="attendance-detail-peer"><strong>${number}</strong></div>`;
      },
    },
    {
      field: 'disposition_display',
      headerName: 'نتیجه',
      minWidth: 125,
      filter: 'agSetColumnFilter',
      cellRenderer: (params: any) => {
        const value = this.escapeHtml(params?.value || '-');
        const cssClass = this.detailDispositionClass(params?.data?.disposition);
        return `<span class="attendance-call-detail-status ${cssClass}">${value}</span>`;
      },
    },
    {
      field: 'duration_display',
      headerName: 'مدت کل',
      minWidth: 115,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'billsec_display',
      headerName: 'مدت مکالمه',
      minWidth: 125,
      filter: 'agTextColumnFilter',
    },
    {
      headerName: 'دفتر تلفن',
      width: 130,
      minWidth: 125,
      maxWidth: 145,
      pinned: 'left',
      sortable: false,
      filter: false,
      floatingFilter: false,
      cellRenderer: (params: any) => {
        const row = params?.data || {};
        const number = this.cleanText(row?.peer_number);
        const contactName = this.cleanText(row?.peer_contact_name);

        if (!number || !this.isExternalPeerNumber(number)) {
          return '<span class="attendance-phonebook-na">—</span>';
        }

        if (contactName) {
          return '<span class="attendance-phonebook-saved"><i class="fas fa-check-circle"></i> ثبت شده</span>';
        }

        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'attendance-phonebook-add-btn';
        button.title = 'ثبت این شماره در دفتر تلفن';
        button.innerHTML = '<i class="fas fa-user-plus"></i><span>ثبت مخاطب</span>';
        button.addEventListener('click', (event) => {
          event.stopPropagation();
          this.openPhonebookAdd(row);
        });
        return button;
      },
    },
  ];

  readonly followupAttemptColumnDefs: ColDef[] = [
    {
      field: 'calldate_fa',
      headerName: 'زمان تلاش',
      minWidth: 165,
      sort: 'desc',
      filter: 'agTextColumnFilter',
    },
    {
      field: 'direction_fa',
      headerName: 'جهت',
      width: 105,
      filter: 'agSetColumnFilter',
    },
    {
      field: 'peer_display',
      headerName: 'طرف مقابل',
      minWidth: 175,
      filter: 'agTextColumnFilter',
      cellClass: 'text-center fw-bold',
    },
    {
      field: 'disposition_fa',
      headerName: 'نتیجه',
      minWidth: 125,
      filter: 'agSetColumnFilter',
      cellRenderer: (params: any) => {
        const value = this.escapeHtml(params?.value || '-');
        const cssClass = this.detailDispositionClass(params?.data?.disposition);
        return `<span class="attendance-call-detail-status ${cssClass}">${value}</span>`;
      },
    },
    {
      field: 'duration_fa',
      headerName: 'مدت کل',
      minWidth: 120,
      filter: 'agTextColumnFilter',
    },
    {
      field: 'billsec_fa',
      headerName: 'مدت مکالمه',
      minWidth: 130,
      filter: 'agTextColumnFilter',
    },
  ];

  constructor() {
    super();

    this.gridOptions = {
      ...(this.gridOptions ?? {}),
      enableRtl: true,
      pagination: true,
      paginationAutoPageSize: false,
      paginationPageSize: this.pageSize,
      animateRows: true,
      rowHeight: 42,
      headerHeight: 42,
      floatingFiltersHeight: 34,
      enableCellTextSelection: true,
      defaultColDef: {
        ...(this.gridOptions?.defaultColDef ?? {}),
        sortable: true,
        resizable: true,
        filter: true,
        floatingFilter: true,
        minWidth: 105,
        cellStyle: { textAlign: 'center' },
        headerClass: 'text-center',
      },
    };
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['extension'] || changes['mode']) {
      this.load();
    }
  }

  override ngOnDestroy(): void {
    this.requestSub?.unsubscribe();
    this.detailSub?.unsubscribe();
  }

  override onGridReady(params: GridReadyEvent, index: number): void {
    super.onGridReady(params, index);

    try {
      const resolvedPageSize = (index === 2 || index === 3)
        ? this.detailPageSize
        : this.pageSize;
      params.api.setGridOption('paginationAutoPageSize', false);
      params.api.setGridOption('paginationPageSize', resolvedPageSize);
    } catch { }

    setTimeout(() => {
      try {
        if (!params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch { }
    }, 80);
  }

  refreshReport(): void {
    this.load();
  }

  selectFollowupDirection(direction: SantralFollowupDirection): void {
    this.activeFollowupDirection.set(direction);
    const rows = direction === 'incoming'
      ? this.incomingFollowupRows()
      : this.outgoingFollowupRows();

    this.followupRows.set(rows);
    this.updateGridData(1, rows);
  }

  totalFollowupCount(): number {
    return this.incomingFollowupRows().length + this.outgoingFollowupRows().length;
  }

  openFollowupDetails(row: any): void {
    if (!row) {
      return;
    }

    const attempts = Array.isArray(row?.attempts) ? row.attempts : [];
    this.selectedFollowup.set(row);
    this.followupAttemptRows.set(attempts);
    this.followupDetailModalOpen.set(true);
    this.updateGridData(3, attempts);
  }

  closeFollowupDetails(): void {
    this.followupDetailModalOpen.set(false);
    this.selectedFollowup.set(null);
    this.followupAttemptRows.set([]);
    this.updateGridData(3, []);
  }

  openMetricDetails(metric: CallMetricKey): void {
    this.detailSub?.unsubscribe();
    this.detailMetric.set(metric);
    this.detailError.set('');
    this.detailRows.set([]);
    this.configureMetricModal(metric);
    this.detailModalOpen.set(true);

    if (metric.startsWith('slot-')) {
      this.detailLoading.set(false);
      return;
    }

    const extension = this.cleanExtension(this.extension);
    if (!extension) {
      this.detailError.set('داخلی سانترال برای این کارشناس مشخص نشده است.');
      return;
    }

    const today = this.todayGregorian();
    const disposition = this.metricDisposition(metric);

    this.detailLoading.set(true);

    this.detailSub = this.santralApi.GetDashboardCalls({
      page: 1,
      limit: 1000,
      sort: 'calldate',
      dir: 'DESC',
      startdate: today,
      enddate: today,
      extension,
      disposition,
      scanLimit: 20000,
    }, false).pipe(
      catchError((error) => {
        console.error('Attendance call metric details error:', error);
        this.detailError.set('دریافت جزئیات تماس از سانترال ناموفق بود.');
        return of({ cdr: [] });
      }),
      finalize(() => this.detailLoading.set(false))
    ).subscribe((response: any) => {
      const rows = Array.isArray(response?.cdr)
        ? response.cdr.map((row: any) => this.mapDetailRow(row, extension))
        : [];

      this.detailRows.set(rows);
      this.updateGridData(2, rows);
    });
  }

  openPhonebookAdd(row: any): void {
    const number = this.cleanText(row?.peer_number);
    const existingName = this.cleanText(row?.peer_contact_name);

    if (!number || !this.isExternalPeerNumber(number)) {
      this.notificationService.warning('این ردیف شماره خارجی قابل ثبت ندارد.');
      return;
    }

    if (existingName) {
      this.notificationService.info('این شماره از قبل در دفتر تلفن ثبت شده است.');
      return;
    }

    this.resetPhonebookCustomerState();
    this.phonebookSaveMode.set('manual');
    this.phonebookForm.set({
      number,
      name: '',
      explain: '',
    });
    this.phonebookRegisteredBy.set(this.getPhonebookRegistrantExtension());
    this.phonebookModalOpen.set(true);
  }

  closePhonebookAdd(): void {
    if (this.phonebookSaving()) {
      return;
    }

    this.phonebookModalOpen.set(false);
    this.phonebookForm.set({ number: '', name: '', explain: '' });
    this.phonebookRegisteredBy.set('');
    this.phonebookSaveMode.set('manual');
    this.resetPhonebookCustomerState();
  }

  setPhonebookSaveMode(mode: PhonebookSaveMode): void {
    if (this.phonebookSaving() || this.phonebookCustomerResolving()) {
      return;
    }

    if (this.phonebookSaveMode() === mode) {
      if (mode === 'customer' && !this.phonebookSelectedCustomer()) {
        this.openPhonebookCustomerModal('');
      }
      return;
    }

    this.phonebookSaveMode.set(mode);
    this.phonebookForm.update(form => ({
      ...form,
      name: '',
      explain: '',
    }));
    this.resetPhonebookCustomerState();

    if (mode === 'customer') {
      this.openPhonebookCustomerModal('');
    }
  }

  openPhonebookCustomerModal(query: string = ''): void {
    if (this.phonebookSaving()) {
      return;
    }

    this.phonebookCustomerModalOpen.set(true);
    this.loadPhonebookCustomers(query);
  }

  closePhonebookCustomerModal(): void {
    this.phonebookCustomerModalOpen.set(false);
  }

  loadPhonebookCustomers(query: string = ''): void {
    this.phonebookCustomerLoading.set(true);

    const filter: any = {
      SearchTarget: this.cleanText(query),
      BrokerRef: '0',
      Active: '4',
    };

    this.baseRepo.GetKowsarCustomer(filter)
      .pipe(finalize(() => this.phonebookCustomerLoading.set(false)))
      .subscribe({
        next: (data: any) => {
          this.phonebookCustomerRows.set(Array.isArray(data?.Customers) ? data.Customers : []);
        },
        error: (error: any) => {
          console.error('loadPhonebookCustomers error:', error);
          this.phonebookCustomerRows.set([]);
          this.notificationService.error('دریافت لیست مشتریان کوثر ناموفق بود.');
        },
      });
  }

  selectPhonebookCustomer(customer: any): void {
    if (!customer) {
      return;
    }

    this.phonebookCustomerModalOpen.set(false);
    this.phonebookSelectedCustomer.set(customer);

    const defaultName = this.cleanText(
      customer?.CustName_Small ||
      customer?.CustName ||
      customer?.CentralName ||
      customer?.Name
    );

    this.phonebookForm.update(form => ({
      ...form,
      name: defaultName,
      explain: '',
    }));

    const meta: PhonebookCustomerMeta = {
      centralRef: this.cleanCode(customer?.CentralRef ?? customer?.central_ref),
      customerCode: this.cleanCode(customer?.CustomerCode ?? customer?.customer_code),
      addressRef: this.cleanCode(customer?.AddressRef ?? customer?.address_ref),
    };

    this.phonebookCustomerMeta.set(meta);
    this.resolvePhonebookCustomerMeta(customer, meta);
  }

  onPhonebookNameChange(value: string): void {
    this.phonebookForm.update(form => ({ ...form, name: value }));
  }

  onPhonebookExplainChange(value: string): void {
    if (this.phonebookSaveMode() !== 'manual') {
      return;
    }
    this.phonebookForm.update(form => ({ ...form, explain: value }));
  }

  phonebookSelectedCustomerName(): string {
    const customer = this.phonebookSelectedCustomer();
    return this.cleanText(
      customer?.CustName_Small ||
      customer?.CustName ||
      customer?.CentralName ||
      customer?.Name
    ) || 'مشتری انتخاب‌شده';
  }

  phonebookCustomerSystemExplain(): string {
    if (this.phonebookSaveMode() !== 'customer' || !this.phonebookSelectedCustomer()) {
      return '';
    }

    return this.buildKowsarPhonebookExplain(
      this.phonebookCustomerMeta(),
      this.getPhonebookRegistrantExtension()
    );
  }

  savePhonebookContact(): void {
    const form = this.phonebookForm();
    const number = this.cleanText(form.number);
    const name = this.cleanText(form.name);
    const registeredBy = this.getPhonebookRegistrantExtension();
    const mode = this.phonebookSaveMode();

    if (!number) {
      this.notificationService.warning('شماره تماس مشخص نیست.');
      return;
    }

    if (!name) {
      this.notificationService.warning('نام مخاطب را وارد کنید.');
      return;
    }

    if (!registeredBy) {
      this.notificationService.warning('داخلی ثبت‌کننده از نشست کاربر مشخص نیست. یک‌بار داشبورد را بازخوانی کنید.');
      return;
    }

    let explain = '';

    if (mode === 'customer') {
      if (!this.phonebookSelectedCustomer()) {
        this.notificationService.warning('ابتدا مشتری را از لیست مشتریان انتخاب کنید.');
        return;
      }

      if (this.phonebookCustomerResolving()) {
        this.notificationService.info('اطلاعات کدهای مشتری در حال تکمیل است؛ چند لحظه صبر کنید.');
        return;
      }

      const meta = this.phonebookCustomerMeta();
      if (!meta.centralRef || !meta.customerCode) {
        this.notificationService.warning('CentralRef یا CustomerCode مشتری انتخاب‌شده مشخص نیست.');
        return;
      }

      explain = this.buildKowsarPhonebookExplain(meta, registeredBy);
    } else {
      const userExplain = this.stripPhonebookSystemAudit(this.cleanText(form.explain));
      explain = this.buildPhonebookExplain(userExplain, registeredBy);
    }

    this.phonebookSaving.set(true);

    this.santralApi.SaveCallerIdContactExact('', number, name, explain, false)
      .pipe(finalize(() => this.phonebookSaving.set(false)))
      .subscribe({
        next: (response: any) => {
          if (Number(response?.ErrCode) !== 0) {
            this.notificationService.error(response?.ErrDesc || 'ثبت مخاطب در دفتر تلفن ناموفق بود.');
            return;
          }

          const normalized = this.normalizePhoneNumber(number);
          const rows = this.detailRows().map((row: any) => {
            const rowNumber = this.cleanText(row?.peer_number);
            if (this.normalizePhoneNumber(rowNumber) !== normalized) {
              return row;
            }

            return {
              ...row,
              peer_contact_name: name,
              peer_display: name,
            };
          });

          this.detailRows.set(rows);
          this.updateGridData(2, rows);
          this.phonebookModalOpen.set(false);
          this.phonebookForm.set({ number: '', name: '', explain: '' });
          this.phonebookRegisteredBy.set('');
          this.phonebookSaveMode.set('manual');
          this.resetPhonebookCustomerState();
          this.notificationService.success(`مخاطب با موفقیت توسط داخلی ${registeredBy} در دفتر تلفن ثبت شد.`);
        },
        error: (error: any) => {
          console.error('savePhonebookContact error:', error);
          this.notificationService.error(
            error?.error?.ErrDesc || error?.message || 'خطا در ثبت مخاطب در دفتر تلفن.'
          );
        },
      });
  }

  private resolvePhonebookCustomerMeta(customer: any, initialMeta: PhonebookCustomerMeta): void {
    if (initialMeta.centralRef && initialMeta.customerCode && initialMeta.addressRef) {
      return;
    }

    const query = initialMeta.customerCode || initialMeta.centralRef || this.cleanText(customer?.CustName_Small);
    if (!query) {
      return;
    }

    this.phonebookCustomerResolving.set(true);

    this.santralApi.SearchKowsarCentralForPhonebook(query, '', 30, false)
      .pipe(finalize(() => this.phonebookCustomerResolving.set(false)))
      .subscribe({
        next: (response: any) => {
          if (Number(response?.ErrCode) !== 0) {
            return;
          }

          const results = Array.isArray(response?.results) ? response.results : [];
          const wantedCentral = initialMeta.centralRef;
          const wantedCustomer = initialMeta.customerCode;

          let match = results.find((row: any) =>
            wantedCentral && this.cleanCode(row?.central_code) === wantedCentral
          );

          if (!match && wantedCustomer) {
            match = results.find((row: any) =>
              Array.isArray(row?.customers) && row.customers.some((item: any) =>
                this.cleanCode(item?.customer_code) === wantedCustomer
              )
            );
          }

          match ||= results[0];
          if (!match) {
            return;
          }

          const customerRows = Array.isArray(match?.customers) ? match.customers : [];
          const exactCustomer = customerRows.find((item: any) =>
            wantedCustomer && this.cleanCode(item?.customer_code) === wantedCustomer
          ) || customerRows[0];

          this.phonebookCustomerMeta.set({
            centralRef:
              initialMeta.centralRef ||
              this.cleanCode(match?.central_code),
            customerCode:
              initialMeta.customerCode ||
              this.cleanCode(exactCustomer?.customer_code ?? match?.primary_customer_code),
            addressRef:
              initialMeta.addressRef ||
              this.cleanCode(exactCustomer?.address_ref ?? match?.primary_address_ref),
          });
        },
        error: (error: any) => {
          console.error('resolvePhonebookCustomerMeta error:', error);
        },
      });
  }

  private getPhonebookRegistrantExtension(): string {
    return this.cleanExtension(this.session.manager);
  }

  private stripPhonebookSystemAudit(value: string): string {
    if (!value) {
      return '';
    }

    return value
      .split(/\r?\n/)
      .filter(line => !/^SYSTEM\|RegisteredByExtension=/i.test(line.trim()))
      .join('\n')
      .trim();
  }

  private buildPhonebookExplain(userExplain: string, registeredBy: string): string {
    const systemLine = `SYSTEM|RegisteredByExtension=${registeredBy}`;
    return userExplain ? `${userExplain}\n${systemLine}` : systemLine;
  }

  private buildKowsarPhonebookExplain(meta: PhonebookCustomerMeta, registeredBy: string): string {
    return [
      'KOWSAR',
      `CentralRef=${meta.centralRef || '0'}`,
      `CustomerCode=${meta.customerCode || '0'}`,
      `AddressRef=${meta.addressRef || '0'}`,
      `ext=${registeredBy || '0'}`,
    ].join('|');
  }

  private cleanCode(value: any): string {
    const raw = this.cleanText(value);
    if (!raw) {
      return '';
    }

    const digits = raw.replace(/[^0-9]/g, '');
    return digits || raw;
  }

  private resetPhonebookCustomerState(): void {
    this.phonebookCustomerModalOpen.set(false);
    this.phonebookCustomerLoading.set(false);
    this.phonebookCustomerRows.set([]);
    this.phonebookSelectedCustomer.set(null);
    this.phonebookCustomerResolving.set(false);
    this.phonebookCustomerMeta.set({
      centralRef: '',
      customerCode: '',
      addressRef: '',
    });
  }

  closeMetricDetails(): void {
    this.detailSub?.unsubscribe();
    this.detailLoading.set(false);
    this.detailModalOpen.set(false);
    this.detailRows.set([]);
    this.detailError.set('');
    this.updateGridData(2, []);
  }

  detailDateLabel(): string {
    return new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date());
  }

  detailRowsCount(): string {
    return this.formatNumber(this.detailRows().length);
  }

  totalCalls(): number {
    return this.toNumber(this.summary()?.total_calls);
  }

  answeredCalls(): number {
    return this.toNumber(this.summary()?.answered_calls);
  }

  noAnswerCalls(): number {
    return this.toNumber(this.summary()?.no_answer_calls);
  }

  busyCalls(): number {
    return this.toNumber(this.summary()?.busy_calls);
  }

  answerRate(): string {
    return `${this.formatNumber(this.summary()?.answer_rate)}٪`;
  }

  talkTime(): string {
    return this.formatSeconds(this.summary()?.total_billsec);
  }

  formatNumber(value: any): string {
    return new Intl.NumberFormat('fa-IR', {
      maximumFractionDigits: 1,
    }).format(this.toNumber(value));
  }

  private load(): void {
    const extension = this.cleanExtension(this.extension);

    this.requestSub?.unsubscribe();
    this.summary.set({});
    this.followupRows.set([]);
    this.incomingFollowupRows.set([]);
    this.outgoingFollowupRows.set([]);
    this.errorMessage.set('');

    if (!extension) {
      this.loading.set(false);
      return;
    }

    const today = this.todayGregorian();
    this.loading.set(true);

    const dashboard$ = this.mode === 'followup'
      ? of({ summary: {}, __skipped: true })
      : this.santralApi.GetDashboard({
        startdate: today,
        enddate: today,
        extension,
      }, false).pipe(
        catchError((error) => {
          console.error('Attendance call dashboard error:', error);
          return of({ summary: {}, __failed: true });
        })
      );

    const followup$ = this.mode === 'summary'
      ? of({ incoming: [], outgoing: [], __skipped: true })
      : this.santralApi.GetFollowupCalls({
        startdate: today,
        enddate: today,
        extension,
        min_billsec: 3,
        scanLimit: 20000,
        limit: 500,
      }, false).pipe(
        catchError((error) => {
          console.error('Attendance follow-up calls error:', error);
          return of({ incoming: [], outgoing: [], __failed: true });
        })
      );

    this.requestSub = forkJoin({
      dashboard: dashboard$,
      followup: followup$,
    }).pipe(
      finalize(() => this.loading.set(false))
    ).subscribe(({ dashboard, followup }: any) => {
      this.summary.set(dashboard?.summary ?? {});

      const incomingRows = Array.isArray(followup?.incoming)
        ? followup.incoming.map((row: SantralFollowupItem) => this.mapFollowupGroup(row))
        : [];
      const outgoingRows = Array.isArray(followup?.outgoing)
        ? followup.outgoing.map((row: SantralFollowupItem) => this.mapFollowupGroup(row))
        : [];

      this.incomingFollowupRows.set(incomingRows);
      this.outgoingFollowupRows.set(outgoingRows);

      let activeDirection = this.activeFollowupDirection();
      if (activeDirection === 'incoming' && incomingRows.length === 0 && outgoingRows.length > 0) {
        activeDirection = 'outgoing';
        this.activeFollowupDirection.set('outgoing');
      } else if (activeDirection === 'outgoing' && outgoingRows.length === 0 && incomingRows.length > 0) {
        activeDirection = 'incoming';
        this.activeFollowupDirection.set('incoming');
      }

      const activeRows = activeDirection === 'incoming' ? incomingRows : outgoingRows;
      this.followupRows.set(activeRows);
      this.updateGridData(1, activeRows);
      this.lastUpdate.set(
        new Intl.DateTimeFormat('fa-IR', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }).format(new Date())
      );

      const dashboardFailed = this.mode !== 'followup' && dashboard?.__failed;
      const followupFailed = this.mode !== 'summary' && followup?.__failed;

      if (
        (this.mode === 'summary' && dashboardFailed) ||
        (this.mode === 'followup' && followupFailed) ||
        (this.mode === 'full' && dashboardFailed && followupFailed)
      ) {
        this.errorMessage.set('دریافت گزارش تماس از سانترال ناموفق بود.');
      }
    });
  }

  private configureMetricModal(metric: CallMetricKey): void {
    switch (metric) {
      case 'total':
        this.detailTitle.set('جزئیات کل تماس‌های امروز');
        this.detailDescription.set('همه تماس‌های ورودی، خروجی و داخلی مرتبط با این داخلی.');
        this.detailValue.set(`${this.formatNumber(this.totalCalls())} تماس`);
        break;

      case 'answered':
        this.detailTitle.set('تماس‌های پاسخ داده شده');
        this.detailDescription.set('تماس‌هایی که امروز با پاسخ موفق ثبت شده‌اند.');
        this.detailValue.set(`${this.formatNumber(this.answeredCalls())} تماس`);
        break;

      case 'no-answer':
        this.detailTitle.set('تماس‌های بی‌پاسخ');
        this.detailDescription.set('تماس‌هایی که امروز بدون پاسخ پایان یافته‌اند.');
        this.detailValue.set(`${this.formatNumber(this.noAnswerCalls())} تماس`);
        break;

      case 'busy':
        this.detailTitle.set('تماس‌های اشغال');
        this.detailDescription.set('تماس‌هایی که نتیجه آن‌ها اشغال ثبت شده است.');
        this.detailValue.set(`${this.formatNumber(this.busyCalls())} تماس`);
        break;

      case 'talk-time':
        this.detailTitle.set('ریز زمان مکالمه امروز');
        this.detailDescription.set('تماس‌های پاسخ داده شده و مدت مکالمه هر تماس.');
        this.detailValue.set(this.talkTime());
        break;

      case 'answer-rate':
        this.detailTitle.set('جزئیات نرخ پاسخ');
        this.detailDescription.set('نسبت تماس‌های پاسخ داده شده به کل تماس‌های امروز.');
        this.detailValue.set(this.answerRate());
        break;

      case 'slot-7':
      case 'slot-8':
      case 'slot-9':
      case 'slot-10':
        this.detailTitle.set(`تنظیم ${this.slotTitle(metric)}`);
        this.detailDescription.set('این جایگاه برای گزارش بعدی رزرو شده و هنوز منبع داده‌ای برای آن تعریف نشده است.');
        this.detailValue.set('رزرو');
        break;
    }
  }

  private metricDisposition(metric: CallMetricKey): SantralDisposition | '' {
    switch (metric) {
      case 'answered':
      case 'talk-time':
        return 'ANSWERED';
      case 'no-answer':
        return 'NO ANSWER';
      case 'busy':
        return 'BUSY';
      default:
        return '';
    }
  }

  private slotTitle(metric: CallMetricKey): string {
    switch (metric) {
      case 'slot-7': return 'جایگاه ۷';
      case 'slot-8': return 'جایگاه ۸';
      case 'slot-9': return 'جایگاه ۹';
      case 'slot-10': return 'جایگاه ۱۰';
      default: return 'جایگاه';
    }
  }

  private mapDetailRow(row: any, extension: string): any {
    const src = this.cleanText(row?.src_original || row?.src);
    const dst = this.cleanText(row?.dst_original || row?.dst);
    const srcDisplay = this.cleanText(
      row?.src_name_or_number || row?.src_display || row?.cnam || src
    );
    const dstDisplay = this.cleanText(
      row?.dst_name_or_number || row?.dst_display || dst
    );

    const explicitPeer = this.cleanText(
      row?.peer_display || row?.peer_contact_name || row?.peer_extension_name || row?.peer_number
    );
    const peer = explicitPeer || (src === extension
      ? (dstDisplay || dst)
      : (srcDisplay || src));

    return {
      ...row,
      calldate_display:
        this.cleanText(row?.calldate_start_fa) ||
        this.cleanText(row?.calldate_fa) ||
        this.cleanText(row?.calldate) ||
        '-',
      call_type_display: this.callTypeTitle(
        this.cleanText(row?.call_type_fa || row?.call_type)
      ),
      peer_display: peer || '-',
      disposition_display: this.dispositionTitle(
        this.cleanText(row?.disposition_fa || row?.disposition)
      ),
      duration_display:
        this.cleanText(row?.duration_fa) || this.formatSeconds(row?.duration),
      billsec_display:
        this.cleanText(row?.billsec_fa) || this.formatSeconds(row?.billsec),
    };
  }

  private dispositionTitle(value: string): string {
    const normalized = value.toUpperCase();

    switch (normalized) {
      case 'ANSWERED': return 'پاسخ داده شده';
      case 'NO ANSWER': return 'بی‌پاسخ';
      case 'BUSY': return 'اشغال';
      case 'FAILED': return 'ناموفق';
      case 'CONGESTION': return 'اختلال';
      default: return value || '-';
    }
  }

  private callTypeTitle(value: string): string {
    const normalized = value.toUpperCase();

    switch (normalized) {
      case 'INCOMING': return 'ورودی';
      case 'OUTGOING': return 'خروجی';
      case 'INTERNAL': return 'داخلی';
      case 'IVR': return 'منوی صوتی';
      case 'RINGGROUP': return 'گروه زنگ';
      case 'TRANSFER': return 'انتقالی';
      default: return value || 'سایر';
    }
  }

  private detailDispositionClass(value: any): string {
    switch (this.cleanText(value).toUpperCase()) {
      case 'ANSWERED': return 'is-answered';
      case 'NO ANSWER': return 'is-no-answer';
      case 'BUSY': return 'is-busy';
      default: return 'is-other';
    }
  }

  private mapFollowupGroup(row: SantralFollowupItem): any {
    return {
      ...row,
      number: this.cleanText(row?.number) || '-',
      contact_name: this.cleanText(row?.contact_name),
      display_name:
        this.cleanText(row?.display_name) ||
        this.cleanText(row?.contact_name) ||
        this.cleanText(row?.number) ||
        '-',
      attempt_count: this.toNumber(row?.attempt_count),
      first_attempt_fa: this.cleanText(row?.first_attempt_fa) || '-',
      last_attempt_fa: this.cleanText(row?.last_attempt_fa) || '-',
      last_disposition_fa: this.cleanText(row?.last_disposition_fa) || '-',
      is_ringgroup: this.toNumber(row?.is_ringgroup),
      ringgroup_number: this.cleanText(row?.ringgroup_number),
      ringgroup_name: this.cleanText(row?.ringgroup_name),
      ringgroup_members: Array.isArray(row?.ringgroup_members) ? row.ringgroup_members : [],
      attempts: Array.isArray(row?.attempts) ? row.attempts : [],
    };
  }

  private todayGregorian(): string {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private cleanExtension(value: any): string {
    const text = this.cleanText(value)
      .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
      .replace(/\D+/g, '');

    return text;
  }

  private isExternalPeerNumber(value: any): boolean {
    const digits = this.normalizePhoneNumber(value);
    const ownExtension = this.cleanExtension(this.extension);

    if (!digits || digits === ownExtension) {
      return false;
    }

    // داخلی‌ها و کدهای کوتاه وارد دفتر تلفن مشتریان نمی‌شوند.
    return digits.length >= 7;
  }

  private normalizePhoneNumber(value: any): string {
    return this.cleanText(value)
      .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
      .replace(/\D+/g, '');
  }

  private cleanText(value: any): string {
    return value === null || value === undefined
      ? ''
      : String(value).trim();
  }

  private toNumber(value: any): number {
    const normalized = this.cleanText(value)
      .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
      .replace(/,/g, '');

    const number = Number(normalized);
    return Number.isFinite(number) ? number : 0;
  }

  private formatSeconds(value: any): string {
    const total = Math.max(0, Math.floor(this.toNumber(value)));
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const seconds = total % 60;

    const parts: string[] = [];
    if (hours > 0) parts.push(`${this.formatNumber(hours)} ساعت`);
    if (minutes > 0) parts.push(`${this.formatNumber(minutes)} دقیقه`);
    if (seconds > 0 || parts.length === 0) parts.push(`${this.formatNumber(seconds)} ثانیه`);

    return parts.join(' و ');
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
