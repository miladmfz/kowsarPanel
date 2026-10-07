import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralOperatorRankingComponent } from '../santral-operator-ranking.component';

@Component({
  selector: 'app-operator-ranking-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="kws-page-header">
    <div>
      <h4 class="kws-page-title">
        رتبه‌بندی اپراتورها
      </h4>

      <div class="kws-page-subtitle">
        بررسی عملکرد اپراتورها بر اساس تماس‌های پاسخ‌داده‌شده، بی‌پاسخ و مدت مکالمه
      </div>
    </div>

    <button type="button" class="btn btn-outline-primary kws-refresh-btn" (click)="vm.loadRankings()"
      [disabled]="vm.loadingRanking() || !vm.selectedGroup()">

      @if (vm.loadingRanking()) {
      <span class="spinner-border spinner-border-sm ms-1"></span>
      }

      بروزرسانی
    </button>
  </div>
`
})
export class OperatorRankingHeaderComponent {
  @Input({ required: true }) vm!: SantralOperatorRankingComponent;
}
