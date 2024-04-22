import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserGroupListComponent } from './user-group/user-group-list/user-group-list.component';
import { UserGroupOpsComponent } from './user-group/user-group-ops/user-group-ops.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { UserOpsComponent } from './user/user-ops/user-ops.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'user/list' },
  { path: 'user-group/list', component: UserGroupListComponent },
  { path: 'user-group/create', component: UserGroupOpsComponent },
  { path: 'user-group/edit/:guid', component: UserGroupOpsComponent },

  { path: 'user/list', component: UserListComponent },
  { path: 'user/create', component: UserOpsComponent },
  { path: 'user/edit/:id', component: UserOpsComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserManagementRoutingModule {}
