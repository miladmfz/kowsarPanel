import { Routes } from '@angular/router';
import { NotFoundComponent } from 'src/app/app-shell/core/not-found/not-found.component';

export const Hesabdari_ROUTES: Routes = [
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


    { path: 'acc-group-list', title: 'acc-group-list', loadComponent: () => import('./acc-group/acc-group-list/acc-group-list.component').then(m => m.AccGroupListComponent), },
    { path: 'acc-group-edit', title: 'acc-group-edit', loadComponent: () => import('./acc-group/acc-group-edit/acc-group-edit.component').then(m => m.AccGroupEditComponent), },
    { path: 'acc-group-edit/:id', title: 'acc-group-edit', loadComponent: () => import('./acc-group/acc-group-edit/acc-group-edit.component').then(m => m.AccGroupEditComponent), },
    { path: 'acc-kol-list', title: 'acc-kol-list', loadComponent: () => import('./acc-kol/acc-kol-list/acc-kol-list.component').then(m => m.AccKolListComponent), },
    { path: 'acc-kol-edit', title: 'acc-kol-edit', loadComponent: () => import('./acc-kol/acc-kol-edit/acc-kol-edit.component').then(m => m.AccKolEditComponent), },
    { path: 'acc-kol-edit/:id', title: 'acc-kol-edit', loadComponent: () => import('./acc-kol/acc-kol-edit/acc-kol-edit.component').then(m => m.AccKolEditComponent), },
    { path: 'acc-moeen-list', title: 'acc-moeen-list', loadComponent: () => import('./acc-moeen/acc-moeen-list/acc-moeen-list.component').then(m => m.AccMoeenListComponent), },
    { path: 'acc-moeen-edit', title: 'acc-moeen-edit', loadComponent: () => import('./acc-moeen/acc-moeen-edit/acc-moeen-edit.component').then(m => m.AccMoeenEditComponent), },
    { path: 'acc-moeen-edit/:id', title: 'acc-moeen-edit', loadComponent: () => import('./acc-moeen/acc-moeen-edit/acc-moeen-edit.component').then(m => m.AccMoeenEditComponent), },
    { path: 'acc-tafzily-list', title: 'acc-tafzily-list', loadComponent: () => import('./acc-tafzily/acc-tafzily-list/acc-tafzily-list.component').then(m => m.AccTafzilyListComponent), },
    { path: 'acc-tafzily-edit', title: 'acc-tafzily-edit', loadComponent: () => import('./acc-tafzily/acc-tafzily-edit/acc-tafzily-edit.component').then(m => m.AccTafzilyEditComponent), },
    { path: 'acc-tafzily-edit/:id', title: 'acc-tafzily-edit', loadComponent: () => import('./acc-tafzily/acc-tafzily-edit/acc-tafzily-edit.component').then(m => m.AccTafzilyEditComponent), },
    { path: 'acc-level-list', title: 'acc-level-list', loadComponent: () => import('./acc-level/acc-level-list/acc-level-list.component').then(m => m.AccLevelListComponent), },
    { path: 'acc-level-edit', title: 'acc-level-edit', loadComponent: () => import('./acc-level/acc-level-edit/acc-level-edit.component').then(m => m.AccLevelEditComponent), },
    { path: 'acc-level-edit/:id', title: 'acc-level-edit', loadComponent: () => import('./acc-level/acc-level-edit/acc-level-edit.component').then(m => m.AccLevelEditComponent), },
    { path: 'acc-accounts-list', title: 'acc-accounts-list', loadComponent: () => import('./acc-accounts/acc-accounts-list/acc-accounts-list.component').then(m => m.AccAccountsListComponent), },
    { path: 'acc-accounts-edit', title: 'acc-accounts-edit', loadComponent: () => import('./acc-accounts/acc-accounts-edit/acc-accounts-edit.component').then(m => m.AccAccountsEditComponent), },
    { path: 'acc-accounts-edit/:id', title: 'acc-accounts-edit', loadComponent: () => import('./acc-accounts/acc-accounts-edit/acc-accounts-edit.component').then(m => m.AccAccountsEditComponent), },
    { path: 'acc-sanad-type-list', title: 'acc-sanad-type-list', loadComponent: () => import('./acc-sanad-type/acc-sanad-type-list/acc-sanad-type-list.component').then(m => m.AccSanadTypeListComponent), },
    { path: 'acc-sanad-type-edit', title: 'acc-sanad-type-edit', loadComponent: () => import('./acc-sanad-type/acc-sanad-type-edit/acc-sanad-type-edit.component').then(m => m.AccSanadTypeEditComponent), },
    { path: 'acc-sanad-type-edit/:id', title: 'acc-sanad-type-edit', loadComponent: () => import('./acc-sanad-type/acc-sanad-type-edit/acc-sanad-type-edit.component').then(m => m.AccSanadTypeEditComponent), },
    { path: 'factor-account-list', title: 'factor-account-list', loadComponent: () => import('./factor-account/factor-account-list/factor-account-list.component').then(m => m.FactorAccountListComponent), },
    { path: 'factor-account-edit', title: 'factor-account-edit', loadComponent: () => import('./factor-account/factor-account-edit/factor-account-edit.component').then(m => m.FactorAccountEditComponent), },
    { path: 'factor-account-edit/:id', title: 'factor-account-edit', loadComponent: () => import('./factor-account/factor-account-edit/factor-account-edit.component').then(m => m.FactorAccountEditComponent), },
    { path: 'vwcentral-browse-list', title: 'vwcentral-browse-list', loadComponent: () => import('./vwcentral-brows/vwcentral-brows-list/vwcentral-brows-list.component').then(m => m.VwcentralBrowsListComponent), },
    { path: 'vwcentral-browse-edit', title: 'vwcentral-browse-edit', loadComponent: () => import('./vwcentral-brows/vwcentral-brows-edit/vwcentral-brows-edit.component').then(m => m.VwcentralBrowsEditComponent), },
    { path: 'vwcentral-browse-edit/:id', title: 'vwcentral-browse-edit', loadComponent: () => import('./vwcentral-brows/vwcentral-brows-edit/vwcentral-brows-edit.component').then(m => m.VwcentralBrowsEditComponent), },
    { path: 'close-acc-senario-list', title: 'close-acc-senario-list', loadComponent: () => import('./close-acc-senario/close-acc-senario-list/close-acc-senario-list.component').then(m => m.CloseAccSenarioListComponent), },
    { path: 'close-acc-senario-edit', title: 'close-acc-senario-edit', loadComponent: () => import('./close-acc-senario/close-acc-senario-edit/close-acc-senario-edit.component').then(m => m.CloseAccSenarioEditComponent), },
    { path: 'close-acc-senario-edit/:id', title: 'close-acc-senario-edit', loadComponent: () => import('./close-acc-senario/close-acc-senario-edit/close-acc-senario-edit.component').then(m => m.CloseAccSenarioEditComponent), },
    { path: 'acc-snd-explain-list', title: 'acc-snd-explain-list', loadComponent: () => import('./acc-snd-explain/acc-snd-explain-list/acc-snd-explain-list.component').then(m => m.AccSndExplainListComponent), },
    { path: 'acc-snd-explain-edit', title: 'acc-snd-explain-edit', loadComponent: () => import('./acc-snd-explain/acc-snd-explain-edit/acc-snd-explain-edit.component').then(m => m.AccSndExplainEditComponent), },
    { path: 'acc-snd-explain-edit/:id', title: 'acc-snd-explain-edit', loadComponent: () => import('./acc-snd-explain/acc-snd-explain-edit/acc-snd-explain-edit.component').then(m => m.AccSndExplainEditComponent), },
    { path: 'acc-sanad-browse-list', title: 'acc-sanad-browse-list', loadComponent: () => import('./acc-sanad-brows/acc-sanad-brows-list/acc-sanad-brows-list.component').then(m => m.AccSanadBrowsListComponent), },
    { path: 'acc-sanad-browse-edit', title: 'acc-sanad-browse-edit', loadComponent: () => import('./acc-sanad-brows/acc-sanad-brows-edit/acc-sanad-brows-edit.component').then(m => m.AccSanadBrowsEditComponent), },
    { path: 'acc-sanad-browse-edit/:id', title: 'acc-sanad-browse-edit', loadComponent: () => import('./acc-sanad-brows/acc-sanad-brows-edit/acc-sanad-brows-edit.component').then(m => m.AccSanadBrowsEditComponent), },




];
