import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralRingGroupComponent } from '../santral-ringgroup.component';

@Component({
  selector: 'app-ringgroup-page-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="kws-page-header">
    <div>
      <h4 class="kws-page-title">
        مدیریت گروه‌های تماس
      </h4>

      <div class="kws-page-subtitle">
        مشاهده RingGroupها، اعضای هر گروه، نوع زنگ خوردن، زمان زنگ و مقصد بعد از عدم پاسخ
      </div>
    </div>

    <div class="kws-header-actions">

      @if (vm.configDirty()) {
      <span class="kws-config-dirty">
        تغییرات اعمال نشده
      </span>
      }

      <button type="button" class="btn btn-outline-primary kws-refresh-btn" (click)="vm.loadRingGroups()"
        [disabled]="vm.loading()">

        @if (vm.loading()) {
        <span class="spinner-border spinner-border-sm ms-1"></span>
        }

        بروزرسانی
      </button>

      <button type="button" class="btn btn-success kws-refresh-btn" (click)="vm.applyConfig()"
        [disabled]="vm.applyingConfig()">

        @if (vm.applyingConfig()) {
        <span class="spinner-border spinner-border-sm ms-1"></span>
        }

        <i class="mdi mdi-check-circle-outline ms-1"></i>
        اعمال تنظیمات
      </button>

    </div>
  </div>
`
})
export class RinggroupPageHeaderComponent {
  @Input({ required: true }) vm!: SantralRingGroupComponent;
}
