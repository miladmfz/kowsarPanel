import { Routes } from '@angular/router';

export const Santral_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./santral.component').then(m => m.SantralComponent),
    },
    {
        path: 'santral-report',
        title: 'گزارش تماس',
        loadComponent: () =>
            import('./components/santral-dashboard/santral-dashboard.component')
                .then(m => m.SantralDashboardComponent),
    },


    {
        path: 'santral-call-report-center',
        title: 'مرکز گزارش تماس',
        loadComponent: () =>
            import('./components/santral-call-report-center/santral-call-report-center.component')
                .then(m => m.SantralCallReportCenterComponent),
    },


    {
        path: 'santral-call',
        title: 'مرکز تماس',
        loadComponent: () =>
            import('./components/santral-list/santral-list.component')
                .then(m => m.SantralListComponent),
    },
    {
        path: 'santral-extension-monitor',
        title: 'گزارش وضعیت داخلی‌ها',
        loadComponent: () =>
            import('./components/santral-extension-monitor/santral-extension-monitor.component')
                .then(m => m.SantralExtensionMonitorComponent),
    },
    {
        path: 'santral-user',
        title: 'کاربران',
        loadComponent: () =>
            import('./components/santral-user/santral-user.component')
                .then(m => m.SantralUserComponent),
    },

    {
        path: 'santral-phonebook',
        title: 'دفترچه تلفن',
        loadComponent: () =>
            import('./components/santral-phonebook/santral-phonebook.component')
                .then(m => m.SantralPhonebookComponent),
    },


    {
        path: 'santral-operator-ranking',
        title: 'رتبه بندی کاربران',
        loadComponent: () =>
            import('./components/santral-operator-ranking/santral-operator-ranking.component')
                .then(m => m.SantralOperatorRankingComponent),
    },



    {
        path: 'santral-ringgroup',
        title: 'گروه بنده کاربران',
        loadComponent: () =>
            import('./components/santral-ringgroup/santral-ringgroup.component')
                .then(m => m.SantralRingGroupComponent),
    },


    {
        path: 'santral-blacklist',
        title: 'لیست سیاه',
        loadComponent: () =>
            import('./components/santral-blacklist/santral-blacklist.component')
                .then(m => m.SantralBlacklistComponent),
    },
    {
        path: 'santral-phone',
        title: 'تلفن',
        loadComponent: () =>
            import('./components/santral-phone/santral-phone.component')
                .then(m => m.SantralPhoneComponent),
    },



];
