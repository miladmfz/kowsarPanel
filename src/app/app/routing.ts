import { Routes } from '@angular/router';
import { DashboardComponent } from '../app-shell/core/dashboard/dashboard.component';
import { NotFoundComponent } from '../app-shell/core/not-found/not-found.component';

const Routing: Routes = [
  //{ path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('../app-shell/core/dashboard/dashboard.module').then(m => m.DashboardModule)
  },
  {
    path: 'application',
    loadChildren: () =>
      import('../app/application/application.module').then((m) => m.ApplicationModule)
  },

  {
    path: 'kowsar',
    loadChildren: () =>
      import('../app/kowsar/kowsar.module').then((m) => m.KowsarModule)
  },
  {
    path: 'manager',
    loadChildren: () =>
      import('../app/manager/manager.module').then((m) => m.ManagerModule)
  },
  {
    path: 'support',
    loadChildren: () =>
      import('../app/support/support.module').then((m) => m.SupportModule)
  },

  {
    path: 'document',
    loadChildren: () =>
      import('../app/document/document.module').then((m) => m.DocumentModule)
  },
  {
    path: 'factor',
    loadChildren: () =>
      import('../app/factor/factor.module').then((m) => m.FactorModule)
  },


];

export { Routing };
