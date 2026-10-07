import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from 'src/app/app-config.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AuthKowsarWebApiService } from './AuthKowsarWebApi.service';

describe('AuthKowsarWebApiService', () => {
  let service: AuthKowsarWebApiService;
  let http: HttpTestingController;
  let loading: LoadingService;

  beforeEach(() => {
    const config = new AppConfigService();
    config.initialize({
      appVersion: '1',
      production: false,
      apiUrl: 'https://api.test/api/',
      baseHref: '/',
    });

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppConfigService, useValue: config },
      ],
    });

    service = TestBed.inject(AuthKowsarWebApiService);
    http = TestBed.inject(HttpTestingController);
    loading = TestBed.inject(LoadingService);
    sessionStorage.clear();
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('preserves the customer login request and typed response contract', () => {
    let result: unknown;

    service.IsUser({ UName: 'user', UPass: 'pass' }).subscribe(value => result = value);
    expect(loading.isVisible()).toBeTrue();

    const request = http.expectOne('https://api.test/api/Auth/IsUser');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      UName: 'user',
      UPass: 'pass',
      DeviceId: jasmine.any(String),
    });
    request.flush({ users: [{ ErrCode: '0', UserName: 'user' }] });

    expect(result).toEqual({ users: [{ ErrCode: '0', UserName: 'user' }] });
    expect(loading.isVisible()).toBeFalse();
  });

  it('keeps the legacy permission envelope and query parameter', () => {
    service.CentralPermission('42').subscribe(result => {
      expect(result.Permissions?.[0].PermissionKey).toBe('DASHBOARD_VIEW');
    });

    const request = http.expectOne(req =>
      req.url === 'https://api.test/api/Auth/CentralPermission' &&
      req.params.get('CentralRef') === '42');
    request.flush({ Permissions: [{ PermissionKey: 'DASHBOARD_VIEW', RoleName: 'ADMIN' }] });
  });

  it('uses the backend subject contract for refresh and logout', () => {
    service.RefreshToken('CUSTOMER:7', 'refresh-1').subscribe();
    const refresh = http.expectOne('https://api.test/api/Auth/v2/refresh');
    expect(refresh.request.body).toEqual({
      subject: 'CUSTOMER:7',
      refreshToken: 'refresh-1',
      deviceId: jasmine.any(String),
    });
    refresh.flush({ accessToken: 'access-2', refreshToken: 'refresh-2', subject: 'CUSTOMER:7' });

    service.Logout('CUSTOMER:7', 'refresh-2').subscribe();
    const logout = http.expectOne('https://api.test/api/Auth/v2/logout');
    expect(logout.request.body).toEqual({ subject: 'CUSTOMER:7', refreshToken: 'refresh-2' });
    logout.flush(null);
  });

  it('uses isolated guest OTP endpoints without receiving the OTP from the server', () => {
    service.RequestGuestOtp({ mobile: '09123456789' }).subscribe(result => {
      expect(result.challengeId).toBe('guest-challenge');
      expect(Object.keys(result)).not.toContain('developmentOtpCode');
    });
    const requestCode = http.expectOne('https://api.test/api/Auth/v2/guest/otp/request');
    expect(requestCode.request.method).toBe('POST');
    expect(requestCode.request.body).toEqual({ mobile: '09123456789' });
    requestCode.flush({ challengeId: 'guest-challenge', expiresAt: '2026-09-23T12:00:00Z' });

    service.VerifyGuestOtp('guest-challenge', '246810').subscribe();
    const verifyCode = http.expectOne('https://api.test/api/Auth/v2/guest/otp/verify');
    expect(verifyCode.request.body).toEqual({
      challengeId: 'guest-challenge',
      code: '246810',
      deviceId: jasmine.any(String),
    });
    verifyCode.flush({
      users: [{ LoginType: 'GUEST', UserName: '09123456789' }],
      auth: { accessToken: 'guest-access', refreshToken: 'guest-refresh', subject: 'guest-subject' },
    });
  });

  it('lists and revokes server-side authentication sessions', () => {
    service.GetAuthSessions(true, 25).subscribe(result => {
      expect(result.sessions[0].status).toBe('ACTIVE');
    });
    const list = http.expectOne(request =>
      request.url === 'https://api.test/api/Auth/v2/sessions' &&
      request.params.get('includeInactive') === 'true' &&
      request.params.get('take') === '25');
    list.flush({ sessions: [{ sessionId: 'session-1', subject: 'KOWSAR:7', status: 'ACTIVE' }] });

    service.RevokeAuthSession('session-1').subscribe();
    const revoke = http.expectOne('https://api.test/api/Auth/v2/sessions/session-1');
    expect(revoke.request.method).toBe('DELETE');
    revoke.flush(null);

    service.RevokeAllAuthSessions('KOWSAR:7').subscribe();
    const revokeAll = http.expectOne('https://api.test/api/Auth/v2/sessions/revoke-all');
    expect(revokeAll.request.body).toEqual({ subject: 'KOWSAR:7' });
    revokeAll.flush({ subject: 'KOWSAR:7', tokenVersion: 2 });
  });

  it('reads and updates only the authenticated Central role configuration', () => {
    service.GetCurrentCentralRoleConfiguration().subscribe(result => {
      expect(result.centralRef).toBe(1843);
      expect(result.roles[0].roleName).toBe('REPORT_VIEWER');
    });
    const read = http.expectOne('https://api.test/api/Auth/v2/central-roles/current');
    expect(read.request.method).toBe('GET');
    read.flush({
      centralRef: 1843,
      centralName: 'مرکز تست',
      version: 'A'.repeat(64),
      roles: [{ roleCode: 43, roleName: 'REPORT_VIEWER', enabled: false, locked: false }],
    });

    service.UpdateCurrentCentralRoleConfiguration({
      enabledRoleRefs: [43],
      expectedVersion: 'A'.repeat(64),
    }).subscribe();
    const update = http.expectOne('https://api.test/api/Auth/v2/central-roles/current');
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual({ enabledRoleRefs: [43], expectedVersion: 'A'.repeat(64) });
    expect(update.request.body).not.toEqual(jasmine.objectContaining({ centralRef: jasmine.anything() }));
    update.flush({ centralRef: 1843, centralName: 'مرکز تست', version: 'B'.repeat(64), roles: [] });
  });
});
