/* ===============================================================
   📘 DashboardComponent
   نمای اصلی داشبورد سیستم
   =============================================================== */

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService } from '../../framework-services/ui/notification.service';
import { AttendancePanelComponent } from 'src/app/features/internal/components/attendance-panel/attendance-panel.component';
import { KowsarReportComponent } from 'src/app/features/internal/components/kowsar-report/kowsar-report.component';
import { KowsarCalendarComponent } from '../../framework-components/kowsar/kowsar-calendar/kowsar-calendar.component';
import { LeaveGridComponent } from 'src/app/features/internal/components/attendance-panel/components/leave-grid/leave-grid.component';
import { AutletterChartComponent } from 'src/app/features/internal/components/autletter-chart/autletter-chart.component';
import { KowsarBaseWebApi } from '../../framework-services/base/KowsarBaseWebApi.service';
import { PermissionService } from '../../framework-services/storage/PermissionService';
import { SessionStorageService } from '../../framework-services/storage/session.storage.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AttendancePanelComponent,
    KowsarReportComponent,
    KowsarCalendarComponent,
    LeaveGridComponent,
    AutletterChartComponent
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ===============================================================
  //   وضعیت‌ها و داده‌های اصلی
  // ===============================================================


  LoginType = signal('')

  ToDayDate = signal('')
  attendanceInterval!: ReturnType<typeof setInterval>;

  // ===============================================================
  //   سازنده
  // ===============================================================

  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly notificationService = inject(NotificationService);
  protected readonly permissionService = inject(PermissionService);
  protected readonly session = inject(SessionStorageService);
  constructor() { }

  // ===============================================================
  // 🚀 Lifecycle Hooks
  // ===============================================================
  ngOnInit(): void {
    this.initDashboard();

  }

  ngOnDestroy(): void {
    if (this.attendanceInterval) {
      clearInterval(this.attendanceInterval);
    }
  }

  // ===============================================================
  //    مقداردهی اولیه داشبورد
  // ===============================================================
  private initDashboard(): void {
    this.loadTodayDate();
    this.detectUserInfo();
  }

  // ===============================================================
  // 📅 دریافت تاریخ امروز از سرور
  // ===============================================================
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

  // ===============================================================
  // 👤 شناسایی نوع کاربر و مقداردهی اطلاعات پایه
  // ===============================================================



  private detectUserInfo(): void {

    this.LoginType.set(this.session.loginType)

    if (this.LoginType() !== 'KOWSAR' && this.LoginType() !== 'CUSTOMER') {
      this.notificationService.warning('شناسه کاربر یافت نشد.');
    }


    // console.log('dashborddddddddddd');

    // if (this.permissionService.hasPermission('ROLE_MANAGE')) {
    //   console.log('has ROLE_MANAGE');
    // } else {
    //   console.log('no ROLE_MANAGE');
    // }

    // if (
    //   this.permissionService.hasAnyPermission([
    //     'ROLE_MANAGE',
    //     'USER_EDIT',
    //     'USER_INSERT'
    //   ])
    // ) {
    //   console.log('majmoeshono shamel beshe');
    // } else {
    //   console.log('nadare');
    // }

    // if (this.permissionService.hasRole('ADMIN')) {
    //   console.log('ADMIN rolesh has');
    // } else {
    //   console.log('ADMIN rolesh nis');
    // }


  }
}
