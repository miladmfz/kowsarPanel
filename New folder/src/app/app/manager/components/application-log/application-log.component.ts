import { Component, OnInit } from '@angular/core';
import { ManagerWebApiService } from '../../services/ManagerWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application-log',
  templateUrl: './application-log.component.html',
})
export class ApplicationLogComponent extends AgGridBaseComponent
  implements OnInit {
  records;
  title = 'لیست  لاگ های سیستم';

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
        field: 'WebLogCode',
        headerName: 'WebLogCode',
        filter: 'agSetColumnFilter',
      },
      {
        field: 'ClassName',
        headerName: 'ClassName ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CreationDate',
        headerName: 'CreationDate',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'LogValue',
        headerName: 'LogValue',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'TagName',
        headerName: 'TagName  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },
    ];

    this.getList();
  }
  getList() {

    this.repo.GetWebLog().subscribe((data) => {
      this.records = data;

    });

  }




}

