import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralUserComponent } from '../santral-user.component';

@Component({
  selector: 'app-user-forward-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
@if (vm.forwardModalVisible()) {
<div class="kws-modal-backdrop" (click)="vm.closeForwardModal()"></div>

<div class="kws-forward-modal" dir="rtl">

  <div class="kws-edit-modal-header">
    <div>
      <h5>مدیریت انتقال تماس</h5>
      <p>
        داخلی {{ vm.forwardingExtension() }} - {{ vm.forwardingDisplayName() }}
      </p>
    </div>

    <button type="button" class="btn btn-light" (click)="vm.closeForwardModal()" [disabled]="vm.forwardingSaving()">
      <i class="mdi mdi-close"></i>
    </button>
  </div>

  <div class="kws-edit-modal-body">

    @if (vm.forwardingLoading()) {
    <div class="kws-forward-loading">
      <span class="spinner-border spinner-border-sm"></span>
      در حال دریافت وضعیت انتقال تماس...
    </div>
    }

    @if (!vm.forwardingLoading()) {

    <div class="kws-forward-help">
      برای انتقال به موبایل، اگر خروجی گرفتن از سانترال با پیش‌شماره انجام می‌شود،
      مقصد را با همان پیش‌شماره وارد کن. مثال:
      <span class="kws-ltr">909121234567</span>
    </div>

    <div class="kws-forward-list">

      <div class="kws-forward-card">
        <div class="kws-forward-card-head">
          <div>
            <h6>انتقال همه تماس‌ها</h6>
            <p>همه تماس‌های ورودی این داخلی مستقیم به مقصد منتقل می‌شود.</p>
          </div>

          <span class="kws-forward-status" [class.active]="vm.getForwardStatus('all').active === 1">
            {{ vm.getForwardStatus('all').active === 1 ? 'فعال' : 'غیرفعال' }}
          </span>
        </div>

        <div class="kws-forward-form">
          <input type="text" class="form-control kws-forward-input" placeholder="مثلاً 909121234567 یا 500"
            [ngModel]="vm.forwardingForm().allTarget" (ngModelChange)="vm.onForwardTargetChange('all', $event)"
            [disabled]="vm.forwardingSaving()" />

          <button type="button" class="btn btn-primary" (click)="vm.saveForwarding('all')" [disabled]="vm.forwardingSaving()">
            ذخیره
          </button>

          <button type="button" class="btn btn-light" (click)="vm.clearForwarding('all')"
            [disabled]="vm.forwardingSaving() || vm.getForwardStatus('all').active !== 1">
            حذف
          </button>
        </div>
      </div>

      <div class="kws-forward-card">
        <div class="kws-forward-card-head">
          <div>
            <h6>انتقال هنگام اشغال</h6>
            <p>اگر داخلی در حال مکالمه باشد، تماس به مقصد تعیین‌شده منتقل می‌شود.</p>
          </div>

          <span class="kws-forward-status" [class.active]="vm.getForwardStatus('busy').active === 1">
            {{ vm.getForwardStatus('busy').active === 1 ? 'فعال' : 'غیرفعال' }}
          </span>
        </div>

        <div class="kws-forward-form">
          <input type="text" class="form-control kws-forward-input" placeholder="مثلاً 909121234567 یا 500"
            [ngModel]="vm.forwardingForm().busyTarget" (ngModelChange)="vm.onForwardTargetChange('busy', $event)"
            [disabled]="vm.forwardingSaving()" />

          <button type="button" class="btn btn-primary" (click)="vm.saveForwarding('busy')"
            [disabled]="vm.forwardingSaving()">
            ذخیره
          </button>

          <button type="button" class="btn btn-light" (click)="vm.clearForwarding('busy')"
            [disabled]="vm.forwardingSaving() || vm.getForwardStatus('busy').active !== 1">
            حذف
          </button>
        </div>
      </div>

      <div class="kws-forward-card">
        <div class="kws-forward-card-head">
          <div>
            <h6>انتقال هنگام عدم پاسخ / در دسترس نبودن</h6>
            <p>اگر داخلی پاسخ ندهد یا در دسترس نباشد، تماس به مقصد تعیین‌شده منتقل می‌شود.</p>
          </div>

          <span class="kws-forward-status" [class.active]="vm.getForwardStatus('unavailable').active === 1">
            {{ vm.getForwardStatus('unavailable').active === 1 ? 'فعال' : 'غیرفعال' }}
          </span>
        </div>

        <div class="kws-forward-form">
          <input type="text" class="form-control kws-forward-input" placeholder="مثلاً 909121234567 یا 500"
            [ngModel]="vm.forwardingForm().unavailableTarget"
            (ngModelChange)="vm.onForwardTargetChange('unavailable', $event)" [disabled]="vm.forwardingSaving()" />

          <button type="button" class="btn btn-primary" (click)="vm.saveForwarding('unavailable')"
            [disabled]="vm.forwardingSaving()">
            ذخیره
          </button>

          <button type="button" class="btn btn-light" (click)="vm.clearForwarding('unavailable')"
            [disabled]="vm.forwardingSaving() || vm.getForwardStatus('unavailable').active !== 1">
            حذف
          </button>
        </div>
      </div>

    </div>
    }

  </div>

  <div class="kws-edit-modal-footer">
    <button type="button" class="btn btn-light" (click)="vm.closeForwardModal()" [disabled]="vm.forwardingSaving()">
      بستن
    </button>
  </div>

</div>
}
`
})
export class UserForwardModalComponent {
  @Input({ required: true }) vm!: SantralUserComponent;
}
