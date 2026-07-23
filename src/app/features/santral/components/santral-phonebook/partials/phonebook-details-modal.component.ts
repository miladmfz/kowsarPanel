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
<div class="kws-phonebook-modal kws-details-modal" dir="rtl">
  <div class="kws-modal-header">
    <div>
      <h5>تاریخچه تماس‌های {{ vm.selectedUnknown()?.number_raw }}</h5>
      <p>جزئیات تماس‌ها و وضعیت پیگیری در بازه انتخاب‌شده</p>
    </div>
    <button type="button" class="btn btn-light" (click)="vm.closeDetails()"><i class="mdi mdi-close"></i></button>
  </div>

  <div class="kws-modal-body details-body">
    <div class="followup-editor">
      <div>
        <label class="form-label">وضعیت پیگیری</label>
        <select class="form-select" [ngModel]="vm.followUpForm().status" (ngModelChange)="vm.onFollowUpStatusChange($event)">
          <option value="new">پیگیری نشده</option>
          <option value="pending">در حال پیگیری</option>
          <option value="contacted">تماس گرفته شد</option>
          <option value="converted">تبدیل به مشتری</option>
          <option value="not_needed">عدم نیاز</option>
        </select>
      </div>
      <div>
        <label class="form-label">مسئول پیگیری</label>
        <input type="text" class="form-control" placeholder="مثلاً 412" [ngModel]="vm.followUpForm().owner" (ngModelChange)="vm.onFollowUpOwnerChange($event)" />
      </div>
      <div>
        <label class="form-label">یادداشت</label>
        <input type="text" class="form-control" placeholder="نتیجه یا توضیح پیگیری" [ngModel]="vm.followUpForm().note" (ngModelChange)="vm.onFollowUpNoteChange($event)" />
      </div>
      <button type="button" class="btn btn-primary" (click)="vm.saveFollowUp()" [disabled]="vm.savingFollowUp()">
        @if (vm.savingFollowUp()) { <span class="spinner-border spinner-border-sm"></span> }
        @else { <i class="mdi mdi-content-save-outline"></i> }
        ذخیره پیگیری
      </button>
    </div>

    @if (vm.loadingDetails()) {
    <div class="kws-loading"><span class="spinner-border spinner-border-sm"></span> در حال دریافت تاریخچه تماس‌ها...</div>
    }
    @if (!vm.loadingDetails() && vm.callDetails().length === 0) {
    <div class="kws-empty"><i class="mdi mdi-phone-off-outline"></i> تماسی در این بازه پیدا نشد</div>
    }
    @if (!vm.loadingDetails() && vm.callDetails().length > 0) {
    <div class="call-timeline">
      @for (call of vm.callDetails(); track call.uniqueid + call.calldate + call.direction) {
      <div class="call-timeline-item" [class.outgoing]="call.direction === 'outgoing'">
        <div class="timeline-icon">
          <i class="mdi" [class.mdi-phone-incoming-outline]="call.direction === 'incoming'" [class.mdi-phone-outgoing-outline]="call.direction === 'outgoing'"></i>
        </div>
        <div class="timeline-content">
          <div class="timeline-head">
            <div>
              <strong>{{ call.direction_fa }}</strong>
              <span class="kws-status-badge" [class.success]="call.disposition === 'ANSWERED'" [class.warning]="call.disposition === 'NO ANSWER'" [class.busy]="call.disposition === 'BUSY'" [class.danger]="call.disposition !== 'ANSWERED' && call.disposition !== 'NO ANSWER' && call.disposition !== 'BUSY'">{{ call.disposition_fa }}</span>
            </div>
            <time>{{ vm.displayJalaliDateTime(call.calldate) }}</time>
          </div>
          <div class="timeline-grid">
            <span>داخلی/اپراتور <strong>{{ call.operator || call.extension || '-' }}</strong></span>
            <span>مبدأ <strong>{{ call.src || '-' }}</strong></span>
            <span>مقصد <strong>{{ call.dst || '-' }}</strong></span>
            <span>مدت زنگ <strong>{{ call.duration_fa || '-' }}</strong></span>
            <span>مدت مکالمه <strong>{{ call.billsec_fa || '-' }}</strong></span>
          </div>
          @if (call.recordingfile) { <audio class="call-audio" controls preload="none" [src]="vm.getRecordingUrl(call.recordingfile)"></audio> }
        </div>
      </div>
      }
    </div>
    }
  </div>
</div>
}
`
})
export class PhonebookDetailsModalComponent {
  @Input({ required: true }) vm!: SantralPhonebookComponent;
}
