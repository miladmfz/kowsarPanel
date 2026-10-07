import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralRingGroupComponent } from '../santral-ringgroup.component';

@Component({
  selector: 'app-ringgroup-basic-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
@if (vm.editModalOpen()) {
<div class="kws-modal-backdrop">

  <div class="kws-edit-modal">

    <div class="kws-edit-modal-header">
      <div>
        <h5>{{ vm.createMode() ? 'ساخت گروه تماس جدید' : 'ویرایش گروه تماس' }}</h5>
        <span>
          {{ vm.createMode() ? 'تعریف RingGroup جدید' : 'گروه ' + vm.toFaNumber(vm.editGrpnum()) }}
        </span>
      </div>

      <button type="button" class="btn-close" (click)="vm.closeEditBasic()">
      </button>
    </div>

    <div class="kws-edit-modal-body">

      <div class="mb-3">
        <label class="form-label">
          کد گروه تماس
        </label>

        <input type="text" class="form-control" inputmode="numeric"
          [ngModel]="vm.editGrpnum()"
          (ngModelChange)="vm.editGrpnum.set($event)"
          [readonly]="!vm.createMode()"
          placeholder="مثلاً 851" />
        @if (vm.createMode()) {
          <div class="form-text">کد باید عددی، یکتا و بین ۲ تا ۸ رقم باشد.</div>
        }
      </div>

      <div class="mb-3">
        <label class="form-label">
          عنوان گروه
        </label>

        <input type="text" class="form-control" [ngModel]="vm.editDescription()"
          (ngModelChange)="vm.editDescription.set($event)" placeholder="مثلاً Hardware یا SupportSBS" />
      </div>

      <div class="mb-3">
        <label class="form-label">
          نوع زنگ خوردن
        </label>

        <select class="form-control" [ngModel]="vm.editStrategy()" (ngModelChange)="vm.editStrategy.set($event)">

          <option value="ringall">
            زنگ همزمان برای همه
          </option>

          <option value="hunt">
            زنگ ترتیبی
          </option>

          <option value="memoryhunt">
            زنگ ترتیبی با حفظ قبلی‌ها
          </option>

          <option value="firstavailable">
            اولین داخلی آزاد
          </option>

          <option value="firstnotonphone">
            اولین داخلی غیرمشغول
          </option>

        </select>
      </div>

      <div class="mb-3">
        <label class="form-label">
          زمان زنگ خوردن
        </label>

        <div class="input-group">
          <input type="number" class="form-control" min="5" max="120" [ngModel]="vm.editGrptime()"
            (ngModelChange)="vm.editGrptime.set(+$event)" />

          <span class="input-group-text">
            ثانیه
          </span>
        </div>

        <div class="form-text">
          مقدار پیشنهادی بین ۵ تا ۱۲۰ ثانیه است.
        </div>
      </div>

    </div>

    <div class="kws-edit-modal-footer">

      <button type="button" class="btn btn-light" (click)="vm.closeEditBasic()" [disabled]="vm.savingBasic()">

        انصراف
      </button>

      <button type="button" class="btn btn-primary" (click)="vm.saveBasic()" [disabled]="vm.savingBasic()">

        @if (vm.savingBasic()) {
        <span class="spinner-border spinner-border-sm ms-1"></span>
        }

        {{ vm.createMode() ? 'ساخت گروه' : 'ذخیره تغییرات' }}
      </button>

    </div>

  </div>

</div>
}

`
})
export class RinggroupBasicModalComponent {
  @Input({ required: true }) vm!: SantralRingGroupComponent;
}
