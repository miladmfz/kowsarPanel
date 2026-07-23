import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralUserComponent } from '../santral-user.component';

@Component({
  selector: 'app-user-recording-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
@if (vm.recordingModalVisible()) {
<div class="kws-modal-backdrop" (click)="vm.closeRecordingModal()"></div>

<div class="kws-forward-modal" dir="rtl">

  <div class="kws-edit-modal-header">
    <div>
      <h5>تنظیمات ضبط مکالمه</h5>
      <p>
        داخلی {{ vm.recordingExtension() }} - {{ vm.recordingDisplayName() }}
      </p>
    </div>

    <button type="button" class="btn btn-light" (click)="vm.closeRecordingModal()" [disabled]="vm.recordingSaving()">

      <i class="mdi mdi-close"></i>
    </button>
  </div>

  <div class="kws-edit-modal-body">

    @if (vm.recordingLoading()) {
    <div class="kws-forward-loading">
      <span class="spinner-border spinner-border-sm"></span>
      در حال دریافت تنظیمات ضبط...
    </div>
    }

    @if (!vm.recordingLoading()) {

    <div class="kws-forward-help">
      مقدار «طبق پیش‌فرض» یعنی تنظیم ضبط از تنظیمات عمومی Issabel پیروی کند.
    </div>

    <div class="kws-forward-list">

      <div class="kws-forward-card">
        <div class="kws-forward-card-head">
          <div>
            <h6>تماس ورودی خارجی</h6>
            <p>تماس‌هایی که از بیرون سازمان به این داخلی وصل می‌شوند.</p>
          </div>
        </div>

        <select class="form-control" [ngModel]="vm.getRecordingValue('in_external')"
          (ngModelChange)="vm.onRecordingValueChange('in_external', $event)" [disabled]="vm.recordingSaving()">

          @for (mode of vm.recordingModeOptions; track mode.value) {
          <option [value]="mode.value">
            {{ mode.title }}
          </option>
          }

        </select>
      </div>

      <div class="kws-forward-card">
        <div class="kws-forward-card-head">
          <div>
            <h6>تماس ورودی داخلی</h6>
            <p>تماس‌هایی که از داخلی‌های دیگر به این داخلی زده می‌شوند.</p>
          </div>
        </div>

        <select class="form-control" [ngModel]="vm.getRecordingValue('in_internal')"
          (ngModelChange)="vm.onRecordingValueChange('in_internal', $event)" [disabled]="vm.recordingSaving()">

          @for (mode of vm.recordingModeOptions; track mode.value) {
          <option [value]="mode.value">
            {{ mode.title }}
          </option>
          }

        </select>
      </div>

      <div class="kws-forward-card">
        <div class="kws-forward-card-head">
          <div>
            <h6>تماس خروجی خارجی</h6>
            <p>تماس‌هایی که این داخلی به شماره‌های بیرون سازمان می‌گیرد.</p>
          </div>
        </div>

        <select class="form-control" [ngModel]="vm.getRecordingValue('out_external')"
          (ngModelChange)="vm.onRecordingValueChange('out_external', $event)" [disabled]="vm.recordingSaving()">

          @for (mode of vm.recordingModeOptions; track mode.value) {
          <option [value]="mode.value">
            {{ mode.title }}
          </option>
          }

        </select>
      </div>

      <div class="kws-forward-card">
        <div class="kws-forward-card-head">
          <div>
            <h6>تماس خروجی داخلی</h6>
            <p>تماس‌هایی که این داخلی با داخلی‌های دیگر برقرار می‌کند.</p>
          </div>
        </div>

        <select class="form-control" [ngModel]="vm.getRecordingValue('out_internal')"
          (ngModelChange)="vm.onRecordingValueChange('out_internal', $event)" [disabled]="vm.recordingSaving()">

          @for (mode of vm.recordingModeOptions; track mode.value) {
          <option [value]="mode.value">
            {{ mode.title }}
          </option>
          }

        </select>
      </div>

    </div>
    }

  </div>

  <div class="kws-edit-modal-footer">

    <button type="button" class="btn btn-light" (click)="vm.closeRecordingModal()" [disabled]="vm.recordingSaving()">

      انصراف
    </button>

    <button type="button" class="btn btn-danger" (click)="vm.saveRecordingSettings()"
      [disabled]="vm.recordingSaving() || vm.recordingLoading()">

      @if (vm.recordingSaving()) {
      <span class="spinner-border spinner-border-sm"></span>
      در حال ذخیره...
      } @else {
      <i class="mdi mdi-content-save-outline"></i>
      ذخیره تنظیمات ضبط
      }

    </button>

  </div>

</div>
}
`
})
export class UserRecordingModalComponent {
  @Input({ required: true }) vm!: SantralUserComponent;
}
