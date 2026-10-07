import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { AuthSessionService } from './auth-session.service';

describe('AuthSessionService', () => {
  let service: AuthSessionService;
  let session: SessionStorageService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        AuthSessionService,
      ],
    });
    service = TestBed.inject(AuthSessionService);
    session = TestBed.inject(SessionStorageService);
    sessionStorage.clear();
    spyOn(session, 'setItem').and.callThrough();
  });

  afterEach(() => sessionStorage.clear());

  it('normalizes and stores user and authentication data', () => {
    const normalized = service.storeLogin(
      {
        auth: {
          accessToken: 'access',
          refreshToken: 'refresh',
          subject: 'subject',
          sessionId: 'session-1',
          tokenVersion: 2,
        },
      },
      {
        LoginType: 'KOWSAR',
        UserId: 42,
        UserName: 'milad',
        CentralRef: 7,
        ErrCode: 0,
      },
      true,
    );

    expect(normalized.UserId).toBe(42);
    expect(normalized.UserName).toBe('milad');
    expect(normalized.CentralRef).toBe(7);
    expect(session.accessToken).toBe('access');
    expect(session.refreshToken).toBe('refresh');
    expect(session.authSubject).toBe('subject');
    expect(session.authSessionId).toBe('session-1');
    expect(session.authTokenVersion).toBe(2);
    expect(session.setItem).toHaveBeenCalledWith('CurrentUser', normalized);
  });

  it('deduplicates permission and role keys before storing them', () => {
    const result = service.storePermissions({
      Permissions: [
        { PermissionKey: 'Orders.Read', RoleName: 'Admin' },
        { PermissionKey: 'Orders.Read', RoleName: 'Admin' },
        { PermissionKey: 'Orders.Write', RoleName: null },
      ],
    });

    expect(result.permissionKeys).toEqual(['Orders.Read', 'Orders.Write']);
    expect(result.roleNames).toEqual(['Admin']);
    expect(session.setItem).toHaveBeenCalledWith('PermissionKeys', result.permissionKeys);
    expect(session.setItem).toHaveBeenCalledWith('RoleNames', result.roleNames);
  });

  it('clears all authorization collections together', () => {
    service.clearPermissions();

    expect(session.setItem).toHaveBeenCalledWith('Permissions', []);
    expect(session.setItem).toHaveBeenCalledWith('PermissionKeys', []);
    expect(session.setItem).toHaveBeenCalledWith('RoleNames', []);
  });
});
