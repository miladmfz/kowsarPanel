import { Component, OnInit } from '@angular/core';
import { AutletterWebApiService } from '../../services/AutletterWebApi.service';
import { FormControl } from '@angular/forms';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/app-shell/framework-services/local.storage.service';
import { CellActionAutletterWork } from './cell-action-autletter-work';
import { ValidateionStateCellAutletterRenderer } from '../autletter-list/validation-state-label-cell-autletter';
import { ValidateionStateCellAutletterWorkRenderer } from './validation-state-label-cell-autletter-work';

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
    localStorageService: LocalStorageService
  ) {
    super(localStorageService);
  }



  records;
  title = 'لیست تیکت های من ';
  dateValue = new FormControl();
  CentralRef: string = '';
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
          editUrl: '/autletter/detail',
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
        field: 'CreatorName',
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


    this.CentralRef = "9";

    this.repo.GetLetterFromPersoninfo(this.CentralRef).subscribe((data) => {

      this.records = data;

    });


  }

  navigateToEdit(id) {
    this.router.navigate(['/autletter/detail', id]);
  }
}

