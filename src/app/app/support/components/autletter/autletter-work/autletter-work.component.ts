import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { CellActionAutletterWork } from './cell-action-autletter-work';
import { ValidateionStateCellAutletterWorkRenderer } from './validation-state-label-cell-autletter-work';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';

@Component({
  selector: 'app-autletter-work',
  templateUrl: './autletter-work.component.html',
})
export class AutletterWorkComponent
  extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private router: Router,
    private repo: AutletterWebApiService,
  ) {
    super();
  }



  records;
  title = 'لیست تیکت های من ';
  dateValue = new FormControl();
  PersonInfoCode: string = '';
  Searchtarget: string = '';

  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = ""
    }
    this.getList()
  }


  override ngOnInit(): void {
    super.ngOnInit();

    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionAutletterWork,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 50,
      },
      {
        field: 'AlarmActive',
        cellRenderer: ValidateionStateCellAutletterWorkRenderer,

        cellClass: 'text-center',
      },
      {
        field: 'LetterTitle',
        headerName: 'عنوان تیکت',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'LetterDescription',
        headerName: 'متن تیکت',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'LetterDate',
        headerName: 'تاریخ تیکت	',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },

      {
        field: 'OwnerName',
        headerName: 'ایجاد کننده',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },

      {
        field: 'RowsCount',
        headerName: 'تعداد ارجاع',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },

      {
        field: 'RowExecutorName',
        headerName: 'کاربر فعلی	',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'RowLetterDate',
        headerName: 'تاریخ ارجاع',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },

    ];

    this.getList();
  }
  getList() {



    this.PersonInfoCode = sessionStorage.getItem("PersonInfoRef");

    this.repo.GetLetterFromPersoninfo(this.PersonInfoCode).subscribe((data) => {

      this.records = data;

    });


  }

  navigateToEdit(id) {
    this.router.navigate(['/support/letter-detail', id]);
  }

}

