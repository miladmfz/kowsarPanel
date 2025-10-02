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
import { CellActionFactorList } from './components/factor/factor-list/cell-action-factor-list';
import { CellActionFactorRowsEdit } from './components/factor/factor-edit/cell-action-factorrows-edit';
import { CellActionGoodEdit } from './components/factor/factor-edit/cell-action-good-edit';
import { CellActionFactorCustomerEdit } from './components/factor/factor-edit/cell-action-factor-customer-edit';
import { CellActionPreFactorList } from './components/prefactor/prefactor-list/cell-action-prefactor-list';
import { CellActionPreGoodEdit } from './components/prefactor/prefactor-edit/cell-action-pregood-edit';
import { CellActionPreFactorRowsEdit } from './components/prefactor/prefactor-edit/cell-action-prefactorrows-edit';
import { CellActionPreFactorCustomerEdit } from './components/prefactor/prefactor-edit/cell-action-prefactor-customer-edit';


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

    CellActionFactorList,
    CellActionGoodEdit,
    CellActionFactorRowsEdit,
    CellActionFactorCustomerEdit,


    CellActionPreGoodEdit,
    CellActionPreFactorRowsEdit,
    CellActionPreFactorCustomerEdit,


    CellActionPreFactorList,
  ]
})
export class FactorModule { }
