import { Routes } from '@angular/router';
import { NotFoundComponent } from 'src/app/app-shell/core/not-found/not-found.component';

export const Accounting_ROUTES: Routes = [
    {
        path: '',
        component: NotFoundComponent,


    },
    // 🚫 404
    // {
    //     path: '**',
    //     component: NotFoundComponent,
    // },

    {
        path: 'forosh',
        loadChildren: () =>
            import('./components/forosh/forosh.routes')
                .then(m => m.Forosh_ROUTES),
    },


    {
        path: 'tanzimat',
        loadChildren: () =>
            import('./components/tanzimat/tanzimat.routes')
                .then(m => m.Tanzimat_ROUTES),
    },


    {
        path: 'taarif-paye',
        loadChildren: () =>
            import('./components/taarif-paye/taarif-paye.routes')
                .then(m => m.TaarifPaye_ROUTES),
    },


    {
        path: 'khazane',
        loadChildren: () =>
            import('./components/khazane/khazane.routes')
                .then(m => m.Khazane_ROUTES),
    },


    {
        path: 'kharid',
        loadChildren: () =>
            import('./components/kharid/kharid.routes')
                .then(m => m.Kharid_ROUTES),
    },


    {
        path: 'hesabdari',
        loadChildren: () =>
            import('./components/hesabdari/hesabdari.routes')
                .then(m => m.Hesabdari_ROUTES),
    },


    {
        path: 'hoghogh-dastmozd',
        loadChildren: () =>
            import('./components/hoghogh-dastmozd/hoghogh-dastmozd.routes')
                .then(m => m.HoghoghDastmozd_ROUTES),
    },



    {
        path: 'gozareshat',
        loadChildren: () =>
            import('./components/gozareshat/gozareshat.routes')
                .then(m => m.Gozareshat_ROUTES),
    },












    //Sample

    {
        path: 'sample/:id/:id_str',
        title: 'sample',
        loadComponent: () =>
            import('../../app-shell/framework-components/kowsar/kowsar-sample-view/kowsar-sample-view.component')
                .then(m => m.KowsarSampleViewComponent),
    },

    {
        path: 'sample/:id',
        title: 'sample',
        loadComponent: () =>
            import('../../app-shell/framework-components/kowsar/kowsar-sample-view/kowsar-sample-view.component')
                .then(m => m.KowsarSampleViewComponent),
    },


];
