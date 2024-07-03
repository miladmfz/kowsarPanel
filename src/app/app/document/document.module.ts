import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DownloadRoutingModule } from './document-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { DownloadListComponent } from './download/download-list/download-list.component';
import { DownloadEditComponent } from './download/download-edit/download-edit.component';
import { DownloadItemComponent } from './download/download-item/download-item.component';
import { EducationListComponent } from './education/education-list/education-list.component';
import { EducationEditComponent } from './education/education-edit/education-edit.component';
import { EducationItemComponent } from './education/education-item/education-item.component';
import { CellActionEducation } from './education/education-list/cell-action-education-work';
import { CellActionDownload } from './download/download-list/cell-action-download';



@NgModule({
  imports: [
    CommonModule,
    DownloadRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    AgGridModule,
    NgPersianDatepickerModule,

  ],
  declarations: [

    DownloadListComponent,
    DownloadEditComponent,
    DownloadItemComponent,

    EducationListComponent,
    EducationEditComponent,
    EducationItemComponent,

    CellActionEducation,
    CellActionDownload,

  ]
})
export class DocumentModule { }
