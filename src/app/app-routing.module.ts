import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './app-shell/core/not-found/not-found.component';
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
    path: '**',
    component: NotFoundComponent,
  },
];


@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'enabled',
      anchorScrolling: 'enabled',
      preloadingStrategy: PreloadAllModules,
      initialNavigation: 'enabledBlocking',
      useHash: true
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule { }