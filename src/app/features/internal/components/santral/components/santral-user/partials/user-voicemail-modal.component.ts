import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralUserComponent } from '../santral-user.component';

@Component({
  selector: 'app-user-voicemail-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
@if (vm.voicemailModalVisible()) {
<div class="kws-modal-backdrop" (click)="vm.closeVoicemailModal()"></div>

<div class="kws-forward-modal kws-voicemail-modal" dir="rtl">

  <div class="kws-edit-modal-header">
    <div>
      <h5>تنظیمات صندوق صوتی</h5>
      <p>
        داخلی {{ vm.voicemailExtension() }} - {{ vm.voicemailDisplayName() }}
      </p>
    </div>

    <button type="button" class="btn btn-light" (click)="vm.closeVoicemailModal()" [disabled]="vm.voicemailSaving()">
      <i class="mdi mdi-close"></i>
    </button>
  </div>

  <div class="kws-edit-modal-body">

    @if (vm.voicemailLoading()) {
    <div class="kws-forward-loading">
      <span class="spinner-border spinner-border-sm"></span>
      در حال دریافت وضعیت صندوق صوتی...
    </div>
    }

    @if (!vm.voicemailLoading()) {

    <div class="kws-forward-help">
      اگر صندوق صوتی فعال باشد، تماس‌های بی‌پاسخ بعد از مدت زمان مشخص‌شده وارد صندوق صوتی این داخلی می‌شوند.
    </div>

    <div class="kws-voicemail-switch-card">
      <div>
        <h6>وضعیت صندوق صوتی</h6>
        <p>
          {{ vm.voicemailForm().enabled ? 'فعال است' : 'غیرفعال است' }}
        </p>
      </div>

      <label class="kws-switch">
        <input
          type="checkbox"
          [ngModel]="vm.voicemailForm().enabled"
          (ngModelChange)="vm.onVoicemailEnabledChange($event)"
          [disabled]="vm.voicemailSaving()" />
        <span></span>
      </label>
    </div>

    <div class="kws-voicemail-switch-card">
      <div>
        <h6>انتقال تماس هنگام اشغال</h6>
        <p>
          {{ vm.voicemailForm().busy_to_voicemail
            ? 'تماس جدید مستقیم وارد صندوق صوتی می‌شود'
            : 'تماس دوم پشت خط داخلی زنگ می‌خورد' }}
        </p>
      </div>

      <label class="kws-switch">
        <input
          type="checkbox"
          [ngModel]="vm.voicemailForm().busy_to_voicemail"
          (ngModelChange)="vm.onVoicemailBusyToVoicemailChange($event)"
          [disabled]="vm.voicemailSaving() || !vm.voicemailForm().enabled" />
        <span></span>
      </label>
    </div>

    @if (vm.voicemailForm().enabled && vm.voicemailForm().busy_to_voicemail) {
    <div class="kws-forward-help">
      برای تشخیص اشغال بودن داخلی، Call Waiting این داخلی خاموش می‌شود.
    </div>
    }

    <div class="kws-forward-list">

      <div class="kws-forward-card">
        <div class="kws-forward-card-head">
          <div>
            <h6>رمز صندوق صوتی</h6>
            <p>برای ورود با *97 یا *98 استفاده می‌شود. اگر خالی بماند، شماره داخلی به عنوان رمز ذخیره می‌شود.</p>
          </div>
        </div>

        <input
          type="text"
          class="form-control kws-ltr"
          [ngModel]="vm.voicemailForm().password"
          (ngModelChange)="vm.onVoicemailPasswordChange($event)"
          placeholder="مثلاً 1234"
          autocomplete="off"
          inputmode="numeric"
          [disabled]="vm.voicemailSaving() || !vm.voicemailForm().enabled" />
      </div>

      <div class="kws-forward-card">
        <div class="kws-forward-card-head">
          <div>
            <h6>مدت زمان زنگ قبل از صندوق صوتی</h6>
            <p>بعد از این تعداد ثانیه، تماس بی‌پاسخ وارد صندوق صوتی می‌شود.</p>
          </div>
        </div>

        <div class="kws-voicemail-ring-row">
          <input
            type="number"
            class="form-control kws-ltr"
            [ngModel]="vm.voicemailForm().ringtimer"
            (ngModelChange)="vm.onVoicemailRingtimerChange($event)"
            min="5"
            max="120"
            step="1"
            [disabled]="vm.voicemailSaving() || !vm.voicemailForm().enabled" />

          <span>ثانیه</span>
        </div>
      </div>

    </div>

    <div class="kws-vm-messages-panel">

      <div class="kws-vm-messages-head">
        <div>
          <h6>پیام‌های موجود در صندوق</h6>
          <p>مدیر می‌تواند پیام‌های جدید و خوانده‌شده این داخلی را مشاهده و پخش کند.</p>
        </div>

        <button
          type="button"
          class="btn btn-sm btn-light"
          (click)="vm.loadVoicemailMessages()"
          [disabled]="vm.voicemailMessagesLoading()">
          <i class="mdi mdi-refresh"></i>
          بروزرسانی
        </button>
      </div>

      <div class="kws-vm-message-tabs">
        <button
          type="button"
          [class.is-active]="vm.voicemailMessagesTab() === 'new'"
          (click)="vm.voicemailMessagesTab.set('new')">
          جدیدها
          @if (vm.voicemailNewMessages().length > 0) {
          <span>{{ vm.voicemailNewMessages().length }}</span>
          }
        </button>

        <button
          type="button"
          [class.is-active]="vm.voicemailMessagesTab() === 'old'"
          (click)="vm.voicemailMessagesTab.set('old')">
          خوانده‌شده‌ها
          @if (vm.voicemailOldMessages().length > 0) {
          <span>{{ vm.voicemailOldMessages().length }}</span>
          }
        </button>
      </div>

      @if (vm.voicemailMessagesLoading()) {
      <div class="kws-forward-loading">
        <span class="spinner-border spinner-border-sm"></span>
        در حال دریافت پیام‌ها...
      </div>
      } @else {
      <div class="kws-vm-message-list">
        @for (msg of vm.visibleVoicemailMessages(); track msg.id) {
        <div class="kws-vm-message-card">

          <div class="kws-vm-message-info">
            <div class="kws-vm-message-icon">
              <i class="mdi mdi-voicemail"></i>
            </div>

            <div class="kws-vm-message-main">
              <strong>{{ msg.caller_number || 'شماره نامشخص' }}</strong>
              <span>{{ msg.folder_title || '-' }}</span>
            </div>

            <div class="kws-vm-message-meta">
              <b>{{ vm.formatVoicemailDuration(msg.duration) }}</b>
              <small>{{ vm.formatVoicemailDate(msg.origtime) }}</small>
            </div>
          </div>

          @if (msg.has_audio && msg.play_url) {
          <audio
            class="kws-vm-message-audio"
            controls
            preload="none"
            [src]="msg.play_url">
          </audio>
          }

        </div>
        } @empty {
        <div class="kws-vm-message-empty">
          پیامی در این بخش وجود ندارد
        </div>
        }
      </div>
      }

    </div>
    }

  </div>

  <div class="kws-edit-modal-footer">

    <button type="button" class="btn btn-light" (click)="vm.closeVoicemailModal()" [disabled]="vm.voicemailSaving()">
      انصراف
    </button>

    <button
      type="button"
      class="btn btn-primary"
      (click)="vm.saveVoicemailSettings()"
      [disabled]="vm.voicemailSaving() || vm.voicemailLoading()">

      @if (vm.voicemailSaving()) {
      <span class="spinner-border spinner-border-sm"></span>
      در حال ذخیره...
      } @else {
      <i class="mdi mdi-content-save-outline"></i>
      ذخیره صندوق صوتی
      }

    </button>

  </div>

</div>
}
`
})
export class UserVoicemailModalComponent {
  @Input({ required: true }) vm!: SantralUserComponent;
}
