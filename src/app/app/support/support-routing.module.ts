import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CustomerListComponent } from './components/customer/customer-list/customer-list.component';
import { CustomerEditComponent } from './components/customer/customer-edit/customer-edit.component';
import { AutletterListComponent } from './components/autletter/autletter-list/autletter-list.component';
import { AutletterChatComponent } from './components/autletter/autletter-chat/autletter-chat.component';
import { AutletterItemComponent } from './components/autletter/autletter-item/autletter-item.component';
import { AutletterDetailComponent } from './components/autletter/autletter-detail/autletter-detail.component';
import { AutletterInsertComponent } from './components/autletter/autletter-insert/autletter-insert.component';
import { AutletterWorkComponent } from './components/autletter/autletter-work/autletter-work.component';


const routes: Routes = [
  {
    path: '',
    children: [

      { path: 'customer-list', component: CustomerListComponent, },

      { path: 'customer-edit', component: CustomerEditComponent, },
      { path: 'customer-edit/:id', component: CustomerEditComponent, },


      { path: 'letter-list', component: AutletterListComponent, },

      { path: 'letter-chat/:id', component: AutletterChatComponent, },

      { path: 'letter-item/:id', component: AutletterItemComponent, },
      { path: 'letter-item', component: AutletterItemComponent, },

      { path: 'letter-detail', component: AutletterDetailComponent, },
      { path: 'letter-detail/:id', component: AutletterDetailComponent, },

      { path: 'letter-insert', component: AutletterInsertComponent, },
      { path: 'letter-mywork', component: AutletterWorkComponent, },





      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: '**', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupportRoutingModule { }

