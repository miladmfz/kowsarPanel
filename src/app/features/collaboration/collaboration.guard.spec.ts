import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Router, UrlTree } from '@angular/router';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { collaborationGuard } from './collaboration.guard';

describe('collaborationGuard', () => {
  let permissions: jasmine.SpyObj<PermissionService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    permissions = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasAnyPermission'], { isAdmin: false });
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);
    TestBed.configureTestingModule({ providers: [
      provideZonelessChangeDetection(),
      { provide: PermissionService, useValue: permissions },
      { provide: Router, useValue: router }
    ] });
  });

  it('allows Collaboration.View', () => {
    permissions.hasAnyPermission.and.returnValue(true);
    expect(TestBed.runInInjectionContext(() => collaborationGuard({} as never, {} as never))).toBeTrue();
  });

  it('redirects users without collaboration permission', () => {
    permissions.hasAnyPermission.and.returnValue(false);
    expect(TestBed.runInInjectionContext(() => collaborationGuard({} as never, {} as never)))
      .toBe(router.createUrlTree.calls.mostRecent().returnValue);
    expect(router.createUrlTree).toHaveBeenCalledOnceWith(['/dashboard']);
  });
});

