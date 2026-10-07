import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { PermissionService } from './PermissionService';

describe('PermissionService', () => {
  let service: PermissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection()] });
    service = TestBed.inject(PermissionService);
    sessionStorage.clear();
  });

  afterEach(() => sessionStorage.clear());

  it('stores distinct typed permission and role names', () => {
    service.savePermissions([
      { PermissionKey: 'DASHBOARD_VIEW', RoleName: 'ADMIN' },
      { PermissionKey: 'DASHBOARD_VIEW', RoleName: 'ADMIN' },
      { PermissionKey: null, RoleName: null },
    ]);

    expect(service.getPermissions()).toEqual(['DASHBOARD_VIEW']);
    expect(service.getRoles()).toEqual(['ADMIN']);
  });
});
