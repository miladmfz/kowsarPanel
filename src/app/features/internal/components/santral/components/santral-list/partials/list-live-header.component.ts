import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralListComponent } from '../santral-list.component';

@Component({
  selector: 'app-list-live-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <!-- Header -->
  <div class="kws-santral-header">
    <div>
      <div class="kws-eyebrow">Live PBX Monitor</div>

      <h4 class="kws-title">
        {{ vm.title() }}
      </h4>

      <div class="kws-subtitle">
        مشاهده وضعیت لحظه‌ای اتصال تلفن، مکالمه فعال، طرف مقابل و مدت تماس
      </div>
    </div>

    <div class="kws-header-actions">

      <button type="button" class="btn kws-header-btn kws-refresh-btn" (click)="vm.refresh()"
        [disabled]="vm.requestInProgress()" title="بروزرسانی">
        <i class="mdi mdi-refresh" [class.kws-spin]="vm.requestInProgress()"></i>
        <span>بروزرسانی</span>
      </button>

      <button type="button" class="btn kws-header-btn kws-auto-btn" [class.active]="vm.autoRefresh()"
        (click)="vm.toggleAutoRefresh()" [title]="vm.autoRefresh() ? 'بروزرسانی خودکار فعال' : 'بروزرسانی خودکار غیرفعال'">
        <i class="mdi" [ngClass]="vm.autoRefresh() ? 'mdi-timer-sync-outline' : 'mdi-timer-off-outline'"></i>
        <span>
          {{ vm.autoRefresh() ? 'خودکار فعال' : 'خودکار غیرفعال' }}
        </span>
      </button>

      <button type="button" class="btn kws-header-btn kws-select-btn" (click)="vm.openManageModal()"
        title="انتخاب داخلی‌ها">
        <i class="mdi mdi-playlist-edit"></i>
        <span>انتخاب داخلی‌ها</span>
      </button>
      <button type="button" class="btn kws-header-btn" (click)="vm.changeSupervisorExtension()" title="خواندن داخلی کاربر از Session">
        <i class="mdi mdi-account-tie-voice-outline"></i>
        <span>داخلی کاربر: {{ vm.supervisorExtension() || '-' }}</span>
      </button>
    </div>
  </div>
`
})
export class ListLiveHeaderComponent {
  @Input({ required: true }) vm!: SantralListComponent;
}
