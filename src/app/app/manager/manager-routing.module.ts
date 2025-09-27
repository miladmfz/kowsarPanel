import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ApplicationListComponent } from './components/application/application-list/application-list.component';

import { WebsiteListComponent } from './components/website/website-list/website-list.component';
import { WebsiteEditComponent } from './components/website/website-edit/website-edit.component';
import { PanelLogComponent } from './components/report/panel-log/panel-log.component';
import { ApplicationReportComponent } from './components/report/application-report/application-report.component';
import { ApplicationEditComponent } from './components/application/application-edit/application-edit.component';


const routes: Routes = [
  {
    path: '',
    children: [


      { path: 'application-list', component: ApplicationListComponent, },
      { path: 'application-edit', component: ApplicationEditComponent, },
      { path: 'application-edit/:id', component: ApplicationEditComponent, },



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

