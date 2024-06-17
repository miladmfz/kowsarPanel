import { Component, OnInit } from '@angular/core';
import { AutletterWebApiService } from 'src/app/app/support/services/AutletterWebApi.service';
import { FormControl } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { CellActionAutletterList } from './cell-action-autletter-list';
import { ValidateionStateCellAutletterRenderer } from './validation-state-label-cell-autletter';

@Component({
  selector: 'app-autletter-list',
  templateUrl: './autletter-list.component.html',
})
export class AutletterListComponent
  extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private router: Router,
    private repo: AutletterWebApiService,
  ) {
    super();
  }



  records;
  title = 'لیست تیکت های ارسالی ';
  dateValue = new FormControl();
  CentralRef: string = '';
  JobPersonRef: string = '';

  Searchtarget: string = '';
  items: any[] = [];
  TextData: string = '';
  selectedOption: string = '0';

  searchTerm: string = '';



  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };



  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = ""
    }
    this.getList()
  }




  override ngOnInit(): void {
    super.ngOnInit();
    this.JobPersonRef = sessionStorage.getItem("JobPersonRef");
    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionAutletterList,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 80,
      },
      {
        field: 'وضعیت',
        cellRenderer: ValidateionStateCellAutletterRenderer,
        cellClass: 'text-center',
        minWidth: 80

      },
      {
        field: 'LetterTitle',
        headerName: 'عنوان تیکت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 200
      },
      {
        field: 'LetterDescription',
        headerName: 'متن تیکت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 200
      },
      {
        field: 'LetterDate',
        headerName: 'تاریخ تیکت	',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'CreatorName',
        headerName: 'ایجاد کننده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150

      },

      {
        field: 'RowsCount',
        headerName: 'تعداد ارجاع',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150

      },

      {
        field: 'RowExecutorName',
        headerName: 'کاربر فعلی	',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'RowLetterDate',
        headerName: 'تاریخ ارجاع',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.getList();
  }
  getList() {



    if (sessionStorage.getItem("JobPersonRef").length > 0) {
      this.searchTerm = ''
      this.CentralRef = ''

      this.repo.GetLetterList("", "", "").subscribe((data) => {
        this.records = data;
      });
    } else {
      this.searchTerm = ''
      this.CentralRef = sessionStorage.getItem("CentralRef");

      this.repo.GetLetterList("", this.CentralRef, "").subscribe((data) => {
        this.records = data;
      });
    }



  }



  LoadList() {
    if (sessionStorage.getItem("JobPersonRef").length > 0) {
      if (this.selectedOption === '0') {
        this.CentralRef = ''
      } else {
        this.CentralRef = sessionStorage.getItem("CentralRef");

      }
      this.repo.GetLetterList(this.searchTerm, this.CentralRef, this.dateValue.value).subscribe((data) => {
        this.records = data;
      });
    } else {

      this.CentralRef = sessionStorage.getItem("CentralRef");

      this.repo.GetLetterList(this.searchTerm, this.CentralRef, this.dateValue.value).subscribe((data) => {
        this.records = data;
      });
    }


  }




  navigateToEdit(id) {
    this.router.navigate(['/support/letter-detail', id]);
  }
}

