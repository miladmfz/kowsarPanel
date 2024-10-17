import { Component, OnInit } from '@angular/core';
import { ManagerWebApiService } from '../../services/ManagerWebApi.service';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { CellActionApplicationList } from './cell_action_application_list';
import { ValidateionStateCellManageApplicationRenderer } from './validation-state-label-cell-manage-application';
import { AddressCellManageApplicationRenderer } from './address-label-cell-manage-application copy';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-application-list',
  templateUrl: './application-list.component.html',
})
export class ApplicationListComponent
  extends AgGridBaseComponent
  implements OnInit {
  records;
  title = 'لیست مشتریان سامانه';
  loading: boolean = false;

  constructor(
    private readonly router: Router,
    private repo: ManagerWebApiService,
    private http: HttpClient,
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
        width: 150,
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
        field: 'AppType',
        cellRenderer: ValidateionStateCellManageApplicationRenderer,
        headerName: 'نوع نرم افزار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },
      {
        field: 'ServerURL',
        cellRenderer: AddressCellManageApplicationRenderer,
        headerName: 'آدرس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
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


  CheckPort(data: any) {

    this.loading = true
    const ip = data.ServerURL.match(/\/\/(.*?):/)[1];
    const port = data.ServerURL.match(/:(\d+)\//)[1];


    this.repo.CheckPort(ip, port).subscribe((e: any) => {
      this.loading = false


      if (e.status == "open") {

        //this.notificationService.succeded();
        Swal.fire({
          title: data.PersianCompanyName + ' پورت فعال می باشد. ',
          icon: 'success',
        });
      } else {
        //this.notificationService.error('Port is closed');
        Swal.fire(data.PersianCompanyName + ' اتصال پورت برقرار نیست ', 'error');
      }
    });

  }


}


