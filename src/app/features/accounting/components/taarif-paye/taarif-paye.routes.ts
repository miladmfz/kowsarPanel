import { Routes } from '@angular/router';
import { NotFoundComponent } from 'src/app/app-shell/core/not-found/not-found.component';

export const TaarifPaye_ROUTES: Routes = [
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





    //central

    {
        path: 'central-list',
        title: 'لیست اجزایه پایه',
        loadComponent: () =>
            import('./central/central-list/central-list.component')
                .then(m => m.CentralListComponent),
    },
    {
        path: 'central-edit',
        title: 'جزئیات اجزای پایه',
        loadComponent: () =>
            import('./central/central-edit/central-edit.component')
                .then(m => m.CentralEditComponent),
    },
    {
        path: 'central-edit/:id',
        title: 'جزئیات اجزای پایه',
        loadComponent: () =>
            import('./central/central-edit/central-edit.component')
                .then(m => m.CentralEditComponent),
    },


    //city

    {
        path: 'city-list',
        title: 'لیست اجزایه پایه',
        loadComponent: () =>
            import('./city/city-list/city-list.component')
                .then(m => m.CityListComponent),
    },

    //centralgrp

    {
        path: 'centralgrp-list',
        title: 'لیست اجزایه پایه',
        loadComponent: () =>
            import('./centralgrp/centralgrp-list/centralgrp-list.component')
                .then(m => m.CentralgrpListComponent),
    },



    //job

    {
        path: 'job-list',
        title: 'job',
        loadComponent: () =>
            import('./job/job-list/job-list.component')
                .then(m => m.JobListComponent),
    },
    {
        path: 'job-edit',
        title: 'job',
        loadComponent: () =>
            import('./job/job-edit/job-edit.component')
                .then(m => m.JobEditComponent),
    },
    {
        path: 'job-edit/:id',
        title: 'job',
        loadComponent: () =>
            import('./job/job-edit/job-edit.component')
                .then(m => m.JobEditComponent),
    },



    //jobperson

    {
        path: 'jobperson-list',
        title: 'jobperson',
        loadComponent: () =>
            import('./jobperson/jobperson-list/jobperson-list.component')
                .then(m => m.JobpersonListComponent),
    },
    {
        path: 'jobperson-edit',
        title: 'jobperson',
        loadComponent: () =>
            import('./jobperson/jobperson-edit/jobperson-edit.component')
                .then(m => m.JobpersonEditComponent),
    },
    {
        path: 'jobperson-edit/:id',
        title: 'jobperson',
        loadComponent: () =>
            import('./jobperson/jobperson-edit/jobperson-edit.component')
                .then(m => m.JobpersonEditComponent),
    },




    //currencyexchange

    {
        path: 'currencyexchange-list',
        title: 'currencyexchange',
        loadComponent: () =>
            import('./currencyexchange/currencyexchange-list/currencyexchange-list.component')
                .then(m => m.CurrencyexchangeListComponent),
    },
    {
        path: 'currencyexchange-edit',
        title: 'currencyexchange',
        loadComponent: () =>
            import('./currencyexchange/currencyexchange-edit/currencyexchange-edit.component')
                .then(m => m.CurrencyexchangeEditComponent),
    },
    {
        path: 'currencyexchange-edit/:id',
        title: 'currencyexchange',
        loadComponent: () =>
            import('./currencyexchange/currencyexchange-edit/currencyexchange-edit.component')
                .then(m => m.CurrencyexchangeEditComponent),
    },

];
