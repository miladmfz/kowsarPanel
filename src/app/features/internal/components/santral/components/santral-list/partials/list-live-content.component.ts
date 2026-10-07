import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralListComponent } from '../santral-list.component';

@Component({
  selector: 'app-list-live-content',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <!-- Error -->
  @if (vm.errorMessage()) {
  <div class="alert alert-danger kws-alert">
    <i class="mdi mdi-alert-circle-outline"></i>
    {{ vm.errorMessage() }}
  </div>
  }

  <!-- Content -->
  @if (vm.firstLoading()) {

  <div class="kws-skeleton-list">
    <div class="kws-skeleton-card"></div>
    <div class="kws-skeleton-card"></div>
    <div class="kws-skeleton-card"></div>
    <div class="kws-skeleton-card"></div>
  </div>

  } @else {

  @if (vm.filteredRecords().length === 0) {

  <div class="kws-empty">
    <i class="mdi mdi-phone-off-outline"></i>
    <h5>داده‌ای برای نمایش وجود ندارد</h5>
    <p>فیلتر وضعیت، سری داخلی‌ها یا عبارت جستجو را تغییر بده.</p>
  </div>

  } @else {

  <div class="kws-extension-grid kws-extension-grid-compact">

    @for (item of vm.filteredRecords(); track item.extension) {

    <div class="kws-extension-card kws-extension-card-compact" [ngClass]="vm.getStatusClass(item)">

      <div class="kws-card-top kws-card-top-compact">

        <div class="kws-card-left-tools">
          <div class="kws-status-pill kws-status-pill-compact">
            <i [class]="vm.getStatusIcon(item)"></i>
            {{ vm.getStatusTitle(item) }}
          </div>

          @if (vm.isBusy(item)) {
          <div class="kws-card-actions-compact">

            <button type="button" class="btn kws-card-icon-action listen" title="گوش دادن"
              aria-label="گوش دادن" (click)="vm.spyCall(item, 'listen')"
              [disabled]="vm.spyInProgressExtension() === item.extension">
              @if (vm.isSpyLoading(item, 'listen')) {
              <span class="spinner-border spinner-border-sm"></span>
              } @else {
              <i class="mdi mdi-headphones"></i>
              }
            </button>

            <button type="button" class="btn kws-card-icon-action whisper" title="تماس با پشتیبان"
              aria-label="تماس با پشتیبان" (click)="vm.spyCall(item, 'whisper')"
              [disabled]="vm.spyInProgressExtension() === item.extension">
              @if (vm.isSpyLoading(item, 'whisper')) {
              <span class="spinner-border spinner-border-sm"></span>
              } @else {
              <i class="mdi mdi-message-processing-outline"></i>
              }
            </button>

            <button type="button" class="btn kws-card-icon-action barge" title="ورود به مکالمه"
              aria-label="ورود به مکالمه" (click)="vm.spyCall(item, 'barge')"
              [disabled]="vm.spyInProgressExtension() === item.extension">
              @if (vm.isSpyLoading(item, 'barge')) {
              <span class="spinner-border spinner-border-sm"></span>
              } @else {
              <i class="mdi mdi-account-voice"></i>
              }
            </button>

            <button type="button" class="btn kws-card-icon-action hangup" title="قطع مکالمه"
              aria-label="قطع مکالمه" (click)="vm.hangupCall(item)"
              [disabled]="vm.hangupInProgressExtension() === item.extension">
              @if (vm.hangupInProgressExtension() === item.extension) {
              <span class="spinner-border spinner-border-sm"></span>
              } @else {
              <i class="mdi mdi-phone-hangup-outline"></i>
              }
            </button>

          </div>
          }
        </div>

        <div class="kws-extension-main kws-extension-main-compact">
          <div class="kws-extension-identity">
            <div class="kws-extension-name">
              {{ item.name || 'بدون نام' }}
            </div>

            <div class="kws-extension-number">
              داخلی {{ item.extension }}
            </div>
          </div>

          <div class="kws-status-dot"></div>
        </div>

      </div>

      @if (vm.isBusy(item)) {

      <div class="kws-compact-call-strip">
        <div class="kws-compact-info peer">
          <span>طرف مقابل</span>
          <strong>{{ vm.getPeerNumber(item) }}</strong>
        </div>

        <div class="kws-compact-info duration">
          <span>مدت</span>
          <strong>{{ vm.getDuration(item) }}</strong>
        </div>

        <div class="kws-compact-info direction">
          <span>نوع</span>
          <strong class="kws-direction" [ngClass]="vm.getDirectionClass(vm.getCallDirection(item))">
            {{ vm.getDirectionTitle(vm.getCallDirection(item)) }}
          </strong>
        </div>
      </div>

      } @else {

      <div class="kws-compact-idle-strip">
        <div class="kws-compact-info">
          <span>وضعیت SIP</span>
          <strong>{{ vm.getPeerStatus(item) }}</strong>
        </div>

        <div class="kws-compact-info ip">
          <span>IP</span>
          <strong>{{ vm.getIpAddress(item) }}</strong>
        </div>
      </div>

      }

    </div>

    }

  </div>

  }

  }
`
})
export class ListLiveContentComponent {
  @Input({ required: true }) vm!: SantralListComponent;
}
