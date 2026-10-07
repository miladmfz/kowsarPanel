import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { PhoneCustomerContext } from '../../../models/webphone.models';

@Component({
  selector: 'app-phone-customer-context-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (context) {
      <section class="kws-customer-context-card">
        <div class="kws-customer-context-head">
          <div class="kws-customer-avatar">
            <i class="mdi mdi-account-tie-voice-outline"></i>
          </div>

          <div class="kws-customer-context-title">
            <h5>{{ context.name || 'مخاطب ناشناس' }}</h5>
            <div class="kws-customer-context-number">
              <strong dir="ltr">{{ context.number || '—' }}</strong>
            </div>
          </div>

          <div class="kws-customer-context-state" [class.is-active]="callActive">
            <span></span>
            {{ callActive ? 'تماس فعال' : 'آخرین مخاطب' }}
          </div>

          <button type="button" class="kws-customer-context-close" title="بستن" (click)="close.emit()">
            <i class="mdi mdi-close"></i>
          </button>
        </div>

        @if (loading || context.loading) {
          <div class="kws-customer-context-loading">
            <span class="spinner-border spinner-border-sm"></span>
            دریافت اطلاعات مشتری از کوثر...
          </div>
        }

        <div class="kws-customer-context-identity">
          <div>
            <span>کد مرکز</span>
            <strong>{{ context.centralRef || '—' }}</strong>
          </div>
          <span class="kws-customer-context-identity-divider"></span>
          <div>
            <span>کد مشتری</span>
            <strong>{{ context.customerCode || '—' }}</strong>
          </div>
        </div>

        <div class="kws-customer-context-description" [class.is-empty]="!context.customerExplain">
          <div>
            <i class="mdi mdi-text-box-outline"></i>
            توضیحات مشتری
          </div>
          <p>{{ context.customerExplain || 'توضیحی برای این مشتری ثبت نشده است.' }}</p>
        </div>

        <div class="kws-customer-context-system-grid">
          <div>
            <span>شماره برنامه</span>
            <strong dir="ltr">{{ context.appNumber || '—' }}</strong>
          </div>

          <div>
            <span>شماره دیتابیس</span>
            <strong dir="ltr">{{ context.databaseNumber || '—' }}</strong>
          </div>

          <div>
            <span>شماره قفل</span>
            <strong dir="ltr">{{ context.lockNumber || '—' }}</strong>
          </div>
        </div>

        @if (!context.centralRef) {
          <div class="kws-customer-context-warning">
            <i class="mdi mdi-link-variant-off"></i>
            این شماره در دفترچه تلفن به Central کوثر متصل نشده است.
          </div>
        } @else if (!loading && !context.loading && !context.customerName) {
          <div class="kws-customer-context-warning">
            <i class="mdi mdi-account-search-outline"></i>
            برای این CentralRef اطلاعات مشتری در API کوثر پیدا نشد.
          </div>
        }

        <div class="kws-customer-context-actions">
          <button type="button" class="is-ticket" [disabled]="!context.centralRef" (click)="createTicket.emit()">
            <i class="mdi mdi-ticket-confirmation-outline"></i>
            ایجاد تیکت
          </button>

          <button type="button" class="is-factor" [disabled]="!context.customerCode" (click)="createFactor.emit()">
            <i class="mdi mdi-file-document-edit-outline"></i>
            ایجاد فاکتور
          </button>

          <button type="button" class="is-factor-list" [disabled]="!context.customerCode" (click)="openFactors.emit()">
            <i class="mdi mdi-file-multiple-outline"></i>
            لیست فاکتورها
          </button>

          <button type="button" class="is-properties" [disabled]="!context.customerCode" (click)="openProperties.emit()">
            <i class="mdi mdi-tag-multiple-outline"></i>
            خصوصیات اضافه
          </button>
        </div>
      </section>
    }
  `
})
export class PhoneCustomerContextPanelComponent {
  @Input() context: PhoneCustomerContext | null = null;
  @Input() loading = false;
  @Input() callActive = false;

  @Output() createTicket = new EventEmitter<void>();
  @Output() createFactor = new EventEmitter<void>();
  @Output() openFactors = new EventEmitter<void>();
  @Output() openProperties = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
