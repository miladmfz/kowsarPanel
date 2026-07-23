import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import type { SantralUserComponent } from '../santral-user.component';

@Component({
  selector: 'app-user-header',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <!-- Header -->
  <div class="santral-user-header">
    <div>
      <h4>مدیریت داخلی‌های سانترال</h4>
      <p>
        مشاهده داخلی‌ها و تغییر نام نمایشی برای نمایش در پنل و تلفن‌ها
      </p>
    </div>

    <button type="button" class="btn btn-primary kws-refresh-btn" (click)="vm.loadUsers()" [disabled]="vm.loading()">
      <i class="mdi mdi-refresh" [class.kws-spin]="vm.loading()"></i>
      بروزرسانی
    </button>
  </div>
`
})
export class UserHeaderComponent {
  @Input({ required: true }) vm!: SantralUserComponent;
}
