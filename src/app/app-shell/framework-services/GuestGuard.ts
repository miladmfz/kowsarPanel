import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { SessionStorageService } from './storage/session.storage.service';

export const GuestGuard: CanActivateFn = () => {
  const session = inject(SessionStorageService);
  const router = inject(Router);
  const isGuest = session.loginType.trim().toUpperCase() === 'GUEST';

  return isGuest && Boolean(session.accessToken)
    ? true
    : router.createUrlTree(['/auth/guest-login']);
};
