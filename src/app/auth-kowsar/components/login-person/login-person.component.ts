import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthKowsarWebApiService } from '../../services/AuthKowsarWebApi.service';
import { AppConfigService } from 'src/app/app-config.service';
import { SwalService } from 'src/app/app-shell/framework-services/ui/swal.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import {
  AuthLoginRequest,
  AuthUserRecord,
  CustomerLoginResponse,
  LoginResponse,
  NormalizedAuthUser,
} from '../../auth-api.models';
import { AuthSessionService } from '../../services/auth-session.service';
type UserType = 'KOWSAR' | 'CUSTOMER';

interface LoginParticle {
  id: number;
  x: number;
  y: number;
  size: number;
  delay: number;
}


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
  private readonly authSession = inject(AuthSessionService);
  protected readonly session = inject(SessionStorageService);
  ngOnInit(): void {
    localStorage.setItem('UserTypeLogin', "CUSTOMER")

    this.buildForm();


    if (this.config.apiUrl === 'http://192.168.1.27:60007/api/') {

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

  goGuestLogin(): void {
    this.router.navigate(['/auth/guest-login']);
  }
  goBackToSite(): void {
    window.location.href = 'https://kits.ir';
  }
  private kowsarLoginClickCount = 0;
  private kowsarLoginClickTimer: ReturnType<typeof setTimeout> | null = null;

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


  private loginCustomer(payload: AuthLoginRequest): void {
    this.repo.IsUser(payload).subscribe({
      next: (data: CustomerLoginResponse) => {
        this.isLoading.set(false);
        if ('requiresOtp' in data) {
          if (data.requiresOtp && data.challengeId) {
            this.otpChallengeId = String(data.challengeId);
            this.smsConfirmVisible = true;
          }
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

  smsConfirmVisible = false;
  otpChallengeId: string | null = null;

  smsForm = this.fb.group({
    ConfirmCode: ['', [Validators.required, Validators.minLength(4)]],
  });

  confirmSmsCode(): void {
    if (this.smsForm.invalid) {
      this.smsForm.markAllAsTouched();
      return;
    }

    const code = String(this.smsForm.value.ConfirmCode ?? '');
    if (!this.otpChallengeId) return;

    this.repo.VerifyOtp(this.otpChallengeId, code).subscribe({
      next: data => {
        this.smsConfirmVisible = false;
        this.otpChallengeId = null;
        this.handleLoginSuccess(data);
      },
      error: () => this.smsForm.controls['ConfirmCode'].setErrors({ wrongCode: true }),
    });
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


  private handleLoginSuccess(data: LoginResponse): void {
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

    this.authSession.storeLogin(data, user, isKowsarLogin);

    const needChangePassword = String(user.NeedChangePassword ?? '0').trim();

    if (needChangePassword === '1' || needChangePassword.toLowerCase() === 'true') {
      this.router.navigate(['/auth/change-password']);
      return;
    }
    const centralRef = user.CentralRef || this.session.centralRef;

    this.repo.CentralPermission(String(centralRef)).subscribe({
      next: permissionData => {
        this.authSession.storePermissions(permissionData);
        this.router.navigate(['/dashboard']);
      },

      error: () => {
        this.authSession.clearPermissions();
        this.router.navigate(['/dashboard']);
      }
    });



  }
  private handleLoginError(_error: unknown): void {
    this.isLoading.set(false);
    this.swal.error('خطا در ارتباط با سرور');
    this.reset_LoginForm()
  }


  glowX: number = -500;

  glowY: number = -500;

  particles: LoginParticle[] = [];

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
