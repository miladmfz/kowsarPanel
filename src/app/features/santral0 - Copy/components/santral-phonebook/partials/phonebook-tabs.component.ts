import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralPhonebookComponent } from '../santral-phonebook.component';

@Component({
  selector: 'app-phonebook-tabs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="phonebook-tabs">
    <button type="button" class="phonebook-tab" [class.active]="vm.activeTab() === 'contacts'"
      (click)="vm.setTab('contacts')">
      <i class="mdi mdi-card-account-phone-outline"></i>
      دفتر تلفن
      <span>{{ vm.contacts().length }}</span>
    </button>

    <button type="button" class="phonebook-tab" [class.active]="vm.activeTab() === 'unknown'" (click)="vm.setTab('unknown')">
      <i class="mdi mdi-phone-alert-outline"></i>
      شماره‌های ناشناس
      <span>{{ vm.unknownNumbers().length }}</span>
    </button>

    <button type="button" class="phonebook-tab" [class.active]="vm.activeTab() === 'report'" (click)="vm.setTab('report')">
      <i class="mdi mdi-chart-box-outline"></i>
      گزارش شماره
      <span><i class="mdi mdi-magnify"></i></span>
    </button>
  </div>
`
})
export class PhonebookTabsComponent {
  @Input({ required: true }) vm!: SantralPhonebookComponent;
}
