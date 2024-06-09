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

    CentralEditComponent,
    CentralListComponent,

    AutletterListComponent,
    AutletterInsertComponent,
    AutletterItemComponent,
    AutletterChatComponent,
    AutletterDetailComponent,
    AutletterWorkComponent,

    CellActionAutletterWork,
    CellActionAutletterList,
    CellActionCentralList,

    ValidateionStateCellAutletterRenderer,
    ValidateionStateCellAutletterWorkRenderer,




  ]
})
export class SupportModule { }
