import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationFormComponent } from './components/application-form/application-form.component';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { ApplicationActiveComponent } from './components/application-active/application-active.component';
import { ApplicationLogComponent } from './components/application-log/application-log.component';
import { WebsiteListComponent } from './components/website/website-list/website-list.component';
import { WebsiteEditComponent } from './components/website/website-edit/website-edit.component';


const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'list',
        component: ApplicationListComponent,
      },
      {
        path: 'form',
        component: ApplicationFormComponent,
      },
      {
        path: 'form/:id',
        component: ApplicationFormComponent,
      },

      {
        path: 'active',
        component: ApplicationActiveComponent,
      },
      {
        path: 'log',
        component: ApplicationLogComponent,
      },


      { path: 'website-list', component: WebsiteListComponent, },
      { path: 'website-list/:id', component: WebsiteListComponent, },

      { path: 'website-edit', component: WebsiteEditComponent, },
      { path: 'website-edit/:id', component: WebsiteEditComponent, },



      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: '**', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ManagerRoutingModule { }

