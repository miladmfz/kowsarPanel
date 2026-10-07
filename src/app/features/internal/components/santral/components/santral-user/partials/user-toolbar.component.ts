import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralUserComponent } from '../santral-user.component';

@Component({
  selector: 'app-user-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <!-- Toolbar -->
  <div class="santral-user-toolbar">
    <div class="kws-search-box">
      <i class="mdi mdi-magnify"></i>

      <input type="text" class="form-control" placeholder="جستجو بر اساس داخلی، نام یا تکنولوژی..."
        [ngModel]="vm.searchText()" (ngModelChange)="vm.onSearchChange($event)" />
    </div>

    <div class="kws-count-box">
      {{ vm.filteredUsers().length }} داخلی
    </div>
  </div>
`
})
export class UserToolbarComponent {
  @Input({ required: true }) vm!: SantralUserComponent;
}
