import { Routes } from '@angular/router';
import { NotFoundComponent } from 'src/app/app-shell/core/not-found/not-found.component';

export const Forosh_ROUTES: Routes = [
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


    //Factor
    {
        path: 'factor-list',
        title: 'لیست فاکتورهای کوثر',
        loadComponent: () =>
            import('./factor/factor-list/factor-list.component')
                .then(m => m.FactorListComponent),
    },
    {
        path: 'factor-edit',
        title: 'فاکتور کوثر',
        loadComponent: () =>
            import('./factor/factor-edit/factor-edit.component')
                .then(m => m.FactorEditComponent),
    },
    {
        path: 'factor-edit/:id',
        title: 'فاکتور کوثر',
        loadComponent: () =>
            import('./factor/factor-edit/factor-edit.component')
                .then(m => m.FactorEditComponent),
    },

    //PreFactor

    {
        path: 'prefactor-list',
        title: 'لیست پیش فاکتورهای کوثر',
        loadComponent: () =>
            import('./prefactor/prefactor-list/prefactor-list.component')
                .then(m => m.PrefactorListComponent),
    },
    {
        path: 'prefactor-edit',
        title: 'پیش فاکتور کوثر',
        loadComponent: () =>
            import('./prefactor/prefactor-edit/prefactor-edit.component')
                .then(m => m.PrefactorEditComponent),
    },
    {
        path: 'prefactor-edit/:id',
        title: 'پیش فاکتور کوثر',
        loadComponent: () =>
            import('./prefactor/prefactor-edit/prefactor-edit.component')
                .then(m => m.PrefactorEditComponent),
    },





    { path: 'daily-action-control-list', title: 'daily-action-control-list', loadComponent: () => import('./daily-action-control/daily-action-control-list/daily-action-control-list.component').then(m => m.DailyActionControlListComponent), },
    { path: 'daily-action-control-edit', title: 'daily-action-control-edit', loadComponent: () => import('./daily-action-control/daily-action-control-edit/daily-action-control-edit.component').then(m => m.DailyActionControlEditComponent), },
    { path: 'daily-action-control-edit/:id', title: 'daily-action-control-edit', loadComponent: () => import('./daily-action-control/daily-action-control-edit/daily-action-control-edit.component').then(m => m.DailyActionControlEditComponent), },

    { path: 'cafe-resturant-factor-list', title: 'cafe-resturant-factor-list', loadComponent: () => import('./cafe-resturant-factor/cafe-resturant-factor-list/cafe-resturant-factor-list.component').then(m => m.CafeResturantFactorListComponent), },
    { path: 'cafe-resturant-factor-edit', title: 'cafe-resturant-factor-edit', loadComponent: () => import('./cafe-resturant-factor/cafe-resturant-factor-edit/cafe-resturant-factor-edit.component').then(m => m.CafeResturantFactorEditComponent), },
    { path: 'cafe-resturant-factor-edit/:id', title: 'cafe-resturant-factor-edit', loadComponent: () => import('./cafe-resturant-factor/cafe-resturant-factor-edit/cafe-resturant-factor-edit.component').then(m => m.CafeResturantFactorEditComponent), },

    { path: 'return-factor-list', title: 'return-factor-list', loadComponent: () => import('./return-factor/return-factor-list/return-factor-list.component').then(m => m.ReturnFactorListComponent), },
    { path: 'return-factor-edit', title: 'return-factor-edit', loadComponent: () => import('./return-factor/return-factor-edit/return-factor-edit.component').then(m => m.ReturnFactorEditComponent), },
    { path: 'return-factor-edit/:id', title: 'return-factor-edit', loadComponent: () => import('./return-factor/return-factor-edit/return-factor-edit.component').then(m => m.ReturnFactorEditComponent), },

    { path: 'return-shopfactor-list', title: 'return-shopfactor-list', loadComponent: () => import('./return-shopfactor/return-shopfactor-list/return-shopfactor-list.component').then(m => m.ReturnShopfactorListComponent), },
    { path: 'return-shopfactor-edit', title: 'return-shopfactor-edit', loadComponent: () => import('./return-shopfactor/return-shopfactor-edit/return-shopfactor-edit.component').then(m => m.ReturnShopfactorEditComponent), },
    { path: 'return-shopfactor-edit/:id', title: 'return-shopfactor-edit', loadComponent: () => import('./return-shopfactor/return-shopfactor-edit/return-shopfactor-edit.component').then(m => m.ReturnShopfactorEditComponent), },

    { path: 'sell-dariaft-list', title: 'sell-dariaft-list', loadComponent: () => import('./sell-dariaft/sell-dariaft-list/sell-dariaft-list.component').then(m => m.SellDariaftListComponent), },
    { path: 'sell-dariaft-edit', title: 'sell-dariaft-edit', loadComponent: () => import('./sell-dariaft/sell-dariaft-edit/sell-dariaft-edit.component').then(m => m.SellDariaftEditComponent), },
    { path: 'sell-dariaft-edit/:id', title: 'sell-dariaft-edit', loadComponent: () => import('./sell-dariaft/sell-dariaft-edit/sell-dariaft-edit.component').then(m => m.SellDariaftEditComponent), },

    { path: 'sell-payment-list', title: 'sell-payment-list', loadComponent: () => import('./sell-payment/sell-payment-list/sell-payment-list.component').then(m => m.SellPaymentListComponent), },
    { path: 'sell-payment-edit', title: 'sell-payment-edit', loadComponent: () => import('./sell-payment/sell-payment-edit/sell-payment-edit.component').then(m => m.SellPaymentEditComponent), },
    { path: 'sell-payment-edit/:id', title: 'sell-payment-edit', loadComponent: () => import('./sell-payment/sell-payment-edit/sell-payment-edit.component').then(m => m.SellPaymentEditComponent), },

    { path: 'customer-mandeh-list', title: 'customer-mandeh-list', loadComponent: () => import('./customer-mandeh/customer-mandeh-list/customer-mandeh-list.component').then(m => m.CustomerMandehListComponent), },
    { path: 'customer-mandeh-edit', title: 'customer-mandeh-edit', loadComponent: () => import('./customer-mandeh/customer-mandeh-edit/customer-mandeh-edit.component').then(m => m.CustomerMandehEditComponent), },
    { path: 'customer-mandeh-edit/:id', title: 'customer-mandeh-edit', loadComponent: () => import('./customer-mandeh/customer-mandeh-edit/customer-mandeh-edit.component').then(m => m.CustomerMandehEditComponent), },

    { path: 'customer-group-list', title: 'customer-group-list', loadComponent: () => import('./customer-group/customer-group-list/customer-group-list.component').then(m => m.CustomerGroupListComponent), },
    { path: 'customer-group-edit', title: 'customer-group-edit', loadComponent: () => import('./customer-group/customer-group-edit/customer-group-edit.component').then(m => m.CustomerGroupEditComponent), },
    { path: 'customer-group-edit/:id', title: 'customer-group-edit', loadComponent: () => import('./customer-group/customer-group-edit/customer-group-edit.component').then(m => m.CustomerGroupEditComponent), },

    { path: 'shopfactor-list', title: 'shopfactor-list', loadComponent: () => import('./shopfactor/shopfactor-list/shopfactor-list.component').then(m => m.ShopfactorListComponent), },
    { path: 'shopfactor-edit', title: 'shopfactor-edit', loadComponent: () => import('./shopfactor/shopfactor-edit/shopfactor-edit.component').then(m => m.ShopfactorEditComponent), },
    { path: 'shopfactor-edit/:id', title: 'shopfactor-edit', loadComponent: () => import('./shopfactor/shopfactor-edit/shopfactor-edit.component').then(m => m.ShopfactorEditComponent), },

    { path: 'decincrement-list', title: 'decincrement-list', loadComponent: () => import('./decincrement/decincrement-list/decincrement-list.component').then(m => m.DecincrementListComponent), },
    { path: 'decincrement-edit', title: 'decincrement-edit', loadComponent: () => import('./decincrement/decincrement-edit/decincrement-edit.component').then(m => m.DecincrementEditComponent), },
    { path: 'decincrement-edit/:id', title: 'decincrement-edit', loadComponent: () => import('./decincrement/decincrement-edit/decincrement-edit.component').then(m => m.DecincrementEditComponent), },

    { path: 'customer-list', title: 'customer-list', loadComponent: () => import('./customer/customer-list/customer-list.component').then(m => m.CustomerListComponent), },
    { path: 'customer-edit', title: 'customer-edit', loadComponent: () => import('./customer/customer-edit/customer-edit.component').then(m => m.CustomerEditComponent), },
    { path: 'customer-edit/:id', title: 'customer-edit', loadComponent: () => import('./customer/customer-edit/customer-edit.component').then(m => m.CustomerEditComponent), },

    { path: 'personinfo-list', title: 'personinfo-list', loadComponent: () => import('./personinfo/personinfo-list/personinfo-list.component').then(m => m.PersoninfoListComponent), },
    { path: 'personinfo-edit', title: 'personinfo-edit', loadComponent: () => import('./personinfo/personinfo-edit/personinfo-edit.component').then(m => m.PersoninfoEditComponent), },
    { path: 'personinfo-edit/:id', title: 'personinfo-edit', loadComponent: () => import('./personinfo/personinfo-edit/personinfo-edit.component').then(m => m.PersoninfoEditComponent), },

    { path: 'personetebar-list', title: 'personetebar-list', loadComponent: () => import('./personetebar/personetebar-list/personetebar-list.component').then(m => m.PersonetebarListComponent), },
    { path: 'personetebar-edit', title: 'personetebar-edit', loadComponent: () => import('./personetebar/personetebar-edit/personetebar-edit.component').then(m => m.PersonetebarEditComponent), },
    { path: 'personetebar-edit/:id', title: 'personetebar-edit', loadComponent: () => import('./personetebar/personetebar-edit/personetebar-edit.component').then(m => m.PersonetebarEditComponent), },

    { path: 'sellbroker-list', title: 'sellbroker-list', loadComponent: () => import('./sellbroker/sellbroker-list/sellbroker-list.component').then(m => m.SellbrokerListComponent), },
    { path: 'sellbroker-edit', title: 'sellbroker-edit', loadComponent: () => import('./sellbroker/sellbroker-edit/sellbroker-edit.component').then(m => m.SellbrokerEditComponent), },
    { path: 'sellbroker-edit/:id', title: 'sellbroker-edit', loadComponent: () => import('./sellbroker/sellbroker-edit/sellbroker-edit.component').then(m => m.SellbrokerEditComponent), },

    { path: 'brokerpath-list', title: 'brokerpath-list', loadComponent: () => import('./brokerpath/brokerpath-list/brokerpath-list.component').then(m => m.BrokerpathListComponent), },
    { path: 'brokerpath-edit', title: 'brokerpath-edit', loadComponent: () => import('./brokerpath/brokerpath-edit/brokerpath-edit.component').then(m => m.BrokerpathEditComponent), },
    { path: 'brokerpath-edit/:id', title: 'brokerpath-edit', loadComponent: () => import('./brokerpath/brokerpath-edit/brokerpath-edit.component').then(m => m.BrokerpathEditComponent), },

    { path: 'goodvalueinpathgroup-list', title: 'goodvalueinpathgroup-list', loadComponent: () => import('./goodvalueinpathgroup/goodvalueinpathgroup-list/goodvalueinpathgroup-list.component').then(m => m.GoodvalueinpathgroupListComponent), },
    { path: 'goodvalueinpathgroup-edit', title: 'goodvalueinpathgroup-edit', loadComponent: () => import('./goodvalueinpathgroup/goodvalueinpathgroup-edit/goodvalueinpathgroup-edit.component').then(m => m.GoodvalueinpathgroupEditComponent), },
    { path: 'goodvalueinpathgroup-edit/:id', title: 'goodvalueinpathgroup-edit', loadComponent: () => import('./goodvalueinpathgroup/goodvalueinpathgroup-edit/goodvalueinpathgroup-edit.component').then(m => m.GoodvalueinpathgroupEditComponent), },


];