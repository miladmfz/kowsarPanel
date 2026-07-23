import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralRingGroupComponent } from '../santral-ringgroup.component';

@Component({
  selector: 'app-ringgroup-filter-card',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card kws-filter-card">
    <div class="card-body">
      <div class="row g-3 align-items-end">

        <div class="col-md-8">
          <label class="form-label">
            جستجو در گروه‌ها
          </label>

          <input type="text" class="form-control" placeholder="مثلاً سخت‌افزار، فروش، ۸۴۲، 500" [ngModel]="vm.searchText()"
            (ngModelChange)="vm.setSearchText($event)" />
        </div>

        <div class="col-md-4">
          <label class="form-label">
            انتخاب سریع گروه
          </label>

          <select class="form-control" [ngModel]="vm.selectedGroupCode()" (ngModelChange)="vm.selectedGroupCode.set($event)">

            <option value="">
              انتخاب گروه تماس
            </option>

            @for (group of vm.groups(); track group.grpnum) {
            <option [value]="group.grpnum">
              {{ vm.toFaNumber(group.grpnum) }} - {{ group.description_fa }} | {{ vm.toFaNumber(group.members_count) }} داخلی
            </option>
            }
          </select>
        </div>

      </div>
    </div>
  </div>
`
})
export class RinggroupFilterCardComponent {
  @Input({ required: true }) vm!: SantralRingGroupComponent;
}
