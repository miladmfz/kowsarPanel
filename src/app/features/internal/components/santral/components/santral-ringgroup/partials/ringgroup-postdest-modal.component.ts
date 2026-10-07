import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralRingGroupComponent } from '../santral-ringgroup.component';

@Component({
  selector: 'app-ringgroup-postdest-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
@if (vm.postDestModalOpen()) {
<div class="kws-modal-backdrop">

  <div class="kws-edit-modal">

    <div class="kws-edit-modal-header">
      <div>
        <h5>ویرایش مقصد بعد از عدم پاسخ</h5>
        <span>
          گروه {{ vm.toFaNumber(vm.postDestGrpnum()) }}
        </span>
      </div>

      <button type="button" class="btn-close" (click)="vm.closeEditPostDest()">
      </button>
    </div>

    <div class="kws-edit-modal-body">

      <div class="mb-3">
        <label class="form-label">
          نوع مقصد
        </label>

        <select class="form-control" [ngModel]="vm.postDestType()" (ngModelChange)="vm.postDestType.set($event)">

          <option value="extension">
            انتقال به داخلی
          </option>

          <option value="ringgroup">
            انتقال به گروه تماس
          </option>

          <option value="ivr">
            انتقال به منوی صوتی IVR
          </option>

        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">
          شماره مقصد
        </label>

        <input type="text" class="form-control" placeholder="مثلاً 500 یا 845 یا 4" [ngModel]="vm.postDestValue()"
          (ngModelChange)="vm.postDestValue.set($event)" />

        <div class="form-text">
          اگر نوع مقصد داخلی باشد مثل 500، اگر گروه تماس باشد مثل 845، و اگر IVR باشد مثل 4 وارد کن.
        </div>
      </div>

      <div class="kws-postdest-preview">
        <span>پیش‌نمایش:</span>

        @if (vm.postDestType() === 'extension') {
        <strong>
          بعد از عدم پاسخ، تماس به داخلی {{ vm.toFaNumber(vm.postDestValue()) }} منتقل می‌شود
        </strong>
        }

        @if (vm.postDestType() === 'ringgroup') {
        <strong>
          بعد از عدم پاسخ، تماس به گروه تماس {{ vm.toFaNumber(vm.postDestValue()) }} منتقل می‌شود
        </strong>
        }

        @if (vm.postDestType() === 'ivr') {
        <strong>
          بعد از عدم پاسخ، تماس به منوی صوتی شماره {{ vm.toFaNumber(vm.postDestValue()) }} منتقل می‌شود
        </strong>
        }
      </div>

    </div>

    <div class="kws-edit-modal-footer">

      <button type="button" class="btn btn-light" (click)="vm.closeEditPostDest()" [disabled]="vm.savingPostDest()">

        انصراف
      </button>

      <button type="button" class="btn btn-primary" (click)="vm.savePostDest()" [disabled]="vm.savingPostDest()">

        @if (vm.savingPostDest()) {
        <span class="spinner-border spinner-border-sm ms-1"></span>
        }

        ذخیره مقصد
      </button>

    </div>

  </div>

</div>
}
`
})
export class RinggroupPostdestModalComponent {
  @Input({ required: true }) vm!: SantralRingGroupComponent;
}
