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
                path: 'login-kowsar',
                loadComponent: () =>
                    import('./components/login-kowsar/login-kowsar.component').then(m => m.LoginKowsarComponent),
            },

            {
                path: 'login-person',
                loadComponent: () =>
                    import('./components/login-person/login-person.component').then(m => m.LoginPersonComponent),
            },



            {
                path: 'register',
                loadComponent: () =>
                    import('./components/register/register.component').then(m => m.RegisterComponent),
            },
            {
                path: 'change-password',
                loadComponent: () =>
                    import('./components/auth-change/auth-change.component').then(m => m.AuthChangeComponent),
            },








        ],
    },
];
