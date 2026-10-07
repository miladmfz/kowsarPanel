import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { SwalService } from 'src/app/app-shell/framework-services/ui/swal.service';
import {
  AUTH_LOGIN_RESPONSE_FIXTURE,
  CENTRAL_PERMISSION_RESPONSE_FIXTURE,
  OTP_CHALLENGE_RESPONSE_FIXTURE,
} from 'src/testing/fixtures/api-response.fixtures';
import { AuthKowsarWebApiService } from '../../services/AuthKowsarWebApi.service';
import { AuthSessionService } from '../../services/auth-session.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let component: LoginComponent;
  let repo: jasmine.SpyObj<AuthKowsarWebApiService>;
  let authSession: jasmine.SpyObj<AuthSessionService>;
  let router: jasmine.SpyObj<Router>;
  let swal: jasmine.SpyObj<SwalService>;

  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    repo = jasmine.createSpyObj<AuthKowsarWebApiService>(
      'AuthKowsarWebApiService',
      ['KowsarLogin', 'IsUser', 'VerifyOtp', 'CentralPermission'],
    );
    authSession = jasmine.createSpyObj<AuthSessionService>(
      'AuthSessionService',
      ['storeLogin', 'storePermissions', 'clearPermissions'],
    );
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.resolveTo(true);
    swal = jasmine.createSpyObj<SwalService>('SwalService', ['warning', 'error']);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: AuthKowsarWebApiService, useValue: repo },
        { provide: AuthSessionService, useValue: authSession },
        { provide: Router, useValue: router },
        { provide: SwalService, useValue: swal },
        {
          provide: AppConfigService,
          useValue: { apiUrl: 'https://api.example.test/api/' },
        },
        {
          provide: SessionStorageService,
          useValue: { centralRef: '3' },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('blocks an incomplete login form without calling the API', () => {
    component.submit();

    expect(swal.warning).toHaveBeenCalled();
    expect(repo.KowsarLogin).not.toHaveBeenCalled();
    expect(repo.IsUser).not.toHaveBeenCalled();
  });

  it('exposes the password visibility toggle to keyboard and assistive technology', () => {
    const toggle = fixture.nativeElement.querySelector('.kws-password-eye') as HTMLButtonElement;

    expect(toggle.tagName).toBe('BUTTON');
    expect(toggle.type).toBe('button');
    expect(toggle.getAttribute('aria-label')).toBe('نمایش رمز عبور');

    toggle.click();
    fixture.detectChanges();
    expect(component.showPassword()).toBeTrue();
    expect(toggle.getAttribute('aria-label')).toBe('پنهان کردن رمز عبور');
  });

  it('stores a successful Kowsar session, permissions, and navigates to the dashboard', () => {
    repo.KowsarLogin.and.returnValue(of(AUTH_LOGIN_RESPONSE_FIXTURE));
    repo.CentralPermission.and.returnValue(of(CENTRAL_PERMISSION_RESPONSE_FIXTURE));
    component.loginForm.patchValue({
      UserType: 'KOWSAR',
      UName: 'fixture-user',
      UPass: 'fixture-password',
    }, { emitEvent: false });

    component.submit();

    expect(repo.KowsarLogin).toHaveBeenCalledWith(jasmine.objectContaining({
      UserType: 'KOWSAR',
      DepartmentCode: 1,
    }));
    expect(authSession.storeLogin).toHaveBeenCalledWith(
      AUTH_LOGIN_RESPONSE_FIXTURE,
      AUTH_LOGIN_RESPONSE_FIXTURE.users![0],
      true,
    );
    expect(authSession.storePermissions).toHaveBeenCalledWith(CENTRAL_PERMISSION_RESPONSE_FIXTURE);
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
    expect(component.isLoading()).toBeFalse();
  });

  it('completes the customer OTP challenge through the backend contract', () => {
    const customerLogin = {
      ...AUTH_LOGIN_RESPONSE_FIXTURE,
      users: [{
        ...AUTH_LOGIN_RESPONSE_FIXTURE.users![0],
        LoginType: 'CUSTOMER',
        XUserCode: 81,
      }],
      auth: {
        ...AUTH_LOGIN_RESPONSE_FIXTURE.auth!,
        subject: 'CUSTOMER:81',
      },
    };
    repo.IsUser.and.returnValue(of(OTP_CHALLENGE_RESPONSE_FIXTURE));
    repo.VerifyOtp.and.returnValue(of(customerLogin));
    repo.CentralPermission.and.returnValue(of(CENTRAL_PERMISSION_RESPONSE_FIXTURE));
    component.loginForm.patchValue({
      UserType: 'CUSTOMER',
      UName: 'customer-fixture',
      UPass: 'fixture-password',
    }, { emitEvent: false });

    component.submit();

    expect(component.smsConfirmVisible).toBeTrue();
    expect(component.otpChallengeId).toBe(OTP_CHALLENGE_RESPONSE_FIXTURE.challengeId);

    component.smsForm.setValue({ ConfirmCode: '1234' });
    component.confirmSmsCode();

    expect(repo.VerifyOtp).toHaveBeenCalledOnceWith(
      OTP_CHALLENGE_RESPONSE_FIXTURE.challengeId,
      '1234',
    );
    expect(authSession.storeLogin).toHaveBeenCalledWith(customerLogin, customerLogin.users[0], false);
    expect(component.smsConfirmVisible).toBeFalse();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('clears authorization collections when permission loading fails', () => {
    repo.KowsarLogin.and.returnValue(of(AUTH_LOGIN_RESPONSE_FIXTURE));
    repo.CentralPermission.and.returnValue(throwError(() => new Error('permission failure')));
    component.loginForm.patchValue({
      UserType: 'KOWSAR',
      UName: 'fixture-user',
      UPass: 'fixture-password',
    }, { emitEvent: false });

    component.submit();

    expect(authSession.clearPermissions).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/dashboard']);
  });
});
