import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



// Components Routing
import { ManagerRoutingModule } from './manager-routing.module';
import { ApplicationFormComponent } from './components/application-form/application-form.component';
import { ApplicationListComponent } from './components/application-list/application-list.component';
import { ApplicationActiveComponent } from './components/application-active/application-active.component';
import { ApplicationLogComponent } from './components/application-log/application-log.component';
import { AgGridModule } from 'ag-grid-angular';
import { CellActionApplicationList } from './components/application-list/cell_action_application_list';
import { ValidateionStateCellManageApplicationRenderer } from './components/application-list/validation-state-label-cell-manage-application';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { NotifierModule } from 'angular-notifier';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';


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
    ApplicationFormComponent,
    ApplicationListComponent,
    ApplicationActiveComponent,
    ApplicationLogComponent,
    CellActionApplicationList,
    ValidateionStateCellManageApplicationRenderer,


  ],
  providers: [
    NotificationService
    // SwalService,
  ],
})
export class ManagerModule { }
