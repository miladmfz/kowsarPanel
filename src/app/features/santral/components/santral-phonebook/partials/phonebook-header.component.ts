import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralPhonebookComponent } from '../santral-phonebook.component';

@Component({
  selector: 'app-phonebook-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="phonebook-header">
    <div>
      <h4>دفتر تلفن تماس‌های ورودی</h4>
      <p>
        مدیریت مخاطبین CallerID و شماره‌هایی که هنوز در دفتر تلفن ثبت نشده‌اند
      </p>
    </div>

    <div class="phonebook-actions">
      <button type="button" class="btn btn-light kws-refresh-btn" (click)="vm.refreshActiveTab()"
        [disabled]="vm.loadingContacts() || vm.loadingUnknown()">
        <i class="mdi mdi-refresh" [class.kws-spin]="vm.loadingContacts() || vm.loadingUnknown()"></i>
        بروزرسانی همین بخش
      </button>

      <button type="button" class="btn btn-primary kws-add-btn" (click)="vm.openAddModal()">
        <i class="mdi mdi-plus"></i>
        افزودن مخاطب
      </button>
    </div>
  </div>
`
})
export class PhonebookHeaderComponent {
  @Input({ required: true }) vm!: SantralPhonebookComponent;
}
