import { NgModule } from '@angular/core';
import { DashboardComponent } from './app-shell/core/dashboard/dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { UnauthorizedComponent } from './auth/unauthorized/unauthorized.component';
import { CallbackComponent } from './auth/callback/callback.component';
import { AutoLoginPartialRoutesGuard } from 'angular-auth-oidc-client';
import { AppComponent } from './app.component';

const routes: Routes = [
  {

    // canActivate: [AutoLoginPartialRoutesGuard],

    path: '',
    loadChildren: () =>
      import('./app-shell/core/layout.module').then((m) => m.LayoutModule),
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: 'callback', component: CallbackComponent },
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
