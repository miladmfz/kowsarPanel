import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';

export const collaborationGuard: CanActivateFn = () => {
  const permissions = inject(PermissionService);
  if (permissions.isAdmin || permissions.hasAnyPermission(['Collaboration.View', 'Collaboration.Admin'])) return true;
  return inject(Router).createUrlTree(['/dashboard']);
};

