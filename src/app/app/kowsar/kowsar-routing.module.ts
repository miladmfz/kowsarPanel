import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';



import { GoodListComponent } from './components/Good/good-list/good-list.component';
import { GoodEditComponent } from './components/Good/good-edit/good-edit.component';
import { GoodsgrpListComponent } from './components/GoodsGrp/goodsgrp-list/goodsgrp-list.component';
import { GoodsgrpEditComponent } from './components/GoodsGrp/goodsgrp-edit/goodsgrp-edit.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'kowsar managment',
    },

    children: [

      { path: 'good-list', component: GoodListComponent, },
      { path: 'good-list/:id', component: GoodListComponent, },

      { path: 'good-edit', component: GoodEditComponent, },
      { path: 'good-edit/:id', component: GoodEditComponent, },

      { path: 'goodsgrp-list', component: GoodsgrpListComponent, },
      { path: 'goodsgrp-list/:id', component: GoodsgrpListComponent, },

      { path: 'goodsgrp-edit', component: GoodsgrpEditComponent, },
      { path: 'goodsgrp-edit/:id', component: GoodsgrpEditComponent, },










      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: '**', redirectTo: 'list', pathMatch: 'full' },
    ],



  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class KowsarMangmentRoutingModule { }

