import { Routes } from '@angular/router';
import { DashboardComponent } from '../app-shell/core/dashboard/dashboard.component';

const Routing: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    component: DashboardComponent,
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

];

export { Routing };
