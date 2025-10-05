import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { CustomerListComponent } from './components/customer/customer-list/customer-list.component';
import { CustomerEditComponent } from './components/customer/customer-edit/customer-edit.component';
import { SupportRoutingModule } from './support-routing.module';
import { AutletterListComponent } from './components/autletter/autletter-list/autletter-list.component';
import { AutletterInsertComponent } from './components/autletter/autletter-insert/autletter-insert.component';
import { AutletterItemComponent } from './components/autletter/autletter-item/autletter-item.component';
import { AutletterChatComponent } from './components/autletter/autletter-chat/autletter-chat.component';
import { AutletterDetailComponent } from './components/autletter/autletter-detail/autletter-detail.component';
import { AutletterWorkComponent } from './components/autletter/autletter-work/autletter-work.component';
import { CellActionAutletterWork } from './components/autletter/autletter-work/cell-action-autletter-work';
import { CellActionAutletterList } from './components/autletter/autletter-list/cell-action-autletter-list';
import { ValidateionStateCellAutletterRenderer } from './components/autletter/autletter-list/validation-state-label-cell-autletter';
import { ValidateionStateCellAutletterWorkRenderer } from './components/autletter/autletter-work/validation-state-label-cell-autletter-work';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { CellActionCentralList } from './components/central/central-list/cell-action-central-list';
import { CentralEditComponent } from './components/central/central-edit/central-edit.component';
import { CentralListComponent } from './components/central/central-list/central-list.component';
import { ProfileEditComponent } from './components/profile/profile-edit/profile-edit.component';
import { ProfileViewComponent } from './components/profile/profile-view/profile-view.component';
import { AutletterAttachComponent } from './components/autletter/autletter-attach/autletter-attach.component';
import { CellActionCustomerList } from './components/customer/customer-list/cell-action-customer-list';
import { CellActionAutletterRowList } from './components/autletter/autletter-item/cell-action-autletterrow-list';
import { SupportFactorEditComponent } from './components/factor/support-factor-edit/support-factor-edit.component';
import { SupportFactorListComponent } from './components/factor/support-factor-list/support-factor-list.component';
import { CellActionSupportFactorList } from './components/factor/support-factor-list/cell-action-support-factor-list';
import { CellActionSupportFactorCustomerEdit } from './components/factor/support-factor-edit/cell-action-support-factor-customer-edit';
import { CellActionSupportFactorRowsEdit } from './components/factor/support-factor-edit/cell-action-support-factorrows-edit';
import { CellActionSupportGoodEdit } from './components/factor/support-factor-edit/cell-action-support-good-edit';
import { SupgoodListComponent } from './components/supgood/supgood-list/supgood-list.component';
import { SupgoodEditComponent } from './components/supgood/supgood-edit/supgood-edit.component';
import { CellActionSupGoodList } from './components/supgood/supgood-list/cell-action-supgood-ist';
import { TaskListComponent } from './components/tasks/task-list/task-list.component';
import { TaskEditComponent } from './components/tasks/task-edit/task-edit.component';
import { CellActionTaskList } from './components/tasks/task-list/cell-action-task-ist';
import { ReportCustomerComponent } from './components/report/report-customer/report-customer.component';
import { ReportFactorComponent } from './components/report/report-factor/report-factor.component';
import { CellActionReportCustomer } from './components/report/report-customer/cell-action-report-customer-list';
import { CellActionletterPreFactorList } from './components/autletter/autletter-detail/cell-action-letterprefactor-list';
import { CellActionletterFactorList } from './components/autletter/autletter-detail/cell-action-letterfactor-list';
import { CellActionSupportAutletterFactorList } from './components/factor/support-factor-edit/cell-action-support-autletter-factor-list';


@NgModule({
  imports: [
    CommonModule,
    SupportRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AgGridModule,
    NgPersianDatepickerModule,

  ],
  declarations: [
    CustomerEditComponent,
    CustomerListComponent,


    ProfileEditComponent,
    ProfileViewComponent,


    CentralEditComponent,
    CentralListComponent,

    AutletterListComponent,
    AutletterInsertComponent,
    AutletterItemComponent,
    AutletterChatComponent,
    AutletterDetailComponent,
    AutletterWorkComponent,
    AutletterAttachComponent,

    CellActionAutletterWork,
    CellActionAutletterList,
    CellActionCentralList,
    CellActionCustomerList,
    CellActionAutletterRowList,


    ValidateionStateCellAutletterRenderer,
    ValidateionStateCellAutletterWorkRenderer,


    SupportFactorEditComponent,
    SupportFactorListComponent,

    SupgoodListComponent,
    SupgoodEditComponent,

    TaskListComponent,
    TaskEditComponent,
    CellActionTaskList,

    ReportCustomerComponent,
    ReportFactorComponent,


    CellActionSupGoodList,
    CellActionReportCustomer,

    CellActionSupportFactorList,
    CellActionSupportGoodEdit,
    CellActionSupportFactorRowsEdit,
    CellActionSupportFactorCustomerEdit,
    CellActionletterPreFactorList,
    CellActionletterFactorList,
    CellActionSupportAutletterFactorList,

  ]

})
export class SupportModule { }
