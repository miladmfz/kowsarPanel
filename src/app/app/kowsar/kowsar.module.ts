import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



// Components Routing
import { KowsarMangmentRoutingModule } from '../kowsar/kowsar-routing.module';

import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AgGridModule } from 'ag-grid-angular';
import { GoodListComponent } from './components/Good/good-list/good-list.component';
import { GoodEditComponent } from './components/Good/good-edit/good-edit.component';
import { CellActionGoodList } from './components/Good/good-list/cell-action-good-ist';
import { GoodsgrpListComponent } from './components/GoodsGrp/goodsgrp-list/goodsgrp-list.component';
import { GoodsgrpEditComponent } from './components/GoodsGrp/goodsgrp-edit/goodsgrp-edit.component';




@NgModule({
  imports: [
    CommonModule,
    KowsarMangmentRoutingModule,
    FormsModule,
    NgPersianDatepickerModule,
    ReactiveFormsModule,
    AgGridModule,



  ],
  declarations: [
    GoodListComponent,
    GoodEditComponent,
    CellActionGoodList,
    GoodsgrpListComponent,
    GoodsgrpEditComponent,
  ],
})
export class KowsarModule { }
