import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserManagementComponent } from './user-management.component';
import { AgGridModule } from 'ag-grid-angular';
import { PhoenixFrameworkModule } from '../../app-shell/framework-components/framework.module';
import { UserManagementRoutingModule } from './user-management-routing.module';
import { UserGroupListComponent } from './user-group/user-group-list/user-group-list.component';
import { UserGroupOpsComponent } from './user-group/user-group-ops/user-group-ops.component';
import { UserListComponent } from './user/user-list/user-list.component';
import { UserOpsComponent } from './user/user-ops/user-ops.component';
import { AuthenticationService } from 'src/app/app-shell/framework-services/authentication.service';

@NgModule({
  declarations: [
    UserManagementComponent,

    UserGroupListComponent,
    UserGroupOpsComponent,

    UserListComponent,
    UserOpsComponent,
  ],
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    PhoenixFrameworkModule,
    AgGridModule,
    UserManagementRoutingModule,
  ],
  providers: [AuthenticationService],
})
export class UserManagementModule {}
