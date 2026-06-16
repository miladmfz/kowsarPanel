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
import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { NotificationService } from '../../framework-services/ui/notification.service';
import { PermissionService } from '../../framework-services/storage/PermissionService';
import { SessionStorageService } from '../../framework-services/storage/session.storage.service';
import { KowsarBaseWebApi } from '../../framework-services/base/KowsarBaseWebApi.service';

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
  isDarkMode = signal(false)
  AlarmActive_Row = signal(0)
  AlarmActive_Conversation = signal(0)
  AlarmActive_LeaveRequest = signal(0)
  AlarmActive_New = signal(0)


  attendanceInterval!: ReturnType<typeof setInterval>;

  // ===============================================================
  // 👤 اطلاعات کاربر
  // ===============================================================
  Imageitem = signal('')
  PhFullName = signal('')

  LoginType = signal('')
  currentStatus = signal('')
  ActiveDate_str = signal('')

  private lastConversationCount = 0;
  private lastLeaveRequestCount = 0;
  private lastAlarmRowCount = 0;
  private lastAlarmNewCount = 0;

  // ===============================================================
  // 🔐 Change Password (Modal + Form)
  // ===============================================================
  isSavingChangePass = signal(false)
  private changePassModal: any;

  // ✅ مهم: اینجا فقط تعریف می‌کنیم، مقداردهی داخل ngOnInit
  changePassForm!: FormGroup;

  // ===============================================================
  //   سازنده و Inject ها
  // ===============================================================
  private readonly zone = inject(NgZone);
  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  protected readonly permissionService = inject(PermissionService);
  protected readonly session = inject(SessionStorageService);

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

    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light';

    this.isDarkMode.set(savedTheme === 'dark')
    this.PhFullName.set(this.session.phFullName)
    this.LoginType.set(this.session.loginType)
    this.ActiveDate_str.set(this.session.getString('ActiveDate') || '')

    this.requestNotificationPermission();

    this.attendanceInterval = setInterval(() => this.Get_Notification(), 2 * (60000));

    this.Get_Notification();

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

  routeletter() {
    if (this.LoginType() == "KOWSAR") {
      this.router.navigate(['/automation/letter-user']);

    } else {
      this.router.navigate(['/automation/letter-customer']);

    }

  }

  // ===============================================================
  // 🔐 ساخت فرم تغییر رمز
  // ===============================================================

  private initChangePasswordForm(): void {
    this.changePassForm = this.fb.group(
      {
        UName: [''],

        UPass: [
          '',
          [
            Validators.required,
            Validators.minLength(4)
          ]
        ],

        UNewPass: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=\[\]{};:'"\\|,.<>/?]).+$/)
          ]
        ],

        confirmPassword: [
          '',
          [
            Validators.required
          ]
        ],
      },
      {
        validators: [
          this.passwordMatchValidator,
          this.newPasswordDifferentValidator
        ]
      }
    );
  }
  private get newPassControl() {
    return this.changePassForm.get('UNewPass');
  }

  get passwordValidations() {
    const value = this.newPassControl?.value ?? '';

    return {
      minLength: value.length >= 8,
      hasUpper: /[A-Z]/.test(value),
      hasLower: /[a-z]/.test(value),
      hasNumber: /\d/.test(value),
      hasSpecial: /[!@#$%^&*()_\-+=\[\]{};:'"\\|,.<>/?]/.test(value)
    };
  }
  isInvalid(controlName: 'UPass' | 'UNewPass' | 'confirmPassword'): boolean {
    const control = this.changePassForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  private passwordMatchValidator = (form: AbstractControl): ValidationErrors | null => {
    const newPass = form.get('UNewPass')?.value;
    const confirmPass = form.get('confirmPassword')?.value;

    if (!newPass || !confirmPass) {
      return null;
    }

    return newPass === confirmPass
      ? null
      : { passwordMismatch: true };
  };

  private newPasswordDifferentValidator = (form: AbstractControl): ValidationErrors | null => {
    const oldPass = form.get('UPass')?.value;
    const newPass = form.get('UNewPass')?.value;

    if (!oldPass || !newPass) {
      return null;
    }

    return oldPass !== newPass
      ? null
      : { sameAsOldPassword: true };
  };
  // ===============================================================
  // 🖼️ دریافت عکس کاربر از سرور
  // ===============================================================


  private loadProfileImage(): void {

    if (!this.session.centralRef) return;
    this.base_repo.GetImageFromServer(this.session.centralRef).subscribe({
      next: (data: any) => {
        if (data?.Text && data?.Text !== 'Nophoto') {
          this.zone.run(() => {
            this.Imageitem.set(`data:image/png;base64,${data.Text}`)
          });
        } else {
          this.zone.run(() => {
            this.Imageitem.set('assets/images/KowsarSupport.png')
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

    const request$ = this.permissionService.canManageRole
      ? this.base_repo.GetKowsarNotification()
      : this.base_repo.GetCustomerNotification();


    request$.subscribe({
      next: (data: any) => {
        const u = data?.users?.[0];
        if (!u) return;

        this.zone.run(() => {
          this.AlarmActive_Row.set(Number(u.AlarmActive_Row) || 0);
          this.AlarmActive_New.set(Number(u.AlarmActive_New) || 0);
          this.AlarmActive_Conversation.set(Number(u.AlarmActive_Conversation) || 0);

          if (this.permissionService.canManageRole) {
            this.AlarmActive_LeaveRequest.set(Number(u.AlarmActive_LeaveRequest) || 0);
          } else {
            this.AlarmActive_LeaveRequest.set(0);
          }

          this.session.setItem('AlarmActive_Row', this.AlarmActive_Row().toString());
          this.session.setItem('AlarmActive_New', this.AlarmActive_New().toString());
          this.session.setItem('AlarmActive_Conversation', this.AlarmActive_Conversation().toString());
          this.session.setItem('AlarmActive_LeaveRequest', this.AlarmActive_LeaveRequest().toString());

          this.showSystemNotifications();
        });
      },
      error: () => console.warn('❌ خطا در دریافت اعلان‌ها از سرور'),
    });
  }

  private showSystemNotifications(): void {
    if (!('Notification' in window)) return;
    if (!window.isSecureContext) return;
    if (Notification.permission !== 'granted') return;

    const conversationCount = this.AlarmActive_Conversation();
    const leaveRequestCount = this.AlarmActive_LeaveRequest();
    const alarmRowCount = this.AlarmActive_Row();
    const alarmNewCount = this.AlarmActive_New();

    const notificationItems: string[] = [];

    if (conversationCount > this.lastConversationCount) {
      notificationItems.push(`${conversationCount} مکالمه خوانده‌نشده`);
    }

    if (leaveRequestCount > this.lastLeaveRequestCount) {
      notificationItems.push(`${leaveRequestCount} درخواست مرخصی`);
    }

    if (alarmRowCount > this.lastAlarmRowCount) {
      notificationItems.push(`${alarmRowCount} ارجاع جدید`);
    }

    if (alarmNewCount > this.lastAlarmNewCount) {
      notificationItems.push(`${alarmNewCount} تیکت جدید`);
    }

    if (notificationItems.length > 0) {
      new Notification('اعلان‌های جدید', {
        body: notificationItems.join(' | ')
      });
    }

    this.lastConversationCount = conversationCount;
    this.lastLeaveRequestCount = leaveRequestCount;
    this.lastAlarmRowCount = alarmRowCount;
    this.lastAlarmNewCount = alarmNewCount;
  }

  // ===============================================================
  // 🌗 تغییر تم سیستم (Dark / Light)
  // ===============================================================
  toggleTheme(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.isDarkMode.set(checked)
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

    this.session.clearSession();
    this.router.navigateByUrl('/auth/login');
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
    this.isSavingChangePass.set(false)

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

    this.isSavingChangePass.set(true)

    const payload = {
      UName: this.session.userName,
      UPass: this.changePassForm.value.UPass,
      UNewPass: this.changePassForm.value.UNewPass,
    };


    this.base_repo.ChangeXUserPassword(payload).subscribe({
      next: (data: any) => {
        this.zone.run(() => {
          if (data.users[0].ErrDesc.length > 0) {

            this.notificationService.error(data.users[0].ErrDesc);
          } else {
            this.notificationService.succeded();

          }



          this.isSavingChangePass.set(false);
          this.changePassModal?.hide();
        });
      },
      error: () => {
        this.zone.run(() => (this.isSavingChangePass.set(false)))
      },
    });

    // 🧪 تست UI (حذف کن)
    setTimeout(() => {
      this.zone.run(() => {
        this.isSavingChangePass.set(false);
        this.changePassModal?.hide();
      });
    }, 600);
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
