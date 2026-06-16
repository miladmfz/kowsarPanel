import { Injectable, inject } from '@angular/core';
import { SessionStorageService } from './session.storage.service';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private readonly session = inject(SessionStorageService);

  savePermissions(data: any[]): void {
    const permissionKeys = [
      ...new Set(data.map(x => x.PermissionKey).filter(x => !!x))
    ];

    const roleNames = [
      ...new Set(data.map(x => x.RoleName).filter(x => !!x))
    ];

    this.session.setItem('PermissionKeys', permissionKeys);
    this.session.setItem('RoleNames', roleNames);
    this.session.setItem('Permissions', data);
  }

  getPermissions(): string[] {
    return this.session.getItem<string[]>('PermissionKeys') || [];
  }

  getRoles(): string[] {
    return this.session.getItem<string[]>('RoleNames') || [];
  }

  hasPermission(permission: string): boolean {
    return this.getPermissions().includes(permission);
  }

  hasRole(role: string): boolean {
    return this.getRoles().includes(role);
  }

  hasAnyPermission(permissions: string[]): boolean {
    const userPermissions = this.getPermissions();
    return permissions.some(p => userPermissions.includes(p));
  }

  hasAnyRole(roles: string[]): boolean {
    const userRoles = this.getRoles();
    return roles.some(r => userRoles.includes(r));
  }

  clear(): void {
    this.session.removeItem('PermissionKeys');
    this.session.removeItem('RoleNames');
    this.session.removeItem('Permissions');
  }


  get canManageRole(): boolean {
    return this.hasPermission('ROLE_MANAGE');
  }

  get canViewDashboard(): boolean {
    return this.hasPermission('DASHBOARD_VIEW');
  }

  get isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  get isManager(): boolean {
    return this.hasRole('MANAGER');
  }

  get canManageUsers(): boolean {
    return this.hasAnyPermission([
      'USER_VIEW',
      'USER_INSERT',
      'USER_EDIT',
      'USER_DELETE',
      'ROLE_MANAGE'
    ]);
  }
}