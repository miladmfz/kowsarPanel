import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { AuthTokenService } from 'src/app/auth-kowsar/services/auth-token.service';
import { AutletterWebApiService } from 'src/app/features/automation/services/AutletterWebApi.service';

@Component({
  selector: 'app-autletter-insert-guest',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './autletter-insert-guest.component.html',
  styleUrls: ['./autletter-insert-guest.component.css'],
})
export class AutletterInsertGuestComponent {
  private readonly fb = inject(FormBuilder);
  private readonly repo = inject(AutletterWebApiService);
  private readonly session = inject(SessionStorageService);
  private readonly authToken = inject(AuthTokenService);
  private readonly notification = inject(NotificationService);
  private readonly router = inject(Router);

  readonly submitting = signal(false);
  readonly createdLetterCode = signal('');
  readonly mobile = this.session.userName;

  readonly ticketForm = this.fb.nonNullable.group({
    guestName: ['', [Validators.required, Validators.maxLength(80)]],
    title: ['', [Validators.required, Validators.maxLength(120)]],
    description: ['', [Validators.required, Validators.maxLength(4000)]],
  });

  submit(): void {
    if (this.ticketForm.invalid || this.submitting()) {
      this.ticketForm.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.createdLetterCode.set('');
    this.repo.GuestTicketCreate(this.ticketForm.getRawValue()).subscribe({
      next: response => {
        const letterCode = String(response.AutLetters?.[0]?.LetterCode ?? '').trim();
        this.submitting.set(false);
        if (!letterCode) {
          this.notification.error('پاسخ ثبت تیکت معتبر نیست.');
          return;
        }

        this.createdLetterCode.set(letterCode);
        this.ticketForm.reset();
        this.notification.success(`تیکت شماره ${letterCode} با موفقیت ثبت شد.`);
      },
      error: error => {
        this.submitting.set(false);
        this.notification.error(this.readError(error));
      },
    });
  }

  logout(): void {
    this.authToken.logout().subscribe(() => {
      void this.router.navigate(['/auth/guest-login']);
    });
  }

  private readError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      const message = error.error?.message;
      if (typeof message === 'string' && message.trim()) return message;
    }
    return 'ثبت تیکت انجام نشد. لطفاً دوباره تلاش کنید.';
  }
}
