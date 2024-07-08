import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FactorRoutingModule } from './factor-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AgGridModule } from 'ag-grid-angular';
import { FactorListComponent } from './components/factor/factor-list/factor-list.component';
import { FactorEditComponent } from './components/factor/factor-edit/factor-edit.component';
import { ShopfactorListComponent } from './components/shopfactor/shopfactor-list/shopfactor-list.component';
import { ShopfactorEditComponent } from './components/shopfactor/shopfactor-edit/shopfactor-edit.component';
import { PrefactorListComponent } from './components/prefactor/prefactor-list/prefactor-list.component';
import { PrefactorEditComponent } from './components/prefactor/prefactor-edit/prefactor-edit.component';

@NgModule({
  imports: [
    CommonModule,
    FactorRoutingModule,
    FormsModule,
    NgPersianDatepickerModule,
    ReactiveFormsModule,
    AgGridModule,
  ],
  declarations: [

    FactorListComponent,
    FactorEditComponent,
    ShopfactorListComponent,
    ShopfactorEditComponent,
    PrefactorListComponent,
    PrefactorEditComponent,

  ]
})
export class FactorModule { }
