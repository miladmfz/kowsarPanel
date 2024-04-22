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
    path: 'autletter',
    loadChildren: () =>
      import('../app/autletter/autletter.module').then((m) => m.AutLetterModule)
  },

  {
    path: 'user-management',
    loadChildren: () =>
      import('../app/user-management/user-management.module').then(
        (x) => x.UserManagementModule
      ),
  },
  {
    path: 'base-info',
    loadChildren: () =>
      import('../app/base-information/base-information.module').then(
        (x) => x.BaseInformationModule
      ),
  },
  {
    path: 'incident',
    loadChildren: () =>
      import('../app/incident/incident.module').then(
        (x) => x.IncidentModule
      ),
  },
];

export { Routing };
