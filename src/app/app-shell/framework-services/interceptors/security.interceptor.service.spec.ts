import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AppConfigService } from 'src/app/app-config.service';
import { AuthTokenService } from 'src/app/auth-kowsar/services/auth-token.service';
import { ACCESS_TOKEN_NAME } from '../base/configuration';
import { SessionStorageService } from '../storage/session.storage.service';
import { SecurityInterceptor } from './security.interceptor.service';

describe('SecurityInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let router: jasmine.SpyObj<Router>;
  let authTokens: jasmine.SpyObj<AuthTokenService>;
  let session: SessionStorageService;

  beforeEach(() => {
    const config = new AppConfigService();
    config.initialize({
      appVersion: '1.0.0',
      production: false,
      apiUrl: 'https://api.example.com/api/',
      baseHref: '/',
    });
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    router.navigateByUrl.and.resolveTo(true);
    authTokens = jasmine.createSpyObj<AuthTokenService>('AuthTokenService', ['refreshAccessToken']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([SecurityInterceptor])),
        provideHttpClientTesting(),
        { provide: AppConfigService, useValue: config },
        { provide: Router, useValue: router },
        { provide: AuthTokenService, useValue: authTokens },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionStorageService);
    localStorage.clear();
    sessionStorage.clear();
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('adds the bearer token to requests for the configured API', () => {
    sessionStorage.setItem(ACCESS_TOKEN_NAME, 'test-token');

    http.get('https://api.example.com/api/users').subscribe();

    const request = httpTesting.expectOne('https://api.example.com/api/users');
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-token');
    request.flush({});
  });

  it('does not leak the token to an external URL containing the API URL', () => {
    sessionStorage.setItem(ACCESS_TOKEN_NAME, 'test-token');
    const externalUrl =
      'https://evil.example/collect?next=https://api.example.com/api/users';

    http.get(externalUrl).subscribe();

    const request = httpTesting.expectOne(externalUrl);
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({});
  });

  it('clears authentication state after an unauthorized API response', () => {
    sessionStorage.setItem(ACCESS_TOKEN_NAME, 'test-token');
    sessionStorage.setItem('SessionId', 'active-session');

    http.get('https://api.example.com/api/users').subscribe({ error: () => undefined });

    const request = httpTesting.expectOne('https://api.example.com/api/users');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(sessionStorage.getItem(ACCESS_TOKEN_NAME)).toBeNull();
    expect(sessionStorage.getItem('SessionId')).toBeNull();
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/auth/login-person');
  });

  it('returns an expired guest session to the guest login page', () => {
    session.setString('LoginType', 'GUEST');
    session.accessToken = 'expired-guest-token';

    http.get('https://api.example.com/api/AutLetter/GuestTicketCreate').subscribe({
      error: () => undefined,
    });

    const request = httpTesting.expectOne(
      'https://api.example.com/api/AutLetter/GuestTicketCreate',
    );
    request.flush({}, { status: 403, statusText: 'Forbidden' });

    expect(session.accessToken).toBe('');
    expect(session.loginType).toBe('');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/auth/guest-login');
  });

  it('refreshes once and retries a failed API request with the rotated access token', () => {
    session.accessToken = 'expired-token';
    session.refreshToken = 'refresh-token';
    session.authSubject = 'KOWSAR:17';
    authTokens.refreshAccessToken.and.returnValue(of('rotated-token'));
    let response: { ok: boolean } | undefined;

    http.get<{ ok: boolean }>('https://api.example.com/api/users').subscribe(value => response = value);

    const failedRequest = httpTesting.expectOne('https://api.example.com/api/users');
    expect(failedRequest.request.headers.get('Authorization')).toBe('Bearer expired-token');
    failedRequest.flush({}, { status: 401, statusText: 'Unauthorized' });

    const retriedRequest = httpTesting.expectOne('https://api.example.com/api/users');
    expect(retriedRequest.request.headers.get('Authorization')).toBe('Bearer rotated-token');
    retriedRequest.flush({ ok: true });

    expect(response).toEqual({ ok: true });
    expect(authTokens.refreshAccessToken).toHaveBeenCalledTimes(1);
    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('clears the session when refresh fails and never retries with a stale token', () => {
    session.accessToken = 'expired-token';
    session.refreshToken = 'refresh-token';
    session.authSubject = 'KOWSAR:17';
    authTokens.refreshAccessToken.and.returnValue(throwError(() => new Error('refresh failed')));

    http.get('https://api.example.com/api/users').subscribe({ error: () => undefined });

    const request = httpTesting.expectOne('https://api.example.com/api/users');
    request.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(session.accessToken).toBe('');
    expect(session.refreshToken).toBe('');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/auth/login-person');
    httpTesting.expectNone('https://api.example.com/api/users');
  });

  it('does not attempt token refresh for a forbidden response', () => {
    session.accessToken = 'valid-token';
    session.refreshToken = 'refresh-token';
    session.authSubject = 'KOWSAR:17';

    http.get('https://api.example.com/api/users').subscribe({ error: () => undefined });

    const request = httpTesting.expectOne('https://api.example.com/api/users');
    request.flush({}, { status: 403, statusText: 'Forbidden' });

    expect(authTokens.refreshAccessToken).not.toHaveBeenCalled();
    expect(session.accessToken).toBe('');
    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/auth/login-person');
  });
});
