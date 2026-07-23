import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralOperatorRankingComponent } from '../santral-operator-ranking.component';

@Component({
  selector: 'app-operator-ranking-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card kws-table-card">
    <div class="card-body p-0">

      @if (vm.loadingRanking()) {
      <div class="kws-empty-state">
        <span class="spinner-border spinner-border-sm mb-2"></span>
        <div>در حال دریافت رتبه‌بندی...</div>
      </div>
      }

      @if (!vm.loadingRanking() && !vm.hasOperators()) {
      <div class="kws-empty-state">
        <i class="mdi mdi-chart-bar"></i>
        <div>
          برای نمایش رتبه‌بندی، گروه تماس و بازه تاریخ را انتخاب کنید.
        </div>
      </div>
      }

      @if (!vm.loadingRanking() && vm.hasOperators()) {
      <div class="table-responsive">
        <table class="table table-hover align-middle mb-0 kws-ranking-table">
          <thead>
            <tr>
              <th>رتبه</th>
              <th>داخلی</th>
              <th>نام اپراتور</th>
              <th>کل تماس‌ها</th>
              <th>پاسخ داده‌شده</th>
              <th>بی‌پاسخ</th>
              <th>درصد پاسخگویی</th>
              <th>مجموع مکالمه</th>
              <th>میانگین مکالمه</th>
              <th>امتیاز نهایی</th>
            </tr>
          </thead>

          <tbody>
            @for (item of vm.operators(); track vm.trackByExtension($index, item)) {
            <tr>
              <td>
                <span class="kws-rank-badge" [class]="vm.getRankClass(item.rank)">

                  {{ vm.toFaNumber(item.rank) }}
                </span>
              </td>

              <td>
                <strong class="kws-extension">
                  {{ vm.toFaNumber(item.extension) }}
                </strong>
              </td>

              <td>
                {{ item.name }}
              </td>

              <td>
                {{ vm.toFaNumber(item.total_calls) }}
              </td>

              <td>
                <span class="kws-success-text">
                  {{ vm.toFaNumber(item.answered_calls) }}
                </span>
              </td>

              <td>
                <span class="kws-danger-text">
                  {{ vm.toFaNumber(item.missed_calls) }}
                </span>
              </td>

              <td>
                {{ vm.formatPercent(item.answer_rate) }}
              </td>

              <td>
                {{ vm.formatSeconds(item.total_talk_sec) }}
              </td>

              <td>
                {{ vm.formatSeconds(item.avg_talk_sec) }}
              </td>

              <td>
                <span class="kws-score-badge" [class]="vm.getScoreClass(item.score)">

                  {{ vm.formatScore(item.score) }}
                </span>
              </td>
            </tr>
            }
          </tbody>
        </table>
      </div>
      }

    </div>
  </div>
`
})
export class OperatorRankingTableComponent {
  @Input({ required: true }) vm!: SantralOperatorRankingComponent;
}
