import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
//import { BaseInformationComponent } from './base-information.component';
//import { BaseInformationRoutingModule } from './base-information-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { PhoenixFrameworkModule } from 'src/app/app-shell/framework-components/framework.module';
//import { AccidentTypeListComponent } from './accident-type/accident-type-list/accident-type-list.component';
import { AuthenticationService } from 'src/app/app-shell/framework-services/authentication.service';
import { IncidentListComponent } from './incident/incident-list/incident-list.component';
import { IncidentItemOpsComponent } from './incident/incident-ops/incident-ops.component';
import { IncidentRoutingModule } from './icident-routing.module';
import { IncidentComponent } from './incident.component';

@NgModule({
  declarations: [
    IncidentComponent,

    IncidentListComponent,
    IncidentItemOpsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PhoenixFrameworkModule,
    AgGridModule,
    IncidentRoutingModule,
  ],
  providers: [AuthenticationService],
})
export class IncidentModule { }
