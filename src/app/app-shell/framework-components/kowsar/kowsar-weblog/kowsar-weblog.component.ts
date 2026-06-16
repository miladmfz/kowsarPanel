import { Component, inject, OnInit, signal } from '@angular/core';
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

  title = signal('لیست لاگ های سیستم')
  records = signal<any[]>([])
  loading = signal(false)


  private readonly repo = inject(KowsarBaseWebApi);


  constructor() {
    super();
  }

  ngOnInit(): void {

    this.column_name_1 = [


      {
        field: 'ClassName',
        headerName: 'ClassName ',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CreationDate',
        headerName: 'CreationDate',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'LogValue',
        headerName: 'LogValue',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'UserName',
        headerName: 'UserName',

        cellClass: 'text-center',
      },
    ];

    this.getList();


  }

  getList(): void {





    this.repo.GetWebLog()
      .subscribe((data: any) => {

        this.records.set(data?.WebLogs ?? [])
        this.updateGridData(1, this.records());

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
