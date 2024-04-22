import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AutletterListComponent } from './components/autletter-list/autletter-list.component';
import { AutletterChatComponent } from './components/autletter-chat/autletter-chat.component';
import { AutletterInsertComponent } from './components/autletter-insert/autletter-insert.component';
import { AutletterItemComponent } from './components/autletter-item/autletter-item.component';
import { AutletterDetailComponent } from './components/autletter-detail/autletter-detail.component';
import { AutletterWorkComponent } from './components/autletter-work/autletter-work.component';


const routes: Routes = [
  {
    path: '',
    data: {
      title: 'تیکت های سامانه ',
    },

    children: [
      {
        path: 'list',
        component: AutletterListComponent,
        data: {
          title: 'لیست',
        },
      },
      {
        path: 'chat/:id',
        component: AutletterChatComponent,
        data: {
          title: 'مکاتبات',
        },
      },
      {
        path: 'item/:id',
        component: AutletterItemComponent,
        data: {
          title: 'item',
        },
      },

      {
        path: 'item',
        component: AutletterItemComponent,
        data: {
          title: 'item',
        },
      },

      {
        path: 'detail',
        component: AutletterDetailComponent,
        data: {
          title: 'جزییات',
        },
      },
      {
        path: 'detail/:id',
        component: AutletterDetailComponent,
        data: {
          title: 'جزییات',
        },
      },
      {
        path: 'insert',
        component: AutletterInsertComponent,
        data: {
          title: 'تیکت جدید',
        },
      },

      {
        path: 'mywork',
        component: AutletterWorkComponent,
        data: {
          title: 'تیکت های من',
        },
      },

      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: '**', redirectTo: 'list', pathMatch: 'full' },
    ],



  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AutletterRoutingModule { }

