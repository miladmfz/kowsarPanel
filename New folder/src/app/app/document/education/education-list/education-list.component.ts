import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { EducationWebApiService } from '../../services/EducationWebApi.service';
import { FormControl } from '@angular/forms';
import { CellActionEducation } from './cell-action-education-work';

@Component({
  selector: 'app-education-list',
  templateUrl: './education-list.component.html',
})
export class EducationListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private router: Router,
    private repo: EducationWebApiService,
  ) {
    super();
  }



  records;
  title = 'لیست ویدیو های قابل نمایش';
  dateValue = new FormControl();
  PersonInfoCode: string = '';
  Searchtarget: string = '';
  JobPersonRef: string = '';

  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = ""
    }
    this.getList()
  }


  override ngOnInit(): void {
    super.ngOnInit();
    this.JobPersonRef = sessionStorage.getItem("JobPersonRef")

    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionEducation,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 80,
      },
      // {
      //   field: 'وضعیت تیکت',
      //   cellRenderer: ValidateionStateCellAutletterWorkRenderer,
      //   cellClass: 'text-center',


      //   minWidth: 80

      // },
      {
        field: 'Title',
        headerName: 'عنوان',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 250
      },
      {
        field: 'FileName',
        headerName: 'نام فایل',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'FilePath',
        headerName: 'آدرس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ReformDate',
        headerName: 'تاریخ ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.getList();
  }
  getList() {

    this.repo.KowsarAttachUrl(this.Searchtarget).subscribe((data) => {

      this.records = data;

    });



  }

  navigateToEdit(id) {
    this.router.navigate(['/document/download-edit', id]);
  }



}





