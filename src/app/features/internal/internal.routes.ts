import { Routes } from '@angular/router';

export const INTERNAL_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./internal.component').then(m => m.InternalComponent),
    },
    // 📌 INTERNAL APPS — اپلیکیشن‌های داخلی کوثر
    {
        path: 'internal-apps-list',
        title: 'لیست اپلیکیشن‌های داخلی کوثر',
        loadComponent: () =>
            import('./components/internal-apps/internal-apps-list/internal-apps-list.component')
                .then(m => m.InternalAppsListComponent),
    },
    {
        path: 'internal-apps-edit',
        title: 'اپلیکیشن داخلی جدید',
        loadComponent: () =>
            import('./components/internal-apps/internal-apps-edit/internal-apps-edit.component')
                .then(m => m.InternalAppsEditComponent),
    },
    {
        path: 'internal-apps-edit/:id',
        title: 'ویرایش اپلیکیشن داخلی',
        loadComponent: () =>
            import('./components/internal-apps/internal-apps-edit/internal-apps-edit.component')
                .then(m => m.InternalAppsEditComponent),
    },


    // 📌 INTERNAL WEBSITE — وب‌سایت‌های داخلی کوثر
    {
        path: 'internal-website-list',
        title: 'لیست وب‌سایت‌های داخلی کوثر',
        loadComponent: () =>
            import('./components/internal-website/internal-website-list/internal-website-list.component')
                .then(m => m.InternalWebsiteListComponent),
    },
    {
        path: 'internal-website-edit',
        title: 'وب‌سایت داخلی جدید',
        loadComponent: () =>
            import('./components/internal-website/internal-website-edit/internal-website-edit.component')
                .then(m => m.InternalWebsiteEditComponent),
    },
    {
        path: 'internal-website-edit/:id',
        title: 'ویرایش وب‌سایت داخلی',
        loadComponent: () =>
            import('./components/internal-website/internal-website-edit/internal-website-edit.component')
                .then(m => m.InternalWebsiteEditComponent),
    },
    {
        path: 'weblog',
        title: 'weblog',

        loadComponent: () =>
            import('../../app-shell/framework-components/kowsar/kowsar-weblog/kowsar-weblog.component').then(m => m.KowsarWeblogComponent),
    },

    {
        path: 'internal-report',
        title: 'گزارشات داخلی',
        loadComponent: () =>
            import('./components/internal-report/internal-report.component')
                .then(m => m.InternalReportComponent),
    },
    {
        path: 'internal-customer-list',
        title: 'مشتریان',
        loadComponent: () =>
            import('./components/internal-customer/internal-customer-list/internal-customer-list.component')
                .then(m => m.InternalCustomerListComponent),
    },
    {
        path: 'internal-customer-edit',
        title: 'اپلیکیشن داخلی جدید',
        loadComponent: () =>
            import('./components/internal-customer/internal-customer-edit/internal-customer-edit.component')
                .then(m => m.InternalCustomerEditComponent),
    },
    {
        path: 'internal-customer-edit/:id',
        title: 'ویرایش اپلیکیشن داخلی',
        loadComponent: () =>
            import('./components/internal-customer/internal-customer-edit/internal-customer-edit.component')
                .then(m => m.InternalCustomerEditComponent),
    },






    // 📌 INTERNAL APPS — اپلیکیشن‌های داخلی کوثر
    {
        path: 'internal-task-list',
        title: 'لیست اپلیکیشن‌های داخلی کوثر',
        loadComponent: () =>
            import('./components/internal-task/internal-task-list/internal-task-list.component')
                .then(m => m.InternalTaskListComponent),
    },
    {
        path: 'internal-task-edit',
        title: 'اپلیکیشن داخلی جدید',
        loadComponent: () =>
            import('./components/internal-task/internal-task-edit/internal-task-edit.component')
                .then(m => m.InternalTaskEditComponent),
    },
    {
        path: 'internal-task-edit/:id',
        title: 'ویرایش اپلیکیشن داخلی',
        loadComponent: () =>
            import('./components/internal-task/internal-task-edit/internal-task-edit.component')
                .then(m => m.InternalTaskEditComponent),
    },




    // 📌 INTERNAL APPS — اپلیکیشن‌های داخلی کوثر
    {
        path: 'internal-good-list',
        title: 'لیست کالا کوثر',
        loadComponent: () =>
            import('./components/internal-good/internal-good-list/internal-good-list.component')
                .then(m => m.InternalGoodListComponent),
    },
    {
        path: 'internal-good-edit',
        title: 'کالا جدید',
        loadComponent: () =>
            import('./components/internal-good/internal-good-edit/internal-good-edit.component')
                .then(m => m.InternalGoodEditComponent),
    },
    {
        path: 'internal-good-edit/:id',
        title: 'ویرایش کالا',
        loadComponent: () =>
            import('./components/internal-good/internal-good-edit/internal-good-edit.component')
                .then(m => m.InternalGoodEditComponent),
    },




    // 📌 INTERNAL APPS — اپلیکیشن‌های داخلی کوثر
    {
        path: 'internal-factors-list',
        title: 'لیست اپلیکیشن‌های داخلی کوثر',
        loadComponent: () =>
            import('./components/internal-factors/internal-factors-list/internal-factors-list.component')
                .then(m => m.InternalFactorsListComponent),
    },
    {
        path: 'internal-factors-edit',
        title: 'اپلیکیشن داخلی جدید',
        loadComponent: () =>
            import('./components/internal-factors/internal-factors-edit/internal-factors-edit.component')
                .then(m => m.InternalFactorsEditComponent),
    },
    {
        path: 'internal-factors-edit/:id',
        title: 'ویرایش اپلیکیشن داخلی',
        loadComponent: () =>
            import('./components/internal-factors/internal-factors-edit/internal-factors-edit.component')
                .then(m => m.InternalFactorsEditComponent),
    },




    // 📌 INTERNAL APPS — اپلیکیشن‌های داخلی کوثر
    {
        path: 'module-config-list',
        title: 'لیست پیش فرض های سیستم',
        loadComponent: () =>
            import('./components/module-config/module-config-list/module-config-list.component')
                .then(m => m.ModuleConfigListComponent),
    },
    {
        path: 'module-config-edit',
        title: 'پیش فرض جدید',
        loadComponent: () =>
            import('./components/module-config/module-config-edit/module-config-edit.component')
                .then(m => m.ModuleConfigEditComponent),
    },
    {
        path: 'module-config-edit/:id',
        title: 'ویرایش پیش فرض',
        loadComponent: () =>
            import('./components/module-config/module-config-edit/module-config-edit.component')
                .then(m => m.ModuleConfigEditComponent),
    },



    {
        path: 'news-rss',
        title: 'خبر ها',
        loadComponent: () =>
            import('./components/internal-news/internal-news-rss/internal-news-rss.component')
                .then(m => m.InternalNewsRssComponent),
    },


];
