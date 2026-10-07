import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { AuthTokenService } from './auth-token.service';

describe('AuthTokenService', () => {
  let service: AuthTokenService;
  let http: HttpTestingController;
  let session: SessionStorageService;

  beforeEach(() => {
    const config = new AppConfigService();
    config.initialize({ appVersion: '1', production: false, apiUrl: 'https://api.test/api/', baseHref: '/' });
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppConfigService, useValue: config },
      ],
    });
    service = TestBed.inject(AuthTokenService);
    http = TestBed.inject(HttpTestingController);
    session = TestBed.inject(SessionStorageService);
    sessionStorage.clear();
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('rotates and stores both tokens', () => {
    session.authSubject = 'CUSTOMER:7';
    session.refreshToken = 'old-refresh';
    let accessToken = '';

    service.refreshAccessToken().subscribe(value => accessToken = value);
    const request = http.expectOne('https://api.test/api/Auth/v2/refresh');
    expect(request.request.body).toEqual({
      subject: 'CUSTOMER:7',
      refreshToken: 'old-refresh',
      deviceId: jasmine.any(String),
    });
    request.flush({
      accessToken: 'new-access',
      refreshToken: 'new-refresh',
      subject: 'CUSTOMER:7',
      sessionId: 'session-2',
      tokenVersion: 3,
    });

    expect(accessToken).toBe('new-access');
    expect(session.accessToken).toBe('new-access');
    expect(session.refreshToken).toBe('new-refresh');
    expect(session.authSessionId).toBe('session-2');
    expect(session.authTokenVersion).toBe(3);
  });

  it('shares a refresh request between concurrent callers', () => {
    session.authSubject = 'CUSTOMER:7';
    session.refreshToken = 'old-refresh';

    service.refreshAccessToken().subscribe();
    service.refreshAccessToken().subscribe();
    const request = http.expectOne('https://api.test/api/Auth/v2/refresh');
    expect(request.request.method).toBe('POST');
    request.flush({ accessToken: 'new-access', refreshToken: 'new-refresh', subject: 'CUSTOMER:7' });
  });

  it('revokes the refresh token before clearing the local session', () => {
    session.authSubject = 'CUSTOMER:7';
    session.accessToken = 'access';
    session.refreshToken = 'refresh';

    service.logout().subscribe();
    const request = http.expectOne('https://api.test/api/Auth/v2/logout');
    expect(request.request.headers.get('Authorization')).toBe('Bearer access');
    expect(request.request.body).toEqual({ subject: 'CUSTOMER:7', refreshToken: 'refresh' });
    request.flush(null);

    expect(session.accessToken).toBe('');
    expect(session.refreshToken).toBe('');
  });

  it('refuses refresh without session credentials', () => {
    expect(() => service.refreshAccessToken()).toThrowError('Refresh credentials are not available.');
  });
});
