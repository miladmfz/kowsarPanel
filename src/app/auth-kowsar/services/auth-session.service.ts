import { Injectable, inject } from '@angular/core';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import {
  AuthUserRecord,
  CentralPermissionResponse,
  LoginResponse,
  NormalizedAuthUser,
  PermissionRecord,
} from '../auth-api.models';

export interface StoredPermissions {
  permissions: PermissionRecord[];
  permissionKeys: string[];
  roleNames: string[];
}

@Injectable({ providedIn: 'root' })
export class AuthSessionService {
  private readonly session = inject(SessionStorageService);

  storeLogin(data: LoginResponse, user: AuthUserRecord, isKowsarLogin: boolean): NormalizedAuthUser {
    const accessToken = String(data.auth?.accessToken ?? '').trim();
    if (accessToken) {
      this.session.accessToken = accessToken;
      this.session.refreshToken = String(data.auth?.refreshToken ?? '');
      this.session.authSubject = String(data.auth?.subject ?? '');
      this.session.authSessionId = String(data.auth?.sessionId ?? '');
      this.session.authTokenVersion = data.auth?.tokenVersion ?? 1;
    }

    const normalizedUser = this.normalizeUser(user, isKowsarLogin);
    Object.entries(normalizedUser).forEach(([key, value]) => {
      this.session.setString(key, String(value));
    });
    this.session.setItem('CurrentUser', normalizedUser);
    this.session.setItem('RawUser', user);
    return normalizedUser;
  }

  storePermissions(response: CentralPermissionResponse): StoredPermissions {
    const permissions = response.permissions ?? response.Permissions ?? [];
    const permissionKeys = this.uniqueStrings(permissions.map(item => item.PermissionKey));
    const roleNames = this.uniqueStrings(permissions.map(item => item.RoleName));

    this.session.setItem('Permissions', permissions);
    this.session.setItem('PermissionKeys', permissionKeys);
    this.session.setItem('RoleNames', roleNames);
    return { permissions, permissionKeys, roleNames };
  }

  clearPermissions(): void {
    this.session.setItem('Permissions', []);
    this.session.setItem('PermissionKeys', []);
    this.session.setItem('RoleNames', []);
  }

  normalizeUser(user: AuthUserRecord, isKowsarLogin: boolean): NormalizedAuthUser {
    const basePath = this.currentBasePath();
    const loginType = user.LoginType || (isKowsarLogin ? 'KOWSAR' : 'CUSTOMER');
    return {
      LoginType: loginType,
      AppKey: `${window.location.hostname}${basePath}`.toLowerCase(),
      HostName: window.location.hostname,
      BasePath: basePath,
      UserId: isKowsarLogin ? (user.UserId || '1') : '1',
      OldUserId: user.OldUserId || '',
      CentralRef: user.CentralRef || '',
      CentralName: user.CentralName || '',
      Manager: user.Manager || '',
      Delegacy: user.Delegacy || '',
      UserName: user.UserName || '',
      DisplayName: user.DisplayName || user.UserPrintName || user.PhFullName || user.BrokerName || user.UserName || '',
      UserPrintName: user.UserPrintName || '',
      Active: user.Active || user.Success || '',
      DepartmentCode: user.DepartmentCode || '',
      DepartmentName: user.DepartmentName || '',
      NeedChangePassword: user.NeedChangePassword || 'False',
      UserMaxDiscount: user.UserMaxDiscount || '0',
      UserIdRef: user.UserIdRef || '',
      XUserCode: user.XUserCode || '',
      CustomerCode: user.CustomerCode || '',
      CustName_Small: user.CustName_Small || '',
      Explain: user.Explain || '',
      PersonInfoRef: user.PersonInfoRef || '',
      PhFullName: user.PhFullName || '',
      SessionId: user.SessionId || '',
      ActiveDate: user.ActiveDate || '',
      IsAdminUser: user.IsAdminUser || '',
      Message: user.Message || user.ErrDesc || '',
      ErrCode: user.ErrCode || '0',
    };
  }

  private currentBasePath(): string {
    const segments = window.location.pathname.split('/').filter(Boolean);
    return segments.length > 0 ? `/${segments[0].toLowerCase()}` : '/';
  }

  private uniqueStrings(values: Array<string | null | undefined>): string[] {
    return [...new Set(values.filter((value): value is string => typeof value === 'string' && value.length > 0))];
  }
}
