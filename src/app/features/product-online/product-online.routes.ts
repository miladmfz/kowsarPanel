import { Routes } from '@angular/router';

export const PRODUCT_ONLINE_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'product-list',
    pathMatch: 'full'
  },
  {
    path: 'product-list',
    loadComponent: () =>
      import('./components/product-list/product-list.component')
        .then(m => m.ProductListComponent)
  },
  {
    path: 'product-item/:goodCode',
    loadComponent: () =>
      import('./components/product-item/product-item.component')
        .then(m => m.ProductItemComponent)
  },
  {
    path: '**',
    redirectTo: 'product-list'
  }
];
