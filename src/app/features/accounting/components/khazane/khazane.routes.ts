import { Routes } from '@angular/router';
import { NotFoundComponent } from 'src/app/app-shell/core/not-found/not-found.component';

export const Khazane_ROUTES: Routes = [
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


    { path: 'khazane-receive-list', title: 'khazane-receive-list', loadComponent: () => import('./khazane-receive/khazane-receive-list/khazane-receive-list.component').then(m => m.KhazaneReceiveListComponent), },
    { path: 'khazane-receive-edit', title: 'khazane-receive-edit', loadComponent: () => import('./khazane-receive/khazane-receive-edit/khazane-receive-edit.component').then(m => m.KhazaneReceiveEditComponent), },
    { path: 'khazane-receive-edit/:id', title: 'khazane-receive-edit', loadComponent: () => import('./khazane-receive/khazane-receive-edit/khazane-receive-edit.component').then(m => m.KhazaneReceiveEditComponent), },
    { path: 'khazane-payment-list', title: 'khazane-payment-list', loadComponent: () => import('./khazane-payment/khazane-payment-list/khazane-payment-list.component').then(m => m.KhazanePaymentListComponent), },
    { path: 'khazane-payment-edit', title: 'khazane-payment-edit', loadComponent: () => import('./khazane-payment/khazane-payment-edit/khazane-payment-edit.component').then(m => m.KhazanePaymentEditComponent), },
    { path: 'khazane-payment-edit/:id', title: 'khazane-payment-edit', loadComponent: () => import('./khazane-payment/khazane-payment-edit/khazane-payment-edit.component').then(m => m.KhazanePaymentEditComponent), },
    { path: 'return-checks-list', title: 'return-checks-list', loadComponent: () => import('./return-checks/return-checks-list/return-checks-list.component').then(m => m.ReturnChecksListComponent), },
    { path: 'return-checks-edit', title: 'return-checks-edit', loadComponent: () => import('./return-checks/return-checks-edit/return-checks-edit.component').then(m => m.ReturnChecksEditComponent), },
    { path: 'return-checks-edit/:id', title: 'return-checks-edit', loadComponent: () => import('./return-checks/return-checks-edit/return-checks-edit.component').then(m => m.ReturnChecksEditComponent), },
    { path: 'check-cansel-list', title: 'check-cansel-list', loadComponent: () => import('./check-cansel/check-cansel-list/check-cansel-list.component').then(m => m.CheckCanselListComponent), },
    { path: 'check-cansel-edit', title: 'check-cansel-edit', loadComponent: () => import('./check-cansel/check-cansel-edit/check-cansel-edit.component').then(m => m.CheckCanselEditComponent), },
    { path: 'check-cansel-edit/:id', title: 'check-cansel-edit', loadComponent: () => import('./check-cansel/check-cansel-edit/check-cansel-edit.component').then(m => m.CheckCanselEditComponent), },
    { path: 'received-chk-inf-list', title: 'received-chk-inf-list', loadComponent: () => import('./received-chk-inf/received-chk-inf-list/received-chk-inf-list.component').then(m => m.ReceivedChkInfListComponent), },
    { path: 'received-chk-inf-edit', title: 'received-chk-inf-edit', loadComponent: () => import('./received-chk-inf/received-chk-inf-edit/received-chk-inf-edit.component').then(m => m.ReceivedChkInfEditComponent), },
    { path: 'received-chk-inf-edit/:id', title: 'received-chk-inf-edit', loadComponent: () => import('./received-chk-inf/received-chk-inf-edit/received-chk-inf-edit.component').then(m => m.ReceivedChkInfEditComponent), },
    { path: 'check-passes-inf-list', title: 'check-passes-inf-list', loadComponent: () => import('./check-passes-inf/check-passes-inf-list/check-passes-inf-list.component').then(m => m.CheckPassesInfListComponent), },
    { path: 'check-passes-inf-edit', title: 'check-passes-inf-edit', loadComponent: () => import('./check-passes-inf/check-passes-inf-edit/check-passes-inf-edit.component').then(m => m.CheckPassesInfEditComponent), },
    { path: 'check-passes-inf-edit/:id', title: 'check-passes-inf-edit', loadComponent: () => import('./check-passes-inf/check-passes-inf-edit/check-passes-inf-edit.component').then(m => m.CheckPassesInfEditComponent), },
    { path: 'cash-list', title: 'cash-list', loadComponent: () => import('./cash/cash-list/cash-list.component').then(m => m.CashListComponent), },
    { path: 'cash-edit', title: 'cash-edit', loadComponent: () => import('./cash/cash-edit/cash-edit.component').then(m => m.CashEditComponent), },
    { path: 'cash-edit/:id', title: 'cash-edit', loadComponent: () => import('./cash/cash-edit/cash-edit.component').then(m => m.CashEditComponent), },
    { path: 'bank-list', title: 'bank-list', loadComponent: () => import('./bank/bank-list/bank-list.component').then(m => m.BankListComponent), },
    { path: 'bank-edit', title: 'bank-edit', loadComponent: () => import('./bank/bank-edit/bank-edit.component').then(m => m.BankEditComponent), },
    { path: 'bank-edit/:id', title: 'bank-edit', loadComponent: () => import('./bank/bank-edit/bank-edit.component').then(m => m.BankEditComponent), },



];
