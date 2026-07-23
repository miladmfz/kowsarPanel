import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { LoadingService } from './app-shell/framework-services/ui/loading.service';
import { SessionStorageService } from './app-shell/framework-services/storage/session.storage.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet
  ],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  public readonly loadingService = inject(LoadingService);
  protected readonly session = inject(SessionStorageService);
  private readonly router = inject(Router);
  constructor() { }

  ngOnInit(): void {

    const currentPath =
      window.location.pathname;

    const isMenuRoute =
      currentPath.includes('/menu');

    const isAuthRoute =
      currentPath.includes('/auth');

    if (
      !this.session.sessionId
      && !isMenuRoute
      && !isAuthRoute
    ) {
      if (localStorage.getItem('UserTypeLogin') == 'KOWSAR') {
        this.router.createUrlTree(['/auth/login-kowsar']);

      } else {
        this.router.createUrlTree(['/auth/login-person']);

      }
    }

    setTimeout(() =>
      this.loadingService.hide(),
      1500
    );
  }

}