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

import { Component, OnInit, OnDestroy, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AppConfigService } from '../../../app-config.service';
import { SharedService } from '../../framework-services/shared.service';
import { NotificationService } from '../../framework-services/ui/notification.service';
import { SessionStorageService } from '../../framework-services/storage/session.storage.service';
import { AuthTokenService } from 'src/app/auth-kowsar/services/auth-token.service';
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
  Show_adminUser = signal(false)

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
  private readonly authTokens = inject(AuthTokenService);
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

    const IsAdminUser = String(this.session.IsAdminUser ?? '0').trim();
    if (IsAdminUser === '1' || IsAdminUser.toLowerCase() === 'true') {
      this.Show_adminUser.set(true)
    } else {
      this.Show_adminUser.set(false)
    }


    setTimeout(() => {
      this.loadSessionData();
      this.loadProfileImage();
      this.LoadAttendance()
    }, 100);
    this.refreshSub = this.sharedService.RefreshAllActions$
      .subscribe(action => {

        console.log("action = " + action)
        if (action === 'refresh') {
          this.LoadAttendance();
        }
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
      ///apiUrl_temp === 'http://192.168.1.27:60007/api/' ||
      apiUrl_temp === 'https://itmali.ir/webapi/' ||
      apiUrl_temp === 'http://5.160.152.173:60005/api/'
    ))

    this.IsKowsarSupportBuild.set((
      apiUrl_temp === 'http://192.168.1.27:60007/api/' ||
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


    this.base_repo.GetImageFromServer(this.CentralRef(), "Central").subscribe({
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

    this.base_repo.AttendanceDashboard().subscribe({
      next: (data: any) => {

        if (status === "3") {

          const attendances = data?.Attendances ?? [];

          const leaveCount = attendances.filter(
            (x: any) => x.Status === "3"
          ).length;

          if (leaveCount > 1) {

            this.notificationService.error(
              "تعداد افراد مرخصی بیش از حد مجاز است"
            );

            return;

          }
        }

        this.EditForm_Attendance.patchValue({ Status: status });
        this.currentStatus.set(status);

        this.base_repo.ManualAttendance(this.EditForm_Attendance.value).subscribe({
          next: (response: any) => {
            this.sharedService.triggerRefresh('refresh');
          },
          error: (err) => {
            console.error('❌ خطا در ManualAttendance:', err);
          },
        });

      },
      error: (err) => {
        console.error(err);
      }
    });

  }

  handleCondensedMenuClick(event: MouseEvent): void {
    const isCondensed =
      document.body.getAttribute('data-sidebar-size') === 'condensed';

    const isDesktop = window.innerWidth >= 992;

    if (!isCondensed || !isDesktop) {
      return;
    }

    const target = event.target as HTMLElement;

    const parentToggle = target.closest<HTMLAnchorElement>(
      '#side-menu > li > a[data-bs-toggle="collapse"]'
    );

    if (!parentToggle) {
      return;
    }

    // جلوگیری از باز ماندن منو توسط Bootstrap
    event.preventDefault();
    event.stopPropagation();

    this.closeCondensedMenus();
  }

  private closeCondensedMenus(): void {
    document
      .querySelectorAll<HTMLElement>(
        '#side-menu > li > .collapse.show'
      )
      .forEach((menu) => {
        menu.classList.remove('show', 'collapsing');
        menu.style.removeProperty('height');
      });

    document
      .querySelectorAll<HTMLAnchorElement>(
        '#side-menu > li > a[aria-expanded="true"]'
      )
      .forEach((link) => {
        link.setAttribute('aria-expanded', 'false');
        link.classList.add('collapsed');
      });
  }
  toggleSidebarCompact(event: Event): void {
    const checked =
      (event.target as HTMLInputElement).checked;

    document.body.setAttribute(
      'data-sidebar-size',
      checked ? 'condensed' : 'default'
    );
  }
  @HostListener('window:resize')
  onWindowResize(): void {
    const body = document.body;
    const isDesktop = window.innerWidth >= 992;

    if (isDesktop) {
      body.classList.remove('sidebar-enable');
      return;
    }

    // جلوگیری از ترکیب Mobile و Condensed
    body.setAttribute('data-sidebar-size', 'default');
  }
  toggleSidebar(): void {
    const body = document.body;
    const isDesktop = window.innerWidth >= 992;

    if (isDesktop) {
      body.classList.remove('sidebar-enable');

      const currentSize =
        body.getAttribute('data-sidebar-size');

      body.setAttribute(
        'data-sidebar-size',
        currentSize === 'condensed'
          ? 'default'
          : 'condensed'
      );

      return;
    }

    // در موبایل نباید condensed باقی بماند
    body.setAttribute('data-sidebar-size', 'default');
    body.classList.toggle('sidebar-enable');
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
    const loginRoute = this.session.loginRoute;
    this.authTokens.logout().subscribe(() => void this.router.navigateByUrl(loginRoute));
  }
}
