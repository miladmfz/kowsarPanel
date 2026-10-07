import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralPhonebookComponent } from '../santral-phonebook.component';

@Component({
  selector: 'app-phonebook-details-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
@if (vm.detailsModalVisible()) {
<div class="kws-modal-backdrop" (click)="vm.closeDetails()"></div>
<div class="kws-phonebook-modal kws-details-modal" dir="rtl" role="dialog" aria-modal="true">
  <div class="kws-modal-header details-modal-header">
    <div class="details-title-wrap">
      <div class="details-title-line">
        <h5>{{ vm.selectedUnknown()?.contact_name || 'تاریخچه تماس‌ها' }}</h5>
        <span class="details-number">{{ vm.selectedUnknown()?.number_raw }}</span>
      </div>
      <p>همه تماس‌های ثبت‌شده در بازه {{ vm.unknownStartDate() }} تا {{ vm.unknownEndDate() }}</p>
    </div>
    <button type="button" class="btn btn-light details-close-btn" (click)="vm.closeDetails()" aria-label="بستن">
      <i class="mdi mdi-close"></i>
    </button>
  </div>

  <div class="kws-modal-body details-body">
    <section class="details-summary" aria-label="خلاصه تماس‌ها">
      <div class="details-summary-item total">
        <i class="mdi mdi-phone-log-outline"></i>
        <span>کل تماس‌ها</span>
        <strong>{{ vm.toFaNumber(vm.detailsSummary().total_calls) }}</strong>
      </div>
      <div class="details-summary-item incoming">
        <i class="mdi mdi-phone-incoming-outline"></i>
        <span>ورودی</span>
        <strong>{{ vm.toFaNumber(vm.detailsSummary().incoming_calls) }}</strong>
      </div>
      <div class="details-summary-item outgoing">
        <i class="mdi mdi-phone-outgoing-outline"></i>
        <span>خروجی</span>
        <strong>{{ vm.toFaNumber(vm.detailsSummary().outgoing_calls) }}</strong>
      </div>
      <div class="details-summary-item answered">
        <i class="mdi mdi-phone-check-outline"></i>
        <span>پاسخ داده‌شده</span>
        <strong>{{ vm.toFaNumber(vm.detailsSummary().answered_calls) }}</strong>
      </div>
      <div class="details-summary-item missed">
        <i class="mdi mdi-phone-missed-outline"></i>
        <span>بی‌پاسخ</span>
        <strong>{{ vm.toFaNumber(vm.detailsSummary().missed_calls) }}</strong>
      </div>
    </section>

    <section class="followup-editor">
      <div class="followup-field followup-status-field">
        <label class="form-label">وضعیت پیگیری</label>
        <select class="form-select" [ngModel]="vm.followUpForm().status" (ngModelChange)="vm.onFollowUpStatusChange($event)">
          <option value="new">پیگیری نشده</option>
          <option value="pending">در حال پیگیری</option>
          <option value="contacted">تماس گرفته شد</option>
          <option value="converted">تبدیل به مشتری</option>
          <option value="not_needed">عدم نیاز</option>
        </select>
      </div>
      <div class="followup-field followup-owner-field">
        <label class="form-label">مسئول پیگیری</label>
        <input type="text" class="form-control" placeholder="مثلاً ۴۱۲" [ngModel]="vm.followUpForm().owner" (ngModelChange)="vm.onFollowUpOwnerChange($event)" />
      </div>
      <div class="followup-field followup-note-field">
        <label class="form-label">یادداشت</label>
        <input type="text" class="form-control" placeholder="نتیجه یا توضیح پیگیری" [ngModel]="vm.followUpForm().note" (ngModelChange)="vm.onFollowUpNoteChange($event)" />
      </div>
      <button type="button" class="btn btn-primary followup-save-btn" (click)="vm.saveFollowUp()" [disabled]="vm.savingFollowUp()">
        @if (vm.savingFollowUp()) { <span class="spinner-border spinner-border-sm"></span> }
        @else { <i class="mdi mdi-content-save-outline"></i> }
        <span>ذخیره پیگیری</span>
      </button>
    </section>

    @if (vm.loadingDetails()) {
      <div class="kws-loading"><span class="spinner-border spinner-border-sm"></span> در حال دریافت تاریخچه تماس‌ها...</div>
    }

    @if (!vm.loadingDetails() && vm.callDetails().length === 0) {
      <div class="kws-empty"><i class="mdi mdi-phone-off-outline"></i> تماسی در این بازه پیدا نشد</div>
    }

    @if (!vm.loadingDetails() && vm.callDetails().length > 0) {
      <div class="call-list-head">
        <strong>ریز تماس‌ها</strong>
        <span>{{ vm.toFaNumber(vm.callDetails().length) }} تماس واقعی</span>
      </div>

      <div class="call-timeline">
        @for (call of vm.callDetails(); track call.call_key || call.uniqueid + call.calldate + call.direction; let index = $index) {
          <article class="call-timeline-item" [class.outgoing]="call.direction === 'outgoing'">
            <div class="timeline-icon" aria-hidden="true">
              <i class="mdi" [class.mdi-phone-incoming-outline]="call.direction === 'incoming'" [class.mdi-phone-outgoing-outline]="call.direction === 'outgoing'"></i>
            </div>

            <div class="timeline-content">
              <header class="timeline-head">
                <div class="timeline-title">
                  <span class="call-index">{{ vm.toFaNumber(index + 1) }}</span>
                  <strong>{{ call.direction_fa }}</strong>
                  <span class="kws-status-badge"
                    [class.success]="call.disposition === 'ANSWERED'"
                    [class.warning]="call.disposition === 'NO ANSWER'"
                    [class.busy]="call.disposition === 'BUSY'"
                    [class.danger]="call.disposition !== 'ANSWERED' && call.disposition !== 'NO ANSWER' && call.disposition !== 'BUSY'">
                    {{ call.disposition_fa }}
                  </span>
                </div>
                <time>{{ vm.displayJalaliDateTime(call.calldate) }}</time>
              </header>

              <div class="call-route">
                <div class="route-party">
                  <small>مبدأ</small>
                  <strong>{{ call.src_name_or_number || call.src || '-' }}</strong>
                  @if (call.src_name_or_number && call.src_name_or_number !== call.src) {
                    <span>{{ call.src }}</span>
                  }
                </div>
                <i class="mdi mdi-arrow-left route-arrow"></i>
                <div class="route-party">
                  <small>مقصد</small>
                  <strong>{{ call.dst_name_or_number || call.dst || '-' }}</strong>
                  @if (call.dst_name_or_number && call.dst_name_or_number !== call.dst) {
                    <span>{{ call.dst }}</span>
                  }
                </div>
              </div>

              <div class="timeline-meta">
                <span><i class="mdi mdi-account-headset"></i> پاسخگو: <strong>{{ call.operator_display || call.operator || call.extension || '-' }}</strong></span>
                @if (call.ringgroups_display) {
                  <span><i class="mdi mdi-account-group-outline"></i> گروه زنگ: <strong>{{ call.ringgroups_display }}</strong></span>
                }
                @if (call.attempted_extensions_display) {
                  <span class="wide-meta"><i class="mdi mdi-phone-ring-outline"></i> داخلی‌های تلاش‌شده: <strong>{{ call.attempted_extensions_display }}</strong></span>
                }
                @if (call.did) { <span><i class="mdi mdi-phone-classic"></i> خط ورودی: <strong>{{ call.did }}</strong></span> }
                <span><i class="mdi mdi-timer-outline"></i> کل تماس: <strong>{{ call.duration_fa || '-' }}</strong></span>
                <span><i class="mdi mdi-message-processing-outline"></i> مکالمه: <strong>{{ call.billsec_fa || '-' }}</strong></span>
                @if ((call.legs_count || 0) > 1) {
                  <span><i class="mdi mdi-source-branch"></i> رکوردهای فنی: <strong>{{ vm.toFaNumber(call.legs_count) }}</strong></span>
                }
              </div>

              @if (vm.hasRecordingReference(call) && !vm.isRecordingUnavailable(call)) {
                <div class="recording-box" [class.open]="vm.isRecordingOpen(call)">
                  @if (!vm.isRecordingOpen(call)) {
                    <button type="button" class="recording-toggle" (click)="vm.toggleRecording(call)">
                      <i class="mdi mdi-play-circle-outline"></i>
                      پخش فایل ضبط
                    </button>
                  } @else {
                    <div class="recording-player-wrap">
                      <audio class="call-audio" controls autoplay preload="metadata"
                        [src]="vm.getRecordingUrl(call.recordingfile)"
                        (error)="vm.onRecordingError(call)"></audio>
                      <button type="button" class="recording-close" (click)="vm.toggleRecording(call)" aria-label="بستن پخش‌کننده">
                        <i class="mdi mdi-close"></i>
                      </button>
                    </div>
                  }
                </div>
              }

              @if (vm.isRecordingUnavailable(call)) {
                <div class="recording-missing"><i class="mdi mdi-volume-off"></i> فایل ضبط برای این تماس پیدا نشد</div>
              }
            </div>
          </article>
        }
      </div>
    }

    <div class="kws-details-footer-actions">
      <button type="button" class="btn btn-light" (click)="vm.closeDetails()">
        <i class="mdi mdi-close"></i>
        بستن
      </button>

      <button type="button" class="btn btn-outline-primary" (click)="vm.openSelectedDetailsKowsarLink()">
        <i class="mdi mdi-link-variant"></i>
        اتصال به کوثر
      </button>

      <button type="button" class="btn btn-primary" (click)="vm.openSelectedDetailsAdd()">
        <i class="mdi mdi-account-plus-outline"></i>
        افزودن به دفتر تلفن
      </button>
    </div>
  </div>
</div>
}
`
})
export class PhonebookDetailsModalComponent {
  @Input({ required: true }) vm!: SantralPhonebookComponent;
}
