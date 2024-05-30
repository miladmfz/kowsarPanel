import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthKowsarComponent } from './auth-kowsar.component';
import { LoginComponent } from './login/login.component';
import { AuthKowsarRoutingModule } from './auth-kowsar-routing.module';
import { RegisterComponent } from './register/register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';

@NgModule({
  imports: [
    CommonModule,
    AuthKowsarRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridModule,

  ],
  declarations: [
    AuthKowsarComponent,
    LoginComponent,
    RegisterComponent
  ]
})
export class AuthKowsarModule { }
