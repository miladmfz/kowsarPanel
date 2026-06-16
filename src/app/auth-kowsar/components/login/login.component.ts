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
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],

})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;

  isLoading = signal(false);
  showPassword = signal(false);

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly repo = inject(AuthKowsarWebApiService);
  private readonly config = inject(AppConfigService);
  private readonly swal = inject(SwalService);
  private readonly notificationService = inject(NotificationService);
  protected readonly session = inject(SessionStorageService);
  ngOnInit(): void {
    this.buildForm();

    if (this.config.apiUrl === 'http://192.168.1.27:60006/api/') {
      this.autoLogin();
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
  private buildForm(): void {
    this.loginForm = this.fb.group({
      UserType: ['CUSTOMER', Validators.required],
      UName: ['', Validators.required],
      UPass: ['', Validators.required],
      DepartmentCode: [1],

    });
  }

  private autoLogin(): void {
    // اگر خواستی یکی از setValue ها رو فعال کنی، چون UserType اضافه شده،
    // بهتره از patchValue استفاده کنی تا مجبور نشی همه فیلدها رو ست کنی.

    //this.loginForm.patchValue({ UName: 'mfz', UPass: '09350935' });


    //this.loginForm.patchValue({ UName: 'بختیاری', UPass: '123456' });
    //this.loginForm.patchValue({ UName: 'userqoq1', UPass: '123456' });
    ///this.loginForm.patchValue({ UName: 'userqoq2', UPass: '123456' });
    ///this.loginForm.patchValue({ UName: 'userqoq3', UPass: '123456' });

    ///this.loginForm.patchValue({ UName: 'خسروی', UPass: '123456' }); ////   474525

    // this.loginForm.patchValue({ UName: 'سیروس', UPass: '123456' });  

    // this.loginForm.patchValue({ UName: 'sadeghzade', UPass: '53568286' });

    this.submit();
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
      case 'KOWSAR':
        this.loginKowsar(payload);
        break;

      case 'CUSTOMER':
        this.loginCustomer(payload);
        break;

      default:
        this.isLoading.set(false);
        this.swal.error('نوع کاربر نامعتبر است');
        break;
    }
  }

  private loginKowsar(payload: any): void {

    this.repo.KowsarLogin(payload).subscribe({
      next: (data: any) => {
        this.handleLoginSuccess(data)

      },
      error: err => {
        this.isLoading.set(false);
        this.handleLoginError(err)
      },
    });


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

  private handleLoginSuccess(data: any): void {
    this.isLoading.set(false);

    const user = data?.users?.[0];

    if (!user) {
      this.swal.error('اطلاعات کاربر دریافت نشد');
      this.loginForm.reset({ UserType: 'CUSTOMER' });
      return;
    }

    const loginType = String(user.LoginType || this.userType).trim().toUpperCase();

    const isKowsarLogin = loginType === 'KOWSAR';
    const isXUserLogin = loginType === 'CUSTOMER';

    const errCode = String(user.ErrCode ?? '-1').trim();

    if (errCode !== '0') {
      this.swal.error(user.ErrDesc || user.Message || 'ورود ناموفق بود');
      this.loginForm.reset({ UserType: loginType as UserType });
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
      this.loginForm.reset({ UserType: 'CUSTOMER' });
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
