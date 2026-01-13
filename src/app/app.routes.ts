import { Routes } from '@angular/router';
import { NotFoundComponent } from './app-shell/core/not-found/not-found.component';

// // 🛡️ گاردها (در صورت وجود)
// import { AuthGuard } from './app-shell/framework-services/auth/auth.guard';
// import { RoleGuard } from './app-shell/framework-services/auth/role.guard';
// import { UrlGuard } from './app-shell/framework-services/auth/url.guard';

export const routes: Routes = [
    // 🏠 مسیر اصلی → داشبورد
    {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
    },

    //   لایه‌ی اصلی (LayoutComponent)
    {
        path: '',
        loadComponent: () =>
            import('./app-shell/core/layout.component').then(m => m.LayoutComponent),

        // 🧭 مسیرهای داخلی (زیرمجموعه Layout)
        children: [
            //   داشبورد
            {
                path: 'dashboard',
                // canActivate: [AuthGuard],
                loadComponent: () =>
                    import('./app-shell/core/dashboard/dashboard.component').then(m => m.DashboardComponent),
            },

            // // 💼 حسابداری / بخش‌های پایه
            {
                path: 'accounting',
                // canActivate: [AuthGuard, RoleGuard],
                loadChildren: () =>
                    import('./features/accounting/accounting.routes').then(m => m.Accounting_ROUTES),
            },

            // 💬 پشتیبانی / تیکت / مرخصی / گزارش پشتیبانی
            {
                path: 'support',
                // canActivate: [AuthGuard],
                loadChildren: () =>
                    import('./features/support/support.routes').then(m => m.SUPPORT_ROUTES),
            },

            // 📱 اپ‌های جانبی (Website, MobileApp, OCR, Order, Broker)
            {
                path: 'module',
                // canActivate: [AuthGuard],
                loadChildren: () =>
                    import('./features/module/module.routes').then(m => m.Module_ROUTES),
            },

            // // 📈 گزارش‌ها (گزارشات عمومی و Kowsar)
            {
                path: 'reports',
                // canActivate: [AuthGuard],
                loadChildren: () =>
                    import('./features/reports/reports.routes').then(m => m.Report_ROUTES),
            },

            // 🧰 پنل داخلی شرکت (فقط برای دامنه/نقش خاص)
            {
                path: 'internal',
                // canActivate: [AuthGuard, UrlGuard, RoleGuard],
                loadChildren: () =>
                    import('./features/internal/internal.routes').then(m => m.INTERNAL_ROUTES),
            },

        ],
    },

    // 🔐 ماژول احراز هویت (Login/Register/Recovery)
    {
        path: 'auth',
        loadChildren: () =>
            import('./auth-kowsar/auth-kowsar-routing').then((m) => m.authKowsarRoutes),
    },

    // 🚫 مسیرهای اشتباه → صفحه 404
    {
        path: '**',
        component: NotFoundComponent,
    },
];
