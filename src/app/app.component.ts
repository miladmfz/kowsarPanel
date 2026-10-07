import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

import { LoadingService } from './app-shell/framework-services/ui/loading.service';
import { SessionStorageService } from './app-shell/framework-services/storage/session.storage.service';
import { AgGridSettingsDialogComponent } from './app-shell/framework-components/ag-grid/ag-grid-settings-dialog/ag-grid-settings-dialog.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    AgGridSettingsDialogComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  public readonly loadingService = inject(LoadingService);
  protected readonly session = inject(SessionStorageService);
  private readonly router = inject(Router);
  constructor() { }

  ngOnInit(): void {

    const pathSegments = window.location.pathname
      .toLowerCase()
      .split('/')
      .filter(Boolean);

    const isMenuRoute =
      pathSegments.includes('menu');

    const isAuthRoute =
      pathSegments.includes('auth');

    if (
      !this.session.sessionId
      && !isMenuRoute
      && !isAuthRoute
    ) {
      void this.router.navigateByUrl(this.session.loginRoute);
    }

  }

}
