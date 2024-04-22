import { Component, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {
  constructor(private oidcSecurityService: OidcSecurityService) {}
  userData = null;
  ngOnInit(): void {
    this.getUserData();
  }
  logout() {
    this.oidcSecurityService
      .logoffAndRevokeTokens()
      .subscribe((result) => console.log(result));
  }
  async getUserData() {
    await this.oidcSecurityService.getUserData().subscribe((data) => {
      this.userData = data;
    });
  }
}
