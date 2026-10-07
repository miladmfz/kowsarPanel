import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralPhonebookComponent } from '../santral-phonebook.component';

@Component({
  selector: 'app-phonebook-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
@if (vm.editModalVisible()) {
<div class="kws-modal-backdrop" (click)="vm.closeEditModal()"></div>

<div class="kws-phonebook-modal" dir="rtl">

  <div class="kws-modal-header">
    <div>
      <h5>
        {{ vm.editForm().id ? 'ویرایش مخاطب' : 'افزودن مخاطب جدید' }}
      </h5>

      <p>
        {{ vm.editForm().id ? ('شناسه ' + vm.editForm().id) : 'ثبت شماره جدید برای CallerID' }}
      </p>
    </div>

    <button type="button" class="btn btn-light" (click)="vm.closeEditModal()" [disabled]="vm.saving()">
      <i class="mdi mdi-close"></i>
    </button>
  </div>

  <div class="kws-modal-body">

    @if (vm.editForm().oldName) {
    <div class="kws-info-row">
      <span>نام فعلی</span>
      <strong>{{ vm.editForm().oldName }}</strong>
    </div>
    }

    <div class="mb-3">
      <label class="form-label">نام مخاطب</label>

      <input type="text" class="form-control" [ngModel]="vm.editForm().name" (ngModelChange)="vm.onNameChange($event)"
        placeholder="مثلاً فلاح یا نصرتی" autocomplete="off" [disabled]="vm.saving()" />
    </div>

    <div class="mb-3">
      <label class="form-label">شماره تماس</label>

      <input type="text" class="form-control kws-ltr-input" [ngModel]="vm.editForm().number"
        (ngModelChange)="vm.onNumberChange($event)" placeholder="مثلاً 09120000000" autocomplete="off"
        [disabled]="vm.saving()" />
    </div>

    <div class="mb-3">
      <label class="form-label">توضیح</label>

      <input type="text" class="form-control" [ngModel]="vm.editForm().explain" (ngModelChange)="vm.onExplainChange($event)"
        placeholder="مثلاً ثبت از پنل" autocomplete="off" [disabled]="vm.saving()" />
    </div>

    <div class="kws-help-text">
      شماره دقیقاً همان چیزی ذخیره می‌شود که وارد می‌کنی.
      اگر روی تلفن شماره با فرمت
      <span class="kws-inline-ltr">021...</span>
      <span class="kws-inline-ltr">09...</span>
      می‌آید، همان فرمت را وارد کن.
    </div>

  </div>

  <div class="kws-modal-footer">
    <button type="button" class="btn btn-light" (click)="vm.closeEditModal()" [disabled]="vm.saving()">
      انصراف
    </button>

    <button type="button" class="btn btn-primary" (click)="vm.saveContact()" [disabled]="vm.saving()">
      @if (vm.saving()) {
      <span class="spinner-border spinner-border-sm"></span>
      در حال ذخیره...
      } @else {
      <i class="mdi mdi-content-save-outline"></i>
      ذخیره مخاطب
      }
    </button>
  </div>

</div>
}
`
})
export class PhonebookEditModalComponent {
  @Input({ required: true }) vm!: SantralPhonebookComponent;
}
