import { Component, OnInit } from '@angular/core';
import { AutletterWebApiService } from '../../services/AutletterWebApi.service';
import { FormControl } from '@angular/forms';
import { IActiveDate } from 'ng-persian-datepicker';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/app-shell/framework-services/local.storage.service';
import { SettingService } from 'src/app/app-shell/framework-services/setting.service';
import { CellActionAutletterList } from './cell-action-autletter-list';

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
    localStorageService: LocalStorageService,
    settingService: SettingService
  ) {
    super(localStorageService, settingService);
  }



  records;
  title = 'لیست تیکت های ارسالی ';
  dateValue = new FormControl();
  CentralRef: string = '';
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

    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionAutletterList,
        cellRendererParams: {
          editUrl: '/autletter/detail',
        },
        width: 50,
      },

      {
        field: 'LetterTitle',
        headerName: 'عنوان تیکت',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
      {
        field: 'LetterDescription',
        headerName: 'متن تیکت',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
      {
        field: 'LetterDate',
        headerName: 'تاریخ تیکت	',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },

      {
        field: 'CreatorName',
        headerName: 'ایجاد کننده',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },

      {
        field: 'RowsCount',
        headerName: 'تعداد ارجاع',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },

      {
        field: 'RowExecutorName',
        headerName: 'کاربر فعلی	',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
      {
        field: 'RowLetterDate',
        headerName: 'تاریخ ارجاع',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
      {
        field: 'AlarmActive',
        headerName: 'وضعیت',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
    ];

    this.getList();
  }
  getList() {

    this.searchTerm = ''
    this.CentralRef = ''

    this.repo.GetLetterList("", "", "").subscribe((data) => {
      this.records = data;
    });

  }



  LoadList() {

    if (this.selectedOption === '0') {
      this.CentralRef = ''
    } else {
      this.CentralRef = '4';
    }
    this.repo.GetLetterList(this.searchTerm, this.CentralRef, this.dateValue.value).subscribe((data) => {
      this.records = data;
    });

  }




  navigateToEdit(id) {
    this.router.navigate(['/autletter/detail', id]);
  }
}

