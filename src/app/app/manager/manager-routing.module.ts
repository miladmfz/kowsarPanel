import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationListComponent } from './components/application/application-list/application-list.component';

import { WebsiteListComponent } from './components/website/website-list/website-list.component';
import { WebsiteEditComponent } from './components/website/website-edit/website-edit.component';
import { PanelLogComponent } from './components/report/panel-log/panel-log.component';
import { ApplicationReportComponent } from './components/report/application-report/application-report.component';
import { ApplicationFormComponent } from './components/application/application-form/application-form.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'application',
    },
    children: [


      { path: 'application-list', component: ApplicationListComponent, },


      { path: 'application-form', component: ApplicationFormComponent, },
      { path: 'application-form/:id', component: ApplicationFormComponent, },



      { path: 'website-list', component: WebsiteListComponent, },
      { path: 'website-list/:id', component: WebsiteListComponent, },

      { path: 'website-edit', component: WebsiteEditComponent, },
      { path: 'website-edit/:id', component: WebsiteEditComponent, },




      { path: 'taskreport-list', component: WebsiteListComponent, },
      { path: 'panel-log', component: PanelLogComponent, },
      { path: 'application-report', component: ApplicationReportComponent, },



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

