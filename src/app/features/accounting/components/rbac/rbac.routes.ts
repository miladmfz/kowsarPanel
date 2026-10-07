import { Routes } from '@angular/router';
import { NotFoundComponent } from 'src/app/app-shell/core/not-found/not-found.component';

export const RBAC_ROUTES: Routes = [
    {
        path: '',
        component: NotFoundComponent,


    },


    {
        path: 'role', loadComponent: () => import('./role/role.component').then(m => m.RoleComponent),
    },


    {
        path: 'role-permission', loadComponent: () => import('./role-permission/role-permission.component').then(m => m.RolePermissionComponent),
    },


    {
        path: 'permission', loadComponent: () => import('./permission/permission.component').then(m => m.PermissionComponent),
    },


    {
        path: 'centralrole', loadComponent: () => import('./centralrole/centralrole.component').then(m => m.CentralroleComponent),
    },

    {
        path: 'sessions',
        loadComponent: () => import('./session-management/session-management.component')
            .then(m => m.SessionManagementComponent),
    },





];
