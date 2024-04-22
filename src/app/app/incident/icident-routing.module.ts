import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { IncidentListComponent } from './incident/incident-list/incident-list.component';
import { IncidentItemOpsComponent } from './incident/incident-ops/incident-ops.component';

const routes: Routes = [
  { path: 'incident/list', component: IncidentListComponent },
  { path: 'incident/create', component: IncidentItemOpsComponent },
  { path: 'incident/edit/:id', component: IncidentItemOpsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class IncidentRoutingModule { }
