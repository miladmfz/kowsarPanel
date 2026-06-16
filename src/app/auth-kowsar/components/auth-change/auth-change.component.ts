import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

@Component({
  selector: 'app-auth-change',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './auth-change.component.html',
  styleUrls: ['./auth-change.component.css'],
})
export class AuthChangeComponent {

  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  protected readonly session = inject(SessionStorageService);
  protected readonly base_repo = inject(KowsarBaseWebApi);
  protected readonly notificationService = inject(NotificationService);



  isSavingChangePass = signal(false);

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  phFullName = signal(this.session.getItem('PhFullName') || '');
  userName = signal(this.session.getItem('UserName') || '');

  changePassForm = this.fb.group(
    {
      UPass: ['', [Validators.required]],
      UNewPass: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: this.passwordMatchValidator
    }
  );
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
  submitChangePassword(): void {
    if (this.changePassForm.invalid) {
      this.changePassForm.markAllAsTouched();
      return;
    }

    this.isSavingChangePass.set(true);

    const payload = {
      UName: this.session.userName,
      UPass: this.changePassForm.value.UPass,
      UNewPass: this.changePassForm.value.UNewPass,
    };

    this.base_repo.ChangeXUserPassword(payload).subscribe({
      next: (data: any) => {
        const user = data?.users?.[0];

        if (!user) {
          this.notificationService.error('پاسخ معتبر از سرور دریافت نشد');
          this.isSavingChangePass.set(false);
          return;
        }

        const errDesc = String(user.ErrDesc || '').trim();

        if (errDesc.length > 0) {
          this.notificationService.error(errDesc);
          this.isSavingChangePass.set(false);
          return;
        }

        this.notificationService.succeded();

        sessionStorage.clear();

        this.router.navigate(['/auth/login']);
      },

      error: () => {
        this.notificationService.error('خطا در تغییر رمز عبور');
        this.isSavingChangePass.set(false);
      },
    });
  }
  isInvalid(controlName: string): boolean {
    const control = this.changePassForm.get(controlName);

    return !!control && control.invalid && (control.dirty || control.touched);
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update(x => !x);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update(x => !x);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(x => !x);
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const newPass = control.get('UNewPass')?.value;
    const confirmPass = control.get('confirmPassword')?.value;

    if (!newPass || !confirmPass) {
      return null;
    }

    return newPass === confirmPass
      ? null
      : { passwordMismatch: true };
  }
}