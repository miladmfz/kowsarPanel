import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralRingGroupComponent } from '../santral-ringgroup.component';

@Component({
  selector: 'app-ringgroup-stat-cards',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="row g-3 mb-3">

    <div class="col-md-3">
      <div class="kws-stat-card">
        <span>تعداد گروه‌ها</span>
        <strong>{{ vm.toFaNumber(vm.totalGroups()) }}</strong>
      </div>
    </div>

    <div class="col-md-3">
      <div class="kws-stat-card">
        <span>مجموع داخلی‌ها</span>
        <strong>{{ vm.toFaNumber(vm.totalMembers()) }}</strong>
      </div>
    </div>

    <div class="col-md-3">
      <div class="kws-stat-card">
        <span>زنگ همزمان</span>
        <strong>{{ vm.toFaNumber(vm.ringAllCount()) }}</strong>
      </div>
    </div>

    <div class="col-md-3">
      <div class="kws-stat-card">
        <span>زنگ ترتیبی</span>
        <strong>{{ vm.toFaNumber(vm.huntCount()) }}</strong>
      </div>
    </div>

  </div>
`
})
export class RinggroupStatCardsComponent {
  @Input({ required: true }) vm!: SantralRingGroupComponent;
}
