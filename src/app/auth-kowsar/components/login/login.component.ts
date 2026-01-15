import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthKowsarWebApiService } from '../../services/AuthKowsarWebApi.service';
import { AppConfigService } from 'src/app/app-config.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { SwalService } from 'src/app/app-shell/framework-services/ui/swal.service';

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
  private readonly loading = inject(LoadingService);
  private readonly swal = inject(SwalService);

  constructor() { }

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      UName: ['', Validators.required],
      UPass: ['', Validators.required],
    });
    if (this.config.apiUrl === 'http://192.168.1.25:60006/api/') {
      this.autoLogin();
    }
  }

  /** 🔹 پر کردن خودکار فرم برای توسعه */
  private autoLogin(): void {

    this.loginForm.setValue({ UName: 'mfz', UPass: '123456' });

    // this.loginForm.setValue({ UName: 'بختیاری', UPass: '123456' });

    ///this.loginForm.setValue({ UName: 'خسروی', UPass: '123456' });

    // this.loginForm.setValue({ UName: 'سیروس', UPass: '123456' });

    // this.loginForm.setValue({ UName: 'sadeghzade', UPass: '53568286' });

    this.submit();
  }

  /**   نمایش یا مخفی‌کردن رمز عبور */
  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  /** 🚀 ارسال فرم لاگین */
  submit(): void {

    if (this.loginForm.invalid) {
      this.swal.warning('لطفاً نام کاربری و رمز عبور را وارد کنید');
      return;
    }

    this.isLoading.set(true);
    const command = this.loginForm.value;

    this.repo.IsUser(command).subscribe({
      next: (data: any) => {
        this.isLoading.set(false);
        const user = data.users?.[0];

        if (!user || user.ErrCode !== '0') {
          this.swal.error(user?.ErrDesc || 'ورود ناموفق بود');
          this.loginForm.reset();
          return;
        }

        //   ذخیره اطلاعات کاربر
        Object.keys(user).forEach(key => {
          sessionStorage.setItem(key, user[key]);
          sessionStorage.setItem("ActiveSession", user.ActiveDate);

        });

        this.router.navigate(['/dashboard']);
        // ⏱️ ثبت حضور اگر JobPersonRef وجود دارد
        // if (user.JobPersonRef) {
        //   this.markAttendance(user.CentralRef);
        // } else {
        // this.router.navigate(['/dashboard']);
        // }
      },
      error: (err) => {
        this.isLoading.set(false);
        console.error('Login error:', err);
        this.swal.error('خطا در ارتباط با سرور');
      },
    });
  }

  /** ⏱️ ارسال وضعیت حضور */
  private markAttendance(CentralRef: string): void {

    const command = { CentralRef, Status: '1' };
    this.repo.ManualAttendance(command).subscribe({
      next: () => this.router.navigate(['/dashboard']),
    });
  }
}
