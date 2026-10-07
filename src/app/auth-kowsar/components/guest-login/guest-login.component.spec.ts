import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AppConfigService } from 'src/app/app-config.service';
import { LoginResponse, OtpChallengeResponse } from '../../auth-api.models';
import { AuthKowsarWebApiService } from '../../services/AuthKowsarWebApi.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { GuestLoginComponent } from './guest-login.component';

describe('GuestLoginComponent', () => {
  let fixture: ComponentFixture<GuestLoginComponent>;
  let component: GuestLoginComponent;
  let api: jasmine.SpyObj<AuthKowsarWebApiService>;
  let authSession: jasmine.SpyObj<AuthSessionService>;
  let router: jasmine.SpyObj<Router>;

  const challenge: OtpChallengeResponse = {
    requiresOtp: true,
    challengeId: 'challenge-1',
    expiresAt: '2026-09-24T10:10:00Z',
    developmentCode: '246810',
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj<AuthKowsarWebApiService>(
      'AuthKowsarWebApiService',
      ['RequestGuestOtp', 'VerifyGuestOtp'],
    );
    authSession = jasmine.createSpyObj<AuthSessionService>('AuthSessionService', [
      'storeLogin',
      'clearPermissions',
    ]);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);

    const config = new AppConfigService();
    config.initialize({
      appVersion: 'test',
      production: false,
      apiUrl: 'http://localhost:60007/api/',
      baseHref: '/',
    });

    await TestBed.configureTestingModule({
      imports: [GuestLoginComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthKowsarWebApiService, useValue: api },
        { provide: AuthSessionService, useValue: authSession },
        { provide: Router, useValue: router },
        { provide: AppConfigService, useValue: config },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GuestLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('rejects an invalid mobile before calling the API', () => {
    component.mobileForm.controls.mobile.setValue('91234');

    component.requestCode();

    expect(api.RequestGuestOtp).not.toHaveBeenCalled();
    expect(component.mobileForm.controls.mobile.touched).toBeTrue();
  });

  it('moves from mobile to verification after a successful development challenge', async () => {
    api.RequestGuestOtp.and.returnValue(of(challenge));
    component.mobileForm.controls.mobile.setValue('09127188872');

    component.requestCode();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(api.RequestGuestOtp).toHaveBeenCalledOnceWith({ mobile: '09127188872' });
    expect(component.step()).toBe('code');
    expect(component.expiresAt()).toBe(challenge.expiresAt);
    expect(component.codeForm.controls.code.value).toBe('246810');
    expect(component.loading()).toBeFalse();
    expect(fixture.nativeElement.querySelector('#guest-code')).not.toBeNull();
  });

  it('stores the guest session and opens the guest ticket after verification', () => {
    const response: LoginResponse = {
      users: [{ LoginType: 'GUEST', UserName: '09127188872', ErrCode: 0 }],
      auth: {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        subject: 'GUEST:hash',
      },
    };
    api.RequestGuestOtp.and.returnValue(of(challenge));
    api.VerifyGuestOtp.and.returnValue(of(response));
    component.mobileForm.controls.mobile.setValue('09127188872');
    component.requestCode();
    component.codeForm.controls.code.setValue('246810');

    component.verifyCode();

    expect(api.VerifyGuestOtp).toHaveBeenCalledOnceWith('challenge-1', '246810');
    expect(authSession.storeLogin).toHaveBeenCalledWith(response, response.users![0], false);
    expect(authSession.clearPermissions).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/guest/ticket']);
  });

  it('keeps the verification step and shows a controlled error for an invalid code', () => {
    api.RequestGuestOtp.and.returnValue(of(challenge));
    api.VerifyGuestOtp.and.returnValue(throwError(() => new Error('unauthorized')));
    component.mobileForm.controls.mobile.setValue('09127188872');
    component.requestCode();
    component.codeForm.controls.code.setValue('111111');

    component.verifyCode();

    expect(component.step()).toBe('code');
    expect(component.loading()).toBeFalse();
    expect(component.errorMessage()).toContain('نامعتبر');
    expect(authSession.storeLogin).not.toHaveBeenCalled();
  });
});
