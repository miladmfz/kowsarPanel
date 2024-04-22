import { Component, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { LocalStorageService } from './app-shell/framework-services/local.storage.service';
import {
  ACCESS_TOKEN_NAME,
  PERMISSIONS_NAME,
} from './app-shell/framework-services/configuration';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private oidcSecurityService: OidcSecurityService,
    private localStorageService: LocalStorageService
  ) {}

  ngOnInit(): void {
    document.body.classList.remove('loading');

    this.oidcSecurityService
      .checkAuth()
      .subscribe(
        ({ isAuthenticated, userData, accessToken, idToken, configId }) => {
          if (isAuthenticated) {
            this.localStorageService.setItem(ACCESS_TOKEN_NAME, accessToken);
            this.localStorageService.setItem(PERMISSIONS_NAME, userData.role);
          }
        }
      );
  }
}
