import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthKowsarWebApiService } from '../../services/AuthKowsarWebApi.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { AppConfigService } from 'src/app/app-config.service';

@Component({
  selector: 'app-guest-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './guest-login.component.html',
  styleUrls: [
    '../login-person/login-person.component.css',
    './guest-login.component.css',
  ],
})
export class GuestLoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(AuthKowsarWebApiService);
  private readonly authSession = inject(AuthSessionService);
  private readonly router = inject(Router);
  private readonly config = inject(AppConfigService);
  private readonly codeInput = viewChild<ElementRef<HTMLInputElement>>('codeInput');

  readonly step = signal<'mobile' | 'code'>('mobile');
  readonly loading = signal(false);
  readonly errorMessage = signal('');
  readonly expiresAt = signal<string | null>(null);
  readonly isDevelopment = !this.config.all.production;
  private challengeId: string | null = null;

  readonly mobileForm = this.fb.nonNullable.group({
    mobile: ['', [Validators.required, Validators.pattern(/^09\d{9}$/)]],
  });

  readonly codeForm = this.fb.nonNullable.group({
    code: ['', [Validators.required, Validators.pattern(/^\d{4,8}$/)]],
  });

  requestCode(): void {
    if (this.mobileForm.invalid || this.loading()) {
      this.mobileForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.api.RequestGuestOtp({ mobile: this.mobileForm.controls.mobile.value }).subscribe({
      next: response => {
        this.challengeId = response.challengeId;
        this.expiresAt.set(response.expiresAt);
        this.codeForm.reset({
          code: this.isDevelopment ? response.developmentCode ?? '' : '',
        });
        this.step.set('code');
        this.loading.set(false);
        setTimeout(() => this.codeInput()?.nativeElement.focus());
      },
      error: error => {
        this.errorMessage.set(this.readError(error, 'ارسال کد تأیید انجام نشد.'));
        this.loading.set(false);
      },
    });
  }

  verifyCode(): void {
    if (this.codeForm.invalid || !this.challengeId || this.loading()) {
      this.codeForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.api.VerifyGuestOtp(this.challengeId, this.codeForm.controls.code.value).subscribe({
      next: response => {
        const user = response.users?.[0];
        if (!user || String(user.LoginType).toUpperCase() !== 'GUEST' || !response.auth?.accessToken) {
          this.errorMessage.set('پاسخ ورود مهمان معتبر نیست.');
          this.loading.set(false);
          return;
        }

        this.authSession.storeLogin(response, user, false);
        this.authSession.clearPermissions();
        void this.router.navigate(['/guest/ticket']);
      },
      error: error => {
        this.errorMessage.set(this.readError(error, 'کد تأیید نامعتبر یا منقضی است.'));
        this.loading.set(false);
      },
    });
  }

  editMobile(): void {
    this.challengeId = null;
    this.expiresAt.set(null);
    this.errorMessage.set('');
    this.codeForm.reset();
    this.step.set('mobile');
  }

  backToCustomerLogin(): void {
    void this.router.navigate(['/auth/login-person']);
  }

  private readError(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;
      if (typeof message === 'string' && message.trim()) return message;
    }
    return fallback;
  }
}
