import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccidentTypeListComponent } from './accident-type/accident-type-list/accident-type-list.component';
import { AccidentTypeOpsComponent } from './accident-type/accident-type-ops/accident-type-ops.component';
import { IncidentItemListComponent } from './incident-item/incident-item-list/incident-item-list.component';
import { IncidentItemOpsComponent } from './incident-item/incident-item-ops/incident-item-ops.component';
import { OrgUnitListComponent } from './org-unit/org-unit-list/org-unit-list.component';
import { OrgUnitOpsComponent } from './org-unit/org-unit-ops/org-unit-ops.component';

const routes: Routes = [
  { path: 'accident-type/list', component: AccidentTypeListComponent },
  { path: 'accident-type/create', component: AccidentTypeOpsComponent },
  { path: 'accident-type/edit/:id', component: AccidentTypeOpsComponent },

  { path: 'incident-item/list', component: IncidentItemListComponent },
  { path: 'incident-item/create', component: IncidentItemOpsComponent },
  { path: 'incident-item/edit/:id', component: IncidentItemOpsComponent },


  { path: 'org-unit/list', component: OrgUnitListComponent },
  { path: 'org-unit/create', component: OrgUnitOpsComponent },
  { path: 'org-unit/edit/:id', component: OrgUnitOpsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BaseInformationRoutingModule { }
