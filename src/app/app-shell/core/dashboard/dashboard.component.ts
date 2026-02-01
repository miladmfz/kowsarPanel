/* ===============================================================
   📘 DashboardComponent
   توضیحات کلی:
   این کامپوننت نمای اصلی داشبورد است و به‌عنوان ورودی مرکزی 
   برای نمایش بخش‌های مختلف سیستم عمل می‌کند.
   شامل:
   1️⃣ نمایش پنل حضور کارشناسان
   2️⃣ نمایش گزارش کوثر
   3️⃣ شناسایی نوع کاربر (ادمین / مشتری)
   4️⃣ واکشی تاریخ جاری از سرور
   5️⃣ هماهنگی بین اجزای مختلف داشبورد
   
   ویژگی‌ها:
   - تعیین نوع کاربر از sessionStorage
   - ذخیره تاریخ فعال سیستم در sessionStorage
   - استفاده از سرویس Notification برای اطلاع‌رسانی
   - ساختار کاملاً Standalone و ماژولار
   =============================================================== */

import { Component, OnInit, Renderer2, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

//   Subcomponents
// import { KowsarReportComponent } from './components/kowsar-report/kowsar-report.component';

//   Services
import { DashboardWebApiService } from '../services/dashboard-web-api.service';
import { SharedService } from '../../framework-services/shared.service';
import { NotificationService } from '../../framework-services/ui/notification.service';
import { AttendancePanelComponent } from 'src/app/features/internal/components/attendance-panel/attendance-panel.component';
import { KowsarReportComponent } from 'src/app/features/internal/components/kowsar-report/kowsar-report.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    AttendancePanelComponent,
    KowsarReportComponent,
    // SupportPanelComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit, OnDestroy {
  // ===============================================================
  //   وضعیت‌ها و داده‌های اصلی
  // ===============================================================
  BrokerRef = '';
  JobPersonRef = '';
  userType = '';




  ToDayDate: string = '';
  reportData: any[] = [];
  Attendance_Data: any[] = [];
  attendanceInterval!: ReturnType<typeof setInterval>;

  // ===============================================================
  //   سازنده
  // ===============================================================
  private readonly repo = inject(DashboardWebApiService);
  private readonly sharedService = inject(SharedService);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);

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
  // 🟦 مقداردهی اولیه داشبورد
  // ===============================================================
  private initDashboard(): void {
    this.loadTodayDate();
    this.detectUserInfo();
  }

  // ===============================================================
  // 📅 دریافت تاریخ امروز از سرور
  // ===============================================================
  private loadTodayDate(): void {
    this.repo.GetTodeyFromServer().subscribe({
      next: (data: any) => {
        this.ToDayDate = data[0]?.TodeyFromServer ?? '';

        // بررسی تغییر تاریخ نسبت به sessionStorage
        const activeDate = sessionStorage.getItem('ActiveDate');
        if (this.ToDayDate !== activeDate) {
          sessionStorage.setItem('ActiveDate', this.ToDayDate);
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
    const phAddress3 = sessionStorage.getItem('PhAddress3');
    const brokerCode = sessionStorage.getItem('BrokerCode');
    const jobPersonRef = sessionStorage.getItem('JobPersonRef');
    const userRole = sessionStorage.getItem('UserType'); // نوع کاربر (admin / customer / ...)


    // تعیین BrokerRef
    this.BrokerRef = phAddress3 === '100' ? '' : brokerCode ?? '';

    // تعیین JobPersonRef
    this.JobPersonRef = jobPersonRef ?? '';

    // تعیین نوع کاربر
    if (userRole) {
      this.userType = userRole.toLowerCase();
    } else if (this.JobPersonRef) {
      this.userType = 'admin'; // اگر شناسه دارد، ادمین یا پشتیبان است
    } else {
      this.userType = 'customer'; // در غیر این صورت مشتری
    }

    // هشدار در صورت عدم وجود JobPersonRef
    if (!this.JobPersonRef && this.userType === 'admin') {
      this.notificationService.warning('شناسه کاربر یافت نشد.');
    }
  }
}
