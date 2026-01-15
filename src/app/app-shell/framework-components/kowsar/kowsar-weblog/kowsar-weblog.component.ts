import { Component, inject, OnInit } from '@angular/core';
import { KowsarBaseWebApi } from '../../../framework-services/base/KowsarBaseWebApi.service';
import { AgGridBaseComponent } from '../../ag-grid/base';
import { AgGridModule } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-kowsar-weblog',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
  ],
  templateUrl: './kowsar-weblog.component.html',
})
export class KowsarWeblogComponent extends AgGridBaseComponent
  implements OnInit {

  title = 'لیست وب‌سایت‌های داخلی کوثر';
  records: any;
  loading = false;

  private readonly repo = inject(KowsarBaseWebApi);


  constructor() {
    super();
  }

  ngOnInit(): void {

    this.columnDefs1 = [

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

  getList(): void {



    this.repo.GetWebLog()
      .subscribe((data: any) => {
        this.records = data?.WebLogs ?? [];
        this.updateGridData(1, this.records);

      });
  }

  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    // ذخیره API درست
    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    // فیت کردن ستون‌ها با تأخیر کوتاه
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch { }
    }, 50);
  }


}
