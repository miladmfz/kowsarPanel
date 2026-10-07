import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { PermissionService } from './storage/PermissionService';
import { RoleGuard } from './RoleGuard';

describe('RoleGuard', () => {
  const state = {} as RouterStateSnapshot;
  let permissionService: jasmine.SpyObj<PermissionService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(() => {
    permissionService = jasmine.createSpyObj<PermissionService>('PermissionService', ['hasAnyRole']);
    router = jasmine.createSpyObj<Router>('Router', ['createUrlTree']);
    router.createUrlTree.and.returnValue({} as UrlTree);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        { provide: PermissionService, useValue: permissionService },
        { provide: Router, useValue: router },
      ],
    });
  });

  function run(roles?: string[]) {
    const route = { data: roles ? { roles } : {} } as unknown as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => RoleGuard(route, state));
  }

  it('allows routes without a role requirement', () => {
    expect(run()).toBeTrue();
    expect(permissionService.hasAnyRole).not.toHaveBeenCalled();
  });

  it('allows a user with an accepted role', () => {
    permissionService.hasAnyRole.and.returnValue(true);

    expect(run(['ADMIN'])).toBeTrue();
  });

  it('redirects a user without an accepted role', () => {
    permissionService.hasAnyRole.and.returnValue(false);

    expect(run(['ADMIN'])).toBe(router.createUrlTree.calls.mostRecent().returnValue);
    expect(router.createUrlTree).toHaveBeenCalledOnceWith(['/dashboard']);
  });
});
