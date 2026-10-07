import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, UrlTree } from '@angular/router';
import { GuestGuard } from './GuestGuard';
import { SessionStorageService } from './storage/session.storage.service';

describe('GuestGuard', () => {
  let session: SessionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection(), provideRouter([])],
    });
    session = TestBed.inject(SessionStorageService);
    sessionStorage.clear();
  });

  afterEach(() => sessionStorage.clear());

  function runGuard(): boolean | UrlTree {
    return TestBed.runInInjectionContext(() => GuestGuard({} as never, {} as never)) as boolean | UrlTree;
  }

  it('allows only an authenticated guest session', () => {
    session.setString('LoginType', 'GUEST');
    session.accessToken = 'guest-access-token';

    expect(runGuard()).toBeTrue();
  });

  it('redirects ordinary users and incomplete sessions to guest login', () => {
    session.setString('LoginType', 'CUSTOMER');
    session.accessToken = 'customer-access-token';

    expect((runGuard() as UrlTree).toString()).toBe('/auth/guest-login');

    session.setString('LoginType', 'GUEST');
    session.accessToken = '';
    expect((runGuard() as UrlTree).toString()).toBe('/auth/guest-login');
  });
});
