import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { biGuard } from './bi.guard';

describe('biGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let canView = false;

  beforeEach(() => {
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: router },
        { provide: PermissionService, useFactory: () => ({ get canViewBiDashboard() { return canView; } }) },
      ],
    });
  });

  it('allows an authorized BI viewer', () => {
    canView = true;
    expect(TestBed.runInInjectionContext(() => biGuard({} as never, {} as never))).toBeTrue();
  });

  it('redirects a user without BI permission', () => {
    canView = false;
    expect(TestBed.runInInjectionContext(() => biGuard({} as never, {} as never)))
      .toBe(router.createUrlTree.calls.mostRecent().returnValue);
    expect(router.createUrlTree).toHaveBeenCalledOnceWith(['/dashboard']);
  });
});
