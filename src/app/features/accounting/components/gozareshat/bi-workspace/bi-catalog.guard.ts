import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';

export const biCatalogGuard: CanActivateFn = () => {
  const permissions = inject(PermissionService);
  return permissions.canManageBiCatalog ? true : inject(Router).createUrlTree(['/accounting/gozareshat/bi']);
};
