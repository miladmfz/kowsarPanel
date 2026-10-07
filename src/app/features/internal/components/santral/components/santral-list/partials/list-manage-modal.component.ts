import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralListComponent } from '../santral-list.component';

@Component({
  selector: 'app-list-manage-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <!-- Manage Selected Modal -->
  @if (vm.manageModalVisible()) {
  <div class="kws-modal-backdrop" (click)="vm.closeManageModal()"></div>

  <div class="kws-manage-modal" dir="rtl">

    <div class="kws-modal-header">
      <div>
        <h5>مدیریت داخلی‌های منتخب</h5>
        <p>داخلی‌هایی که بیشتر نیاز داری ببینی را انتخاب کن.</p>
      </div>

      <button type="button" class="btn btn-light" (click)="vm.closeManageModal()">
        <i class="mdi mdi-close"></i>
      </button>
    </div>

    <div class="kws-modal-toolbar">
      <div class="kws-input-wrap">
        <i class="mdi mdi-magnify"></i>

        <input type="text" class="form-control" placeholder="جستجو در داخلی‌ها..." [ngModel]="vm.manageSearchText()"
          (ngModelChange)="vm.manageSearchText.set($event)">
      </div>

      <button type="button" class="btn btn-outline-primary" (click)="vm.selectVisibleModalRecords()">
        انتخاب موارد دیده‌شده
      </button>

      <button type="button" class="btn btn-outline-danger" (click)="vm.clearSelectedExtensions()">
        حذف انتخاب‌ها
      </button>
    </div>

    <div class="kws-selected-summary">
      <span>
        تعداد منتخب:
        <strong>{{ vm.selectedExtensions().length }}</strong>
      </span>

      <button type="button" class="btn btn-primary btn-sm" (click)="vm.showOnlySelected()">
        نمایش منتخب‌ها
      </button>
    </div>

    <div class="kws-modal-list">
      @for (item of vm.modalRecords(); track item.extension) {
      <button type="button" class="kws-modal-item" [class.selected]="vm.isSelected(item.extension)"
        (click)="vm.toggleSelected(item.extension)">

        <span class="kws-check">
          @if (vm.isSelected(item.extension)) {
          <i class="mdi mdi-check"></i>
          }
        </span>

        <span class="kws-modal-ext">{{ item.extension }}</span>

        <span class="kws-modal-name">{{ item.name || 'بدون نام' }}</span>

        <span class="kws-modal-status" [ngClass]="vm.getStatusClass(item)">
          {{ vm.getStatusTitle(item) }}
        </span>

      </button>
      }
    </div>

  </div>
  }
`
})
export class ListManageModalComponent {
  @Input({ required: true }) vm!: SantralListComponent;
}
