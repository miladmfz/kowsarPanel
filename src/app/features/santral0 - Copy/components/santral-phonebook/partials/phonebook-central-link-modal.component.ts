import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralPhonebookComponent } from '../santral-phonebook.component';

@Component({
  selector: 'app-phonebook-central-link-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
@if (vm.centralLinkModalVisible()) {
  <div class="kws-modal-backdrop kws-central-link-backdrop" (click)="vm.closeKowsarCentralLink()"></div>

  <div class="kws-central-link-modal" dir="rtl">
    <header class="kws-central-link-header">
      <div>
        <h5>ارتباط شماره با مرکز کوثر</h5>
        <p>
          شماره
          <strong class="kws-inline-ltr">
            {{ vm.centralLinkUnknown()?.number_raw || vm.centralLinkUnknown()?.number_normal || '-' }}
          </strong>
          را در Central، Customer و Address جستجو و به مرکز درست متصل کن.
        </p>
      </div>

      <button type="button" class="btn btn-light" (click)="vm.closeKowsarCentralLink()"
        [disabled]="vm.centralLinkSaving()">
        <i class="mdi mdi-close"></i>
      </button>
    </header>

    <div class="kws-central-link-search">
      <label class="form-label">جستجو در تمام اطلاعات کوثر</label>

      <div class="kws-central-search-row">
        <div class="kws-search-box">
          <i class="mdi mdi-database-search-outline"></i>
          <input type="text" class="form-control"
            placeholder="شماره، نام، کد مرکز، کد مشتری، کد ملی، آدرس یا ایمیل..."
            [ngModel]="vm.centralLinkQuery()"
            (ngModelChange)="vm.onCentralLinkQueryChange($event)"
            (keyup.enter)="vm.searchKowsarCentral()"
            [disabled]="vm.centralLinkLoading() || vm.centralLinkSaving()" />
        </div>

        <button type="button" class="btn btn-primary kws-central-search-btn"
          (click)="vm.searchKowsarCentral()"
          [disabled]="vm.centralLinkLoading() || vm.centralLinkSaving()">
          @if (vm.centralLinkLoading()) {
            <span class="spinner-border spinner-border-sm"></span>
            در حال جستجو
          } @else {
            <i class="mdi mdi-magnify"></i>
            جستجو
          }
        </button>
      </div>

      <small>
        جستجو روی فیلدهای Central، Customer و Address انجام می‌شود؛ از جمله نام، کدها، تلفن، موبایل، فکس، ایمیل و متن آدرس.
      </small>
    </div>

    <div class="kws-central-link-body">
      @if (vm.centralLinkLoading()) {
        <div class="kws-loading">
          <span class="spinner-border spinner-border-sm"></span>
          در حال خواندن اطلاعات از دیتابیس کوثر...
        </div>
      }

      @if (!vm.centralLinkLoading() && vm.centralLinkHasSearched() && vm.centralLinkResults().length === 0) {
        <div class="kws-empty">
          <i class="mdi mdi-database-off-outline"></i>
          نتیجه‌ای پیدا نشد؛ نام، کد مرکز یا بخشی از شماره را امتحان کن.
        </div>
      }

      @if (!vm.centralLinkLoading() && vm.centralLinkResults().length > 0) {
        <div class="kws-central-result-summary">
          <strong>{{ vm.toFaNumber(vm.centralLinkResults().length) }} مرکز پیدا شد</strong>
          <span>با انتخاب «افزودن به دفتر تلفن»، شماره در دفتر تلفن فعلی ذخیره و CentralRef داخل توضیح ثبت می‌شود.</span>
        </div>

        <div class="kws-central-results">
          @for (result of vm.centralLinkResults(); track result.central_code) {
            <article class="kws-central-result-card">
              <div class="kws-central-result-main">
                <div class="kws-central-result-title">
                  <div class="kws-central-avatar">
                    {{ vm.toFaNumber(result.central_code) }}
                  </div>

                  <div>
                    <h6>{{ result.display_name || result.name || ('مرکز ' + result.central_code) }}</h6>
                    <div class="kws-central-code-row">
                      <span>CentralCode: <strong>{{ result.central_code }}</strong></span>
                      <span>CustomerCode: <strong>{{ vm.kowsarCustomerCodes(result) }}</strong></span>
                      <span>نوع: <strong>{{ vm.kowsarCustomerTypes(result) }}</strong></span>
                    </div>
                  </div>
                </div>

                <div class="kws-central-match-box">
                  <span>محل تطابق</span>
                  <strong>{{ vm.kowsarMatchFields(result) }}</strong>
                </div>
              </div>

              <div class="kws-central-contact-grid">
                <div class="kws-central-info-block">
                  <small>شماره‌های ثبت‌شده</small>
                  @if ((result.phones || []).length === 0) {
                    <span class="kws-muted-text">شماره‌ای ثبت نشده</span>
                  } @else {
                    <div class="kws-central-phone-list">
                      @for (phone of result.phones || []; track phone.type + phone.value + phone.address_ref) {
                        <span>
                          <i class="mdi" [class.mdi-cellphone]="phone.type === 'MOBILE'"
                            [class.mdi-phone-outline]="phone.type === 'PHONE'"
                            [class.mdi-fax]="phone.type === 'FAX'"></i>
                          {{ phone.label }}:
                          <strong class="kws-inline-ltr">{{ phone.value }}</strong>
                          @if (phone.contact_name) { <em>{{ phone.contact_name }}</em> }
                        </span>
                      }
                    </div>
                  }
                </div>

                <div class="kws-central-info-block">
                  <small>آدرس</small>
                  <strong class="kws-central-address-text">{{ vm.kowsarPrimaryAddress(result) }}</strong>
                  @if ((result.emails || []).length > 0) {
                    <span class="kws-central-email kws-inline-ltr">{{ (result.emails || []).join('، ') }}</span>
                  }
                </div>
              </div>

              <footer class="kws-central-result-footer">
                <div>
                  @if (result.code_melli) {
                    <span>کد ملی: <strong>{{ result.code_melli }}</strong></span>
                  }
                  @if (result.economy_code) {
                    <span>کد اقتصادی: <strong>{{ result.economy_code }}</strong></span>
                  }
                  @if (result.manager) {
                    <span>مدیر: <strong>{{ result.manager }}</strong></span>
                  }
                </div>

                <button type="button" class="btn btn-success kws-central-connect-btn"
                  (click)="vm.linkUnknownToKowsarCentral(result)"
                  [disabled]="vm.centralLinkSaving()">
                  @if (vm.centralLinkSaving()) {
                    <span class="spinner-border spinner-border-sm"></span>
                  } @else {
                    <i class="mdi mdi-link-variant-plus"></i>
                  }
                  افزودن به دفتر تلفن
                </button>
              </footer>
            </article>
          }
        </div>
      }
    </div>
  </div>
}
`
})
export class PhonebookCentralLinkModalComponent {
  @Input({ required: true }) vm!: SantralPhonebookComponent;
}
