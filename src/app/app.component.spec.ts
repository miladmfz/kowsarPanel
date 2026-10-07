import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AppComponent } from './app.component';
import { SessionStorageService } from './app-shell/framework-services/storage/session.storage.service';
import { LoadingService } from './app-shell/framework-services/ui/loading.service';

describe('AppComponent session redirect', () => {
  let router: jasmine.SpyObj<Router>;
  let loadingService: jasmine.SpyObj<LoadingService>;
  let originalPath: string;

  beforeEach(() => {
    originalPath = window.location.pathname;
    router = jasmine.createSpyObj<Router>('Router', ['navigateByUrl']);
    router.navigateByUrl.and.resolveTo(true);
    loadingService = jasmine.createSpyObj<LoadingService>('LoadingService', ['hide']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        SessionStorageService,
        { provide: Router, useValue: router },
        { provide: LoadingService, useValue: loadingService }
      ]
    });

    sessionStorage.clear();
    localStorage.clear();
  });

  afterEach(() => {
    history.replaceState({}, '', originalPath || '/');
    sessionStorage.clear();
    localStorage.clear();
  });

  function initializeAt(path: string): void {
    history.replaceState({}, '', path);
    const component = TestBed.runInInjectionContext(() => new AppComponent());
    component.ngOnInit();
  }

  it('redirects a customer login to the person login page', () => {
    initializeAt('/dashboard');

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/auth/login-person');
  });

  it('redirects a Kowsar login to the Kowsar login page', () => {
    localStorage.setItem('UserTypeLogin', 'KOWSAR');

    initializeAt('/dashboard');

    expect(router.navigateByUrl).toHaveBeenCalledOnceWith('/auth/login-kowsar');
  });

  it('does not redirect an authenticated session', () => {
    sessionStorage.setItem('SessionId', 'session-123');

    initializeAt('/dashboard');

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });

  it('does not redirect public auth and menu routes', () => {
    initializeAt('/auth/login-person');
    initializeAt('/menu/home');

    expect(router.navigateByUrl).not.toHaveBeenCalled();
  });
});
