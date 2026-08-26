import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralOperatorRankingComponent } from '../santral-operator-ranking.component';

@Component({
  selector: 'app-operator-ranking-group-info',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  @if (vm.selectedGroupInfo()) {
  <div class="kws-group-info">

    <div class="kws-info-item">
      <span>کد گروه تماس:</span>
      <strong>
        {{ vm.toFaNumber(vm.selectedGroupInfo()?.grpnum || '') }}
      </strong>
    </div>

    <div class="kws-info-item">
      <span>عنوان گروه:</span>
      <strong>
        {{ vm.getGroupFaName(vm.selectedGroupInfo()) }}
      </strong>
    </div>

    <div class="kws-info-item">
      <span>تعداد داخلی‌ها:</span>
      <strong>
        {{ vm.toFaNumber(vm.getGroupMembersCount(vm.selectedGroupInfo())) }} داخلی
      </strong>
    </div>

    <div class="kws-info-item">
      <span>نوع زنگ خوردن:</span>
      <strong>
        {{ vm.getStrategyFa(vm.selectedGroupInfo()?.strategy) }}
      </strong>
    </div>

    <div class="kws-info-item">
      <span>مدت زنگ خوردن:</span>
      <strong>
        {{ vm.toFaNumber(vm.selectedGroupInfo()?.grptime || 0) }} ثانیه
      </strong>
    </div>

  </div>
  }
`
})
export class OperatorRankingGroupInfoComponent {
  @Input({ required: true }) vm!: SantralOperatorRankingComponent;
}
