import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FactorWebApiService } from '../../../services/FactorWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { FormControl } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';

@Component({
  selector: 'app-prefactor-list',
  templateUrl: './prefactor-list.component.html',
})
export class PrefactorListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private basewebapi: FactorWebApiService,
  ) {
    super();
  }


  start_dateValue = new FormControl();
  End_dateValue = new FormControl();

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




  records;
  title = 'پیش فاکتور های فروش  ';

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
        field: 'CustName_Small',
        headerName: 'نام مشتری  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Manager',
        headerName: 'مدیریت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'پشتیبانی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Phone',
        headerName: 'شماره تماس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'Mobile',
        headerName: 'موبایل',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
    ];

    this.getList();
  }




  getList() {




  }


}



