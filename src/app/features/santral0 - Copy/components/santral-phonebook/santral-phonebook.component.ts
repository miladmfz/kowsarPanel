import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { catchError, finalize, forkJoin, of } from 'rxjs';
import { SantralWebApiService } from '../../services/santralapi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { addDaysToGregorianDate, formatGregorianDateInput } from '../../shared/utils/santral-format.util';
import { displayJalaliDateTime, gregorianDateToJalaliText, jalaliTextToGregorianDate } from '../../shared/utils/santral-date.util';


interface CallerIdContact {
  Id: string;
  Name: string;
  Number: string;
  Explain: string;
}

interface UnknownCallerNumber {
  number_raw: string;
  number_normal?: string;
  contact_name?: string;

  call_count: number;
  answered_count: number;
  missed_count: number;

  first_call_date: string;
  last_call_date: string;

  total_duration?: number;
  total_billsec?: number;

  last_disposition?: string;
  last_disposition_fa?: string;

  last_dst?: string;
  last_did?: string;
  last_answered_by?: string;

  last_route_display?: string;

  last_duration?: number;
  last_billsec?: number;

  last_duration_fa?: string;
  last_billsec_fa?: string;

  last_uniqueid?: string;
  last_linkedid?: string;
  inbound_count?: number;
  outbound_count?: number;
  contact_days?: number;
  recent_30m_count?: number;
  last_operator?: string;
  followup_status?: string;
  followup_note?: string;
  followup_owner?: string;
  followup_updated_at?: string;
}

interface KowsarCentralPhone {
  type: string;
  label: string;
  value: string;
  address_ref?: number;
  contact_name?: string;
}

interface KowsarCentralAddress {
  address_code?: number;
  address_title?: string;
  address_text?: string;
  phone?: string;
  mobile?: string;
  fax?: string;
  email?: string;
  mobile_name?: string;
}

interface KowsarCentralSearchResult {
  central_code: number;
  central_private_code?: number | string | null;
  display_name: string;
  name?: string;
  title?: string;
  manager?: string;
  delegacy?: string;
  economy_code?: string;
  code_melli?: string;
  customer_count?: number;
  customer_codes?: number[];
  customer_types?: string[];
  primary_customer_code?: number | null;
  primary_address_ref?: number | null;
  address_count?: number;
  phones?: KowsarCentralPhone[];
  emails?: string[];
  addresses?: KowsarCentralAddress[];
  match_fields?: string[];
}

interface KowsarBatchPhoneMatch {
  number: string;
  normalized_number?: string;
  central_code: number;
  display_name: string;
  customer_code?: number | null;
  customer_type?: string;
  address_ref?: number | null;
  matched_field: string;
  matched_value: string;
  match_type: string;
}

interface CallerCallDetail {
  calldate: string;
  direction: 'incoming' | 'outgoing';
  direction_fa: string;
  extension: string;
  operator: string;
  operator_name?: string;
  operator_display?: string;
  answered_by?: string;
  answered_by_name?: string;
  src: string;
  src_name?: string;
  src_name_or_number?: string;
  dst: string;
  dst_name?: string;
  dst_name_or_number?: string;
  did: string;
  disposition: string;
  disposition_fa: string;
  duration: number;
  billsec: number;
  duration_fa: string;
  billsec_fa: string;
  recordingfile: string;
  has_recording?: number;
  recording_url?: string;
  uniqueid: string;
  linkedid: string;
  call_key?: string;
  attempted_extensions?: string[];
  attempted_extensions_display?: string;
  ringgroups?: string[];
  ringgroups_display?: string;
  legs_count?: number;
}

interface CallerDetailsSummary {
  total_calls: number;
  incoming_calls: number;
  outgoing_calls: number;
  answered_calls: number;
  missed_calls: number;
  total_duration: number;
  total_billsec: number;
}

type PhonebookTab = 'contacts' | 'unknown' | 'report';

import { PhonebookHeaderComponent } from './partials/phonebook-header.component';
import { PhonebookTabsComponent } from './partials/phonebook-tabs.component';
import { PhonebookContactsTabComponent } from './partials/phonebook-contacts-tab.component';
import { PhonebookUnknownTabComponent } from './partials/phonebook-unknown-tab.component';
import { PhonebookEditModalComponent } from './partials/phonebook-edit-modal.component';
import { PhonebookDetailsModalComponent } from './partials/phonebook-details-modal.component';
import { PhonebookNumberReportTabComponent } from './partials/phonebook-number-report-tab.component';
import { PhonebookCentralLinkModalComponent } from './partials/phonebook-central-link-modal.component';

@Component({
  selector: 'app-santral-phonebook',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    PhonebookHeaderComponent,
    PhonebookTabsComponent,
    PhonebookContactsTabComponent,
    PhonebookUnknownTabComponent,
    PhonebookNumberReportTabComponent,
    PhonebookEditModalComponent,
    PhonebookDetailsModalComponent,
    PhonebookCentralLinkModalComponent
  ],
  templateUrl: './santral-phonebook.component.html',
  styleUrls: ['./santral-phonebook.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SantralPhonebookComponent implements OnInit {

  readonly vm = this;

  private readonly santralApi = inject(SantralWebApiService);
  private readonly notificationService = inject(NotificationService);

  activeTab = signal<PhonebookTab>('contacts');

  loadingContacts = signal(false);
  loadingUnknown = signal(false);

  contactsLoaded = signal(false);
  unknownLoaded = signal(false);
  saving = signal(false);

  centralLinkModalVisible = signal(false);
  centralLinkLoading = signal(false);
  centralLinkSaving = signal(false);
  centralLinkHasSearched = signal(false);
  centralLinkQuery = signal('');
  centralLinkResults = signal<KowsarCentralSearchResult[]>([]);
  centralLinkUnknown = signal<UnknownCallerNumber | null>(null);

  batchKowsarPanelOpen = signal(false);
  batchKowsarLoading = signal(false);
  batchKowsarHasSearched = signal(false);
  batchKowsarQuery = signal('');
  batchKowsarResults = signal<KowsarBatchPhoneMatch[]>([]);
  batchKowsarRequestedCount = signal(0);
  batchKowsarFoundCount = signal(0);
  batchKowsarNotFoundCount = signal(0);
  batchKowsarErrorCount = signal(0);
  batchKowsarSavingKey = signal('');

  searchText = signal('');
  unknownSearchText = signal('');
  numberReportQuery = signal('');

  contacts = signal<CallerIdContact[]>([]);
  unknownNumbers = signal<UnknownCallerNumber[]>([]);

  unknownStartDate = signal(this.toJalaliDateInput(this.addDays(new Date(), -30)));
  unknownEndDate = signal(this.toJalaliDateInput(this.formatDateInput(new Date())));

  editModalVisible = signal(false);
  detailsModalVisible = signal(false);
  loadingDetails = signal(false);
  savingFollowUp = signal(false);
  selectedUnknown = signal<UnknownCallerNumber | null>(null);
  callDetails = signal<CallerCallDetail[]>([]);
  detailsSummary = signal<CallerDetailsSummary>(this.emptyDetailsSummary());
  activeRecordingKey = signal('');
  unavailableRecordingKeys = signal<Set<string>>(new Set<string>());
  followUpForm = signal({ status: 'new', note: '', owner: '' });

  editForm = signal({
    id: '',
    oldName: '',
    name: '',
    number: '',
    explain: ''
  });

  filteredContacts = computed(() => {
    const q = this.searchText().trim().toLowerCase();
    const list = this.contacts();

    if (!q) {
      return list;
    }

    return list.filter(item => {
      const text = [
        item.Id,
        item.Name,
        item.Number,
        item.Explain
      ].join(' ').toLowerCase();

      return text.includes(q);
    });
  });

  filteredUnknownNumbers = computed(() => {
    const q = this.unknownSearchText().trim().toLowerCase();
    const list = this.unknownNumbers();

    if (!q) {
      return list;
    }

    return list.filter(item => {
      const text = [
        item.number_raw,
        item.number_normal,
        item.call_count,
        item.answered_count,
        item.missed_count,
        item.first_call_date,
        item.last_call_date
      ].join(' ').toLowerCase();

      return text.includes(q);
    });
  });

  filteredBatchKowsarResults = computed(() => {
    const q = this.batchKowsarQuery().trim().toLowerCase();
    const list = this.batchKowsarResults();

    if (!q) {
      return list;
    }

    return list.filter(item => [
      item.number,
      item.normalized_number,
      item.central_code,
      item.display_name,
      item.customer_code,
      item.customer_type,
      item.matched_field,
      item.matched_value,
      item.match_type
    ].join(' ').toLowerCase().includes(q));
  });

  batchKowsarUniqueMatchedCount = computed(() => {
    return new Set(this.batchKowsarResults().map(item => String(item.number || '').trim()).filter(Boolean)).size;
  });

  numberReportSuggestions = computed(() => {
    const q = this.numberReportQuery().trim().toLowerCase();

    if (!q) {
      return this.contacts().slice(0, 20);
    }

    return this.contacts()
      .filter(item => `${item.Name} ${item.Number} ${item.Explain}`.toLowerCase().includes(q))
      .slice(0, 30);
  });

  ngOnInit(): void {
    this.loadContacts();
  }

  setTab(tab: PhonebookTab): void {
    this.activeTab.set(tab);

    if (tab === 'contacts' && !this.contactsLoaded()) {
      this.loadContacts();
    }

    if (tab === 'unknown' && !this.unknownLoaded()) {
      this.loadUnknownNumbers();
    }

    if (tab === 'report' && !this.contactsLoaded()) {
      this.loadContacts();
    }
  }

  refreshActiveTab(): void {
    if (this.activeTab() === 'unknown') {
      this.loadUnknownNumbers();
      return;
    }

    this.loadContacts();
  }

  loadAll(): void {
    this.refreshActiveTab();
  }

  loadContacts(): void {
    this.loadingContacts.set(true);

    this.santralApi.GetCallerIdContacts('', 1000, false)
      .pipe(finalize(() => this.loadingContacts.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت دفتر تلفن');
            return;
          }

          const rows = Array.isArray(res?.contacts) ? res.contacts : [];
          this.contacts.set(rows);
          this.contactsLoaded.set(true);
        },
        error: (err: any) => {
          console.error('GetCallerIdContacts error:', err);
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }

  loadUnknownNumbers(): void {
    const startdate = this.toGregorianDateInput(this.unknownStartDate());
    const enddate = this.toGregorianDateInput(this.unknownEndDate());

    if (!startdate || !enddate) {
      this.notificationService.warning('تاریخ را به‌صورت شمسی وارد کنید. نمونه: ۱۴۰۵/۰۴/۱۰');
      return;
    }

    if (startdate > enddate) {
      this.notificationService.warning('تاریخ شروع نباید بزرگ‌تر از تاریخ پایان باشد');
      return;
    }

    this.loadingUnknown.set(true);

    this.santralApi.GetUnknownCallerNumbers(startdate, enddate, 300, false)
      .pipe(finalize(() => this.loadingUnknown.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت شماره‌های ناشناس');
            return;
          }

          const rows = Array.isArray(res?.numbers) ? res.numbers : [];
          this.unknownNumbers.set(rows);
          this.unknownLoaded.set(true);
        },
        error: (err: any) => {
          console.error('GetUnknownCallerNumbers error:', err);
          this.notificationService.error('خطا در ارتباط با سرور');
        }
      });
  }

  toggleBatchKowsarPanel(): void {
    this.batchKowsarPanelOpen.update(value => !value);
  }

  onBatchKowsarQueryChange(value: string): void {
    this.batchKowsarQuery.set(value);
  }

  searchUnknownNumbersInKowsar(): void {
    const numbers = Array.from(new Set(
      this.unknownNumbers()
        .map(item => String(item?.number_raw || item?.number_normal || '').trim())
        .filter(Boolean)
    )).slice(0, 300);

    if (numbers.length === 0) {
      this.notificationService.warning('شماره ناشناسی برای بررسی گروهی وجود ندارد');
      return;
    }

    const chunks: string[][] = [];
    for (let index = 0; index < numbers.length; index += 75) {
      chunks.push(numbers.slice(index, index + 75));
    }

    this.batchKowsarPanelOpen.set(true);
    this.batchKowsarLoading.set(true);
    this.batchKowsarHasSearched.set(true);
    this.batchKowsarResults.set([]);
    this.batchKowsarRequestedCount.set(numbers.length);
    this.batchKowsarFoundCount.set(0);
    this.batchKowsarNotFoundCount.set(0);
    this.batchKowsarErrorCount.set(0);

    const requests = chunks.map(chunk =>
      this.santralApi.BatchSearchKowsarPhonesForPhonebook(chunk, 5, false)
        .pipe(catchError((error: any) => {
          console.error('BatchSearchKowsarPhonesForPhonebook error:', error);
          return of({
            ErrCode: 2,
            results: [],
            requested_count: chunk.length,
            found_count: 0,
            not_found_count: chunk.length
          });
        }))
    );

    forkJoin(requests)
      .pipe(finalize(() => this.batchKowsarLoading.set(false)))
      .subscribe(responses => {
        const rows: KowsarBatchPhoneMatch[] = [];
        let foundCount = 0;
        let notFoundCount = 0;
        let errorCount = 0;

        for (const response of responses as any[]) {
          if (Number(response?.ErrCode) !== 0) {
            errorCount += Number(response?.requested_count || 0);
            continue;
          }

          const currentRows = Array.isArray(response?.results) ? response.results : [];
          rows.push(...currentRows);
          foundCount += Number(response?.found_count || 0);
          notFoundCount += Number(response?.not_found_count || 0);
        }

        const uniqueRows = new Map<string, KowsarBatchPhoneMatch>();
        for (const row of rows) {
          const key = [
            String(row?.number || '').trim(),
            Number(row?.central_code || 0),
            String(row?.matched_field || '').trim(),
            Number(row?.address_ref || 0)
          ].join('|');

          if (!uniqueRows.has(key)) {
            uniqueRows.set(key, row);
          }
        }

        const resultRows = Array.from(uniqueRows.values());
        resultRows.sort((a, b) => {
          const numberCompare = String(a.number || '').localeCompare(String(b.number || ''));
          if (numberCompare !== 0) {
            return numberCompare;
          }
          return Number(a.central_code || 0) - Number(b.central_code || 0);
        });

        this.batchKowsarResults.set(resultRows);
        this.batchKowsarFoundCount.set(foundCount);
        this.batchKowsarNotFoundCount.set(notFoundCount);
        this.batchKowsarErrorCount.set(errorCount);

        if (resultRows.length === 0 && errorCount === 0) {
          this.notificationService.warning('برای شماره‌های بررسی‌شده موردی در کوثر پیدا نشد');
        } else if (errorCount > 0) {
          this.notificationService.warning('بخشی از شماره‌ها به علت خطای ارتباط بررسی نشدند');
        } else {
          this.notificationService.success(`${foundCount} شماره در اطلاعات کوثر پیدا شد`);
        }
      });
  }

  openBatchKowsarFullSearch(item: KowsarBatchPhoneMatch): void {
    const number = String(item?.number || '').trim();
    if (!number) {
      return;
    }

    const source = this.unknownNumbers().find(row => {
      const raw = String(row?.number_raw || '').trim();
      const normal = String(row?.number_normal || '').trim();
      return raw === number || normal === number || raw.endsWith(number.slice(-10));
    });

    this.openKowsarCentralLink(source || {
      number_raw: number,
      number_normal: item.normalized_number || number,
      call_count: 0,
      answered_count: 0,
      missed_count: 0,
      first_call_date: '',
      last_call_date: ''
    });
  }

  addBatchKowsarResultToPhonebook(item: KowsarBatchPhoneMatch): void {
    const number = String(item?.number || '').trim();
    const centralCode = Number(item?.central_code || 0);
    const displayName = String(item?.display_name || '').trim();

    if (!number || centralCode <= 0 || !displayName) {
      this.notificationService.warning('اطلاعات شماره یا مرکز کامل نیست');
      return;
    }

    const saveKey = `${number}|${centralCode}`;
    this.batchKowsarSavingKey.set(saveKey);

    const explainParts = ['KOWSAR', `CentralRef=${centralCode}`];
    const customerCode = Number(item?.customer_code || 0);
    const addressRef = Number(item?.address_ref || 0);

    if (customerCode > 0) {
      explainParts.push(`CustomerCode=${customerCode}`);
    }
    if (addressRef > 0) {
      explainParts.push(`AddressRef=${addressRef}`);
    }

    const explain = explainParts.join('|');

    this.santralApi.SaveCallerIdContactExact('', number, displayName, explain, false)
      .pipe(finalize(() => this.batchKowsarSavingKey.set('')))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'افزودن شماره به دفتر تلفن ناموفق بود');
            return;
          }

          const saved = res?.contact || {
            Id: '',
            Name: displayName,
            Number: number,
            Explain: explain
          };

          this.upsertContact(saved);
          this.removeUnknownNumber(number);
          this.batchKowsarResults.update(list => list.filter(row => String(row?.number || '').trim() !== number));
          this.notificationService.success('شماره به دفتر تلفن اضافه شد');
        },
        error: (error: any) => {
          console.error('addBatchKowsarResultToPhonebook error:', error);
          this.notificationService.error('خطا در افزودن شماره به دفتر تلفن');
        }
      });
  }

  batchKowsarSaveKey(item: KowsarBatchPhoneMatch): string {
    return `${String(item?.number || '').trim()}|${Number(item?.central_code || 0)}`;
  }

  batchMatchTypeFa(value: string): string {
    switch (String(value || '').toUpperCase()) {
      case 'EXACT': return 'تطابق دقیق';
      case 'NORMALIZED': return 'تطابق نرمال‌شده';
      case 'LOCAL_SUFFIX': return 'تطابق ۸ رقم آخر';
      case 'CONTAINS': return 'شماره داخل فیلد';
      default: return value || '-';
    }
  }

  onSearchChange(value: string): void {
    this.searchText.set(value);
  }

  onUnknownSearchChange(value: string): void {
    this.unknownSearchText.set(value);
  }

  onUnknownStartDateChange(value: string): void {
    this.unknownStartDate.set(value);
  }

  onUnknownEndDateChange(value: string): void {
    this.unknownEndDate.set(value);
  }

  openKowsarCentralLink(item: UnknownCallerNumber): void {
    const number = String(item?.number_raw || item?.number_normal || '').trim();

    if (!number) {
      this.notificationService.warning('شماره تماس برای ایجاد ارتباط نامعتبر است');
      return;
    }

    this.centralLinkUnknown.set(item);
    this.centralLinkQuery.set(number);
    this.centralLinkResults.set([]);
    this.centralLinkHasSearched.set(false);
    this.centralLinkModalVisible.set(true);
    this.searchKowsarCentral();
  }

  closeKowsarCentralLink(force = false): void {
    if (this.centralLinkSaving() && !force) {
      return;
    }

    this.centralLinkModalVisible.set(false);
    this.centralLinkLoading.set(false);
    this.centralLinkSaving.set(false);
    this.centralLinkHasSearched.set(false);
    this.centralLinkQuery.set('');
    this.centralLinkResults.set([]);
    this.centralLinkUnknown.set(null);
  }

  onCentralLinkQueryChange(value: string): void {
    this.centralLinkQuery.set(value);
  }

  searchKowsarCentral(): void {
    const query = this.centralLinkQuery().trim();
    const selected = this.centralLinkUnknown();
    const number = String(selected?.number_raw || selected?.number_normal || '').trim();

    if (query.length < 2) {
      this.notificationService.warning('برای جستجو حداقل دو کاراکتر وارد کنید');
      return;
    }

    this.centralLinkLoading.set(true);
    this.centralLinkHasSearched.set(true);

    this.santralApi.SearchKowsarCentralForPhonebook(query, number, 40, false)
      .pipe(finalize(() => this.centralLinkLoading.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.centralLinkResults.set([]);
            this.notificationService.error(res?.ErrDesc || 'جستجو در اطلاعات کوثر ناموفق بود');
            return;
          }

          const rows = Array.isArray(res?.results) ? res.results : [];
          this.centralLinkResults.set(rows);
        },
        error: (err: any) => {
          console.error('SearchKowsarCentralForPhonebook error:', err);
          this.centralLinkResults.set([]);
          this.notificationService.error('ارتباط با دیتابیس کوثر برقرار نشد');
        }
      });
  }

  linkUnknownToKowsarCentral(result: KowsarCentralSearchResult): void {
    const selected = this.centralLinkUnknown();
    const number = String(selected?.number_raw || selected?.number_normal || '').trim();
    const centralCode = Number(result?.central_code || 0);
    const displayName = String(result?.display_name || result?.name || '').trim();

    if (!number || centralCode <= 0 || !displayName) {
      this.notificationService.warning('اطلاعات شماره یا مرکز انتخاب‌شده کامل نیست');
      return;
    }

    const explainParts = [
      'KOWSAR',
      `CentralRef=${centralCode}`
    ];

    const customerCode = Number(result?.primary_customer_code || 0);
    const addressRef = Number(result?.primary_address_ref || 0);

    if (customerCode > 0) {
      explainParts.push(`CustomerCode=${customerCode}`);
    }
    if (addressRef > 0) {
      explainParts.push(`AddressRef=${addressRef}`);
    }

    const explain = explainParts.join('|');
    this.centralLinkSaving.set(true);

    this.santralApi.SaveCallerIdContactExact('', number, displayName, explain, false)
      .pipe(finalize(() => this.centralLinkSaving.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'ثبت ارتباط با کوثر ناموفق بود');
            return;
          }

          const saved = res?.contact || {
            Id: '',
            Name: displayName,
            Number: number,
            Explain: explain
          };

          this.upsertContact(saved);
          this.removeUnknownNumber(number);
          this.notificationService.success(`شماره به مرکز ${centralCode} متصل شد`);
          this.closeKowsarCentralLink(true);
        },
        error: (err: any) => {
          console.error('linkUnknownToKowsarCentral error:', err);
          this.notificationService.error('خطا در ذخیره ارتباط شماره با کوثر');
        }
      });
  }

  kowsarCustomerCodes(result: KowsarCentralSearchResult): string {
    const values = Array.isArray(result?.customer_codes) ? result.customer_codes : [];
    return values.length > 0 ? values.join('، ') : '-';
  }

  kowsarCustomerTypes(result: KowsarCentralSearchResult): string {
    const values = Array.isArray(result?.customer_types) ? result.customer_types.filter(Boolean) : [];
    return values.length > 0 ? values.join('، ') : '-';
  }

  kowsarMatchFields(result: KowsarCentralSearchResult): string {
    const values = Array.isArray(result?.match_fields) ? result.match_fields.filter(Boolean) : [];
    return values.length > 0 ? values.join('، ') : 'تطابق در اطلاعات مرکز';
  }

  kowsarPrimaryAddress(result: KowsarCentralSearchResult): string {
    const rows = Array.isArray(result?.addresses) ? result.addresses : [];
    const found = rows.find(row => String(row?.address_text || '').trim() !== '');
    return String(found?.address_text || '').trim() || '-';
  }

  onNumberReportQueryChange(value: string): void {
    this.numberReportQuery.set(value);
  }

  openContactDetails(item: CallerIdContact): void {
    const number = String(item?.Number || '').trim();
    if (!number) {
      this.notificationService.warning('برای این مخاطب شماره‌ای ثبت نشده است');
      return;
    }

    this.numberReportQuery.set(number);
    this.openNumberDetails(number, {
      number_raw: number,
      number_normal: number,
      contact_name: item.Name || '',
      call_count: 0,
      answered_count: 0,
      missed_count: 0,
      first_call_date: '',
      last_call_date: ''
    });
  }

  runNumberReport(): void {
    const query = this.numberReportQuery().trim();
    if (!query) {
      this.notificationService.warning('شماره یا نام مخاطب را وارد کنید');
      return;
    }

    const normalized = query.toLowerCase();
    const contact = this.contacts().find(item =>
      String(item.Number || '').trim() === query ||
      String(item.Name || '').trim().toLowerCase() === normalized
    ) || this.numberReportSuggestions()[0];

    if (contact && !/^[+0-9۰-۹٠-٩\s()-]+$/.test(query)) {
      this.openContactDetails(contact);
      return;
    }

    this.openNumberDetails(query, {
      number_raw: query,
      number_normal: query,
      contact_name: contact?.Name || '',
      call_count: 0,
      answered_count: 0,
      missed_count: 0,
      first_call_date: '',
      last_call_date: ''
    });
  }

  openDetails(item: UnknownCallerNumber): void {
    const number = String(item?.number_raw || item?.number_normal || '').trim();
    if (!number) return;
    this.openNumberDetails(number, item);
  }

  private openNumberDetails(number: string, item: UnknownCallerNumber): void {
    this.selectedUnknown.set(item);
    this.followUpForm.set({
      status: item.followup_status || 'new',
      note: item.followup_note || '',
      owner: item.followup_owner || item.last_operator || ''
    });
    this.callDetails.set([]);
    this.detailsSummary.set(this.emptyDetailsSummary());
    this.activeRecordingKey.set('');
    this.unavailableRecordingKeys.set(new Set<string>());
    this.detailsModalVisible.set(true);
    this.loadingDetails.set(true);

    const startdate = this.toGregorianDateInput(this.unknownStartDate());
    const enddate = this.toGregorianDateInput(this.unknownEndDate());

    // limit=0 یعنی همه تماس‌های بازه انتخاب‌شده، نه فقط چند تماس آخر.
    this.santralApi.GetCallerNumberDetails(number, startdate, enddate, 0, false)
      .pipe(finalize(() => this.loadingDetails.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت جزئیات تماس');
            return;
          }
          const calls = Array.isArray(res?.calls) ? res.calls : [];
          this.callDetails.set(calls);

          const rawSummary = res?.summary || {};
          this.detailsSummary.set({
            total_calls: Number(rawSummary.total_calls ?? calls.length) || 0,
            incoming_calls: Number(rawSummary.incoming_calls ?? 0) || 0,
            outgoing_calls: Number(rawSummary.outgoing_calls ?? 0) || 0,
            answered_calls: Number(rawSummary.answered_calls ?? 0) || 0,
            missed_calls: Number(rawSummary.missed_calls ?? 0) || 0,
            total_duration: Number(rawSummary.total_duration ?? 0) || 0,
            total_billsec: Number(rawSummary.total_billsec ?? 0) || 0
          });

          const contactName = String(res?.contact_name || '').trim();
          if (contactName) {
            this.selectedUnknown.update(current => current
              ? { ...current, contact_name: contactName } as UnknownCallerNumber
              : current);
          }

          const f = res?.followup || {};
          this.followUpForm.set({
            status: f.status || item.followup_status || 'new',
            note: f.note || item.followup_note || '',
            owner: f.owner || item.followup_owner || item.last_operator || ''
          });
        },
        error: () => this.notificationService.error('خطا در ارتباط با سرور')
      });
  }

  closeDetails(): void {
    if (this.savingFollowUp()) return;
    this.detailsModalVisible.set(false);
    this.selectedUnknown.set(null);
    this.callDetails.set([]);
    this.detailsSummary.set(this.emptyDetailsSummary());
    this.activeRecordingKey.set('');
    this.unavailableRecordingKeys.set(new Set<string>());
  }

  openSelectedDetailsKowsarLink(): void {
    const item = this.selectedUnknown();
    if (!item) return;

    this.closeDetails();
    this.openKowsarCentralLink(item);
  }

  openSelectedDetailsAdd(): void {
    const item = this.selectedUnknown();
    if (!item) return;

    this.closeDetails();
    this.openAddFromUnknown(item);
  }

  onFollowUpStatusChange(value: string): void {
    this.followUpForm.update(form => ({ ...form, status: value }));
  }

  onFollowUpNoteChange(value: string): void {
    this.followUpForm.update(form => ({ ...form, note: value }));
  }

  onFollowUpOwnerChange(value: string): void {
    this.followUpForm.update(form => ({ ...form, owner: value }));
  }

  saveFollowUp(): void {
    const item = this.selectedUnknown();
    const number = String(item?.number_raw || item?.number_normal || '').trim();
    if (!number) return;
    const form = this.followUpForm();
    this.savingFollowUp.set(true);

    this.santralApi.SaveCallerNumberFollowUp(number, form.status, form.note, form.owner, false)
      .pipe(finalize(() => this.savingFollowUp.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'ذخیره پیگیری ناموفق بود');
            return;
          }
          this.notificationService.success('وضعیت پیگیری ذخیره شد');
          const f = res?.followup || {};
          this.unknownNumbers.update(list => list.map(row => row.number_raw === number ? {
            ...row,
            followup_status: f.status || form.status,
            followup_note: f.note || form.note,
            followup_owner: f.owner || form.owner,
            followup_updated_at: f.updated_at || ''
          } : row));
        },
        error: () => this.notificationService.error('خطا در ذخیره وضعیت پیگیری')
      });
  }

  getFollowUpTitle(status: string | undefined): string {
    const map: Record<string, string> = {
      new: 'پیگیری نشده', pending: 'در حال پیگیری', contacted: 'تماس گرفته شد',
      converted: 'تبدیل به مشتری', not_needed: 'عدم نیاز'
    };
    return map[String(status || 'new')] || 'پیگیری نشده';
  }

  getRecordingUrl(file: string): string {
    return this.santralApi.GetRecordingUrl(file || '');
  }

  hasRecordingReference(call: CallerCallDetail): boolean {
    if (Number(call?.has_recording) === 0) {
      return false;
    }

    const value = String(call?.recordingfile || '').trim();
    if (!value) {
      return false;
    }

    const invalidValues = new Set(['0', 'null', 'none', 'false', 'no', '-', 'n/a']);
    return !invalidValues.has(value.toLowerCase());
  }

  recordingKey(call: CallerCallDetail): string {
    return [call?.uniqueid, call?.calldate, call?.recordingfile]
      .map(value => String(value || '').trim())
      .join('|');
  }

  isRecordingOpen(call: CallerCallDetail): boolean {
    return this.activeRecordingKey() === this.recordingKey(call);
  }

  isRecordingUnavailable(call: CallerCallDetail): boolean {
    return this.unavailableRecordingKeys().has(this.recordingKey(call));
  }

  toggleRecording(call: CallerCallDetail): void {
    if (!this.hasRecordingReference(call) || this.isRecordingUnavailable(call)) {
      return;
    }

    const key = this.recordingKey(call);
    this.activeRecordingKey.update(current => current === key ? '' : key);
  }

  onRecordingError(call: CallerCallDetail): void {
    const key = this.recordingKey(call);
    this.unavailableRecordingKeys.update(current => {
      const next = new Set(current);
      next.add(key);
      return next;
    });

    if (this.activeRecordingKey() === key) {
      this.activeRecordingKey.set('');
    }
  }

  private emptyDetailsSummary(): CallerDetailsSummary {
    return {
      total_calls: 0,
      incoming_calls: 0,
      outgoing_calls: 0,
      answered_calls: 0,
      missed_calls: 0,
      total_duration: 0,
      total_billsec: 0
    };
  }

  openAddModal(): void {
    this.editForm.set({
      id: '',
      oldName: '',
      name: '',
      number: '',
      explain: 'ثبت از پنل'
    });

    this.editModalVisible.set(true);
  }

  openAddFromUnknown(item: UnknownCallerNumber): void {
    const number = String(item?.number_raw || item?.number_normal || '').trim();

    this.editForm.set({
      id: '',
      oldName: '',
      name: '',
      number,
      explain: 'ثبت از شماره‌های ناشناس'
    });

    this.editModalVisible.set(true);
  }

  openEditModal(item: CallerIdContact): void {
    this.editForm.set({
      id: item.Id || '',
      oldName: item.Name || '',
      name: item.Name || '',
      number: item.Number || '',
      explain: item.Explain || ''
    });

    this.editModalVisible.set(true);
  }

  closeEditModal(force = false): void {
    if (this.saving() && !force) {
      return;
    }

    this.editModalVisible.set(false);

    this.editForm.set({
      id: '',
      oldName: '',
      name: '',
      number: '',
      explain: ''
    });
  }

  onNameChange(value: string): void {
    this.editForm.update(form => ({
      ...form,
      name: value
    }));
  }

  onNumberChange(value: string): void {
    this.editForm.update(form => ({
      ...form,
      number: value
    }));
  }

  onExplainChange(value: string): void {
    this.editForm.update(form => ({
      ...form,
      explain: value
    }));
  }

  saveContact(): void {
    const form = this.editForm();

    const id = String(form.id || '').trim();
    const name = String(form.name || '').trim();
    const number = String(form.number || '').trim();
    const explain = String(form.explain || '').trim();

    if (!name) {
      this.notificationService.warning('نام مخاطب را وارد کنید');
      return;
    }

    if (!number) {
      this.notificationService.warning('شماره تماس را وارد کنید');
      return;
    }

    this.saving.set(true);

    this.santralApi.SaveCallerIdContactExact(id, number, name, explain)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'ذخیره مخاطب ناموفق بود');
            return;
          }

          this.notificationService.success('مخاطب با موفقیت ذخیره شد');

          const saved = res?.contact || { Id: id, Name: name, Number: number, Explain: explain };
          this.upsertContact(saved);
          this.removeUnknownNumber(number);

          this.closeEditModal(true);

          if (!this.contactsLoaded()) {
            this.loadContacts();
          }
        },
        error: (err: any) => {
          console.error('SaveCallerIdContactExact error:', err);

          const msg =
            err?.error?.ErrDesc ||
            err?.message ||
            'خطا در ذخیره مخاطب';

          this.notificationService.error(msg);
        }
      });
  }


  private upsertContact(contact: Partial<CallerIdContact>): void {
    const id = String(contact?.Id || '').trim();
    const normalized: CallerIdContact = {
      Id: id,
      Name: String(contact?.Name || '').trim(),
      Number: String(contact?.Number || '').trim(),
      Explain: String(contact?.Explain || '').trim()
    };

    if (!normalized.Id && !normalized.Number) {
      return;
    }

    this.contacts.update(list => {
      const index = list.findIndex(row => {
        const rowId = String(row?.Id || '').trim();
        const rowNumber = String(row?.Number || '').trim();

        return (
          (normalized.Id && rowId === normalized.Id) ||
          (normalized.Number && rowNumber === normalized.Number)
        );
      });

      if (index < 0) {
        return [normalized, ...list];
      }

      const copy = [...list];
      copy[index] = {
        ...copy[index],
        ...normalized
      };

      return copy;
    });

    this.contactsLoaded.set(true);
  }

  private removeUnknownNumber(number: string): void {
    const raw = String(number || '').trim();

    if (!raw) {
      return;
    }

    const tail10 = raw.slice(-10);
    const tail8 = raw.slice(-8);

    this.unknownNumbers.update(list =>
      list.filter(item => {
        const itemRaw = String(item?.number_raw || '').trim();
        const itemNormal = String(item?.number_normal || '').trim();
        const values = [itemRaw, itemNormal].filter(Boolean);

        return !values.some(value =>
          value === raw ||
          value.endsWith(tail10) ||
          raw.endsWith(value.slice(-10)) ||
          value.endsWith(tail8)
        );
      })
    );
  }

  private addDays(date: Date, days: number): string {
    return addDaysToGregorianDate(date, days);
  }

  private formatDateInput(date: Date): string {
    return formatGregorianDateInput(date);
  }

  private toJalaliDateInput(gregorianDate: string): string {
    return this.toFaNumber(gregorianDateToJalaliText(gregorianDate) || gregorianDate);
  }

  private toGregorianDateInput(jalaliDate: string): string {
    return jalaliTextToGregorianDate(jalaliDate);
  }

  displayJalaliDateTime(value: unknown): string {
    return displayJalaliDateTime(value);
  }

  toFaNumber(value: unknown): string {
    const fa = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(value ?? '').replace(/\d/g, digit => fa[Number(digit)]);
  }

  getUnknownStatusClass(item: UnknownCallerNumber): string {
    const status = String(item.last_disposition || '').toUpperCase();

    if (status === 'ANSWERED') {
      return 'success';
    }

    if (status === 'NO ANSWER') {
      return 'warning';
    }

    if (status === 'BUSY') {
      return 'busy';
    }

    return 'danger';
  }
  deleteContact(item: CallerIdContact): void {
    const id = String(item?.Id || '').trim();

    if (!id) {
      this.notificationService.warning('شناسه مخاطب نامعتبر است');
      return;
    }

    const name = item?.Name || '-';
    const number = item?.Number || '-';

    const ok = window.confirm(
      `آیا از حذف مخاطب "${name}" با شماره "${number}" مطمئن هستید؟`
    );

    if (!ok) {
      return;
    }

    this.saving.set(true);

    this.santralApi.DeleteCallerIdContact(id)
      .pipe(finalize(() => this.saving.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'حذف مخاطب ناموفق بود');
            return;
          }

          this.notificationService.success('مخاطب با موفقیت حذف شد');

          this.contacts.update(list =>
            list.filter(row => String(row?.Id || '') !== id)
          );

          if (this.activeTab() === 'unknown' && this.unknownLoaded()) {
            this.loadUnknownNumbers();
          }
        },
        error: (err: any) => {
          console.error('DeleteCallerIdContact error:', err);

          const msg =
            err?.error?.ErrDesc ||
            err?.message ||
            'خطا در حذف مخاطب';

          this.notificationService.error(msg);
        }
      });
  }
}