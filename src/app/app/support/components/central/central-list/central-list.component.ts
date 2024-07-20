import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { CentralWebApiService } from '../../../services/CentralWebApi.service';
import { FormControl } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { CellActionAutletterList } from '../../autletter/autletter-list/cell-action-autletter-list';
import { CellActionCentralList } from './cell-action-central-list';

@Component({
  selector: 'app-central-list',
  templateUrl: './central-list.component.html',
})
export class CentralListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private router: Router,
    private repo: CentralWebApiService,
  ) {
    super();
  }



  records;
  title = 'لیست اجزای پایه ';
  dateValue = new FormControl();
  CentralRef: string = '';
  JobPersonRef: string = '';

  Searchtarget: string = '';
  items: any[] = [];
  TextData: string = '';
  selectedOption: string = '0';

  searchTerm: string = '';
  loading: boolean = true;



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
        cellRenderer: CellActionCentralList,
        cellRendererParams: {
          editUrl: '/support/central-edit',
        },
        width: 80,
      },
      {
        field: 'CentralCode',
        headerName: 'CentralCode',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        width: 80,
      },
      {
        field: 'Name',
        headerName: 'Name',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 300

      },
      {
        field: 'Title',
        headerName: 'Title',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150

      },

      {
        field: 'FName',
        headerName: 'FName',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150

      },
      {
        field: 'Manager',
        headerName: 'Manager',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150

      },
      {
        field: 'Delegacy',
        headerName: 'Delegacy',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150

      },
      {
        field: 'CentralName',
        headerName: 'CentralName',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150

      },

    ];

    this.getList();
  }


  getList() {


    this.loading = true
    this.repo.GetKowsarCentral(this.Searchtarget).subscribe((data: any) => {
      this.records = data.Centrals;
      this.loading = false

    });


  }



  navigateToEdit(id) {
    this.router.navigate(['/support/central-edit', id]);
  }
}

