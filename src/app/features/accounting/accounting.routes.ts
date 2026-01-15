import { Routes } from '@angular/router';

export const Accounting_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./accounting.component').then(m => m.AccountingComponent),
    },

    //Factor
    {
        path: 'factor-list',
        title: 'لیست فاکتورهای کوثر',
        loadComponent: () =>
            import('./components/factor/factor-list/factor-list.component')
                .then(m => m.FactorListComponent),
    },
    {
        path: 'factor-edit',
        title: 'فاکتور کوثر',
        loadComponent: () =>
            import('./components/factor/factor-edit/factor-edit.component')
                .then(m => m.FactorEditComponent),
    },
    {
        path: 'factor-edit/:id',
        title: 'فاکتور کوثر',
        loadComponent: () =>
            import('./components/factor/factor-edit/factor-edit.component')
                .then(m => m.FactorEditComponent),
    },

    //PreFactor

    {
        path: 'prefactor-list',
        title: 'لیست پیش فاکتورهای کوثر',
        loadComponent: () =>
            import('./components/prefactor/prefactor-list/prefactor-list.component')
                .then(m => m.PrefactorListComponent),
    },
    {
        path: 'prefactor-edit',
        title: 'پیش فاکتور کوثر',
        loadComponent: () =>
            import('./components/prefactor/prefactor-edit/prefactor-edit.component')
                .then(m => m.PrefactorEditComponent),
    },
    {
        path: 'prefactor-edit/:id',
        title: 'پیش فاکتور کوثر',
        loadComponent: () =>
            import('./components/prefactor/prefactor-edit/prefactor-edit.component')
                .then(m => m.PrefactorEditComponent),
    },

    //good

    {
        path: 'good-list',
        title: 'لیست کالای کوثر  ',
        loadComponent: () =>
            import('./components/good/good-list/good-list.component')
                .then(m => m.GoodListComponent),
    },
    {
        path: 'good-edit',
        title: 'ایجاد کالا کوثر',
        loadComponent: () =>
            import('./components/good/good-edit/good-edit.component')
                .then(m => m.GoodEditComponent),
    },
    {
        path: 'good-edit/:id',
        title: 'اصلاح کالا کوثر',
        loadComponent: () =>
            import('./components/good/good-edit/good-edit.component')
                .then(m => m.GoodEditComponent),
    },


    //report

    {
        path: 'report-list',
        title: 'لیست گزارشات',
        loadComponent: () =>
            import('./components/report/report-list/report-list.component')
                .then(m => m.ReportListComponent),
    },
    {
        path: 'report-detail',
        title: 'جزئیات گزارش',
        loadComponent: () =>
            import('./components/report/report-detail/report-detail.component')
                .then(m => m.ReportDetailComponent),
    },
    {
        path: 'report-detail/:id',
        title: 'جزئیات گزارش',
        loadComponent: () =>
            import('./components/report/report-detail/report-detail.component')
                .then(m => m.ReportDetailComponent),
    },


    //report

    {
        path: 'dbsetup',
        title: 'لیست تنظیمات کوثر',
        loadComponent: () =>
            import('./components/dbsetup/dbsetup-list/dbsetup-list.component')
                .then(m => m.DbsetupListComponent),
    },


    //goodsgrp

    {
        path: 'goodsgrp-list',
        title: 'لیست تنظیمات کوثر',
        loadComponent: () =>
            import('./components/goodsgrp/goodsgrp-list/goodsgrp-list.component')
                .then(m => m.GoodsgrpListComponent),
    },


];
