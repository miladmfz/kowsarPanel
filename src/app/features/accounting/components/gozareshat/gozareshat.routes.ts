import { Routes } from '@angular/router';
import { NotFoundComponent } from 'src/app/app-shell/core/not-found/not-found.component';
import { biGuard } from './bi-workspace/bi.guard';
import { biCatalogGuard } from './bi-workspace/bi-catalog.guard';
import { biAuditGuard } from './bi-workspace/bi-audit.guard';
import { biOperationsGuard } from './bi-workspace/bi-operations.guard';

export const Gozareshat_ROUTES: Routes = [
    {
        path: '',
        component: NotFoundComponent,


    },
    // 🚫 404
    // {
    //     path: '**',
    //     component: NotFoundComponent,
    // },

    // {
    //     path: 'forosh',
    //     loadChildren: () =>
    //         import('./features/accounting/accounting.routes')
    //             .then(m => m.Accounting_ROUTES),
    // },


    //report

    {
        path: 'bi',
        title: 'مرکز داشبوردهای مدیریتی',
        canActivate: [biGuard],
        loadComponent: () =>
            import('./bi-workspace/bi-home.component')
                .then(m => m.BiHomeComponent),
    },

    {
        path: 'bi/workspace',
        title: 'داشبورد مدیریتی',
        canActivate: [biGuard],
        loadComponent: () =>
            import('./bi-workspace/bi-workspace.component')
                .then(m => m.BiWorkspaceComponent),
    },

    {
        path: 'bi/catalog',
        title: 'مدیریت کاتالوگ BI',
        canActivate: [biGuard, biCatalogGuard],
        loadComponent: () =>
            import('./bi-workspace/bi-catalog-admin.component')
                .then(m => m.BiCatalogAdminComponent),
    },

    {
        path: 'bi/audit',
        title: 'ممیزی داشبوردهای BI',
        canActivate: [biGuard, biAuditGuard],
        loadComponent: () => import('./bi-workspace/bi-audit.component').then(m => m.BiAuditComponent),
    },

    {
        path: 'bi/operations',
        title: 'مرکز عملیات هوش مدیریتی',
        canActivate: [biGuard, biOperationsGuard],
        loadComponent: () => import('./bi-workspace/bi-operations.component').then(m => m.BiOperationsComponent),
    },

    {
        path: 'bi/analytics',
        title: 'تحلیل پیشرفته مدیریتی',
        canActivate: [biGuard],
        loadComponent: () => import('./bi-workspace/bi-analytics.component').then(m => m.BiAnalyticsComponent),
    },

    {
        path: 'report-list',
        title: 'لیست گزارشات',
        loadComponent: () =>
            import('./report/report-list/report-list.component')
                .then(m => m.ReportListComponent),
    },
    {
        path: 'report-detail',
        title: 'جزئیات گزارش',
        loadComponent: () =>
            import('./report/report-detail/report-detail.component')
                .then(m => m.ReportDetailComponent),
    },
    {
        path: 'report-detail/:id',
        title: 'جزئیات گزارش',
        loadComponent: () =>
            import('./report/report-detail/report-detail.component')
                .then(m => m.ReportDetailComponent),
    },



    {
        path: 'chart-list',
        title: 'لیست گزارشات',
        loadComponent: () =>
            import('./chart/chart-list/chart-list.component')
                .then(m => m.ChartListComponent),
    },
    {
        path: 'chart-detail',
        title: 'جزئیات گزارش',
        loadComponent: () =>
            import('./chart/chart-detail/chart-detail.component')
                .then(m => m.ChartDetailComponent),
    },
    {
        path: 'chart-detail/:id',
        title: 'جزئیات گزارش',
        loadComponent: () =>
            import('./chart/chart-detail/chart-detail.component')
                .then(m => m.ChartDetailComponent),
    },
];
