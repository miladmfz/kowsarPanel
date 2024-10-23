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
import { GoodTestComponent } from './components/Good/good-test/good-test.component';
import { CellActionGoodEditImage } from './components/Good/good-edit/cell-action-good-edit-image';
import { CellActionGoodEditGroup } from './components/Good/good-edit/cell-action-good-edit-group';
import { CellActionGoodEditStack } from './components/Good/good-edit/cell-action-good-edit-stack';
import { CellActionGoodImageBtn } from './components/Good/good-edit/cell-action-good-edit-image-btn';
import { CellActionGoodGroupBtn } from './components/Good/good-edit/cell-action-good-edit-group-btn';




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
    GoodTestComponent,
    CellActionGoodList,
    GoodsgrpListComponent,
    GoodsgrpEditComponent,


    CellActionGoodEditImage,
    CellActionGoodEditGroup,
    CellActionGoodEditStack,
    CellActionGoodImageBtn,
    CellActionGoodGroupBtn
  ],
})
export class KowsarModule { }
