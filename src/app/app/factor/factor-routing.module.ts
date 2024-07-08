import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { FactorListComponent } from './components/factor/factor-list/factor-list.component';
import { FactorEditComponent } from './components/factor/factor-edit/factor-edit.component';
import { PrefactorListComponent } from './components/prefactor/prefactor-list/prefactor-list.component';
import { PrefactorEditComponent } from './components/prefactor/prefactor-edit/prefactor-edit.component';
import { ShopfactorListComponent } from './components/shopfactor/shopfactor-list/shopfactor-list.component';
import { ShopfactorEditComponent } from './components/shopfactor/shopfactor-edit/shopfactor-edit.component';
const routes: Routes = [
  {
    path: '',
    children: [


      { path: 'factor-list', component: FactorListComponent, },
      { path: 'factor-edit', component: FactorEditComponent, },
      { path: 'factor-edit/:id', component: FactorEditComponent, },

      { path: 'prefactor-list', component: PrefactorListComponent, },
      { path: 'prefactor-edit', component: PrefactorEditComponent, },
      { path: 'prefactor-edit/:id', component: PrefactorEditComponent, },

      { path: 'shopfactor-list', component: ShopfactorListComponent, },
      { path: 'shopfactor-edit', component: ShopfactorEditComponent, },
      { path: 'shopfactor-edit/:id', component: ShopfactorEditComponent, },


      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: '**', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FactorRoutingModule { }

