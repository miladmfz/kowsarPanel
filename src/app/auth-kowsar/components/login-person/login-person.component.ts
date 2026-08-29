import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthKowsarWebApiService } from '../../services/AuthKowsarWebApi.service';
import { AppConfigService } from 'src/app/app-config.service';
import { SwalService } from 'src/app/app-shell/framework-services/ui/swal.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
type UserType = 'KOWSAR' | 'CUSTOMER';


@Component({
  selector: 'app-login-person',
  templateUrl: './login-person.component.html',
  styleUrls: ['./login-person.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginPersonComponent implements OnInit {
  loginForm!: FormGroup;

  isLoading = signal(false);
  showPassword = signal(false);
  showAutoLoginBanner = signal(false);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly repo = inject(AuthKowsarWebApiService);
  private readonly config = inject(AppConfigService);
  private readonly swal = inject(SwalService);
  private readonly notificationService = inject(NotificationService);
  protected readonly session = inject(SessionStorageService);
  ngOnInit(): void {
    localStorage.setItem('UserTypeLogin', "CUSTOMER")

    this.buildForm();


    if (this.config.apiUrl === 'http://192.168.1.27:60007/api/') {

      console.log('🚀 AutoLogin triggered (DEV MODE)');

      this.showAutoLoginBanner.set(true)

      //this.autoLogin();

    }


  }

  // -------------------------------
  // UI helpers (ظاهر متفاوت)
  // -------------------------------
  get userType(): UserType {
    return (this.loginForm?.get('UserType')?.value as UserType) || 'KOWSAR';
  }

  get isKowsar(): boolean {
    return this.userType === 'KOWSAR';
  }

  // -------------------------------
  // Form
  // -------------------------------

  loginauto(): void {
    this.loginForm.patchValue({ UName: 'بختیاری', UPass: 'Aa@123456' });
    this.submit();
  }



  gokowsarlogin(): void {

    this.router.navigate(['/auth/login-kowsar']);

  }
  goBackToSite(): void {
    window.location.href = 'https://kits.ir';
  }
  private kowsarLoginClickCount = 0;
  private kowsarLoginClickTimer: any = null;

  onKowsarLoginIconClick(): void {

    this.kowsarLoginClickCount++;

    if (this.kowsarLoginClickTimer) {
      clearTimeout(this.kowsarLoginClickTimer);
    }

    this.kowsarLoginClickTimer = setTimeout(() => {
      this.kowsarLoginClickCount = 0;
    }, 1200);

    if (this.kowsarLoginClickCount >= 5) {

      this.kowsarLoginClickCount = 0;

      if (this.kowsarLoginClickTimer) {
        clearTimeout(this.kowsarLoginClickTimer);
        this.kowsarLoginClickTimer = null;
      }

      this.gokowsarlogin();
    }

  }
  private buildForm(): void {


    this.loginForm = this.fb.group({
      UserType: [localStorage.getItem('UserTypeLogin') || 'CUSTOMER', Validators.required],
      UName: ['', Validators.required],
      UPass: ['', Validators.required],
      DepartmentCode: [1],

    });
    // 2. listen تغییرات فرم
    this.loginForm.get('UserType')?.valueChanges.subscribe(value => {

      if (value) {
        localStorage.setItem('UserTypeLogin', value);
        this.reset_LoginForm()
      }

    });
  }



  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  // -------------------------------
  // Login
  // -------------------------------
  submit(): void {
    if (this.loginForm.invalid) {
      this.swal.warning('لطفاً نوع کاربر، نام کاربری و رمز عبور را وارد کنید');
      return;
    }
    this.loginForm.patchValue({
      DepartmentCode: 1,
    });
    this.isLoading.set(true);

    const payload = this.loginForm.value;

    // switch-case برای کال کردن API متفاوت
    switch (payload.UserType as UserType) {

      case 'CUSTOMER':
        this.loginCustomer(payload);
        break;

      default:
        this.isLoading.set(false);
        this.swal.error('نوع کاربر نامعتبر است');
        break;
    }
  }


  private loginCustomer(payload: any): void {
    this.repo.IsUser(payload).subscribe({
      next: (data: any) => {
        this.isLoading.set(false);
        this.loginResultData = data;

        const user = data?.users?.[0];

        const encodedCode = data?.users?.[0]?.RandomeCode;
        const realCode = this.decodeBase64(encodedCode);


        if (user?.AuthSms == "True" && user?.RandomeCode) {
          this.smsCodeFromServer = realCode;
          this.smsConfirmVisible = true;
          return;
        }

        this.handleLoginSuccess(data);
      },
      error: err => {
        this.isLoading.set(false);
        this.handleLoginError(err);
      },
    });
  }

  //////////////////////////////////

  loginResultData: any = null;

  smsConfirmVisible = false;
  smsCodeFromServer: string | null = null;

  smsForm = this.fb.group({
    ConfirmCode: ['', [Validators.required, Validators.minLength(4)]],
  });

  confirmSmsCode(): void {
    if (this.smsForm.invalid) {
      this.smsForm.markAllAsTouched();
      return;
    }

    const userCode = this.smsForm.value.ConfirmCode;

    if (userCode === this.smsCodeFromServer) {
      this.handleLoginSuccess(this.loginResultData);
      console.log('SMS code confirmed');
    } else {
      this.smsForm.controls['ConfirmCode'].setErrors({ wrongCode: true });
    }
  }
  private decodeBase64(value: string): string {
    try {
      return decodeURIComponent(
        Array.prototype.map.call(atob(value), (c: string) =>
          '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
        ).join('')
      );
    } catch {
      return '';
    }
  }
  ///////////////////////////
  private reset_LoginForm(): void {
    this.loginForm.reset(
      {
        UserType: localStorage.getItem('UserTypeLogin') || 'CUSTOMER',
        UName: "",
        UPass: "",
        DepartmentCode: 1,
      });
  }


  private handleLoginSuccess(data: any): void {
    this.isLoading.set(false);

    const user = data?.users?.[0];

    if (!user) {
      this.swal.error('اطلاعات کاربر دریافت نشد');
      this.reset_LoginForm()
      return;
    }

    const loginType = String(user.LoginType || this.userType).trim().toUpperCase();

    const isKowsarLogin = loginType === 'KOWSAR';
    const isXUserLogin = loginType === 'CUSTOMER';

    const errCode = String(user.ErrCode ?? '-1').trim();

    if (errCode !== '0') {
      this.swal.error(user.ErrDesc || user.Message || 'ورود ناموفق بود');
      this.reset_LoginForm()
      return;
    }

    this.storeNormalizedUserSession(user, isKowsarLogin, isXUserLogin);

    const needChangePassword = String(user.NeedChangePassword ?? '0').trim();

    if (needChangePassword === '1' || needChangePassword.toLowerCase() === 'true') {
      this.router.navigate(['/auth/change-password']);
      return;
    }
    const centralRef = user.CentralRef || this.session.centralRef;

    this.repo.CentralPermission(centralRef).subscribe({
      next: (permissionData: any) => {
        const permissions = permissionData?.permissions || permissionData?.Permissions || [];

        const permissionKeys = [
          ...new Set(
            permissions
              .map((x: any) => x.PermissionKey)
              .filter((x: any) => !!x)
          )
        ];

        const roleNames = [
          ...new Set(
            permissions
              .map((x: any) => x.RoleName)
              .filter((x: any) => !!x)
          )
        ];

        this.session.setItem('Permissions', JSON.stringify(permissions));
        this.session.setItem('PermissionKeys', JSON.stringify(permissionKeys));
        this.session.setItem('RoleNames', JSON.stringify(roleNames));

        this.router.navigate(['/dashboard']);
      },

      error: err => {
        console.error('CentralPermission error:', err);

        this.session.setItem('Permissions', JSON.stringify([]));
        this.session.setItem('PermissionKeys', JSON.stringify([]));
        this.session.setItem('RoleNames', JSON.stringify([]));

        this.router.navigate(['/dashboard']);
      }
    });



  }
  private getCurrentBasePath(): string {
    const segments = window.location.pathname
      .split('/')
      .filter(Boolean);

    return segments.length > 0
      ? `/${segments[0].toLowerCase()}`
      : '/';
  }

  private getCurrentAppKey(): string {
    return `${window.location.hostname}${this.getCurrentBasePath()}`.toLowerCase();
  }

  private storeNormalizedUserSession(user: any, isKowsarLogin: boolean, isXUserLogin: boolean): void {
    const appKey = this.getCurrentAppKey();
    const loginType = user.LoginType || (isKowsarLogin ? 'KOWSAR' : 'CUSTOMER');
    console.log(user)
    const normalizedUser = {
      LoginType: loginType,
      AppKey: appKey,
      HostName: window.location.hostname,
      BasePath: this.getCurrentBasePath(),
      UserId: isKowsarLogin
        ? (user.UserId || '1')
        : '1',

      OldUserId: user.OldUserId || '',
      CentralRef: user.CentralRef || '',
      CentralName: user.CentralName || '',
      UserName: user.UserName || '',
      DisplayName: user.DisplayName || user.UserPrintName || user.PhFullName || user.BrokerName || user.UserName || '',
      UserPrintName: user.UserPrintName || '',
      Active: user.Active || user.Success || '',
      DepartmentCode: user.DepartmentCode || '',
      DepartmentName: user.DepartmentName || '',
      NeedChangePassword: user.NeedChangePassword || 'False',
      UserMaxDiscount: user.UserMaxDiscount || '0',
      UserIdRef: user.UserIdRef || '',
      XUserCode: user.XUserCode || '',
      CustomerCode: user.CustomerCode || '',
      CustName_Small: user.CustName_Small || '',
      Explain: user.Explain || '',
      PersonInfoRef: user.PersonInfoRef || '',
      PhFullName: user.PhFullName || '',
      SessionId: user.SessionId || '',
      ActiveDate: user.ActiveDate || '',
      IsAdminUser: user.IsAdminUser || '',
      Message: user.Message || user.ErrDesc || '',
      ErrCode: user.ErrCode || '0'
    };

    Object.keys(normalizedUser).forEach(key => {
      this.session.setItem(key, String((normalizedUser as any)[key]));
    });

    this.session.setItem('CurrentUser', JSON.stringify(normalizedUser));
    this.session.setItem('RawUser', JSON.stringify(user));
  }


  private handleLoginSuccess1(data: any): void {
    this.isLoading.set(false);

    const user = data?.users?.[0];

    if (!user || user.ErrCode !== '0') {
      this.swal.error(user?.ErrDesc || 'ورود ناموفق بود');
      this.reset_LoginForm()
      return;
    }

    this.storeUserSession(user);




    if (user.Userid && user.UserId.length > 0) {
      this.session.setItem('UserId', user.Userid);
    } else {
      this.session.setItem('UserId', "1");
    }


    // مسیر متفاوت (اختیاری)
    if (this.userType === 'KOWSAR') {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  private handleLoginError(error: any): void {
    this.isLoading.set(false);
    console.error('Login error:', error);
    this.swal.error('خطا در ارتباط با سرور');
    this.reset_LoginForm()
  }

  // -------------------------------
  // Session
  // -------------------------------
  private storeUserSession(user: any): void {
    Object.keys(user).forEach(key => {
      this.session.setItem(key, String(user[key]));
    });

    // این یکی هم مفید است که نوع کاربر را هم نگه داری
    this.session.setItem('UserType', this.userType);


  }


  glowX: number = -500;

  glowY: number = -500;

  particles: any[] = [];

  particleId: number = 0;

  lastParticleTime: number = 0;

  onLoginButtonPointerMove(event: PointerEvent): void {

    const rect =
      (event.currentTarget as HTMLElement)
        .getBoundingClientRect();

    this.glowX =
      event.clientX - rect.left;

    this.glowY =
      event.clientY - rect.top;

    const now =
      Date.now();

    if (now - this.lastParticleTime > 55) {

      this.lastParticleTime = now;

      this.createLoginButtonParticle();
    }
  }

  onLoginButtonPointerLeave(): void {

    this.glowX = -500;

    this.glowY = -500;
  }

  createLoginButtonParticle(): void {

    const particle = {

      id: this.particleId++,

      x: this.glowX + ((Math.random() - 0.5) * 42),

      y: this.glowY + ((Math.random() - 0.5) * 42),

      size: 5 + Math.random() * 8,

      delay: Math.random() * 0.15
    };

    this.particles = [
      ...this.particles,
      particle
    ];

    setTimeout(() => {

      this.particles =
        this.particles.filter(p =>
          p.id !== particle.id
        );

    }, 1200);
  }
}
