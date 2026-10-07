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
  selector: 'app-login-kowsar',
  templateUrl: './login-kowsar.component.html',
  styleUrls: ['./login-kowsar.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
})
export class LoginKowsarComponent implements OnInit {
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

    localStorage.setItem('UserTypeLogin', "KOWSAR")

    this.buildForm();


    if (this.config.apiUrl === 'http://192.168.1.27:60007/api/') {

      this.showAutoLoginBanner.set(true)


    }
  }


  loginsadeghzade(): void {
    this.loginForm.patchValue({ UName: 'صادق زاده', UPass: '123456' });
    this.submit();
  }

  loginmfz(): void {
    this.loginForm.patchValue({ UName: '005', UPass: '005' });
    this.submit();
  }
  loginkhosravi(): void {
    this.loginForm.patchValue({ UName: 'آقای خسروی', UPass: '123' });
    this.submit();
  }


  get userType(): UserType {
    return (this.loginForm?.get('UserType')?.value as UserType) || 'KOWSAR';
  }

  get isKowsar(): boolean {
    return this.userType === 'KOWSAR';
  }

  gopersonlogin(): void {
    localStorage.setItem('UserTypeLogin', "CUSTOMER")

    this.router.navigate(['/auth/login-person']);
  }


  private buildForm(): void {


    this.loginForm = this.fb.group({
      UserType: [localStorage.getItem('UserTypeLogin') || 'KOWSAR', Validators.required],
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

      default:
        this.isLoading.set(false);
        this.swal.error('نوع کاربر نامعتبر است');
        break;
    }
  }

  private loginKowsar(payload: AuthLoginRequest): void {

    this.repo.KowsarLogin(payload).subscribe({
      next: (data: LoginResponse) => {
        this.handleLoginSuccess(data)

      },
      error: err => {
        this.isLoading.set(false);
        this.handleLoginError(err)
      },
    });


  }


  smsConfirmVisible = false;

  smsForm = this.fb.group({
    ConfirmCode: ['', [Validators.required, Validators.minLength(4)]],
  });

  private reset_LoginForm(): void {
    this.loginForm.reset(
      {
        UserType: localStorage.getItem('UserTypeLogin') || 'KOWSAR',
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
