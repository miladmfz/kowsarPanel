import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralPhonebookComponent } from '../santral-phonebook.component';

@Component({
  selector: 'app-phonebook-contacts-tab',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  @if (vm.activeTab() === 'contacts') {

  <div class="phonebook-toolbar">
    <div class="kws-search-box">
      <i class="mdi mdi-magnify"></i>

      <input type="text" class="form-control" placeholder="جستجو بر اساس نام، شماره یا توضیح..."
        [ngModel]="vm.searchText()" (ngModelChange)="vm.onSearchChange($event)" />
    </div>

    <div class="kws-count-box">
      {{ vm.filteredContacts().length }} مخاطب
    </div>
  </div>

  <div class="phonebook-card">

    @if (vm.loadingContacts()) {
    <div class="kws-loading">
      <span class="spinner-border spinner-border-sm"></span>
      در حال دریافت دفتر تلفن...
    </div>
    }

    @if (!vm.loadingContacts() && vm.filteredContacts().length === 0) {
    <div class="kws-empty">
      <i class="mdi mdi-card-account-phone-outline"></i>
      مخاطبی برای نمایش وجود ندارد
    </div>
    }

    @if (!vm.loadingContacts() && vm.filteredContacts().length > 0) {
    <div class="table-responsive kws-table-wrap">
      <table class="table kws-phonebook-table align-middle">
        <colgroup>
          <col class="col-id" />
          <col class="col-actions" />
          <col class="col-name" />
          <col class="col-number" />
          <col class="col-explain" />
        </colgroup>

        <thead>
          <tr>
            <th class="kws-id-col">شناسه</th>
            <th class="kws-actions-col">عملیات</th>
            <th class="kws-name-col">نام مخاطب</th>
            <th class="kws-number-col">شماره</th>
            <th class="kws-explain-col">توضیح</th>
          </tr>
        </thead>

        <tbody>
          @for (item of vm.filteredContacts(); track item.Id) {
          <tr>
            <td class="kws-id-col">
              <span class="kws-id-badge">
                {{ item.Id }}
              </span>
            </td>

            <td class="kws-actions-col">
              <div class="kws-row-actions">
                <button type="button" class="btn btn-sm kws-edit-btn" (click)="vm.openEditModal(item)">
                  <i class="mdi mdi-pencil-outline"></i>
                  <span>ویرایش</span>
                </button>

                <button type="button" class="btn btn-sm kws-delete-btn" (click)="vm.deleteContact(item)"
                  [disabled]="vm.saving()">
                  <i class="mdi mdi-trash-can-outline"></i>
                  <span>حذف</span>
                </button>
              </div>
            </td>

            <td class="kws-name-col">
              <div class="kws-contact-cell">
                <strong class="kws-contact-name">
                  {{ item.Name || '-' }}
                </strong>
              </div>
            </td>

            <td class="kws-number-col">
              <span class="kws-number">
                {{ item.Number || '-' }}
              </span>
            </td>

            <td class="kws-explain-col">
              <span class="kws-muted-text">
                {{ item.Explain || '-' }}
              </span>
            </td>
          </tr>
          }
        </tbody>
      </table>
    </div>
    }

  </div>
  }
`
})
export class PhonebookContactsTabComponent {
  @Input({ required: true }) vm!: SantralPhonebookComponent;
}
