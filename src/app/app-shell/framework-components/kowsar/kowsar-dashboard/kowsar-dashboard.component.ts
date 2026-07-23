import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { AttendancePanelComponent } from 'src/app/features/internal/components/attendance-panel/attendance-panel.component';
import { KowsarReportComponent } from 'src/app/features/internal/components/kowsar-report/kowsar-report.component';
import { KowsarCalendarComponent } from '../kowsar-calendar/kowsar-calendar.component';
import { LeaveGridComponent } from 'src/app/features/internal/components/attendance-panel/components/leave-grid/leave-grid.component';
import { AutletterChartComponent } from 'src/app/features/internal/components/autletter-chart/autletter-chart.component';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';

@Component({
  selector: 'app-kowsar-dashboard',
  templateUrl: './kowsar-dashboard.component.html',
  standalone: true,
  imports: [
    CommonModule,

    AttendancePanelComponent,
    KowsarReportComponent,
    KowsarCalendarComponent,
    LeaveGridComponent,
    AutletterChartComponent
  ],
})
export class KowsarDashboardComponent implements OnInit {

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
