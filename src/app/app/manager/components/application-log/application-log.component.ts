import { Component, OnInit } from '@angular/core';
import { ManagerWebApiService } from '../../services/ManagerWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';
import { LocalStorageService } from 'src/app/app-shell/framework-services/local.storage.service';
import { EditDeleteCellRenderer } from 'src/app/app-shell/framework-components/ag-grid/edit-delete-cell-btn';

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
    localStorageService: LocalStorageService
  ) {
    super(localStorageService);
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
      },
      {
        field: 'CreationDate',
        headerName: 'CreationDate',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },
      {
        field: 'LogValue',
        headerName: 'LogValue',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
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
