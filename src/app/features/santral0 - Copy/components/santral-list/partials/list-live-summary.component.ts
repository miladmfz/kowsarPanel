import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralListComponent } from '../santral-list.component';

@Component({
  selector: 'app-list-live-summary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <!-- Summary -->
  <div class="kws-summary-grid">

    <button type="button" class="kws-summary-card" [class.active]="vm.statusFilter() === 'all'"
      (click)="vm.setStatusFilter('all')">
      <div class="kws-summary-icon">
        <i class="mdi mdi-phone-outline"></i>
      </div>

      <div>
        <div class="kws-summary-value">{{ vm.totalCount() }}</div>
        <div class="kws-summary-label">کل داخلی‌ها</div>
      </div>
    </button>

    <button type="button" class="kws-summary-card" [class.active]="vm.statusFilter() === 'busy'"
      (click)="vm.setStatusFilter('busy')">
      <div class="kws-summary-icon busy">
        <i class="mdi mdi-phone-in-talk-outline"></i>
      </div>

      <div>
        <div class="kws-summary-value">{{ vm.busyCount() }}</div>
        <div class="kws-summary-label">در حال مکالمه</div>
      </div>
    </button>

    <button type="button" class="kws-summary-card" [class.active]="vm.statusFilter() === 'idle'"
      (click)="vm.setStatusFilter('idle')">
      <div class="kws-summary-icon idle">
        <i class="mdi mdi-phone-check-outline"></i>
      </div>

      <div>
        <div class="kws-summary-value">{{ vm.idleCount() }}</div>
        <div class="kws-summary-label">آزاد</div>
      </div>
    </button>

    <button type="button" class="kws-summary-card" [class.active]="vm.statusFilter() === 'offline'"
      (click)="vm.setStatusFilter('offline')">
      <div class="kws-summary-icon offline">
        <i class="mdi mdi-phone-off-outline"></i>
      </div>

      <div>
        <div class="kws-summary-value">{{ vm.offlineCount() }}</div>
        <div class="kws-summary-label">قطع / آفلاین</div>
      </div>
    </button>

  </div>
`
})
export class ListLiveSummaryComponent {
  @Input({ required: true }) vm!: SantralListComponent;
}
