import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
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

interface CallerCallDetail {
  calldate: string;
  direction: 'incoming' | 'outgoing';
  direction_fa: string;
  extension: string;
  operator: string;
  src: string;
  dst: string;
  did: string;
  disposition: string;
  disposition_fa: string;
  duration: number;
  billsec: number;
  duration_fa: string;
  billsec_fa: string;
  recordingfile: string;
  uniqueid: string;
  linkedid: string;
}

type PhonebookTab = 'contacts' | 'unknown';

import { PhonebookHeaderComponent } from './partials/phonebook-header.component';
import { PhonebookTabsComponent } from './partials/phonebook-tabs.component';
import { PhonebookContactsTabComponent } from './partials/phonebook-contacts-tab.component';
import { PhonebookUnknownTabComponent } from './partials/phonebook-unknown-tab.component';
import { PhonebookEditModalComponent } from './partials/phonebook-edit-modal.component';
import { PhonebookDetailsModalComponent } from './partials/phonebook-details-modal.component';

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
    PhonebookEditModalComponent,
    PhonebookDetailsModalComponent
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

  searchText = signal('');
  unknownSearchText = signal('');

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

  openDetails(item: UnknownCallerNumber): void {
    const number = String(item?.number_raw || item?.number_normal || '').trim();
    if (!number) return;

    this.selectedUnknown.set(item);
    this.followUpForm.set({
      status: item.followup_status || 'new',
      note: item.followup_note || '',
      owner: item.followup_owner || item.last_operator || ''
    });
    this.callDetails.set([]);
    this.detailsModalVisible.set(true);
    this.loadingDetails.set(true);

    const startdate = this.toGregorianDateInput(this.unknownStartDate());
    const enddate = this.toGregorianDateInput(this.unknownEndDate());

    this.santralApi.GetCallerNumberDetails(number, startdate, enddate, 100, false)
      .pipe(finalize(() => this.loadingDetails.set(false)))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'خطا در دریافت جزئیات تماس');
            return;
          }
          this.callDetails.set(Array.isArray(res?.calls) ? res.calls : []);
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