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

import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AppConfigService } from '../../../app-config.service';
import { SharedService } from '../../framework-services/shared.service';
import { NotificationService } from '../../framework-services/ui/notification.service';
import { SessionStorageService } from '../../framework-services/storage/session.storage.service';
import { PermissionService } from '../../framework-services/storage/PermissionService';
import { KowsarBaseWebApi } from '../../framework-services/base/KowsarBaseWebApi.service';

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
  isDarkMode = signal(false)
  private themeSub?: Subscription;

  // ===============================================================
  // 👤 اطلاعات کاربر
  // ===============================================================
  PhFullName = signal('')
  LoginType = signal('')
  CustName_Small = signal('')
  Explain = signal('')
  CentralRef = signal('')
  Imageitem = signal('')
  IsCustomerBuild = signal(false)
  IsKowsarSupportBuild = signal(false)
  ShowHoghogh = signal(false)

  currentStatus = signal('')

  // ===============================================================
  // 🔔 اعلان‌ها
  // ===============================================================
  AlarmActive_Row = signal(0)
  AlarmActtive_Conversation = signal(0)
  AlarmActtive_LeaveRequest = signal(0)

  // ===============================================================
  // 📱 اپلیکیشن‌ها
  // ===============================================================
  apporder = signal('')
  appbroker = signal('')
  appocr = signal('')
  array_applications = signal<any[]>([])

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
  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly sharedService = inject(SharedService);
  private readonly config = inject(AppConfigService);
  private readonly router = inject(Router);
  protected readonly session = inject(SessionStorageService);
  private readonly notificationService = inject(NotificationService);
  protected readonly permissionService = inject(PermissionService);


  constructor() { }

  // ===============================================================
  // 🚀 Lifecycle Hooks
  // ===============================================================
  ngOnInit(): void {



    if (this.permissionService.canManageRole) {
      this.ShowHoghogh.set(true)
    } else {
      this.ShowHoghogh.set(false)
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

  ToDevelop(): void {
    this.notificationService.develop()
  }

  // ===============================================================
  //   بارگذاری داده‌های sessionStorage
  // ===============================================================
  private LoadAttendance(): void {
    this.base_repo.AttendanceDashboard().subscribe({
      next: (data: any) => {
        const matched = data?.Attendances?.find(x => x.CentralRef === this.session.centralRef);
        this.EditForm_Attendance.patchValue({
          Status: matched?.Status ?? null
        });
        this.currentStatus.set(matched?.Status)
      },
      error: (err) => {

      },
    });
  }

  private loadSessionData(): void {
    const newPhFullName = this.session.phFullName;
    const newCentralRef = this.session.centralRef || '';

    //   فقط در صورت تغییر، بروزرسانی انجام شود
    if (newPhFullName !== this.PhFullName())
      this.PhFullName.set(newPhFullName)
    if (newCentralRef !== this.CentralRef()) {
      this.CentralRef.set(newCentralRef)
      this.loadProfileImage(); // کاربر جدید → تصویر جدید
    }

    this.LoginType.set(this.session.loginType)
    this.CustName_Small.set(this.session.getString('CustName_Small') || '')
    this.Explain.set(this.session.getString('Explain') || '')


    const apiUrl_temp = this.config.apiUrl;
    this.IsCustomerBuild.set(!(
      ///apiUrl_temp === 'http://192.168.1.27:60006/api/' ||
      apiUrl_temp === 'https://itmali.ir/webapi/' ||
      apiUrl_temp === 'http://5.160.152.173:60005/api/'
    ))

    this.IsKowsarSupportBuild.set((
      apiUrl_temp === 'http://192.168.1.27:60006/api/' ||
      apiUrl_temp === 'https://itmali.ir/webapi/' ||
      apiUrl_temp === 'http://5.160.152.173:60005/api/'
    ))

    // 🧾 مقداردهی فرم حضور
    this.EditForm_Attendance.patchValue({ CentralRef: this.CentralRef() });
  }

  // ===============================================================
  // 🖼️ دریافت تصویر پروفایل از سرور
  // ===============================================================
  private loadProfileImage(): void {
    if (!this.CentralRef) return;


    this.base_repo.GetImageFromServer(this.CentralRef()).subscribe({
      next: (data: any) => {

        if (data?.Text && data?.Text !== "Nophoto") {
          this.Imageitem.set(`data:image/png;base64,${data.Text}`)
        } else {
          this.Imageitem.set('assets/images/KowsarSupport.png')
        }
      },
      error: () => {
        console.warn('  خطا در دریافت تصویر کاربر');
        this.Imageitem.set('assets/images/KowsarSupport.png')
      },
    });
  }

  // ===============================================================
  // 🟢 تغییر وضعیت حضور (ارسال به سرور)
  // ===============================================================
  setStatus(status: string): void {
    // ۱️⃣ بروزرسانی فرم
    this.EditForm_Attendance.patchValue({ Status: status });
    this.currentStatus.set(status)


    // ۲️⃣ ارسال به API

    this.base_repo.ManualAttendance(this.EditForm_Attendance.value).subscribe({
      next: (response: any) => {

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
    this.router.navigate(['/auth/login']);
  }
}
