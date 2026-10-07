import { Routes } from '@angular/router';
import { collaborationGuard } from './collaboration.guard';

export const COLLABORATION_ROUTES: Routes = [
  {
    path: '',
    title: 'همکاری سازمانی',
    canActivate: [collaborationGuard],
    loadComponent: () => import('./pages/collaboration-home/collaboration-home.component')
      .then(m => m.CollaborationHomeComponent)
  }
];
