import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {


    path: '',
    loadChildren: () =>
      import('./app-shell/core/layout.module').then((m) => m.LayoutModule),
  },
  {


    path: 'auth',
    loadChildren: () =>
      import('./auth-kowsar/auth-kowsar.module').then((m) => m.AuthKowsarModule),
  },


  {
    path: '',
    redirectTo: 'error/404',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
