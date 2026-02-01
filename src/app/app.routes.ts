import { Routes } from '@angular/router';
import { NotFoundComponent } from './app-shell/core/not-found/not-found.component';
import { AuthGuard } from './app-shell/framework-services/AuthGuard';

// 🛡️ Guards
// import { RoleGuard } from './app-shell/framework-services/auth/role.guard';
// import { UrlGuard } from './app-shell/framework-services/auth/url.guard';

export const routes: Routes = [

    // 🔐 ماژول احراز هویت (Login/Register/Recovery)
    {
        path: 'auth',
        loadChildren: () =>
            import('./auth-kowsar/auth-kowsar-routing')
                .then(m => m.authKowsarRoutes),
    },

    // 🏠 مسیر اصلی → داشبورد (بعد از لاگین)
    {
        path: '',
        canActivate: [AuthGuard],
        loadComponent: () =>
            import('./app-shell/core/layout.component')
                .then(m => m.LayoutComponent),

        children: [

            {
                path: '',
                redirectTo: 'dashboard',
                pathMatch: 'full',
            },

            // 📊 داشبورد
            {
                path: 'dashboard',
                loadComponent: () =>
                    import('./app-shell/core/dashboard/dashboard.component')
                        .then(m => m.DashboardComponent),
            },

            // 💼 حسابداری
            {
                path: 'accounting',
                // canActivate: [RoleGuard],
                loadChildren: () =>
                    import('./features/accounting/accounting.routes')
                        .then(m => m.Accounting_ROUTES),
            },

            // 💬 پشتیبانی
            {
                path: 'support',
                loadChildren: () =>
                    import('./features/support/support.routes')
                        .then(m => m.SUPPORT_ROUTES),
            },

            // 📱 ماژول‌ها
            {
                path: 'module',
                loadChildren: () =>
                    import('./features/module/module.routes')
                        .then(m => m.Module_ROUTES),
            },


            // 🧰 پنل داخلی
            {
                path: 'internal',
                // canActivate: [UrlGuard, RoleGuard],
                loadChildren: () =>
                    import('./features/internal/internal.routes')
                        .then(m => m.INTERNAL_ROUTES),
            },
        ],
    },

    // 🚫 404
    {
        path: '**',
        component: NotFoundComponent,
    },
];
