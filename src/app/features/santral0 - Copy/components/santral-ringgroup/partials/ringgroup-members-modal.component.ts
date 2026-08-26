import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralRingGroupComponent } from '../santral-ringgroup.component';

@Component({
  selector: 'app-ringgroup-members-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
@if (vm.membersModalOpen()) {
<div class="kws-modal-backdrop">

  <div class="kws-edit-modal">

    <div class="kws-edit-modal-header">
      <div>
        <h5>ویرایش اعضای گروه تماس</h5>
        <span>
          گروه {{ vm.toFaNumber(vm.membersGrpnum()) }}
        </span>
      </div>

      <button type="button" class="btn-close" (click)="vm.closeEditMembers()">
      </button>
    </div>

    <div class="kws-edit-modal-body">
      <div class="mb-3">

        <label class="form-label">
          انتخاب از لیست داخلی‌ها
        </label>

        <input type="text" class="form-control mb-2" placeholder="جستجوی داخلی یا نام اپراتور..."
          [ngModel]="vm.extensionSearch()" (ngModelChange)="vm.setExtensionSearch($event)" />

        <div class="kws-extension-picker">

          @if (vm.loadingExtensions()) {
          <div class="kws-picker-empty">
            در حال دریافت داخلی‌ها...
          </div>
          }

          @if (!vm.loadingExtensions() && vm.filteredAvailableExtensions().length === 0) {
          <div class="kws-picker-empty">
            داخلی قابل افزودن پیدا نشد
          </div>
          }

          @for (ext of vm.filteredAvailableExtensions(); track vm.getExtensionCode(ext)) {
          <button type="button" class="kws-extension-option" (click)="vm.addMemberFromExtension(ext)">

            <span class="kws-extension-option-code">
              {{ vm.toFaNumber(vm.getExtensionCode(ext)) }}
            </span>

            <span class="kws-extension-option-name">
              {{ vm.getExtensionName(ext) }}
            </span>

            <i class="mdi mdi-plus-circle-outline"></i>

          </button>
          }

        </div>

      </div>
      <div class="mb-3">
        <label class="form-label">
          افزودن داخلی
        </label>

        <div class="input-group">
          <input type="text" class="form-control" placeholder="مثلاً 500" [ngModel]="vm.newMember()"
            (ngModelChange)="vm.newMember.set($event)" (keyup.enter)="vm.addMember()" />

          <button type="button" class="btn btn-primary" (click)="vm.addMember()">

            افزودن
          </button>
        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">
          اعضای فعلی
        </label>

        <div class="kws-member-edit-list">

          @for (member of vm.getEditingMembers(); track member) {
          <div class="kws-member-edit-chip">
            <span>
              {{ vm.toFaNumber(member) }}
            </span>

            <button type="button" class="btn btn-sm btn-outline-danger" (click)="vm.removeMember(member)">

              <i class="mdi mdi-close"></i>
            </button>
          </div>
          }

        </div>
      </div>

      <div class="mb-3">
        <label class="form-label">
          لیست خام داخلی‌ها
        </label>

        <input type="text" class="form-control" dir="ltr" [ngModel]="vm.membersText()"
          (ngModelChange)="vm.membersText.set($event)" placeholder="500-501-502" />

        <div class="form-text">
          داخلی‌ها را با خط تیره یا کاما جدا کن. مثال: 500-501-502
        </div>
      </div>

    </div>

    <div class="kws-edit-modal-footer">

      <button type="button" class="btn btn-light" (click)="vm.closeEditMembers()" [disabled]="vm.savingMembers()">

        انصراف
      </button>

      <button type="button" class="btn btn-primary" (click)="vm.saveMembers()" [disabled]="vm.savingMembers()">

        @if (vm.savingMembers()) {
        <span class="spinner-border spinner-border-sm ms-1"></span>
        }

        ذخیره اعضا
      </button>

    </div>

  </div>

</div>
}

`
})
export class RinggroupMembersModalComponent {
  @Input({ required: true }) vm!: SantralRingGroupComponent;
}
