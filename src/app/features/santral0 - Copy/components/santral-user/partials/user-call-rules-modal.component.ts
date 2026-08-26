import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralUserComponent } from '../santral-user.component';

@Component({
  selector: 'app-user-call-rules-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
@if (vm.callRulesModalVisible()) {
<div class="kws-modal-backdrop" (click)="vm.closeCallRulesModal()"></div>

<div class="kws-forward-modal kws-call-rules-modal" dir="rtl">

  <div class="kws-edit-modal-header">
    <div>
      <h5>محدودیت تماس</h5>
      <p>
        داخلی {{ vm.callRulesExtension() }} - {{ vm.callRulesDisplayName() }}
      </p>
    </div>

    <button type="button" class="btn btn-light" (click)="vm.closeCallRulesModal()" [disabled]="vm.callRulesSaving()">
      <i class="mdi mdi-close"></i>
    </button>
  </div>

  <div class="kws-edit-modal-body">

    @if (vm.callRulesLoading()) {
    <div class="kws-forward-loading">
      <span class="spinner-border spinner-border-sm"></span>
      در حال دریافت محدودیت‌های تماس...
    </div>
    }

    @if (!vm.callRulesLoading()) {

    <div class="kws-forward-help">
      این تنظیمات برای کنترل تماس‌های این داخلی استفاده می‌شود. اعمال واقعی محدودیت‌ها در مرحله بعد با Dialplan انجام می‌شود.
    </div>

    <div class="kws-call-rules-list">

      <div class="kws-call-rule-card">
        <div class="kws-call-rule-icon is-internal">
          <i class="mdi mdi-phone-classic"></i>
        </div>

        <div class="kws-call-rule-content">
          <h6>تماس داخلی</h6>
          <p>اجازه تماس با سایر داخلی‌ها مثل 409، 412 و داخلی‌های دیگر.</p>
          <strong [class.is-blocked]="!vm.callRulesForm().allow_internal">
            {{ vm.callRuleStatusText(vm.callRulesForm().allow_internal) }}
          </strong>
        </div>

        <label class="kws-switch">
          <input
            type="checkbox"
            [ngModel]="vm.callRulesForm().allow_internal"
            (ngModelChange)="vm.onCallRuleChange('allow_internal', $event)"
            [disabled]="vm.callRulesSaving()" />
          <span></span>
        </label>
      </div>

      <div class="kws-call-rule-card">
        <div class="kws-call-rule-icon is-outbound">
          <i class="mdi mdi-phone-outgoing-outline"></i>
        </div>

        <div class="kws-call-rule-content">
          <h6>تماس خروجی به بیرون</h6>
          <p>اجازه تماس با موبایل، شهری، خارج از شرکت و مسیرهای خروجی.</p>
          <strong [class.is-blocked]="!vm.callRulesForm().allow_outbound">
            {{ vm.callRuleStatusText(vm.callRulesForm().allow_outbound) }}
          </strong>
        </div>

        <label class="kws-switch">
          <input
            type="checkbox"
            [ngModel]="vm.callRulesForm().allow_outbound"
            (ngModelChange)="vm.onCallRuleChange('allow_outbound', $event)"
            [disabled]="vm.callRulesSaving()" />
          <span></span>
        </label>
      </div>

      <div class="kws-call-rule-card">
        <div class="kws-call-rule-icon is-inbound">
          <i class="mdi mdi-phone-incoming-outline"></i>
        </div>

        <div class="kws-call-rule-content">
          <h6>دریافت تماس از بیرون</h6>
          <p>اگر غیرفعال شود، تماس‌هایی که از ترانک یا مسیرهای ورودی بیرونی به این داخلی برسند باید مسدود شوند.</p>
          <strong [class.is-blocked]="!vm.callRulesForm().allow_external_inbound">
            {{ vm.callRuleStatusText(vm.callRulesForm().allow_external_inbound) }}
          </strong>
        </div>

        <label class="kws-switch">
          <input
            type="checkbox"
            [ngModel]="vm.callRulesForm().allow_external_inbound"
            (ngModelChange)="vm.onCallRuleChange('allow_external_inbound', $event)"
            [disabled]="vm.callRulesSaving()" />
          <span></span>
        </label>
      </div>

    </div>

    }

  </div>

  <div class="kws-edit-modal-footer">

    <button type="button" class="btn btn-light" (click)="vm.closeCallRulesModal()" [disabled]="vm.callRulesSaving()">
      انصراف
    </button>

    <button
      type="button"
      class="btn btn-primary"
      (click)="vm.saveCallRules()"
      [disabled]="vm.callRulesSaving() || vm.callRulesLoading()">

      @if (vm.callRulesSaving()) {
      <span class="spinner-border spinner-border-sm"></span>
      در حال ذخیره...
      } @else {
      <i class="mdi mdi-content-save-outline"></i>
      ذخیره محدودیت تماس
      }

    </button>

  </div>

</div>
}
`
})
export class UserCallRulesModalComponent {
  @Input({ required: true }) vm!: SantralUserComponent;
}
