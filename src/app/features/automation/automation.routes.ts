import { Routes } from '@angular/router';

export const AUTOMATION_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./automation.component').then(m => m.AutomationComponent),
    },
    {
        path: 'leaverequest-list',
        title: 'لیست درخواست‌های مرخصی',
        loadComponent: () =>
            import('./components/leaverequest/leaverequest-list/leaverequest-list.component').then(m => m.LeaverequestListComponent),
    },
    {
        path: 'leaverequest-edit',
        title: 'درخواست مرخصی جدید',
        loadComponent: () =>
            import('./components/leaverequest/leaverequest-edit/leaverequest-edit.component').then(m => m.LeaverequestEditComponent),
    },
    {
        path: 'leaverequest-edit/:id',
        title: 'ویرایش درخواست مرخصی',
        loadComponent: () =>
            import('./components/leaverequest/leaverequest-edit/leaverequest-edit.component').then(m => m.LeaverequestEditComponent),
    },



    {
        path: 'letter-customer',
        title: 'لیست نامه‌ها',
        loadComponent: () =>
            import('./components/autletter/autletter-customer-list/autletter-customer-list.component').then(
                (m) => m.AutletterCustomerListComponent
            ),
    },


    {
        path: 'letter-user',
        title: 'لیست نامه‌ها',
        loadComponent: () =>
            import('./components/autletter/autletter-kowsar-list/autletter-kowsar-list.component').then(
                (m) => m.AutletterKowsarListComponent
            ),
    },

    {
        path: 'letter-panel/:id',
        title: 'جزئیات نامه',
        loadComponent: () =>
            import('./components/autletter/autletter-panel/autletter-panel.component').then(
                (m) => m.AutletterPanelComponent
            ),
    },
    {
        path: 'insert-letter',
        title: 'افزودن نامه جدید',
        loadComponent: () =>
            import('./components/autletter/autletter-insert/autletter-insert.component').then(
                (m) => m.AutletterInsertComponent
            ),
    },
    {
        path: 'letter-mine',
        title: 'نامه‌های من',
        loadComponent: () =>
            import('./components/autletter/autletter-mine/autletter-mine.component').then(
                (m) => m.AutLetterMineComponent
            ),
    },


    {
        path: 'employe-list',
        title: 'کارمندان',
        loadComponent: () =>
            import('./components/salary/employe/employe-list/employe-list.component').then(
                (m) => m.EmployeListComponent
            ),
    },
    {
        path: 'employe-edit',
        title: 'کارمندان',
        loadComponent: () =>
            import('./components/salary/employe/employe-edit/employe-edit.component').then(m => m.EmployeEditComponent),
    },
    {
        path: 'employe-edit/:id',
        title: 'کارمندان',
        loadComponent: () =>
            import('./components/salary/employe/employe-edit/employe-edit.component').then(m => m.EmployeEditComponent),
    },





    {
        path: 'monthsummary-list',
        title: 'لیست ماه',
        loadComponent: () =>
            import('./components/salary/monthsummary/monthsummary-list/monthsummary-list.component').then(
                (m) => m.MonthsummaryListComponent
            ),
    },
    {
        path: 'monthsummary-edit',
        title: 'لیست ماه',
        loadComponent: () =>
            import('./components/salary/monthsummary/monthsummary-edit/monthsummary-edit.component').then(m => m.MonthsummaryEditComponent),
    },
    {
        path: 'monthsummary-edit/:id',
        title: 'لیست ماه',
        loadComponent: () =>
            import('./components/salary/monthsummary/monthsummary-edit/monthsummary-edit.component').then(m => m.MonthsummaryEditComponent),
    },






    {
        path: 'salarysummary-list',
        title: 'لیست حقوق',
        loadComponent: () =>
            import('./components/salary/salarysummary/salarysummary-list/salarysummary-list.component').then(
                (m) => m.SalarysummaryListComponent
            ),
    },
    {
        path: 'salarysummary-edit',
        title: 'لیست حقوق',
        loadComponent: () =>
            import('./components/salary/salarysummary/salarysummary-edit/salarysummary-edit.component').then(m => m.SalarysummaryEditComponent),
    },
    {
        path: 'salarysummary-edit/:id',
        title: 'لیست حقوق',
        loadComponent: () =>
            import('./components/salary/salarysummary/salarysummary-edit/salarysummary-edit.component').then(m => m.SalarysummaryEditComponent),
    },





];
