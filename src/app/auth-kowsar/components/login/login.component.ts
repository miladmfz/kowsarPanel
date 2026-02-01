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
  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(AuthKowsarWebApiService);
  private readonly config = inject(AppConfigService);
  private readonly swal = inject(SwalService);

  ngOnInit(): void {
    this.buildForm();

    if (this.config.apiUrl === 'http://192.168.1.25:60006/api/') {
      this.autoLogin();
    }
  }

  // -------------------------------
  // Form
  // -------------------------------
  private buildForm(): void {
    this.loginForm = this.fb.group({
      UName: ['', Validators.required],
      UPass: ['', Validators.required],
    });
  }

  private autoLogin(): void {

    ///this.loginForm.setValue({ UName: 'mfz', UPass: '123456' });

    //this.loginForm.setValue({ UName: 'بختیاری', UPass: '123456' });

    this.loginForm.setValue({ UName: 'خسروی', UPass: '123456' });

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
      this.swal.warning('لطفاً نام کاربری و رمز عبور را وارد کنید');
      return;
    }

    this.isLoading.set(true);

    this.loadingService.show()
    this.repo.IsUser(this.loginForm.value).subscribe({
      next: (data: any) => {
        this.handleLoginSuccess(data)
        this.loadingService.hide()
      },
      error: err => this.handleLoginError(err),
    });
  }

  private handleLoginSuccess(data: any): void {

    this.isLoading.set(false);

    const user = data?.users?.[0];

    if (!user || user.ErrCode !== '0') {
      this.swal.error(user?.ErrDesc || 'ورود ناموفق بود');
      this.loginForm.reset();
      return;
    }

    this.storeUserSession(user);

    this.router.navigate(['/dashboard']);
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


  }

}
