import { Routes } from '@angular/router';

export const workforceAbsenceRoutes: Routes = [
    {
        path: 'workforce-absence',
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'request-list',
            },
            {
                path: 'dashboard',
                title: 'داشبورد مرخصی جدید',
                loadComponent: () =>
                    import('./dashboard/workforce-absence-dashboard.component')
                        .then((m) => m.WorkforceAbsenceDashboardComponent),
            },
            {
                path: 'request-list',
                title: 'لیست درخواست‌های مرخصی جدید',
                loadComponent: () =>
                    import('./request-list/workforce-absence-request-list.component')
                        .then((m) => m.WorkforceAbsenceRequestListComponent),
            },
            {
                path: 'request-edit',
                title: 'ثبت درخواست مرخصی جدید',
                loadComponent: () =>
                    import('./request-edit/workforce-absence-request-edit.component')
                        .then((m) => m.WorkforceAbsenceRequestEditComponent),
            },
            {
                path: 'request-edit/:id',
                title: 'ویرایش درخواست مرخصی جدید',
                loadComponent: () =>
                    import('./request-edit/workforce-absence-request-edit.component')
                        .then((m) => m.WorkforceAbsenceRequestEditComponent),
            },
            {
                path: 'policy-list',
                title: 'لیست Policy مرخصی جدید',
                loadComponent: () =>
                    import('./policy-list/workforce-absence-policy-list.component')
                        .then((m) => m.WorkforceAbsencePolicyListComponent),
            },
            {
                path: 'policy-edit',
                title: 'ایجاد Policy مرخصی جدید',
                loadComponent: () =>
                    import('./policy-edit/workforce-absence-policy-edit.component')
                        .then((m) => m.WorkforceAbsencePolicyEditComponent),
            },
            {
                path: 'policy-edit/:id',
                title: 'ویرایش Policy مرخصی جدید',
                loadComponent: () =>
                    import('./policy-edit/workforce-absence-policy-edit.component')
                        .then((m) => m.WorkforceAbsencePolicyEditComponent),
            },
            {
                path: 'type-list',
                title: 'انواع مرخصی جدید',
                loadComponent: () =>
                    import('./type-list/workforce-absence-type-list.component')
                        .then((m) => m.WorkforceAbsenceTypeListComponent),
            },
            {
                path: 'type-edit',
                title: 'ایجاد نوع مرخصی جدید',
                loadComponent: () =>
                    import('./type-edit/workforce-absence-type-edit.component')
                        .then((m) => m.WorkforceAbsenceTypeEditComponent),
            },
            {
                path: 'type-edit/:id',
                title: 'ویرایش نوع مرخصی جدید',
                loadComponent: () =>
                    import('./type-edit/workforce-absence-type-edit.component')
                        .then((m) => m.WorkforceAbsenceTypeEditComponent),
            },
        ],
    },
];
