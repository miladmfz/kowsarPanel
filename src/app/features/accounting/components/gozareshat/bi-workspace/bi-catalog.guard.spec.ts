import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { biCatalogGuard } from './bi-catalog.guard';

describe('biCatalogGuard', () => {
  let router: jasmine.SpyObj<Router>;
  let canManage = false;

  beforeEach(() => {
    canManage = false;
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);
    TestBed.configureTestingModule({ providers: [
      provideZonelessChangeDetection(), { provide: Router, useValue: router },
      { provide: PermissionService, useFactory: () => ({ get canManageBiCatalog() { return canManage; } }) },
    ] });
  });

  it('allows a catalog administrator', () => {
    canManage = true;
    expect(TestBed.runInInjectionContext(() => biCatalogGuard({} as never, {} as never))).toBeTrue();
  });

  it('redirects a viewer to the BI workspace', () => {
    expect(TestBed.runInInjectionContext(() => biCatalogGuard({} as never, {} as never)))
      .toBe(router.createUrlTree.calls.mostRecent().returnValue);
    expect(router.createUrlTree).toHaveBeenCalledOnceWith(['/accounting/gozareshat/bi']);
  });
});
