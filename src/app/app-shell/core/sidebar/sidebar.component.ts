import { Component, OnInit } from '@angular/core';
import { OidcSecurityService } from 'angular-auth-oidc-client';
declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  constructor(private oidcSecurityService: OidcSecurityService) { }
  ngOnInit(): void {
    this.getUserData();
  }
  userData = null;
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
