import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DownloadListComponent } from './download/download-list/download-list.component';
import { DownloadEditComponent } from './download/download-edit/download-edit.component';
import { DownloadItemComponent } from './download/download-item/download-item.component';
import { EducationListComponent } from './education/education-list/education-list.component';
import { EducationEditComponent } from './education/education-edit/education-edit.component';
import { EducationItemComponent } from './education/education-item/education-item.component';
const routes: Routes = [
  {
    path: '',
    children: [

      { path: 'download-list', component: DownloadListComponent, },

      { path: 'download-edit', component: DownloadEditComponent, },
      { path: 'download-edit/:id', component: DownloadEditComponent, },

      { path: 'download-item', component: DownloadItemComponent, },
      { path: 'download-item/:id', component: DownloadItemComponent, },



      { path: 'education-list', component: EducationListComponent, },

      { path: 'education-edit', component: EducationEditComponent, },
      { path: 'education-edit/:id', component: EducationEditComponent, },

      { path: 'education-item', component: EducationItemComponent, },
      { path: 'education-item/:id', component: EducationItemComponent, },

      { path: '', redirectTo: 'list', pathMatch: 'full' },
      { path: '**', redirectTo: 'list', pathMatch: 'full' },
    ],
  },
];



@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DownloadRoutingModule { }

