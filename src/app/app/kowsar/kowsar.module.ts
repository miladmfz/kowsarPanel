import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';



// Components Routing
import { KowsarMangmentRoutingModule } from '../kowsar/kowsar-routing.module';

import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { GoodOrderListComponent } from './components/goods_order/good-order-list/good-order-list.component';
import { GoodOrderEditComponent } from './components/goods_order/good-order-edit/good-order-edit.component';
import { GroupOrderListComponent } from './components/groups-order/group-order-list/group-order-list.component';
import { GroupOrderEditComponent } from './components/groups-order/group-order-edit/group-order-edit.component';
import { CellActionGoodOrderList } from './components/goods_order/good-order-list/cell-action-good-order-list';
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
    GoodOrderListComponent,
    GoodOrderEditComponent,
    GroupOrderListComponent,
    GroupOrderEditComponent,
    CellActionGoodOrderList,
    GoodListComponent,
    GoodEditComponent,
    CellActionGoodList,
    GoodsgrpListComponent,
    GoodsgrpEditComponent

  ],
})
export class KowsarModule { }
