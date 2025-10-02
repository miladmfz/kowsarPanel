import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



// Components Routing
import { ManagerRoutingModule } from './manager-routing.module';
import { AgGridModule } from 'ag-grid-angular';
import { CellActionApplicationList } from './components/application/application-list/cell_action_application_list';
import { ValidateionStateCellManageApplicationRenderer } from './components/application/application-list/validation-state-label-cell-manage-application';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { NotifierModule } from 'angular-notifier';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { WebsiteListComponent } from './components/website/website-list/website-list.component';
import { WebsiteEditComponent } from './components/website/website-edit/website-edit.component';
import { CellActionWebSiteList } from './components/website/website-list/cell_action_website_list';
import { TaskReportComponent } from './components/report/task-report/task-report.component';
import { PanelLogComponent } from './components/report/panel-log/panel-log.component';
import { ApplicationReportComponent } from './components/report/application-report/application-report.component';
import { ApplicationListComponent } from './components/application/application-list/application-list.component';
import { ApplicationFormComponent } from './components/application/application-form/application-form.component';


@NgModule({
  imports: [
    CommonModule,
    ManagerRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AgGridModule,
    NotifierModule,
    NgPersianDatepickerModule,

  ],
  declarations: [
    ApplicationListComponent,
    CellActionApplicationList,
    ValidateionStateCellManageApplicationRenderer,
    ApplicationFormComponent,
    WebsiteListComponent,
    WebsiteEditComponent,
    CellActionWebSiteList,


    TaskReportComponent,
    PanelLogComponent,
    ApplicationReportComponent,



  ],
  providers: [
    NotificationService
    // SwalService,
  ],
})
export class ManagerModule { }
