import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseInformationComponent } from './base-information.component';
import { BaseInformationRoutingModule } from './base-information-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { PhoenixFrameworkModule } from 'src/app/app-shell/framework-components/framework.module';
import { AccidentTypeListComponent } from './accident-type/accident-type-list/accident-type-list.component';
import { AccidentTypeOpsComponent } from './accident-type/accident-type-ops/accident-type-ops.component';
import { AuthenticationService } from 'src/app/app-shell/framework-services/authentication.service';
import { IncidentItemListComponent } from './incident-item/incident-item-list/incident-item-list.component';
import { IncidentItemOpsComponent } from './incident-item/incident-item-ops/incident-item-ops.component';
import { OrgUnitOpsComponent } from './org-unit/org-unit-ops/org-unit-ops.component';
import { OrgUnitListComponent } from './org-unit/org-unit-list/org-unit-list.component';

@NgModule({
  declarations: [
    BaseInformationComponent,
    OrgUnitOpsComponent,
    OrgUnitListComponent,
    AccidentTypeListComponent,
    AccidentTypeOpsComponent,
    IncidentItemListComponent,
    IncidentItemOpsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PhoenixFrameworkModule,
    AgGridModule,
    BaseInformationRoutingModule,
  ],
  providers: [AuthenticationService],
})

export class BaseInformationModule { }
