// src/app/auth-kowsar/auth-kowsar.routes.ts
import { Routes } from '@angular/router';

export const authKowsarRoutes: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./components/auth-kowsar/auth-kowsar.component').then(m => m.AuthKowsarComponent),
        children: [
            {
                path: '',
                redirectTo: 'login',
                pathMatch: 'full',
            },
            {
                path: 'login',
                loadComponent: () =>
                    import('./components/login/login.component').then(m => m.LoginComponent),
            },
            {
                path: 'register',
                loadComponent: () =>
                    import('./components/register/register.component').then(m => m.RegisterComponent),
            },
        ],
    },
];
