import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { AuthTokenService } from 'src/app/auth-kowsar/services/auth-token.service';
import { AutletterWebApiService } from 'src/app/features/automation/services/AutletterWebApi.service';
import { AutletterInsertGuestComponent } from './autletter-insert-guest.component';

describe('AutletterInsertGuestComponent', () => {
  let fixture: ComponentFixture<AutletterInsertGuestComponent>;
  let component: AutletterInsertGuestComponent;
  let repo: jasmine.SpyObj<AutletterWebApiService>;
  let authToken: jasmine.SpyObj<AuthTokenService>;
  let notification: jasmine.SpyObj<NotificationService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    repo = jasmine.createSpyObj<AutletterWebApiService>('AutletterWebApiService', [
      'GuestTicketCreate',
    ]);
    authToken = jasmine.createSpyObj<AuthTokenService>('AuthTokenService', ['logout']);
    notification = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'success',
      'error',
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);
    authToken.logout.and.returnValue(of(undefined));

    await TestBed.configureTestingModule({
      imports: [AutletterInsertGuestComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AutletterWebApiService, useValue: repo },
        { provide: AuthTokenService, useValue: authToken },
        { provide: NotificationService, useValue: notification },
        { provide: Router, useValue: router },
        { provide: SessionStorageService, useValue: { userName: '09127188872' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AutletterInsertGuestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('shows the verified mobile from the guest session', () => {
    expect(component.mobile).toBe('09127188872');
    expect(fixture.nativeElement.textContent).toContain('09127188872');
  });

  it('does not submit an invalid ticket', () => {
    component.submit();

    expect(repo.GuestTicketCreate).not.toHaveBeenCalled();
    expect(component.ticketForm.controls.guestName.touched).toBeTrue();
    expect(component.ticketForm.controls.title.touched).toBeTrue();
    expect(component.ticketForm.controls.description.touched).toBeTrue();
  });

  it('submits the guest name, title and description and exposes the tracking code', () => {
    repo.GuestTicketCreate.and.returnValue(
      of({ AutLetters: [{ LetterCode: 8123 }] }),
    );
    component.ticketForm.setValue({
      guestName: 'متین اصلو',
      title: 'درخواست راهنمایی',
      description: 'شرح درخواست مهمان',
    });

    component.submit();

    expect(repo.GuestTicketCreate).toHaveBeenCalledOnceWith({
      guestName: 'متین اصلو',
      title: 'درخواست راهنمایی',
      description: 'شرح درخواست مهمان',
    });
    expect(component.createdLetterCode()).toBe('8123');
    expect(component.submitting()).toBeFalse();
    expect(notification.success).toHaveBeenCalled();
    expect(component.ticketForm.getRawValue()).toEqual({
      guestName: '',
      title: '',
      description: '',
    });
  });

  it('keeps the form data and reports a controlled submission error', () => {
    repo.GuestTicketCreate.and.returnValue(
      throwError(() => new Error('network')),
    );
    component.ticketForm.setValue({
      guestName: 'متین اصلو',
      title: 'عنوان',
      description: 'شرح',
    });

    component.submit();

    expect(component.submitting()).toBeFalse();
    expect(component.ticketForm.getRawValue()).toEqual({
      guestName: 'متین اصلو',
      title: 'عنوان',
      description: 'شرح',
    });
    expect(notification.error).toHaveBeenCalledOnceWith(
      'ثبت تیکت انجام نشد. لطفاً دوباره تلاش کنید.',
    );
  });

  it('logs out and returns to guest login', () => {
    component.logout();

    expect(authToken.logout).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/auth/guest-login']);
  });
});
