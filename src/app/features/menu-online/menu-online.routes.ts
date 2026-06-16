import { Routes } from '@angular/router';

export const MENU_ONLINE_ROUTES: Routes = [

    {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full'
    },

    {
        path: 'home',
        loadComponent: () =>
            import('./components/home/home.component')
                .then(m => m.HomeComponent),
    },

    {
        path: 'home/:id',
        loadComponent: () =>
            import('./components/home/home.component')
                .then(m => m.HomeComponent),
    },

    {
        path: 'menu-fa',
        loadComponent: () =>
            import('./components/menu/menu.component')
                .then(m => m.MenuComponent),
    },

    // {
    //     path: 'menu-en',
    //     loadComponent: () =>
    //         import('./order/menu-en/menu-en.component')
    //             .then(m => m.MenuEnComponent),
    // },

    // {
    //     path: 'basket',
    //     loadComponent: () =>
    //         import('./order/order-basket/order-basket.component')
    //             .then(m => m.OrderBasketComponent),
    // }

];