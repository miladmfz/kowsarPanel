import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../framework-services/ui/notification.service';
import { KowsarBaseWebApi } from '../../framework-services/base/KowsarBaseWebApi.service';
import { PermissionService } from '../../framework-services/storage/PermissionService';
import { SessionStorageService } from '../../framework-services/storage/session.storage.service';
import { KowsarDashboardComponent } from '../../framework-components/kowsar/kowsar-dashboard/kowsar-dashboard.component';
import { CustomerDashboardComponent } from '../../framework-components/kowsar/customer-dashboard/customer-dashboard.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    KowsarDashboardComponent,
    CustomerDashboardComponent
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {


  LoginType = signal('')
  ToDayDate = signal('')
  attendanceInterval!: ReturnType<typeof setInterval>;

  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly notificationService = inject(NotificationService);
  protected readonly permissionService = inject(PermissionService);
  protected readonly session = inject(SessionStorageService);
  constructor() { }

  ngOnInit(): void {
    this.initDashboard();

  }

  ngOnDestroy(): void {
    if (this.attendanceInterval) {
      clearInterval(this.attendanceInterval);
    }
  }

  private initDashboard(): void {
    this.loadTodayDate();
    this.detectUserInfo();
  }

  private loadTodayDate(): void {
    this.base_repo.GetTodeyFromServer().subscribe({
      next: (data: any) => {
        const today = data.Text ?? '';

        this.ToDayDate.set(today);

        const activeDate = this.session.getString('ActiveDate');

        if (today !== activeDate) {
          this.session.setItem('ActiveDate', today);
          this.notificationService.info('📆 تاریخ جدید از سرور بروزرسانی شد.');
        }
      },
      error: () => {
        this.notificationService.error('❌ دریافت تاریخ از سرور ناموفق بود.');
      },
    });
  }



  private detectUserInfo(): void {

    this.LoginType.set(this.session.loginType)

    if (this.LoginType() !== 'KOWSAR' && this.LoginType() !== 'CUSTOMER') {
      this.notificationService.warning('شناسه کاربر یافت نشد.');
    }



  }
}
