import { Injectable, inject } from '@angular/core';
import { SessionStorageService } from './session.storage.service';
import { PermissionRecord } from 'src/app/auth-kowsar/auth-api.models';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {

  private readonly session = inject(SessionStorageService);

  savePermissions(data: PermissionRecord[]): void {
    const permissionKeys = [
      ...new Set(data.map(x => x.PermissionKey).filter((value): value is string => !!value))
    ];

    const roleNames = [
      ...new Set(data.map(x => x.RoleName).filter((value): value is string => !!value))
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
    return this.hasAnyRole(['ADMIN']);
  }

  get canViewDashboard(): boolean {
    return this.hasPermission('DASHBOARD_VIEW');
  }

  get canViewBiDashboard(): boolean {
    return this.isAdmin || this.hasPermission('BI_DASHBOARD_VIEW');
  }

  get canEditOwnBiDashboard(): boolean {
    return this.isAdmin || this.hasPermission('BI_DASHBOARD_EDIT_OWN');
  }

  get canManageBiCatalog(): boolean {
    return this.isAdmin || this.hasPermission('BI_CATALOG_MANAGE');
  }

  get canPublishBiDashboard(): boolean {
    return this.isAdmin || this.hasPermission('BI_DASHBOARD_PUBLISH');
  }

  get canShareBiDashboard(): boolean {
    return this.isAdmin || this.hasPermission('BI_DASHBOARD_SHARE');
  }

  get canViewBiAudit(): boolean {
    return this.isAdmin || this.hasPermission('BI_AUDIT_VIEW');
  }

  get canViewBiOperations(): boolean {
    return this.isAdmin || this.hasPermission('BI_OPERATIONS_VIEW');
  }

  get canManageBiSchedules(): boolean {
    return this.isAdmin || this.hasPermission('BI_SCHEDULE_MANAGE');
  }

  get canReviewBiPilot(): boolean {
    return this.isAdmin || this.hasPermission('BI_PILOT_REVIEW');
  }

  get canExportBi(): boolean {
    return this.isAdmin || this.hasPermission('BI_EXPORT');
  }

  get isAdmin(): boolean {
    return this.hasRole('ADMIN');
  }

  get isManager(): boolean {
    return this.hasRole('MANAGER');
  }

  get canManageUsers(): boolean {
    return this.hasAnyRole([
      'ACCOUNTING_USER',
      'SALES_USER',
      'PURCHASE_USER',
      'REPORT_VIEWER',
      'ADMIN',
    ]);
  }
}
