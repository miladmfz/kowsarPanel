import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';

export const biGuard: CanActivateFn = () => {
  const permissions = inject(PermissionService);
  if (permissions.canViewBiDashboard) return true;
  return inject(Router).createUrlTree(['/dashboard']);
};
