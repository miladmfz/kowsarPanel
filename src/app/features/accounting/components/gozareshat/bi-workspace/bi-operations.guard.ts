import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';

export const biOperationsGuard: CanActivateFn = () => {
  const permissions = inject(PermissionService);
  return permissions.canViewBiOperations ? true : inject(Router).createUrlTree(['/accounting/gozareshat/bi']);
};
