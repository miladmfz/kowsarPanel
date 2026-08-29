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
import { Component, OnInit, AfterViewInit, OnDestroy, NgZone, inject, signal, HostListener } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators, AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';
import { NotificationService } from '../../framework-services/ui/notification.service';
import { PermissionService } from '../../framework-services/storage/PermissionService';
import { SessionStorageService } from '../../framework-services/storage/session.storage.service';
import { KowsarBaseWebApi } from '../../framework-services/base/KowsarBaseWebApi.service';
import { AppConfigService } from 'src/app/app-config.service';
import { WebPhoneService } from 'src/app/features/santral/services/webphone.service';
declare const bootstrap: any;
import { NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { cleanSantralText } from 'src/app/features/santral/shared/utils/santral-format.util';
import { WebPhoneTonePlayer } from 'src/app/features/santral/shared/webphone/webphone-tone-player';
import { SantralWebApiService } from 'src/app/features/santral/services/santralapi.service';
import { CustomerWebApiService } from 'src/app/features/internal/services/CustomerWebApi.service';

interface HeaderPhoneBookItem {
  name: string;
  number: string;
  explain: string;
  centralRef?: number;
  customerCode?: number;
  addressRef?: number;
}

interface HeaderCallContext {
  number: string;
  phoneBookName: string;
  customerName: string;
  customerExplain: string;
  centralRef?: number;
  customerCode?: number;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './header.component.html',
  styleUrls: [
    './header.component.css',
  ],
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
  profileDropdownOpen = signal(false);
  toggleProfileDropdown(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.profileDropdownOpen.update(value => !value);
  }


  closeProfileDropdown(): void {
    this.profileDropdownOpen.set(false);
  }
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.kws-profile-root')) {
      this.profileDropdownOpen.set(false);
    }
  }
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
  private headerPhoneBook = signal<HeaderPhoneBookItem[]>([]);
  private headerCallContexts = new Map<number, HeaderCallContext>();
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
  private readonly customer_repo = inject(CustomerWebApiService);

  private readonly fb = inject(FormBuilder);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);
  protected readonly permissionService = inject(PermissionService);
  protected readonly session = inject(SessionStorageService);
  private readonly appConfig = inject(AppConfigService);
  protected readonly webPhoneService = inject(WebPhoneService);
  private readonly santralApi = inject(SantralWebApiService) as any;
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
    if (this.LoginType() == 'KOWSAR') {
      this.initHeaderWebPhone();
      this.loadHeaderPhoneBook();
    }
    this.requestNotificationPermission();

    this.attendanceInterval = setInterval(() => this.Get_Notification(), 2 * (60000));

    this.Get_Notification();

    this.loadProfileImage();
    this.bindHeaderIncomingPreviewHandler();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        if (!this.router.url.includes('/santral/santral-phone')) {
          this.bindHeaderIncomingPreviewHandler();
          this.restoreHeaderPhoneState();
        }
      });
  }
  private loadHeaderPhoneBook(): void {
    const extension = String(this.session.manager ?? '').trim();

    this.santralApi.GetPhoneBook(extension, false).subscribe({
      next: (res: any) => {
        const list =
          Array.isArray(res?.phonebook) ? res.phonebook :
            Array.isArray(res?.items) ? res.items :
              Array.isArray(res?.records) ? res.records :
                [];

        const mapped = list
          .map((row: any) => {
            const number = cleanSantralText(
              row?.display_number ??
              row?.DisplayNumber ??
              row?.Number ??
              row?.number ??
              ''
            );

            const name = cleanSantralText(
              row?.Name ??
              row?.name ??
              ''
            );

            const explain = cleanSantralText(
              row?.Explain ??
              row?.explain ??
              ''
            );

            const link = this.parseHeaderKowsarExplain(explain);

            return {
              name,
              number,
              explain,
              ...link
            };
          })
          .filter((item: any) => !!item.number);

        this.headerPhoneBook.set(mapped);
        this.refreshIncomingNamesFromHeaderPhoneBook();
      },
      error: () => {
        this.headerPhoneBook.set([]);
      }
    });
  }

  private normalizeHeaderPhoneValue(value: any): string {
    let text = cleanSantralText(value);

    if (!text) {
      return '';
    }

    const fa = '۰۱۲۳۴۵۶۷۸۹';
    const ar = '٠١٢٣٤٥٦٧٨٩';

    text = text.replace(/[۰-۹]/g, d => String(fa.indexOf(d)));
    text = text.replace(/[٠-٩]/g, d => String(ar.indexOf(d)));

    text = text.replace(/[^\d]/g, '');

    if (text.startsWith('0098')) {
      text = '0' + text.substring(4);
    }

    if (text.startsWith('98') && text.length === 12) {
      text = '0' + text.substring(2);
    }

    return text;
  }

  private isSameHeaderPhoneNumber(a: any, b: any): boolean {
    const x = this.normalizeHeaderPhoneValue(a);
    const y = this.normalizeHeaderPhoneValue(b);

    if (!x || !y) {
      return false;
    }

    if (x === y) {
      return true;
    }

    // برای موبایل / شماره شهری با پیش‌شماره متفاوت
    if (x.length >= 8 && y.length >= 8) {
      return x.slice(-8) === y.slice(-8);
    }

    return false;
  }

  private parseHeaderKowsarExplain(
    explain: string
  ): { centralRef?: number; customerCode?: number; addressRef?: number } {
    const text = String(explain ?? '').trim();
    if (!text || !/^KOWSAR(?:\||$)/i.test(text)) {
      return {};
    }

    const values: Record<string, number> = {};
    for (const part of text.split('|').slice(1)) {
      const [rawKey, rawValue] = part.split('=', 2);
      const key = String(rawKey ?? '').trim().toLowerCase();
      const value = Number(String(rawValue ?? '').trim());

      if (key && Number.isFinite(value) && value > 0) {
        values[key] = value;
      }
    }

    return {
      centralRef: values['centralref'],
      customerCode: values['customercode'],
      addressRef: values['addressref']
    };
  }

  private findHeaderContact(number: string): HeaderPhoneBookItem | undefined {
    return this.headerPhoneBook().find(item =>
      this.isSameHeaderPhoneNumber(item.number, number)
    );
  }

  private findHeaderContactName(number: string): string {
    return cleanSantralText(this.findHeaderContact(number)?.name ?? '');
  }

  private refreshIncomingNamesFromHeaderPhoneBook(): void {
    this.webPhoneService.lines().forEach(line => {
      if (!line?.number) {
        return;
      }

      const currentName = cleanSantralText(line.name);

      if (currentName && currentName !== line.number) {
        return;
      }

      const name = this.findHeaderContactName(line.number);

      if (!name) {
        return;
      }

      this.webPhoneService.updateLine(line.index, {
        name
      });
    });
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
    this.stopMiniIncomingAlert();
    this.closeMiniConnectedNotification();
    this.miniIncomingTone.dispose();
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
    this.base_repo.GetImageFromServer(this.session.centralRef, "Central").subscribe({
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

    const request$ = this.permissionService.canManageUsers
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

    this.profileDropdownOpen.set(false);

    const el = document.getElementById('changePasswordModal');
    if (!el) return;

    this.changePassForm.reset();
    this.changePassForm.markAsPristine();
    this.changePassForm.markAsUntouched();
    this.isSavingChangePass.set(false);

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
  private initHeaderWebPhone(): void {
    const cfg = this.appConfig.santralWebPhone;

    const wsUrl = String(cfg?.wsUrl ?? '').trim();
    const domain = String(cfg?.domain ?? '').trim();
    const extension = String(this.session.manager ?? '').trim();
    const password = String(this.session.delegacy ?? '').trim();

    if (!wsUrl || !domain || !extension || !password) {
      return;
    }

    this.webPhoneService.init({
      wsUrl,
      domain,
      extension,
      password
    });
  }
  toggleMiniPhoneConnection(): void {
    if (this.miniPhoneIsRinging() || this.miniPhoneHasActiveCall()) {
      this.openPhonePage();
      return;
    }

    if (this.webPhoneService.isConnected()) {
      this.webPhoneService.disconnect();
      return;
    }

    this.initHeaderWebPhone();
    this.bindHeaderIncomingPreviewHandler();
    this.webPhoneService.connect();
  }
  miniPhoneActiveNumber(): string {
    const line = this.webPhoneService
      .lines()
      .find(item => !!item.session);

    return line?.number || '';
  }
  miniPhoneHasActiveCall(): boolean {
    return this.webPhoneService
      .lines()
      .some(item => !!item.session);
  }
  hangupMiniPhoneCall(event: Event): void {
    event.stopPropagation();
    this.stopMiniIncomingAlert();
    this.closeMiniConnectedNotification();
    const line = this.webPhoneService
      .lines()
      .find(item => !!item.session);

    if (!line?.session) {
      return;
    }

    try {
      line.session.terminate();
    } catch {
      // ignore
    }
  }
  openPhonePage(): void {
    this.router.navigate(['/santral/santral-phone']);
  }
  private bindHeaderIncomingPreviewHandler(): void {
    this.webPhoneService.setIncomingSessionHandler((session: any) => {
      this.handleHeaderIncomingPreview(session);
    });
  }

  private restoreHeaderPhoneState(): void {
    this.webPhoneService.lines()
      .filter(line => !!line.session)
      .forEach(line => {
        if (this.headerCallContexts.has(line.index)) {
          return;
        }

        const phoneBookItem = this.findHeaderContact(line.number);
        const phoneBookName = phoneBookItem?.name || line.name || line.number;

        this.headerCallContexts.set(line.index, {
          number: line.number,
          phoneBookName,
          customerName: '',
          customerExplain: '',
          centralRef: phoneBookItem?.centralRef,
          customerCode: phoneBookItem?.customerCode
        });

        if (phoneBookItem?.name && phoneBookItem.name !== line.name) {
          this.webPhoneService.updateLine(line.index, { name: phoneBookItem.name });
        }

        if (line.status === 'incoming' || line.status === 'ringing') {
          this.startMiniIncomingAlert();
          this.showMiniIncomingNotification(line.index, false);
        }

        if (phoneBookItem?.centralRef) {
          this.loadHeaderCustomerProfile(line.index, phoneBookItem.centralRef, line.session);
        }
      });
  }
  private handleHeaderIncomingPreview(session: any): void {
    const lineIndex = this.findHeaderFreeLine();

    if (!lineIndex) {
      return;
    }

    const remoteIdentity = session?.remote_identity;
    const callerNumber = cleanSantralText(remoteIdentity?.uri?.user);
    const phoneBookItem = this.findHeaderContact(callerNumber);
    const remoteName = cleanSantralText(remoteIdentity?.display_name);
    const callerName = phoneBookItem?.name || remoteName || callerNumber;

    this.headerCallContexts.set(lineIndex, {
      number: callerNumber,
      phoneBookName: callerName,
      customerName: '',
      customerExplain: '',
      centralRef: phoneBookItem?.centralRef,
      customerCode: phoneBookItem?.customerCode
    });

    this.webPhoneService.activeLineIndex.set(lineIndex);
    this.webPhoneService.updateLine(lineIndex, {
      session,
      status: 'incoming',
      number: callerNumber,
      name: callerName,
      direction: 'incoming',
      muted: false,
      held: false,
      answered: false,
      startedAt: Date.now(),
      connectedAt: null
    });

    this.startMiniIncomingAlert();
    this.showMiniIncomingNotification(lineIndex, false);

    if (phoneBookItem?.centralRef) {
      this.loadHeaderCustomerProfile(lineIndex, phoneBookItem.centralRef, session);
    }

    let connectedHandled = false;
    const handleConnected = () => {
      if (connectedHandled) {
        return;
      }

      connectedHandled = true;
      this.stopMiniIncomingAlert();
      this.webPhoneService.updateLine(lineIndex, {
        status: 'active',
        answered: true,
        connectedAt: Date.now()
      });
      this.showMiniConnectedNotification(lineIndex);
    };

    session.on('accepted', handleConnected);
    session.on('confirmed', handleConnected);

    session.on('ended', () => {
      this.clearHeaderIncomingPreview(lineIndex);
    });

    session.on('failed', () => {
      this.clearHeaderIncomingPreview(lineIndex);
    });
  }

  private loadHeaderCustomerProfile(lineIndex: number, centralRef: number, session: any): void {
    this.customer_repo.GetCustomerByCodeFromSantral(centralRef + "").subscribe({
      next: (res: any) => {
        const current = this.headerCallContexts.get(lineIndex);
        const line = this.webPhoneService.lines().find(item => item.index === lineIndex);

        if (!current || !line?.session || line.session !== session) {
          return;
        }

        const customer = Array.isArray(res?.Customers) ? res.Customers[0] : null;
        if (!customer) {
          return;
        }

        const updated: HeaderCallContext = {
          ...current,
          customerName: cleanSantralText(customer?.CustName_Small ?? ''),
          customerExplain: cleanSantralText(customer?.Explain ?? '')
        };

        this.headerCallContexts.set(lineIndex, updated);

        if (line.status === 'incoming' || line.status === 'ringing') {
          this.showMiniIncomingNotification(lineIndex, true);
        } else if (line.status === 'active' || line.status === 'held') {
          this.showMiniConnectedNotification(lineIndex);
        }
      }
    });
  }

  private findHeaderFreeLine(): number | null {
    const current = this.webPhoneService.activeLine();

    if (!current.session) {
      return current.index;
    }

    const empty = this.webPhoneService
      .lines()
      .find(line => !line.session);

    return empty?.index ?? null;
  }

  private clearHeaderIncomingPreview(lineIndex: number): void {
    this.stopMiniIncomingAlert();
    this.closeMiniConnectedNotification();
    this.headerCallContexts.delete(lineIndex);

    this.webPhoneService.updateLine(lineIndex, {
      status: 'ended',
      session: null,
      held: false,
      muted: false
    });

    setTimeout(() => {
      this.webPhoneService.clearLine(lineIndex);
    }, 800);
  }

  miniPhoneIncomingLine(): any {
    return this.webPhoneService
      .lines()
      .find(item => item.status === 'incoming') ?? null;
  }

  miniPhoneIsRinging(): boolean {
    return !!this.miniPhoneIncomingLine();
  }

  miniPhoneText(): string {
    const incoming = this.miniPhoneIncomingLine();

    if (incoming) {
      return incoming.name || incoming.number || 'تماس ورودی';
    }

    const active = this.webPhoneService
      .lines()
      .find(item => !!item.session);

    if (active) {
      return active.name || active.number || 'تماس فعال';
    }

    if (this.webPhoneService.registerStatus() === 'registered') {
      return this.webPhoneService.extension() || 'تلفن متصل';
    }

    return 'اتصال تلفن';
  }

  miniPhoneMainClick(event: Event): void {
    event.stopPropagation();

    if (this.miniPhoneIsRinging() || this.miniPhoneHasActiveCall()) {
      this.openPhonePage();
      return;
    }

    if (this.webPhoneService.isConnected()) {
      this.webPhoneService.disconnect();
      return;
    }

    this.initHeaderWebPhone();
    this.bindHeaderIncomingPreviewHandler();
    this.webPhoneService.connect();
  }

  private readonly miniIncomingTone = new WebPhoneTonePlayer({
    frequencies: [880],
    gain: 0.04,
    toneDurationMs: 450,
    intervalMs: 1200
  });

  private miniIncomingNotification: Notification | null = null;
  private miniConnectedNotification: Notification | null = null;
  private miniConnectedNotificationTimer: ReturnType<typeof setTimeout> | null = null;

  private startMiniIncomingAlert(): void {
    this.miniIncomingTone.start();
  }

  private stopMiniIncomingAlert(): void {
    this.miniIncomingTone.stop();

    if (this.miniIncomingNotification) {
      this.miniIncomingNotification.close();
      this.miniIncomingNotification = null;
    }
  }

  private notificationBody(context: HeaderCallContext | undefined): string {
    if (!context) {
      return 'تماس جدید';
    }

    const lines: string[] = [];
    const phoneBookName = cleanSantralText(context.phoneBookName);
    const customerName = cleanSantralText(context.customerName);
    const number = cleanSantralText(context.number);
    const explain = cleanSantralText(context.customerExplain);

    if (phoneBookName && phoneBookName !== number) {
      lines.push(phoneBookName);
    }
    if (customerName && customerName !== phoneBookName && customerName !== number) {
      lines.push(`نام مشتری: ${customerName}`);
    }
    if (number) {
      lines.push(number);
    }
    if (explain) {
      lines.push(`توضیحات: ${explain}`);
    }

    return lines.join('\n') || 'تماس جدید';
  }

  private canShowPhoneNotification(): boolean {
    return (
      'Notification' in window &&
      window.isSecureContext &&
      Notification.permission === 'granted'
    );
  }

  private showMiniIncomingNotification(lineIndex: number, silentUpdate: boolean): void {
    if (!this.canShowPhoneNotification()) {
      return;
    }

    const context = this.headerCallContexts.get(lineIndex);
    this.miniIncomingNotification?.close();

    this.miniIncomingNotification = new Notification('تماس ورودی', {
      body: this.notificationBody(context),
      tag: 'kowsar-webphone-incoming',
      requireInteraction: true,
      silent: silentUpdate,
      renotify: !silentUpdate,
      dir: 'rtl'
    } as NotificationOptions & { requireInteraction?: boolean; renotify?: boolean });

    this.miniIncomingNotification.onclick = () => {
      window.focus();

      this.zone.run(() => {
        this.openPhonePage();
      });

      this.miniIncomingNotification?.close();
      this.miniIncomingNotification = null;
    };
  }

  private showMiniConnectedNotification(lineIndex: number): void {
    if (!this.canShowPhoneNotification()) {
      return;
    }

    this.stopMiniIncomingAlert();
    this.closeMiniConnectedNotification();

    const context = this.headerCallContexts.get(lineIndex);
    this.miniConnectedNotification = new Notification('تماس برقرار شد', {
      body: this.notificationBody(context),
      tag: 'kowsar-webphone-connected',
      requireInteraction: false,
      silent: true,
      dir: 'rtl'
    } as NotificationOptions & { requireInteraction?: boolean });

    this.miniConnectedNotification.onclick = () => {
      window.focus();
      this.zone.run(() => this.openPhonePage());
      this.closeMiniConnectedNotification();
    };

    this.miniConnectedNotificationTimer = setTimeout(() => {
      this.closeMiniConnectedNotification();
    }, 8000);
  }

  private closeMiniConnectedNotification(): void {
    if (this.miniConnectedNotificationTimer) {
      clearTimeout(this.miniConnectedNotificationTimer);
      this.miniConnectedNotificationTimer = null;
    }

    if (this.miniConnectedNotification) {
      this.miniConnectedNotification.close();
      this.miniConnectedNotification = null;
    }
  }

}
