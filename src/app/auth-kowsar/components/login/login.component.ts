import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthKowsarWebApiService } from '../../services/AuthKowsarWebApi.service';
import { AppConfigService } from 'src/app/app-config.service';
import { SwalService } from 'src/app/app-shell/framework-services/ui/swal.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

type UserType = 'KOWSAR' | 'CUSTOMER';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
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

  ngOnInit(): void {
    this.buildForm();

    if (this.config.apiUrl === 'http://192.168.1.25:60006/api/') {
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
    });
  }

  private autoLogin(): void {
    // اگر خواستی یکی از setValue ها رو فعال کنی، چون UserType اضافه شده،
    // بهتره از patchValue استفاده کنی تا مجبور نشی همه فیلدها رو ست کنی.

    this.loginForm.patchValue({ UName: 'mfz', UPass: '123456' });


    //this.loginForm.setValue({ UName: 'بختیاری', UPass: '123456' });

    // this.loginForm.setValue({ UName: 'خسروی', UPass: '123456' });

    // this.loginForm.setValue({ UName: 'سیروس', UPass: '123456' });

    // this.loginForm.setValue({ UName: 'sadeghzade', UPass: '53568286' });

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
    this.isLoading.set(false);
    this.notificationService.warning("فعلا این بخش غیر فعال می باشد.");

  }

  private loginCustomer(payload: any): void {

    this.repo.IsUser(payload).subscribe({
      next: (data: any) => {
        this.handleLoginSuccess(data)

      },
      error: err => {
        this.isLoading.set(false);
        this.handleLoginError(err)
      },
    });
  }

  private handleLoginSuccess(data: any): void {
    this.isLoading.set(false);

    const user = data?.users?.[0];

    if (!user || user.ErrCode !== '0') {
      this.swal.error(user?.ErrDesc || 'ورود ناموفق بود');
      this.loginForm.reset({ UserType: 'CUSTOMER' });
      return;
    }

    this.storeUserSession(user);

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
      sessionStorage.setItem(key, String(user[key]));
    });

    // این یکی هم مفید است که نوع کاربر را هم نگه داری
    sessionStorage.setItem('UserType', this.userType);
  }
}
