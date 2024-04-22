import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



// Components Routing
import { AutletterRoutingModule } from './autletter-routing.module';
import { AutletterInsertComponent } from './components/autletter-insert/autletter-insert.component';
import { AutletterItemComponent } from './components/autletter-item/autletter-item.component';
import { AutletterChatComponent } from './components/autletter-chat/autletter-chat.component';
import { AutletterListComponent } from './components/autletter-list/autletter-list.component';
import { AutletterDetailComponent } from './components/autletter-detail/autletter-detail.component';
import { AutletterWorkComponent } from './components/autletter-work/autletter-work.component';

import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { CellActionAutletterWork } from './components/autletter-work/cell-action-autletter-work';
import { AgGridModule } from 'ag-grid-angular';
import { CellActionAutletterList } from './components/autletter-list/cell-action-autletter-list';


@NgModule({
  imports: [
    CommonModule,
    AutletterRoutingModule,
    FormsModule,
    NgPersianDatepickerModule,
    ReactiveFormsModule,
    AgGridModule,

  ],
  declarations: [
    AutletterListComponent,
    AutletterInsertComponent,
    AutletterItemComponent,
    AutletterChatComponent,
    AutletterDetailComponent,
    AutletterWorkComponent,
    CellActionAutletterWork,
    CellActionAutletterList,


  ],
})
export class AutLetterModule { }
