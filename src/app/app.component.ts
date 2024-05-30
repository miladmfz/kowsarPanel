import { Component, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { LocalStorageService } from './app-shell/framework-services/local.storage.service';
import {
  ACCESS_TOKEN_NAME,
  PERMISSIONS_NAME,
} from './app-shell/framework-services/configuration';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  constructor(
    private readonly router: Router,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    document.body.classList.remove('loading');
    this.localStorageService.setItem(ACCESS_TOKEN_NAME, "1111111111");
    this.localStorageService.setItem(PERMISSIONS_NAME, "1111111111");

    sessionStorage


    if (!this.localStorageService.exists('ActiveDate')) {
      this.router.navigate(['/auth/login']);

    }
  }
}

