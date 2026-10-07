import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { biOperationsGuard } from './bi-operations.guard';

describe('biOperationsGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let canView = false;

  beforeEach(() => {
    canView = false;
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);
    TestBed.configureTestingModule({ providers: [
      provideZonelessChangeDetection(), { provide: Router, useValue: router },
      { provide: PermissionService, useFactory: () => ({ get canViewBiOperations() { return canView; } }) },
    ] });
  });

  it('allows BI operations viewers', () => {
    canView = true;
    expect(TestBed.runInInjectionContext(() => biOperationsGuard({} as any, {} as any))).toBeTrue();
  });

  it('redirects users without the independent operations permission', () => {
    const result = TestBed.runInInjectionContext(() => biOperationsGuard({} as any, {} as any));
    expect(result).toBe(router.createUrlTree.calls.mostRecent().returnValue);
    expect(router.createUrlTree).toHaveBeenCalledOnceWith(['/accounting/gozareshat/bi']);
  });
});
