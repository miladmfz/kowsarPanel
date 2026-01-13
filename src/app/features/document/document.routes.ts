import { Routes } from '@angular/router';

export const Document_ROUTES: Routes = [
    {
        path: '',
        loadComponent: () =>
            import('./document.component').then(m => m.DocumentComponent),
    },


];
