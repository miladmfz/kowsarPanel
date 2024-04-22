import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication.service';
import { LocalStorageService } from './local.storage.service';
import { ACCESS_TOKEN_NAME, ROLE_TOKEN_NAME } from './configuration';

export const authGuard = () => {
  const authenticationService = inject(AuthenticationService);
  const localStorageService = inject(LocalStorageService);
  const router = inject(Router);

  console.log('guard activated');
  // if (authenticationService.isLoggedIn()) {
  return true;
  // }

  // localStorageService.removeItem(ACCESS_TOKEN_NAME)
  // localStorageService.removeItem(ROLE_TOKEN_NAME)
  // router.navigateByUrl('/login')
  // return false
};
