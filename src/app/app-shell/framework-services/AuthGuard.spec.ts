import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, UrlTree } from '@angular/router';

import { AuthGuard } from './AuthGuard';
import { SessionStorageService } from './storage/session.storage.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let sessionValues: Record<string, string>;
  let session: jasmine.SpyObj<SessionStorageService>;

  beforeEach(() => {
    sessionValues = {};
    session = jasmine.createSpyObj<SessionStorageService>(
      'SessionStorageService',
      ['getString', 'clearAuthentication']
    );
    Object.defineProperty(session, 'loginRoute', {
      get: () => localStorage.getItem('UserTypeLogin') === 'KOWSAR'
        ? '/auth/login-kowsar'
        : '/auth/login-person'
    });
    session.getString.and.callFake((key: string) => sessionValues[key] ?? '');

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: SessionStorageService, useValue: session },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('redirects a user without a session to the person login', () => {
    const result = guard.canActivate();

    expect(result instanceof UrlTree).toBeTrue();
    expect((result as UrlTree).toString()).toBe('/auth/login-person');
    expect(session.clearAuthentication).toHaveBeenCalled();
  });

  it('redirects a Kowsar user without a session to the Kowsar login', () => {
    localStorage.setItem('UserTypeLogin', 'KOWSAR');

    const result = guard.canActivate();

    expect((result as UrlTree).toString()).toBe('/auth/login-kowsar');
  });

  it('rejects a session created for a different host', () => {
    sessionValues = {
      SessionId: 'active-session',
      HostName: 'different.example.com',
    };

    const result = guard.canActivate();

    expect(result instanceof UrlTree).toBeTrue();
    expect(session.clearAuthentication).toHaveBeenCalled();
  });

  it('redirects users who must change their password', () => {
    sessionValues = {
      SessionId: 'active-session',
      HostName: window.location.hostname,
      NeedChangePassword: 'true',
    };

    const result = guard.canActivate();

    expect((result as UrlTree).toString()).toBe('/auth/change-password');
    expect(session.clearAuthentication).not.toHaveBeenCalled();
  });

  it('allows a valid session for the current host', () => {
    sessionValues = {
      SessionId: 'active-session',
      HostName: window.location.hostname.toUpperCase(),
      NeedChangePassword: '0',
    };

    expect(guard.canActivate()).toBeTrue();
  });
});
