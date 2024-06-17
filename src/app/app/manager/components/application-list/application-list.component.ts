import { Component, OnInit } from '@angular/core';
import { ManagerWebApiService } from '../../services/ManagerWebApi.service';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { CellActionApplicationList } from './cell_action_application_list';
import { ValidateionStateCellManageApplicationRenderer } from './validation-state-label-cell-manage-application';
@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
})
export class ApplicationListComponent
  extends AgGridBaseComponent
  implements OnInit {
  records;
  title = 'لیست مشتریان سامانه';

  constructor(
    private readonly router: Router,
    private repo: ManagerWebApiService,
  ) {
    super();
  }



  override ngOnInit(): void {
    super.ngOnInit();

    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionApplicationList,
        cellRendererParams: {
          editUrl: '/manager/form',
        },
        width: 10,
      },

      {
        field: 'AppBrokerCustomerCode',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ActivationCode',
        headerName: 'کد فعال سازی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'PersianCompanyName',
        headerName: 'نام فارسی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'EnglishCompanyName',
        headerName: 'نام انگلیسی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'AppType',
        cellRenderer: ValidateionStateCellManageApplicationRenderer,

        headerName: 'نوع نرم افزار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },
      {
        field: 'ServerURL',
        headerName: 'آدرس',
        filter: 'agSetColumnFilter',
      },
      {
        field: 'SecendServerURL',
        headerName: 'آدرس دوم',
        filter: 'agSetColumnFilter',
      },
      {
        field: 'DbName',
        headerName: 'دیتابیس',
        filter: 'agSetColumnFilter',
      },
      {
        field: 'DbImageName',
        headerName: 'دیتابیس عکس',
        filter: 'agSetColumnFilter',
      },
    ];

    this.getList();
  }
  getList() {

    this.repo.GetAppBrokerCustomer().subscribe((data) => {
      this.records = data;
    });
  }

  navigateToEdit(id) {
    this.router.navigate(['/manager/form', id]);
  }
}


