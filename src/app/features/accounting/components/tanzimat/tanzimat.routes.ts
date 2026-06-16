import { Routes } from '@angular/router';
import { NotFoundComponent } from 'src/app/app-shell/core/not-found/not-found.component';

export const Tanzimat_ROUTES: Routes = [
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
        path: 'dbsetup',
        title: 'لیست تنظیمات کوثر',
        loadComponent: () =>
            import('./dbsetup/dbsetup-list/dbsetup-list.component')
                .then(m => m.DbsetupListComponent),
    },


    {
        path: 'fiscal-period-list',
        title: 'دوره مالی',
        loadComponent: () =>
            import('./fiscal-period/fiscal-period-list/fiscal-period-list.component')
                .then(m => m.FiscalPeriodListComponent),
    },


];
