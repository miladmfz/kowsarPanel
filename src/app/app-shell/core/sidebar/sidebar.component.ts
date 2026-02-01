/* ===============================================================
   🧭 SidebarComponent
   توضیحات کلی:
   این کامپوننت وظیفه‌ی نمایش و مدیریت منوی کناری (Sidebar) سیستم را دارد.
   شامل بخش‌های پروفایل کاربر، وضعیت حضور، لینک‌های منو، و کنترل تم است.

   قابلیت‌ها:
   1️⃣ بارگذاری اطلاعات کاربر از sessionStorage  
   2️⃣ دریافت تصویر پروفایل از سرور  
   3️⃣ تنظیم وضعیت حضور کاربر و ارسال آن به API  
   4️⃣ نمایش پویا‌ی منوها بر اساس نقش کاربر (کارشناس یا مشتری)  
   5️⃣ پشتیبانی از حالت تیره و روشن  
   =============================================================== */

import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';

//   سرویس‌ها
import { AppConfigService } from '../../../app-config.service';
import { ThemeService } from '../../framework-services/ui/theme.service';
import { DashboardWebApiService } from '../services/dashboard-web-api.service';
import { SharedService } from '../../framework-services/shared.service';
import { LoadingService } from '../../framework-services/ui/loading.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit, OnDestroy {
  // ===============================================================
  // 🌗 وضعیت تم
  // ===============================================================
  isDarkMode = false;
  private themeSub?: Subscription;

  // ===============================================================
  // 👤 اطلاعات کاربر
  // ===============================================================
  PhFullName = '';
  JobPersonRef = '';
  CustName_Small = '';
  Explain = '';
  CentralRef = '';
  BrokerRef = '';
  PhAddress3 = '';
  Imageitem = '';
  IsCustomerBuild = false;
  ShowHoghogh = false;

  currentStatus = '';

  // ===============================================================
  // 🔔 اعلان‌ها
  // ===============================================================
  AlarmActive_Row = 0;
  AlarmActtive_Conversation = 0;
  AlarmActtive_LeaveRequest = 0;

  // ===============================================================
  // 📱 اپلیکیشن‌ها
  // ===============================================================
  apporder = '';
  appbroker = '';
  appocr = '';
  array_applications: any[] = [];

  // ===============================================================
  // 🗓️ فرم وضعیت حضور
  // ===============================================================
  EditForm_Attendance = new FormGroup({
    CentralRef: new FormControl(''),
    Status: new FormControl(''),
  });

  private refreshInterval?: ReturnType<typeof setInterval>;
  private refreshSub?: Subscription;

  // ===============================================================
  //   سازنده
  // ===============================================================
  private readonly config = inject(AppConfigService);
  private readonly themeService = inject(ThemeService);
  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(DashboardWebApiService);
  private readonly sharedService = inject(SharedService);
  private readonly router = inject(Router);

  constructor() { }

  // ===============================================================
  // 🚀 Lifecycle Hooks
  // ===============================================================
  ngOnInit(): void {
    // ⏳ تأخیر کوتاه برای آماده‌شدن sessionStorage

    const UserName = sessionStorage.getItem('UserName') || '';


    const centralRef = sessionStorage.getItem('CentralRef') ?? '';

    if (['1139', '1843'].includes(centralRef) || ['admin'].includes(UserName)) {
      this.ShowHoghogh = true
    }

    if (['user'].includes(UserName)) {
      this.ShowHoghogh = false
    }

    setTimeout(() => {
      this.loadSessionData();
      this.loadProfileImage();
      this.LoadAttendance()
    }, 100);
    this.refreshSub = this.sharedService.RefreshAllActions$?.subscribe(action => {
      if (action === 'refresh') this.LoadAttendance();
    });
  }

  ngOnDestroy(): void {
    this.themeSub?.unsubscribe();
    clearInterval(this.refreshInterval);
    this.refreshSub?.unsubscribe();

  }

  // ===============================================================
  //   بارگذاری داده‌های sessionStorage
  // ===============================================================
  private LoadAttendance(): void {

    this.loadingService.show()
    this.repo.AttendanceDashboard().subscribe({
      next: (data: any) => {
        this.loadingService.hide()
        const matched = data?.Attendances?.find(x => x.CentralRef === sessionStorage.getItem('CentralRef'));
        console.log(matched)

        this.EditForm_Attendance.patchValue({
          Status: matched?.Status ?? null
        });
        this.currentStatus = matched?.Status;


      },
      error: (err) => {

      },
    });
  }

  private loadSessionData(): void {
    const newPhFullName = sessionStorage.getItem('PhFullName') || '';
    const newCentralRef = sessionStorage.getItem('CentralRef') || '';

    //   فقط در صورت تغییر، بروزرسانی انجام شود
    if (newPhFullName !== this.PhFullName) this.PhFullName = newPhFullName;
    if (newCentralRef !== this.CentralRef) {
      this.CentralRef = newCentralRef;
      this.loadProfileImage(); // کاربر جدید → تصویر جدید
    }

    this.JobPersonRef = sessionStorage.getItem('JobPersonRef') || '';
    this.CustName_Small = sessionStorage.getItem('CustName_Small') || '';
    this.Explain = sessionStorage.getItem('Explain') || '';
    this.PhAddress3 = sessionStorage.getItem('PhAddress3') || '';
    this.BrokerRef =
      this.PhAddress3 === '100'
        ? ''
        : sessionStorage.getItem('BrokerCode') || '';

    // 🎯 تشخیص نوع کاربر (ادمین یا مشتری)
    const apiUrl_temp = this.config.apiUrl;
    this.IsCustomerBuild = !(
      ///apiUrl_temp === 'http://192.168.1.25:60006/api/' ||
      apiUrl_temp === 'http://itmali.ir/webapi/' ||
      apiUrl_temp === 'http://5.160.152.173:60005/api/'
    );

    // 🧾 مقداردهی فرم حضور
    this.EditForm_Attendance.patchValue({ CentralRef: this.CentralRef });
  }

  // ===============================================================
  // 🖼️ دریافت تصویر پروفایل از سرور
  // ===============================================================
  private loadProfileImage(): void {
    if (!this.CentralRef) return;

    this.loadingService.show()
    this.repo.GetImageFromServer(this.CentralRef).subscribe({
      next: (data: any) => {
        this.loadingService.hide()
        if (data?.Text && data?.Text !== "Nophoto") {
          this.Imageitem = `data:image/png;base64,${data.Text}`;
        } else {
          this.Imageitem = 'assets/images/KowsarSupport.png';
        }
      },
      error: () => {
        console.warn('  خطا در دریافت تصویر کاربر');
        this.Imageitem = 'assets/images/KowsarSupport.png';
      },
    });
  }

  // ===============================================================
  // 🟢 تغییر وضعیت حضور (ارسال به سرور)
  // ===============================================================
  setStatus(status: string): void {
    // ۱️⃣ بروزرسانی فرم
    this.EditForm_Attendance.patchValue({ Status: status });
    this.currentStatus = status;
    this.loadingService.show()

    // ۲️⃣ ارسال به API
    this.loadingService.show()
    this.repo.ManualAttendance(this.EditForm_Attendance.value).subscribe({
      next: (response: any) => {
        console.log('  ManualAttendance success:', response);
        // ۳️⃣ اطلاع‌رسانی به سایر بخش‌ها برای رفرش
        this.sharedService.triggerRefresh('refresh');
      },
      error: (err) => {
        console.error('❌ خطا در ManualAttendance:', err);
      },
    });
  }

  // ===============================================================
  // 🔁 بروزرسانی دستی اطلاعات کاربر
  // ===============================================================
  refreshPage(): void {
    this.loadSessionData();
    this.loadProfileImage();
  }

  // ===============================================================
  // 🚪 خروج از سیستم
  // ===============================================================
  logout(): void {
    sessionStorage.clear();
    localStorage.removeItem('theme');
    this.router.navigate(['/auth/login']);
  }
}
