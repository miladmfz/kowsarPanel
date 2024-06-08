import { Component, OnInit } from '@angular/core';
import { ManagerWebApiService } from '../../services/ManagerWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-application-active',
  templateUrl: './application-active.component.html',
})
export class ApplicationActiveComponent extends AgGridBaseComponent
  implements OnInit {
  records;
  title = 'لیست نرم افزار های فعال';

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
        field: 'Server_Name',
        headerName: 'Server_Name',
        filter: 'agSetColumnFilter',
      },
      {
        field: 'BrokerStr',
        headerName: 'BrokerStr ',
        filter: 'agSetColumnFilter',

        cellClass: 'text-center',
      },

    ];

    this.getList();
  }
  getList() {

    this.repo.GetActiveApplication().subscribe((data) => {
      this.records = data;

    });

  }


}
