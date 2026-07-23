import { Routes } from '@angular/router';

export const Module_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./module.component').then(m => m.ModuleComponent),
    },


    //Factor
    {
        path: 'broker-app',
        title: 'نرم افزار بازاریاب',
        loadComponent: () =>
            import('./components/android/broker-app/broker-app.component')
                .then(m => m.BrokerAppComponent),
    }, {
        path: 'ocr-app',
        title: 'نرم افزار پردازش انبار',
        loadComponent: () =>
            import('./components/android/ocr-app/ocr-app.component')
                .then(m => m.OcrAppComponent),
    }, {
        path: 'order-app',
        title: 'نرم افزار سفارشگیر',
        loadComponent: () =>
            import('./components/android/order-app/order-app.component')
                .then(m => m.OrderAppComponent),
    },

];
