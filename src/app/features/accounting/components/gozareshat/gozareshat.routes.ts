import { Routes } from '@angular/router';
import { NotFoundComponent } from 'src/app/app-shell/core/not-found/not-found.component';

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
