import { Routes } from '@angular/router';

export const Report_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./reports.component').then(m => m.ReportsComponent),
    },


];
