import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralOperatorRankingComponent } from '../santral-operator-ranking.component';

@Component({
  selector: 'app-operator-ranking-stats',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="row g-3 mb-3">

    <div class="col-md-3">
      <div class="kws-stat-card">
        <span>کل تماس‌ها</span>
        <strong>{{ vm.toFaNumber(vm.totalCalls()) }}</strong>
      </div>
    </div>

    <div class="col-md-3">
      <div class="kws-stat-card">
        <span>پاسخ داده‌شده</span>
        <strong>{{ vm.toFaNumber(vm.answeredCalls()) }}</strong>
      </div>
    </div>

    <div class="col-md-3">
      <div class="kws-stat-card">
        <span>بی‌پاسخ</span>
        <strong>{{ vm.toFaNumber(vm.missedCalls()) }}</strong>
      </div>
    </div>

    <div class="col-md-3">
      <div class="kws-stat-card">
        <span>میانگین پاسخگویی</span>
        <strong>{{ vm.formatPercent(vm.avgAnswerRate()) }}</strong>
      </div>
    </div>

  </div>
`
})
export class OperatorRankingStatsComponent {
  @Input({ required: true }) vm!: SantralOperatorRankingComponent;
}
