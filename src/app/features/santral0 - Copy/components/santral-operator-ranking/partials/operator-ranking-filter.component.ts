import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralOperatorRankingComponent } from '../santral-operator-ranking.component';

@Component({
  selector: 'app-operator-ranking-filter',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="card kws-filter-card">
    <div class="card-body">
      <div class="row g-3 align-items-end">

        <div class="col-md-4">
          <label class="form-label">
            گروه تماس
          </label>

          <select class="form-control" [ngModel]="vm.selectedGroup()" (ngModelChange)="vm.onGroupChange($event)"
            [disabled]="vm.loadingGroups()">

            <option value="">
              انتخاب گروه تماس
            </option>

            @for (group of vm.groups(); track group.grpnum) {
            <option [value]="group.grpnum">
              {{ vm.getGroupOptionLabel(group) }}
            </option>
            }
          </select>
        </div>

        <div class="col-md-3">
          <label class="form-label">
            از تاریخ شمسی
          </label>

          <input
            type="text"
            class="form-control kws-date-input"
            placeholder="۱۴۰۵/۰۴/۱۰"
            inputmode="numeric"
            dir="ltr"
            [ngModel]="vm.startdate()"
            (ngModelChange)="vm.setStartDate($event)" />
        </div>

        <div class="col-md-3">
          <label class="form-label">
            تا تاریخ شمسی
          </label>

          <input
            type="text"
            class="form-control kws-date-input"
            placeholder="۱۴۰۵/۰۴/۱۰"
            inputmode="numeric"
            dir="ltr"
            [ngModel]="vm.enddate()"
            (ngModelChange)="vm.setEndDate($event)" />
        </div>

        <div class="col-md-2 d-grid">
          <button type="button" class="btn btn-primary" (click)="vm.loadRankings()" [disabled]="vm.loadingRanking()">

            @if (vm.loadingRanking()) {
            <span class="spinner-border spinner-border-sm ms-1"></span>
            }

            نمایش رتبه‌بندی
          </button>
        </div>

      </div>
    </div>
  </div>
`
})
export class OperatorRankingFilterComponent {
  @Input({ required: true }) vm!: SantralOperatorRankingComponent;
}
