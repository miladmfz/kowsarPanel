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


@NgModule({
  imports: [
    CommonModule,
    ManagerRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AgGridModule
  ],
  declarations: [
    ApplicationFormComponent,
    ApplicationListComponent,
    ApplicationActiveComponent,
    ApplicationLogComponent,
    CellActionApplicationList,



  ],
})
export class ManagerModule { }
