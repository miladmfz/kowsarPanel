import { CommonModule } from '@angular/common';
import { Component, Input, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import 'src/app/app-shell/framework-components/ag-grid/ag-grid-enterprise-registration';
import type { ColDef, GridOptions, GridSizeChangedEvent } from 'ag-grid-community';
import { catchError, concatMap, finalize, from, map, of } from 'rxjs';

import type { SantralPhonebookComponent } from '../santral-phonebook.component';
import { SantralWebApiService } from '../../../services/santralapi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import {
  CdrKowsarAuditService,
  CdrKowsarAuditSourceNumber
} from '../services/cdr-kowsar-audit.service';
import {
  addDaysToGregorianDate,
  formatGregorianDateInput
} from '../../../shared/utils/santral-format.util';
import {
  displayJalaliDateTime,
  gregorianDateToJalaliText,
  jalaliTextToGregorianDate
} from '../../../shared/utils/santral-date.util';

type AuditScope = 'all' | 'range';
type AuditFilter = 'all' | 'found' | 'not_found' | 'phonebook' | 'new';
type AuditMatchStatus = 'FOUND' | 'NOT_FOUND' | 'ERROR';

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

interface KowsarAuditRow extends CdrKowsarAuditSourceNumber {
  row_key: string;
  match_status: AuditMatchStatus;
  phonebook_name: string;
  phonebook_explain: string;
  central_code?: number | null;
  display_name?: string;
  customer_code?: number | null;
  customer_type?: string;
  address_ref?: number | null;
  matched_field?: string;
  matched_value?: string;
  match_type?: string;
}

@Component({
  selector: 'app-phonebook-kowsar-audit-tab',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridModule],
  template: `
  @if (vm.activeTab() === 'kowsar-audit') {
    <section class="kws-audit-shell" dir="rtl">
      <div class="kws-audit-hero">
        <div class="kws-audit-hero-copy">
          <div class="kws-audit-hero-icon"><i class="mdi mdi-database-sync-outline"></i></div>
          <div>
            <h4>تطبیق کامل CDR با اطلاعات کوثر</h4>
            <p>
              تمام شماره‌های بیرونی تماس‌های ورودی و خروجی را از CDR استخراج می‌کند،
              شماره‌های تکراری و legهای RingGroup را یکی می‌کند و سپس با تلفن، موبایل و فکس Address در کوثر مقایسه می‌کند.
            </p>
          </div>
        </div>
      </div>

      <div class="kws-audit-filter-card">
        <div class="kws-audit-scope-row">
          <label class="kws-audit-scope" [class.active]="scope() === 'all'">
            <input type="radio" name="auditScope" value="all" [ngModel]="scope()" (ngModelChange)="setScope($event)" />
            <span class="kws-audit-scope-icon"><i class="mdi mdi-database-clock-outline"></i></span>
            <span>
              <strong>کل تاریخچه CDR</strong>
              <small>برای اجرای اولیه و ساخت تصویر کامل شماره‌های قدیمی</small>
            </span>
          </label>

          <label class="kws-audit-scope" [class.active]="scope() === 'range'">
            <input type="radio" name="auditScope" value="range" [ngModel]="scope()" (ngModelChange)="setScope($event)" />
            <span class="kws-audit-scope-icon"><i class="mdi mdi-calendar-range"></i></span>
            <span>
              <strong>بازه زمانی</strong>
              <small>برای دفعات بعد فقط تماس‌های بازه موردنظر بررسی می‌شوند</small>
            </span>
          </label>
        </div>

        @if (scope() === 'range') {
          <div class="kws-audit-date-row">
            <label>
              <span>از تاریخ</span>
              <input class="form-control" type="text" inputmode="numeric" placeholder="۱۴۰۵/۰۵/۰۱"
                [ngModel]="startDate()" (ngModelChange)="startDate.set($event)" />
            </label>
            <label>
              <span>تا تاریخ</span>
              <input class="form-control" type="text" inputmode="numeric" placeholder="۱۴۰۵/۰۵/۱۸"
                [ngModel]="endDate()" (ngModelChange)="endDate.set($event)" />
            </label>
          </div>
        } @else {
          <div class="kws-audit-note">
            <i class="mdi mdi-information-outline"></i>
            اجرای کل تاریخچه برای بار اول ممکن است کمی زمان‌بر باشد. هیچ جدولی ساخته یا تغییر داده نمی‌شود.
          </div>
        }

        <div class="kws-audit-run-row">
          <button type="button" class="btn btn-primary kws-audit-run-btn" (click)="runAudit()" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner-border spinner-border-sm"></span>
              در حال بررسی {{ toFaNumber(processedCount()) }} از {{ toFaNumber(sourceCount()) }}
            } @else {
              <i class="mdi mdi-playlist-search"></i>
              {{ scope() === 'all' ? 'بررسی کل CDR' : 'بررسی بازه انتخاب‌شده' }}
            }
          </button>

          @if (loading() && sourceCount() > 0) {
            <div class="kws-audit-progress-wrap">
              <div class="kws-audit-progress-text">
                <span>تطبیق با کوثر</span>
                <strong>{{ toFaNumber(progressPercent()) }}٪</strong>
              </div>
              <div class="progress">
                <div class="progress-bar" role="progressbar" [style.width.%]="progressPercent()"></div>
              </div>
            </div>
          }
        </div>
      </div>

      @if (hasRun()) {
        <div class="kws-audit-summary-grid">
          <div class="kws-audit-summary-card">
            <span>شماره یکتای CDR</span>
            <strong>{{ toFaNumber(sourceCount()) }}</strong>
            <small>{{ toFaNumber(totalCalls()) }} تماس منطقی</small>
          </div>
          <div class="kws-audit-summary-card success">
            <span>پیدا شده در کوثر</span>
            <strong>{{ toFaNumber(foundCount()) }}</strong>
            <small>{{ toFaNumber(matchRowsCount()) }} نتیجه تطبیق</small>
          </div>
          <div class="kws-audit-summary-card warning">
            <span>پیدا نشده در کوثر</span>
            <strong>{{ toFaNumber(notFoundCount()) }}</strong>
            <small>نیازمند بررسی یا ثبت</small>
          </div>
          <div class="kws-audit-summary-card info">
            <span>از قبل در دفتر تلفن</span>
            <strong>{{ toFaNumber(phonebookCount()) }}</strong>
            <small>بر اساس شماره نرمال‌شده</small>
          </div>
          <div class="kws-audit-summary-card muted">
            <span>قدیمی‌ترین تماس</span>
            <strong class="kws-audit-date-value">{{ displayDate(firstSeen()) }}</strong>
            <small>در داده بررسی‌شده</small>
          </div>
          <div class="kws-audit-summary-card muted">
            <span>آخرین تماس</span>
            <strong class="kws-audit-date-value">{{ displayDate(lastSeen()) }}</strong>
            <small>در داده بررسی‌شده</small>
          </div>
        </div>

        <div class="kws-audit-toolbar">
          <div class="kws-audit-filter-buttons">
            <button type="button" [class.active]="statusFilter() === 'all'" (click)="statusFilter.set('all')">
              همه <span>{{ toFaNumber(uniqueVisibleBaseCount('all')) }}</span>
            </button>
            <button type="button" [class.active]="statusFilter() === 'found'" (click)="statusFilter.set('found')">
              در کوثر <span>{{ toFaNumber(foundCount()) }}</span>
            </button>
            <button type="button" [class.active]="statusFilter() === 'not_found'" (click)="statusFilter.set('not_found')">
              پیدا نشده <span>{{ toFaNumber(notFoundCount()) }}</span>
            </button>
            <button type="button" [class.active]="statusFilter() === 'phonebook'" (click)="statusFilter.set('phonebook')">
              دفتر تلفن <span>{{ toFaNumber(phonebookCount()) }}</span>
            </button>
            <button type="button" [class.active]="statusFilter() === 'new'" (click)="statusFilter.set('new')">
              جدید برای دفتر تلفن <span>{{ toFaNumber(newPhonebookCandidateCount()) }}</span>
            </button>
          </div>

          <div class="kws-audit-search">
            <i class="mdi mdi-magnify"></i>
            <input class="form-control" type="text" placeholder="جستجو در شماره، نام مرکز، CentralCode، CustomerCode..."
              [ngModel]="searchText()" (ngModelChange)="searchText.set($event)" />
          </div>
        </div>

        <div class="kws-audit-grid-card">
          <div class="kws-audit-grid-note">
            <span>
              <i class="mdi mdi-table-large"></i>
              هر شماره ممکن است چند نتیجه در کوثر داشته باشد؛ همه نتیجه‌های پیدا شده به‌صورت ردیف جدا نمایش داده می‌شوند.
            </span>
            <strong>{{ toFaNumber(filteredRows().length) }} ردیف</strong>
          </div>

          @if (!loading() && filteredRows().length === 0) {
            <div class="kws-audit-empty">
              <i class="mdi mdi-database-off-outline"></i>
              نتیجه‌ای با فیلتر فعلی وجود ندارد
            </div>
          } @else {
            <ag-grid-angular
              class="ag-theme-quartz kws-audit-grid"
              [rowData]="filteredRows()"
              [columnDefs]="columnDefs"
              [defaultColDef]="defaultColDef"
              [gridOptions]="gridOptions"
              [pagination]="true"
              [paginationPageSize]="20"
              [paginationPageSizeSelector]="pageSizeOptions"
              [animateRows]="true"
              [enableRtl]="true"
              (gridSizeChanged)="onGridSizeChanged($event)">
            </ag-grid-angular>
          }
        </div>
      }
    </section>
  }
  `,
  styles: [`
    .kws-audit-shell { display: grid; gap: 14px; }
    :host ::ng-deep .kws-audit-action-cell { display:flex; align-items:center; justify-content:center; gap:6px; height:100%; white-space:nowrap; }
    :host ::ng-deep .kws-audit-action-cell .btn { min-width:92px; border-radius:9px; font-weight:700; }
    :host ::ng-deep .kws-audit-action-cell .kws-audit-saved { display:inline-flex; align-items:center; gap:5px; color:#198754; font-weight:700; }
    .kws-audit-hero, .kws-audit-filter-card, .kws-audit-grid-card {
      background: #fff; border: 1px solid #e5eaf2; border-radius: 18px;
      box-shadow: 0 8px 24px rgba(15, 23, 42, .05);
    }
    .kws-audit-hero { padding: 18px 20px; }
    .kws-audit-hero-copy { display: flex; align-items: flex-start; gap: 14px; }
    .kws-audit-hero-icon { width: 46px; height: 46px; border-radius: 14px; display: grid; place-items: center;
      background: #eef6ff; color: #1769d2; font-size: 24px; flex: 0 0 auto; }
    .kws-audit-hero h4 { margin: 0 0 5px; font-size: 18px; font-weight: 800; color: #172033; }
    .kws-audit-hero p { margin: 0; line-height: 1.9; color: #667085; font-size: 13px; }
    .kws-audit-filter-card { padding: 16px; }
    .kws-audit-scope-row { display: grid; grid-template-columns: repeat(2,minmax(0,1fr)); gap: 12px; }
    .kws-audit-scope { position: relative; display: flex; align-items: center; gap: 11px; min-height: 74px;
      padding: 12px 14px; border: 1px solid #dce3ed; border-radius: 14px; cursor: pointer; transition: .18s ease; }
    .kws-audit-scope:hover { border-color: #a9c8f5; }
    .kws-audit-scope.active { border-color: #4387e8; box-shadow: 0 0 0 3px rgba(67,135,232,.10); background: #f8fbff; }
    .kws-audit-scope input { position: absolute; opacity: 0; pointer-events: none; }
    .kws-audit-scope-icon { width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; background: #f1f4f8; color: #50627a; font-size: 20px; }
    .kws-audit-scope.active .kws-audit-scope-icon { background: #e8f2ff; color: #1769d2; }
    .kws-audit-scope strong, .kws-audit-scope small { display: block; }
    .kws-audit-scope strong { color: #202a3b; font-size: 14px; margin-bottom: 4px; }
    .kws-audit-scope small { color: #7b8798; font-size: 12px; line-height: 1.5; }
    .kws-audit-date-row { display: grid; grid-template-columns: repeat(2,minmax(0,240px)); gap: 12px; margin-top: 14px; }
    .kws-audit-date-row label span { display: block; font-size: 12px; font-weight: 700; margin: 0 3px 6px; color: #556274; }
    .kws-audit-note { margin-top: 13px; display: flex; align-items: center; gap: 8px; padding: 9px 12px; border-radius: 11px; background: #fff8e8; color: #8b6413; font-size: 12px; }
    .kws-audit-run-row { display: flex; align-items: center; gap: 16px; margin-top: 14px; }
    .kws-audit-run-btn { min-width: 190px; min-height: 42px; border-radius: 12px; font-weight: 700; }
    .kws-audit-progress-wrap { flex: 1; min-width: 220px; }
    .kws-audit-progress-text { display: flex; justify-content: space-between; margin-bottom: 5px; font-size: 12px; color: #64748b; }
    .kws-audit-progress-wrap .progress { height: 7px; border-radius: 20px; }
    .kws-audit-summary-grid { display: grid; grid-template-columns: repeat(6,minmax(0,1fr)); gap: 10px; }
    .kws-audit-summary-card { background: #fff; border: 1px solid #e5eaf2; border-radius: 15px; padding: 13px 14px; min-height: 95px; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 6px 18px rgba(15,23,42,.04); }
    .kws-audit-summary-card span { color: #758196; font-size: 11px; font-weight: 700; }
    .kws-audit-summary-card strong { font-size: 26px; color: #172033; line-height: 1.2; margin: 5px 0 3px; }
    .kws-audit-summary-card small { color: #98a2b3; font-size: 10px; }
    .kws-audit-summary-card.success { border-top: 3px solid #32a86b; }
    .kws-audit-summary-card.warning { border-top: 3px solid #e7a928; }
    .kws-audit-summary-card.info { border-top: 3px solid #4387e8; }
    .kws-audit-summary-card.muted { border-top: 3px solid #98a2b3; }
    .kws-audit-summary-card .kws-audit-date-value { font-size: 14px; direction: ltr; text-align: right; }
    .kws-audit-toolbar { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
    .kws-audit-filter-buttons { display: flex; gap: 7px; flex-wrap: wrap; }
    .kws-audit-filter-buttons button { border: 1px solid #dce3ed; background: #fff; color: #566277; min-height: 34px; border-radius: 10px; padding: 6px 10px; font-size: 12px; font-weight: 700; }
    .kws-audit-filter-buttons button.active { background: #edf5ff; color: #1769d2; border-color: #92bbef; }
    .kws-audit-filter-buttons button span { margin-right: 4px; opacity: .75; }
    .kws-audit-search { position: relative; width: min(100%, 390px); }
    .kws-audit-search i { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); color: #8994a6; z-index: 2; }
    .kws-audit-search input { padding-right: 36px; border-radius: 11px; }
    .kws-audit-grid-card { overflow: hidden; }
    .kws-audit-grid-note { min-height: 46px; padding: 10px 14px; display: flex; align-items: center; justify-content: space-between; gap: 10px; border-bottom: 1px solid #edf0f5; color: #657287; font-size: 12px; }
    .kws-audit-grid-note span { display: flex; align-items: center; gap: 7px; }
    .kws-audit-grid { width: 100%; height: 610px; }
    .kws-audit-empty { min-height: 180px; display: grid; place-items: center; align-content: center; gap: 8px; color: #8490a2; }
    .kws-audit-empty i { font-size: 34px; }
    :host ::ng-deep .kws-audit-status-found { color: #198754 !important; font-weight: 800; }
    :host ::ng-deep .kws-audit-status-not-found { color: #b97900 !important; font-weight: 800; }
    :host ::ng-deep .kws-audit-status-error { color: #c0392b !important; font-weight: 800; }
    :host ::ng-deep .kws-audit-number-cell { direction: ltr; text-align: right; font-weight: 800; color: #1f3556; }
    :host-context(html[data-bs-theme='dark']) .kws-audit-hero,
    :host-context(html[data-bs-theme='dark']) .kws-audit-filter-card,
    :host-context(html[data-bs-theme='dark']) .kws-audit-grid-card,
    :host-context(html[data-bs-theme='dark']) .kws-audit-summary-card {
      color: var(--kws-dark-text, #f1f5f9); background: var(--kws-dark-surface, #252e40);
      border-color: var(--kws-dark-border, rgba(226,232,240,.18)); box-shadow: 0 8px 24px rgba(0,0,0,.24);
    }
    :host-context(html[data-bs-theme='dark']) .kws-audit-hero h4,
    :host-context(html[data-bs-theme='dark']) .kws-audit-scope strong,
    :host-context(html[data-bs-theme='dark']) .kws-audit-summary-card strong,
    :host-context(html[data-bs-theme='dark']) ::ng-deep .kws-audit-number-cell { color: var(--kws-dark-text, #f1f5f9); }
    :host-context(html[data-bs-theme='dark']) .kws-audit-hero p,
    :host-context(html[data-bs-theme='dark']) .kws-audit-scope small,
    :host-context(html[data-bs-theme='dark']) .kws-audit-date-row label span,
    :host-context(html[data-bs-theme='dark']) .kws-audit-progress-text,
    :host-context(html[data-bs-theme='dark']) .kws-audit-summary-card span,
    :host-context(html[data-bs-theme='dark']) .kws-audit-summary-card small,
    :host-context(html[data-bs-theme='dark']) .kws-audit-grid-note,
    :host-context(html[data-bs-theme='dark']) .kws-audit-empty { color: var(--kws-dark-muted, #c2ccda); }
    :host-context(html[data-bs-theme='dark']) .kws-audit-scope,
    :host-context(html[data-bs-theme='dark']) .kws-audit-filter-buttons button {
      color: var(--kws-dark-text, #f1f5f9); background: var(--kws-dark-surface-raised, #303b51);
      border-color: var(--kws-dark-border, rgba(226,232,240,.18));
    }
    :host-context(html[data-bs-theme='dark']) .kws-audit-scope.active,
    :host-context(html[data-bs-theme='dark']) .kws-audit-filter-buttons button.active {
      color: #fff; background: #245ca8; border-color: #60a5fa;
    }
    :host-context(html[data-bs-theme='dark']) .kws-audit-scope-icon,
    :host-context(html[data-bs-theme='dark']) .kws-audit-scope.active .kws-audit-scope-icon {
      color: #bfdbfe; background: rgba(59,130,246,.18);
    }
    :host-context(html[data-bs-theme='dark']) .kws-audit-note {
      color: #fde68a; background: rgba(245,158,11,.16);
    }
    @media (max-width: 1400px) { .kws-audit-summary-grid { grid-template-columns: repeat(3,minmax(0,1fr)); } }
    @media (max-width: 768px) {
      .kws-audit-scope-row, .kws-audit-date-row, .kws-audit-summary-grid { grid-template-columns: 1fr; }
      .kws-audit-run-row { align-items: stretch; flex-direction: column; }
      .kws-audit-search { width: 100%; }
      .kws-audit-grid { height: 560px; }
    }
  `]
})
export class PhonebookKowsarAuditTabComponent {
  @Input({ required: true }) vm!: SantralPhonebookComponent;

  private readonly auditApi = inject(CdrKowsarAuditService);
  private readonly santralApi = inject(SantralWebApiService);
  private readonly notificationService = inject(NotificationService);

  readonly scope = signal<AuditScope>('all');
  readonly startDate = signal(this.toJalaliDateInput(addDaysToGregorianDate(new Date(), -30)));
  readonly endDate = signal(this.toJalaliDateInput(formatGregorianDateInput(new Date())));
  readonly loading = signal(false);
  readonly hasRun = signal(false);
  readonly sourceNumbers = signal<CdrKowsarAuditSourceNumber[]>([]);
  readonly rows = signal<KowsarAuditRow[]>([]);
  readonly searchText = signal('');
  readonly statusFilter = signal<AuditFilter>('all');
  readonly processedCount = signal(0);
  readonly sourceCount = signal(0);
  readonly totalCalls = signal(0);
  readonly foundCount = signal(0);
  readonly notFoundCount = signal(0);
  readonly phonebookCount = signal(0);
  readonly matchRowsCount = signal(0);
  readonly firstSeen = signal('');
  readonly lastSeen = signal('');
  readonly savingKey = signal('');

  readonly progressPercent = computed(() => {
    const total = this.sourceCount();
    if (total <= 0) return 0;
    return Math.min(100, Math.round((this.processedCount() / total) * 100));
  });

  readonly newPhonebookCandidateCount = computed(() => {
    const keys = new Set<string>();
    for (const row of this.rows()) {
      if (row.match_status === 'FOUND' && !row.phonebook_name) {
        keys.add(row.number_key || this.phoneKey(row.number_normal || row.number_raw));
      }
    }
    return keys.size;
  });

  readonly filteredRows = computed(() => {
    const q = this.searchText().trim().toLowerCase();
    const filter = this.statusFilter();

    return this.rows().filter(row => {
      if (filter === 'found' && row.match_status !== 'FOUND') return false;
      if (filter === 'not_found' && row.match_status !== 'NOT_FOUND') return false;
      if (filter === 'phonebook' && !row.phonebook_name) return false;
      if (filter === 'new' && !(row.match_status === 'FOUND' && !row.phonebook_name)) return false;

      if (!q) return true;

      return [
        row.number_raw,
        row.number_normal,
        row.phonebook_name,
        row.phonebook_explain,
        row.display_name,
        row.central_code,
        row.customer_code,
        row.customer_type,
        row.address_ref,
        row.matched_field,
        row.matched_value,
        row.match_type,
        row.call_count,
        row.first_call_date,
        row.last_call_date
      ].join(' ').toLowerCase().includes(q);
    });
  });

  readonly pageSizeOptions = [20, 50, 100, 250];

  readonly defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    minWidth: 115,
    suppressHeaderMenuButton: false
  };

  readonly columnDefs: ColDef<KowsarAuditRow>[] = [
    {
      headerName: 'شماره CDR', field: 'number_normal', pinned: 'right', width: 160, minWidth: 150,
      lockPinned: true, cellClass: 'kws-audit-number-cell'
    },
    {
      headerName: 'وضعیت کوثر', field: 'match_status', width: 140,
      valueFormatter: p => this.matchStatusFa(String(p.value || '')),
      cellClassRules: {
        'kws-audit-status-found': p => p.value === 'FOUND',
        'kws-audit-status-not-found': p => p.value === 'NOT_FOUND',
        'kws-audit-status-error': p => p.value === 'ERROR'
      }
    },
    { headerName: 'نام مرکز', field: 'display_name', minWidth: 220, flex: 1, valueFormatter: p => this.emptyDash(p.value) },
    { headerName: 'CentralCode', field: 'central_code', width: 125, valueFormatter: p => this.emptyDash(p.value) },
    { headerName: 'CustomerCode', field: 'customer_code', width: 130, valueFormatter: p => this.emptyDash(p.value) },
    { headerName: 'نوع مشتری', field: 'customer_type', width: 130, valueFormatter: p => this.emptyDash(p.value) },
    { headerName: 'AddressRef', field: 'address_ref', width: 115, valueFormatter: p => this.emptyDash(p.value) },
    { headerName: 'محل تطابق', field: 'matched_field', width: 120, valueFormatter: p => this.emptyDash(p.value) },
    { headerName: 'مقدار ثبت‌شده در کوثر', field: 'matched_value', minWidth: 180, cellClass: 'kws-audit-number-cell', valueFormatter: p => this.emptyDash(p.value) },
    {
      headerName: 'نوع تطابق', field: 'match_type', width: 140,
      valueFormatter: p => this.matchTypeFa(String(p.value || ''))
    },
    { headerName: 'نام دفتر تلفن', field: 'phonebook_name', minWidth: 180, valueFormatter: p => this.emptyDash(p.value) },
    {
      headerName: 'عملیات', colId: 'actions', pinned: 'left', width: 245, minWidth: 230, maxWidth: 270,
      sortable: false, filter: false, resizable: false, lockPinned: true,
      cellRenderer: (params: any) => this.renderActionsCell(params)
    },
    { headerName: 'تعداد تماس', field: 'call_count', width: 110 },
    { headerName: 'ورودی', field: 'incoming_count', width: 90 },
    { headerName: 'خروجی', field: 'outgoing_count', width: 90 },
    { headerName: 'پاسخ', field: 'answered_count', width: 90 },
    { headerName: 'بی‌پاسخ', field: 'missed_count', width: 95 },
    {
      headerName: 'اولین تماس', field: 'first_call_date', minWidth: 165,
      valueFormatter: p => this.displayDate(String(p.value || ''))
    },
    {
      headerName: 'آخرین تماس', field: 'last_call_date', minWidth: 165,
      sort: 'desc', valueFormatter: p => this.displayDate(String(p.value || ''))
    }
  ];

  readonly gridOptions: GridOptions<KowsarAuditRow> = {
    rowHeight: 50,
    headerHeight: 46,
    ensureDomOrder: true,
    suppressCellFocus: true
  };

  private renderActionsCell(params: any): HTMLElement {
    const row = params?.data as KowsarAuditRow | undefined;
    const wrap = document.createElement('div');
    wrap.className = 'kws-audit-action-cell';

    if (!row || row.match_status !== 'FOUND') {
      wrap.textContent = '-';
      return wrap;
    }

    const searchButton = document.createElement('button');
    searchButton.type = 'button';
    searchButton.className = 'btn btn-sm btn-outline-primary';
    searchButton.innerHTML = '<i class="mdi mdi-magnify-plus-outline"></i> بررسی';
    searchButton.title = 'باز کردن جستجوی کامل همین شماره در کوثر';
    searchButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.openAuditFullSearch(row);
    });
    wrap.appendChild(searchButton);

    if (String(row.phonebook_name || '').trim()) {
      const saved = document.createElement('span');
      saved.className = 'kws-audit-saved';
      saved.innerHTML = '<i class="mdi mdi-check-circle-outline"></i> ثبت شده';
      saved.title = `در دفتر تلفن: ${row.phonebook_name}`;
      wrap.appendChild(saved);
      return wrap;
    }

    const addButton = document.createElement('button');
    addButton.type = 'button';
    addButton.className = 'btn btn-sm btn-success';
    addButton.innerHTML = '<i class="mdi mdi-account-plus-outline"></i> افزودن';
    addButton.title = 'افزودن همین نتیجه کوثر به دفتر تلفن';
    addButton.addEventListener('click', (event) => {
      event.stopPropagation();
      addButton.disabled = true;
      addButton.innerHTML = '<span class="spinner-border spinner-border-sm"></span> ثبت';
      this.addAuditRowToPhonebook(row, addButton);
    });
    wrap.appendChild(addButton);

    return wrap;
  }

  private openAuditFullSearch(row: KowsarAuditRow): void {
    this.vm.openBatchKowsarFullSearch(this.toBatchMatch(row));
  }

  private addAuditRowToPhonebook(row: KowsarAuditRow, button?: HTMLButtonElement): void {
    const number = String(row.number_normal || row.number_raw || '').trim();
    const centralCode = Number(row.central_code || 0);
    const displayName = String(row.display_name || '').trim();

    if (!number || centralCode <= 0 || !displayName) {
      if (button) {
        button.disabled = false;
        button.innerHTML = '<i class="mdi mdi-account-plus-outline"></i> افزودن';
      }
      this.notificationService.warning('اطلاعات شماره یا مرکز برای ثبت کامل نیست');
      return;
    }

    const key = this.phoneKey(number);
    const wasAlreadyInPhonebook = this.rows().some(item =>
      (item.number_key || this.phoneKey(item.number_normal || item.number_raw)) === key &&
      String(item.phonebook_name || '').trim() !== ''
    );

    const explainParts = ['KOWSAR', `CentralRef=${centralCode}`];
    const customerCode = Number(row.customer_code || 0);
    const addressRef = Number(row.address_ref || 0);

    if (customerCode > 0) explainParts.push(`CustomerCode=${customerCode}`);
    if (addressRef > 0) explainParts.push(`AddressRef=${addressRef}`);

    const explain = explainParts.join('|');
    const saveKey = `${key}|${centralCode}`;
    this.savingKey.set(saveKey);

    this.santralApi.SaveCallerIdContactExact('', number, displayName, explain, false)
      .pipe(finalize(() => {
        this.savingKey.set('');
        if (button && button.isConnected) {
          button.disabled = false;
          button.innerHTML = '<i class="mdi mdi-account-plus-outline"></i> افزودن';
        }
      }))
      .subscribe({
        next: (res: any) => {
          if (Number(res?.ErrCode) !== 0) {
            this.notificationService.error(res?.ErrDesc || 'افزودن شماره به دفتر تلفن ناموفق بود');
            return;
          }

          this.rows.update(list => list.map(item => {
            const itemKey = item.number_key || this.phoneKey(item.number_normal || item.number_raw);
            return itemKey === key
              ? { ...item, phonebook_name: displayName, phonebook_explain: explain }
              : item;
          }));

          if (!wasAlreadyInPhonebook) {
            this.phonebookCount.update(value => value + 1);
          }

          // Keep the other phonebook tabs synchronized as well.
          this.vm.loadContacts();
          this.vm.loadUnknownNumbers();
          this.notificationService.success(`${displayName} به دفتر تلفن اضافه شد`);
        },
        error: (error: any) => {
          console.error('addAuditRowToPhonebook error:', error);
          this.notificationService.error('خطا در افزودن شماره به دفتر تلفن');
        }
      });
  }

  private toBatchMatch(row: KowsarAuditRow): KowsarBatchPhoneMatch {
    const number = String(row.number_normal || row.number_raw || '').trim();
    return {
      number,
      normalized_number: number,
      central_code: Number(row.central_code || 0),
      display_name: String(row.display_name || ''),
      customer_code: row.customer_code ?? null,
      customer_type: String(row.customer_type || ''),
      address_ref: row.address_ref ?? null,
      matched_field: String(row.matched_field || ''),
      matched_value: String(row.matched_value || ''),
      match_type: String(row.match_type || '')
    };
  }

  setScope(value: AuditScope): void {
    this.scope.set(value === 'range' ? 'range' : 'all');
  }

  runAudit(): void {
    const allTime = this.scope() === 'all';
    const startGregorian = allTime ? '' : jalaliTextToGregorianDate(this.startDate());
    const endGregorian = allTime ? '' : jalaliTextToGregorianDate(this.endDate());

    if (!allTime) {
      if (!startGregorian || !endGregorian) {
        this.notificationService.warning('تاریخ را به‌صورت شمسی وارد کنید. نمونه: ۱۴۰۵/۰۵/۱۸');
        return;
      }
      if (startGregorian > endGregorian) {
        this.notificationService.warning('تاریخ شروع نباید بزرگ‌تر از تاریخ پایان باشد');
        return;
      }
    }

    this.loading.set(true);
    this.hasRun.set(true);
    this.rows.set([]);
    this.sourceNumbers.set([]);
    this.processedCount.set(0);
    this.sourceCount.set(0);
    this.totalCalls.set(0);
    this.foundCount.set(0);
    this.notFoundCount.set(0);
    this.phonebookCount.set(0);
    this.matchRowsCount.set(0);
    this.firstSeen.set('');
    this.lastSeen.set('');

    this.auditApi.getExternalNumbers(allTime, startGregorian, endGregorian, 50000)
      .subscribe({
        next: res => {
          if (Number(res?.ErrCode) !== 0) {
            this.loading.set(false);
            this.notificationService.error(res?.ErrDesc || 'دریافت شماره‌های CDR ناموفق بود');
            return;
          }

          const source = Array.isArray(res?.numbers) ? res.numbers : [];
          this.sourceNumbers.set(source);
          this.sourceCount.set(source.length);
          this.totalCalls.set(Number(res?.total_calls || 0));
          this.firstSeen.set(String(res?.first_seen || ''));
          this.lastSeen.set(String(res?.last_seen || ''));

          if (Number(res?.truncated || 0) === 1) {
            this.notificationService.warning('تعداد شماره‌های خام CDR به سقف گزارش رسیده است؛ برای پوشش کامل، گزارش را در چند بازه زمانی اجرا کنید');
          }

          if (source.length === 0) {
            this.loading.set(false);
            this.notificationService.warning('شماره بیرونی برای بررسی پیدا نشد');
            return;
          }

          this.runKowsarBatches(source);
        },
        error: err => {
          console.error('getCdrExternalNumbersForKowsar error:', err);
          this.loading.set(false);
          this.notificationService.error('ارتباط با سرویس CDR برقرار نشد');
        }
      });
  }

  uniqueVisibleBaseCount(filter: AuditFilter): number {
    if (filter === 'all') return this.sourceCount();
    return this.sourceCount();
  }

  onGridSizeChanged(event: GridSizeChangedEvent<KowsarAuditRow>): void {
    if (event.clientWidth > 1500) {
      event.api.sizeColumnsToFit();
    }
  }

  displayDate(value: string): string {
    const raw = String(value || '').trim();
    if (!raw) return '-';
    return displayJalaliDateTime(raw) || raw;
  }

  toFaNumber(value: unknown): string {
    const fa = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    return String(value ?? '').replace(/\d/g, d => fa[Number(d)]);
  }

  matchStatusFa(value: string): string {
    switch (value) {
      case 'FOUND': return 'پیدا شد';
      case 'NOT_FOUND': return 'پیدا نشد';
      case 'ERROR': return 'خطای بررسی';
      default: return '-';
    }
  }

  matchTypeFa(value: string): string {
    switch (String(value || '').toUpperCase()) {
      case 'EXACT': return 'تطابق دقیق';
      case 'NORMALIZED': return 'تطابق نرمال‌شده';
      case 'LOCAL_SUFFIX': return 'تطابق ۸ رقم آخر';
      case 'CONTAINS': return 'شماره داخل فیلد';
      default: return value || '-';
    }
  }

  private runKowsarBatches(source: CdrKowsarAuditSourceNumber[]): void {
    const requestNumbers = source
      .map(item => String(item.number_normal || item.number_raw || '').trim())
      .filter(Boolean);

    const chunks: string[][] = [];
    for (let index = 0; index < requestNumbers.length; index += 75) {
      chunks.push(requestNumbers.slice(index, index + 75));
    }

    const allMatches: KowsarBatchPhoneMatch[] = [];
    const errorKeys = new Set<string>();

    from(chunks)
      .pipe(
        concatMap(chunk => this.santralApi.BatchSearchKowsarPhonesForPhonebook(chunk, 10, false)
          .pipe(
            map((response: any) => ({ response, chunk })),
            catchError(error => {
              console.error('BatchSearchKowsarPhonesForPhonebook audit error:', error);
              return of({
                response: { ErrCode: 2, results: [], requested_count: chunk.length },
                chunk
              });
            }),
            finalize(() => this.processedCount.update(value => Math.min(this.sourceCount(), value + chunk.length)))
          )
        ),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (packet: any) => {
          const response = packet?.response || {};
          const chunk = Array.isArray(packet?.chunk) ? packet.chunk : [];

          if (Number(response?.ErrCode) !== 0) {
            chunk.forEach((number: string) => errorKeys.add(this.phoneKey(number)));
            return;
          }

          const current = Array.isArray(response?.results) ? response.results : [];
          allMatches.push(...current);
        },
        error: error => {
          console.error('Kowsar audit batch stream error:', error);
          this.buildResultRows(source, allMatches, errorKeys);
          this.notificationService.warning('بخشی از شماره‌ها به علت خطای ارتباط بررسی نشدند');
        },
        complete: () => {
          this.buildResultRows(source, allMatches, errorKeys);

          if (errorKeys.size > 0) {
            this.notificationService.warning(`${errorKeys.size} شماره به علت خطای ارتباط با کوثر کامل بررسی نشد`);
          } else {
            this.notificationService.success('تطبیق CDR با اطلاعات کوثر کامل شد');
          }
        }
      });
  }

  private buildResultRows(
    source: CdrKowsarAuditSourceNumber[],
    matches: KowsarBatchPhoneMatch[],
    errorKeys: Set<string>
  ): void {
    const dedupMatches = new Map<string, KowsarBatchPhoneMatch>();

    for (const item of matches) {
      const numberKey = this.phoneKey(item?.normalized_number || item?.number || '');
      const dedupKey = [
        numberKey,
        Number(item?.central_code || 0),
        Number(item?.address_ref || 0),
        String(item?.matched_field || ''),
        String(item?.matched_value || '')
      ].join('|');

      if (numberKey && !dedupMatches.has(dedupKey)) {
        dedupMatches.set(dedupKey, item);
      }
    }

    const matchesByNumber = new Map<string, KowsarBatchPhoneMatch[]>();
    for (const item of dedupMatches.values()) {
      const key = this.phoneKey(item?.normalized_number || item?.number || '');
      if (!key) continue;
      const list = matchesByNumber.get(key) || [];
      list.push(item);
      matchesByNumber.set(key, list);
    }

    const phonebookLookup = this.buildPhonebookLookup();
    const result: KowsarAuditRow[] = [];
    const foundKeys = new Set<string>();
    const notFoundKeys = new Set<string>();
    const phonebookKeys = new Set<string>();

    for (const item of source) {
      const key = item.number_key || this.phoneKey(item.number_normal || item.number_raw);
      if (!key) continue;

      const contact = phonebookLookup.get(key);
      if (contact) phonebookKeys.add(key);

      const matched = matchesByNumber.get(key) || [];

      if (matched.length > 0) {
        foundKeys.add(key);

        matched.forEach((match, index) => {
          result.push({
            ...item,
            row_key: `${key}|${Number(match.central_code || 0)}|${Number(match.address_ref || 0)}|${index}`,
            match_status: 'FOUND',
            phonebook_name: contact?.name || '',
            phonebook_explain: contact?.explain || '',
            central_code: Number(match.central_code || 0) || null,
            display_name: String(match.display_name || ''),
            customer_code: match.customer_code ?? null,
            customer_type: String(match.customer_type || ''),
            address_ref: match.address_ref ?? null,
            matched_field: String(match.matched_field || ''),
            matched_value: String(match.matched_value || ''),
            match_type: String(match.match_type || '')
          });
        });
        continue;
      }

      if (errorKeys.has(key)) {
        result.push({
          ...item,
          row_key: `${key}|ERROR`,
          match_status: 'ERROR',
          phonebook_name: contact?.name || '',
          phonebook_explain: contact?.explain || ''
        });
        continue;
      }

      notFoundKeys.add(key);
      result.push({
        ...item,
        row_key: `${key}|NOT_FOUND`,
        match_status: 'NOT_FOUND',
        phonebook_name: contact?.name || '',
        phonebook_explain: contact?.explain || ''
      });
    }

    result.sort((a, b) => String(b.last_call_date || '').localeCompare(String(a.last_call_date || '')));

    this.rows.set(result);
    this.foundCount.set(foundKeys.size);
    this.notFoundCount.set(notFoundKeys.size);
    this.phonebookCount.set(phonebookKeys.size);
    this.matchRowsCount.set(Array.from(dedupMatches.values()).length);
  }

  private buildPhonebookLookup(): Map<string, { name: string; explain: string }> {
    const lookup = new Map<string, { name: string; explain: string }>();
    const contacts = (this.vm as any)?.contacts?.() || [];

    for (const contact of contacts) {
      const key = this.phoneKey(String(contact?.Number || ''));
      if (!key || lookup.has(key)) continue;

      lookup.set(key, {
        name: String(contact?.Name || '').trim(),
        explain: String(contact?.Explain || '').trim()
      });
    }

    return lookup;
  }

  private phoneKey(value: string): string {
    let digits = String(value || '').replace(/\D+/g, '');

    if (digits.startsWith('0098') && digits.length > 4) {
      digits = '0' + digits.substring(4);
    } else if (digits.startsWith('98') && digits.length >= 12) {
      digits = '0' + digits.substring(2);
    } else if (digits.length === 10 && digits.startsWith('9')) {
      digits = '0' + digits;
    }

    if (digits.length < 8) return '';
    return digits.length >= 10 ? digits.slice(-10) : digits;
  }

  private toJalaliDateInput(gregorianDate: string): string {
    const value = gregorianDateToJalaliText(gregorianDate) || gregorianDate;
    return this.toFaNumber(value);
  }

  private emptyDash(value: unknown): string {
    return value === null || value === undefined || String(value).trim() === '' ? '-' : String(value);
  }
}
