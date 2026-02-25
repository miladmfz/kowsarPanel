/* ===============================================================
   📘 HeaderComponent
   توضیحات کلی:
   این کامپوننت مسئول نمایش نوار بالای سیستم (Topbar) است.
   شامل مدیریت اعلان‌ها، تغییر تم، تصویر پروفایل و کنترل سایدبار می‌باشد.

   قابلیت‌ها:
   1️⃣ دریافت اعلان‌ها از سرور در بازه‌های زمانی منظم (هر ۱۵ ثانیه)
   2️⃣ بارگذاری تصویر پروفایل از API
   3️⃣ پشتیبانی از حالت تیره و روشن با ذخیره‌سازی در localStorage
   4️⃣ مدیریت خروج از سیستم و پاک‌سازی session
   5️⃣ کنترل باز/بسته شدن سایدبار در حالت دسکتاپ و موبایل
   6️⃣ نمایش مودال تغییر رمز عبور از داخل Topbar
   =============================================================== */

import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { DashboardWebApiService } from '../services/dashboard-web-api.service';
import { NotificationService } from '../../framework-services/ui/notification.service';

declare const bootstrap: any;

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit, AfterViewInit, OnDestroy {
  // ===============================================================
  //   وضعیت‌ها و متغیرهای اعلان
  // ===============================================================
  isDarkMode = false;
  AlarmActive_Row = 0;
  AlarmActtive_Conversation = 0;
  AlarmActtive_LeaveRequest = 0;
  attendanceInterval!: ReturnType<typeof setInterval>;

  // ===============================================================
  // 👤 اطلاعات کاربر
  // ===============================================================
  Imageitem = '';
  PhFullName = '';
  UserName = '';
  UserType = '';

  JobPersonRef = '';
  currentStatus = '';
  ActiveSession_str = '';

  // ===============================================================
  // 🔐 Change Password (Modal + Form)
  // ===============================================================
  isSavingChangePass = false;
  private changePassModal: any;

  // ✅ مهم: اینجا فقط تعریف می‌کنیم، مقداردهی داخل ngOnInit
  changePassForm!: FormGroup;

  // ===============================================================
  //   سازنده و Inject ها
  // ===============================================================
  private readonly zone = inject(NgZone);
  private readonly repo = inject(DashboardWebApiService);
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);

  constructor() { }

  requestNotificationPermission(): void {
    if (!('Notification' in window)) {
      console.warn('Notification API توسط این مرورگر پشتیبانی نمی‌شود.');
      return;
    }

    Notification.requestPermission().then(permission => {
      console.log('Notification permission:', permission);
      // permission می‌تونه 'granted'، 'denied' یا 'default' باشه
    });
  }

  // ===============================================================
  // 🚀 Lifecycle Hooks
  // ===============================================================
  ngOnInit(): void {
    // ✅ ساخت فرم تغییر رمز (بعد از inject شدن fb)
    this.initChangePasswordForm();

    // 🌓 مقداردهی اولیه تم
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
    this.isDarkMode = savedTheme === 'dark';

    // 👤 اطلاعات پایه کاربر
    this.PhFullName = sessionStorage.getItem('PhFullName') || '';
    this.UserName = sessionStorage.getItem('UserName') || '';
    this.UserType = sessionStorage.getItem('UserType') || '';



    this.JobPersonRef = sessionStorage.getItem('JobPersonRef') || '';
    this.ActiveSession_str = sessionStorage.getItem('ActiveSession') || '';
    this.requestNotificationPermission();
    // 🔔 بروزرسانی اعلان‌ها هر ۱۵ ثانیه
    this.attendanceInterval = setInterval(() => this.Get_Notification(), 15000);
    this.Get_Notification();

    // 📷 دریافت تصویر پروفایل
    this.loadProfileImage();
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';
        this.setTheme(savedTheme);
      }, 0);
    });
  }

  ngOnDestroy(): void {
    if (this.attendanceInterval) clearInterval(this.attendanceInterval);
  }

  // ===============================================================
  // 🔐 ساخت فرم تغییر رمز
  // ===============================================================
  private initChangePasswordForm(): void {
    this.changePassForm = this.fb.group(
      {
        UName: [''],
        UPass: ['', [Validators.required, Validators.minLength(4)]],
        UNewPass: ['', [Validators.required, Validators.minLength(6)]],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: [this.passwordMatchValidator] }
    );
  }

  // ===============================================================
  // 🖼️ دریافت عکس کاربر از سرور
  // ===============================================================
  private loadProfileImage(): void {
    const centralRef = sessionStorage.getItem('CentralRef');
    if (!centralRef) return;

    this.repo.GetImageFromServer(centralRef).subscribe({
      next: (data: any) => {
        if (data?.Text && data?.Text !== 'Nophoto') {
          this.zone.run(() => {
            this.Imageitem = `data:image/png;base64,${data.Text}`;
          });
        } else {
          this.zone.run(() => {
            this.Imageitem = 'assets/images/KowsarSupport.png';
          });
        }
      },
      error: () => console.warn('❌ خطا در دریافت تصویر کاربر'),
    });
  }

  // ===============================================================
  // 🔔 دریافت اعلان‌ها از API
  // ===============================================================
  Get_Notification(): void {
    const personRef = sessionStorage.getItem('PersonInfoRef');
    if (!personRef) return;

    this.repo.GetNotification().subscribe({
      next: (data: any) => {
        const u = data?.users?.[0];
        if (!u) return;

        this.zone.run(() => {
          this.AlarmActive_Row = Number(u.AlarmActive_Row) || 0;
          this.AlarmActtive_Conversation = Number(u.AlarmActtive_Conversation) || 0;

          // فقط برای ادمین‌ها (PhAddress3=100)
          if (sessionStorage.getItem('PhAddress3') === '100') {
            this.AlarmActtive_LeaveRequest = Number(u.AlarmActtive_LeaveRequest) || 0;
          } else {
            this.AlarmActtive_LeaveRequest = 0;
          }

          // ذخیره در session برای سایر بخش‌ها
          sessionStorage.setItem('AlarmActive_Row', this.AlarmActive_Row.toString());
          sessionStorage.setItem('AlarmActtive_Conversation', this.AlarmActtive_Conversation.toString());
          sessionStorage.setItem('AlarmActtive_LeaveRequest', this.AlarmActtive_LeaveRequest.toString());

          // ✅ اینجا نوتیفیکیشن سیستم رو بفرست
          this.showSystemNotifications();
        });
      },
      error: () => console.warn('❌ خطا در دریافت اعلان‌ها از سرور'),
    });
  }

  private showSystemNotifications(): void {
    if (!('Notification' in window)) {
      console.warn('Notification API پشتیبانی نمی‌شود.');
      return;
    }

    if (Notification.permission !== 'granted') {
      // اجازه داده نشده، کار خاصی نمی‌کنیم
      return;
    }

    // مثال‌ها: هر کدوم رو خواستی شرط بذار
    if (this.AlarmActtive_Conversation > 0) {
      new Notification('پیام جدید', {
        body: `شما ${this.AlarmActtive_Conversation} مکالمه خوانده‌نشده دارید.`,
        icon: '/assets/icons/chat.png', // اگر آیکون داری
      });
    }

    if (this.AlarmActtive_LeaveRequest > 0) {
      new Notification('درخواست مرخصی جدید', {
        body: `شما ${this.AlarmActtive_LeaveRequest} درخواست مرخصی جدید دارید.`,
        icon: '/assets/icons/leave.png',
      });
    }

    if (this.AlarmActive_Row > 0) {
      new Notification('ارجاع جدید', {
        body: `تعداد ارجاع جدید: ${this.AlarmActive_Row}`,
        icon: '/assets/icons/alarm.png',
      });
    }
  }
  // ===============================================================
  // 🌗 تغییر تم سیستم (Dark / Light)
  // ===============================================================
  toggleTheme(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.isDarkMode = checked;
    this.setTheme(checked ? 'dark' : 'light');
  }

  setTheme(mode: 'light' | 'dark'): void {
    const bsLight = document.getElementById('bs-default-stylesheet') as HTMLLinkElement;
    const appLight = document.getElementById('app-default-stylesheet') as HTMLLinkElement;
    const bsDark = document.getElementById('bs-dark-stylesheet') as HTMLLinkElement;
    const appDark = document.getElementById('app-dark-stylesheet') as HTMLLinkElement;

    if (!bsLight || !appLight || !bsDark || !appDark) return;

    if (mode === 'dark') {
      bsLight.disabled = true;
      appLight.disabled = true;
      bsDark.disabled = false;
      appDark.disabled = false;
      document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
      bsLight.disabled = false;
      appLight.disabled = false;
      bsDark.disabled = true;
      appDark.disabled = true;
      document.documentElement.setAttribute('data-bs-theme', 'light');
    }

    localStorage.setItem('theme', mode);
  }

  // ===============================================================
  // 🚪 خروج از سیستم
  // ===============================================================
  logout(): void {
    sessionStorage.clear();
    localStorage.removeItem('theme');
    window.location.reload();
  }

  // ===============================================================
  // 📱 باز و بسته کردن سایدبار
  // ===============================================================
  toggleSidebar(): void {
    const body = document.body;
    const width = window.innerWidth;

    if (width >= 993) {
      const isCondensed = body.getAttribute('data-sidebar-size') === 'condensed';
      body.setAttribute('data-sidebar-size', isCondensed ? 'default' : 'condensed');
    } else {
      body.classList.toggle('sidebar-enable');
    }
  }

  // ===============================================================
  // 🔐 Change Password Modal Methods
  // ===============================================================
  openChangePasswordModal(): void {
    // اگر dropdown پروفایل باز باشد، ببند (برای UX بهتر)
    this.closeAnyOpenDropdowns();

    const el = document.getElementById('changePasswordModal');
    if (!el) return;

    // ریست فرم هر بار باز شدن
    this.changePassForm.reset();
    this.changePassForm.markAsPristine();
    this.changePassForm.markAsUntouched();
    this.isSavingChangePass = false;

    this.changePassModal = bootstrap.Modal.getOrCreateInstance(el, {
      backdrop: 'static',
      keyboard: false,
    });

    this.changePassModal.show();
  }

  submitChangePassword(): void {
    if (this.changePassForm.invalid) {
      this.changePassForm.markAllAsTouched();
      return;
    }

    this.isSavingChangePass = true;

    const payload = {
      UName: this.UserName,
      UPass: this.changePassForm.value.UPass,
      UNewPass: this.changePassForm.value.UNewPass,
    };


    this.repo.ChangeXUserPassword(payload).subscribe({
      next: (data: any) => {
        this.zone.run(() => {
          if (data.users[0].ErrDesc.length > 0) {

            this.notificationService.error(data.users[0].ErrDesc);
          } else {
            this.notificationService.succeded();

          }



          this.isSavingChangePass = false;
          this.changePassModal?.hide();
        });
      },
      error: () => {
        this.zone.run(() => (this.isSavingChangePass = false));
      },
    });

    // 🧪 تست UI (حذف کن)
    setTimeout(() => {
      this.zone.run(() => {
        this.isSavingChangePass = false;
        this.changePassModal?.hide();
      });
    }, 600);
  }

  isInvalid(controlName: 'UPass' | 'UNewPass' | 'confirmPassword'): boolean {
    const c = this.changePassForm.get(controlName);
    return !!(c && c.invalid && (c.touched || c.dirty));
  }

  private passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
    const newPass = group.get('UNewPass')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (!newPass || !confirm) return null;
    return newPass === confirm ? null : { passwordMismatch: true };
  }

  private closeAnyOpenDropdowns(): void {
    try {
      // بستن همه dropdown های باز (بدون حساسیت به ساختار دقیق DOM)
      const openedMenus = document.querySelectorAll('.dropdown-menu.show');
      openedMenus.forEach((m) => m.classList.remove('show'));

      const openedToggles = document.querySelectorAll('[aria-expanded="true"]');
      openedToggles.forEach((t) => t.setAttribute('aria-expanded', 'false'));
    } catch {
      // silent
    }
  }
}
