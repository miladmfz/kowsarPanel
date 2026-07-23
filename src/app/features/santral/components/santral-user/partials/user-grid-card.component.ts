import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralUserComponent } from '../santral-user.component';

@Component({
  selector: 'app-user-grid-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <!-- List Card -->
  <div class="santral-user-card">

    @if (vm.loading()) {
    <div class="kws-loading">
      <span class="spinner-border spinner-border-sm"></span>
      در حال دریافت داخلی‌ها...
    </div>
    }

    @if (!vm.loading() && vm.filteredUsers().length === 0) {
    <div class="kws-empty">
      <i class="mdi mdi-phone-off-outline"></i>
      داخلی‌ای برای نمایش وجود ندارد
    </div>
    }

    @if (!vm.loading() && vm.filteredUsers().length > 0) {
    <div class="table-responsive kws-table-wrap">
      <table class="table kws-user-table align-middle">
        <thead>
          <tr>
            <th>داخلی</th>
            <th class="text-center kws-action-col">عملیات</th>
            <th>نام نمایشی</th>
            <th>نام Issabel</th>
            <th>توضیح Device</th>
            <th>Tech</th>
            <th>Dial</th>
            <th>Voicemail</th>
            <th>مدت زنگ</th>
          </tr>
        </thead>

        <tbody>
          @for (item of vm.filteredUsers(); track item.extension) {
          <tr>
            <td>
              <span class="kws-ext-code">
                {{ item.extension }}
              </span>
            </td>
            <td class="text-center kws-action-col">
              <div class="kws-row-actions">

                <button type="button" class="btn btn-sm kws-icon-action kws-edit-action" title="ویرایش نام داخلی"
                  (click)="vm.openEditModal(item)">

                  <i class="mdi mdi-pencil-outline"></i>
                </button>

                <button type="button" class="btn btn-sm kws-icon-action kws-forward-action" title="انتقال تماس"
                  (click)="vm.openForwardModal(item)">

                  <i class="mdi mdi-phone-forward-outline"></i>
                </button>

                <button type="button" class="btn btn-sm kws-icon-action kws-recording-action" title="تنظیمات ضبط مکالمه"
                  (click)="vm.openRecordingModal(item)">

                  <i class="mdi mdi-record-circle-outline"></i>
                </button>

                <button type="button" class="btn btn-sm kws-icon-action kws-voicemail-action" title="تنظیمات صندوق صوتی"
                  (click)="vm.openVoicemailModal(item)">

                  <i class="mdi mdi-voicemail"></i>
                </button>

                <button type="button" class="btn btn-sm kws-icon-action kws-call-rule-action" title="محدودیت تماس"
                  (click)="vm.openCallRulesModal(item)">

                  <i class="mdi mdi-phone-lock-outline"></i>
                </button>

              </div>
            </td>

            <td>
              <div class="kws-main-name">
                {{ item.display_name || '-' }}
              </div>
            </td>

            <td>
              <span class="kws-muted-text">
                {{ item.user_name || '-' }}
              </span>
            </td>

            <td>
              <span class="kws-muted-text">
                {{ item.device_description || '-' }}
              </span>
            </td>

            <td>
              <span class="kws-tech-badge">
                {{ item.tech || '-' }}
              </span>
            </td>

            <td>
              <span class="kws-ltr">
                {{ item.dial || '-' }}
              </span>
            </td>

            <td>
              <span class="kws-vm-status" [class.is-active]="item.voicemail === 'default'">
                {{ item.voicemail === 'default' ? 'فعال' : 'غیرفعال' }}
              </span>
            </td>

            <td>
              <span class="kws-muted-text">
                {{ item.ringtimer && +item.ringtimer > 0 ? item.ringtimer + ' ثانیه' : '-' }}
              </span>
            </td>
          </tr>
          }
        </tbody>
      </table>
    </div>
    }

  </div>
`
})
export class UserGridCardComponent {
  @Input({ required: true }) vm!: SantralUserComponent;
}
