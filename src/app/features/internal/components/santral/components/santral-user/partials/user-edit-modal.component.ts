import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralUserComponent } from '../santral-user.component';

@Component({
  selector: 'app-user-edit-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
<!-- Edit Modal -->
@if (vm.editModalVisible()) {
<div class="kws-modal-backdrop" (click)="vm.closeEditModal()"></div>

<div class="kws-edit-modal" dir="rtl">

  <div class="kws-edit-modal-header">
    <div>
      <h5>ویرایش نام داخلی</h5>
      <p>
        داخلی {{ vm.editForm().extension }}
      </p>
    </div>

    <button type="button" class="btn btn-light" (click)="vm.closeEditModal()" [disabled]="vm.saving()">
      <i class="mdi mdi-close"></i>
    </button>
  </div>

  <div class="kws-edit-modal-body">

    <div class="kws-info-row">
      <span>شماره داخلی</span>
      <strong class="kws-ltr">
        {{ vm.editForm().extension || '-' }}
      </strong>
    </div>

    <div class="kws-info-row">
      <span>نام فعلی</span>
      <strong>
        {{ vm.editForm().oldName || '-' }}
      </strong>
    </div>

    <div class="mb-3">
      <label class="form-label">نام جدید داخلی</label>

      <input type="text" class="form-control" [ngModel]="vm.editForm().displayName"
        (ngModelChange)="vm.onDisplayNameChange($event)" placeholder="مثلاً میلاد فلاح" autocomplete="off"
        [disabled]="vm.saving()" />
    </div>

    <div class="kws-help-text">
      بعد از ذخیره، نام داخلی در اطلاعات Issabel ذخیره می‌شود و در پنل نمایش داده خواهد شد.
      برای نمایش روی خود تلفن، مقدار CallerID داخلی هم از سمت API به‌روزرسانی می‌شود.
    </div>

  </div>

  <div class="kws-edit-modal-footer">
    <button type="button" class="btn btn-light" (click)="vm.closeEditModal()" [disabled]="vm.saving()">
      انصراف
    </button>

    <button type="button" class="btn btn-primary" (click)="vm.saveUserName()" [disabled]="vm.saving()">
      @if (vm.saving()) {
      <span class="spinner-border spinner-border-sm"></span>
      در حال ذخیره...
      } @else {
      <i class="mdi mdi-content-save-outline"></i>
      ذخیره تغییرات
      }
    </button>
  </div>

</div>
}
`
})
export class UserEditModalComponent {
  @Input({ required: true }) vm!: SantralUserComponent;
}
