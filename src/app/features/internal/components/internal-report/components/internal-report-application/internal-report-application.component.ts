import { Component, inject, OnInit } from '@angular/core';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { RouterModule } from '@angular/router';
import { InternalAppsWebApiService } from 'src/app/features/internal/services/InternalAppsWebApi.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';


@Component({
  selector: 'app-internal-report-application',
  templateUrl: './internal-report-application.component.html',
  standalone: true,

  imports: [
    CommonModule,
    AgGridModule,
    RouterModule,
    ReactiveFormsModule,
    NgPersianDatepickerModule,
  ],
})
export class InternalReportApplicationComponent extends AgGridBaseComponent
  implements OnInit {
  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(InternalAppsWebApiService);

  constructor() {
    super();
  }
  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#0066cc',
    selectedText: '#ffffff',
  };

  title = 'گزارش سامانه داخلی';
  records: any[] = [];
  loading = false;
  selectedFlag: string = '1';

  Title_Lookup: Base_Lookup[] = [
    { id: "1", name: "تعداد دستگاه‌های فعال برای هر مشتری" },
    { id: "2", name: "تعداد لاگ‌ها در بازه تاریخ" },
    { id: "3", name: "لیست دستگاه‌ها + آخرین اتصال" },
    { id: "4", name: "تعداد کل ورودهای لاگ" },
    { id: "5", name: "جزئیات آخرین ورود هر دستگاه" },
    { id: "6", name: "بازاریاب‌های مرتبط با مشتری" },
    { id: "7", name: "دستگاه‌هایی با نسخه متفاوت" },
    { id: "8", name: "تعداد تکرار هر نسخه" }
  ];

  EditForm_AppLog = new FormGroup({
    FromDate: new FormControl(''),
    ToDate: new FormControl(''),
    ServerName: new FormControl(''),
    Flag: new FormControl('', Validators.required),
  });

  appLogResult: any[] = [];

  ngOnInit(): void {
    this.changeColumns(this.selectedFlag);
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

  // --------------------------
  // تغییر ستون‌ها براساس Flag
  // --------------------------
  changeColumns(flag: string) {

    switch (flag) {
      case "1":
        this.columnDefs1 = [
          { field: 'ServerName', headerName: 'مشتری' },
          { field: 'UniqueDeviceCount', headerName: 'تعداد دستگاه' }
        ];
        break;

      case "2":
        this.columnDefs1 = [
          { field: 'ServerName', headerName: 'مشتری' },
          { field: 'TotalLogCount', headerName: 'تعداد لاگ' }
        ];
        break;

      case "3":
        this.columnDefs1 = [
          { field: 'ServerName', headerName: 'مشتری' },
          { field: 'DeviceId', headerName: 'Device ID' },
          { field: 'LastSeenDate', headerName: 'آخرین اتصال' }
        ];
        break;

      case "4":
        this.columnDefs1 = [
          { field: 'ServerName', headerName: 'مشتری' },
          { field: 'StrDate', headerName: 'تاریخ' },
          { field: 'LogCount', headerName: 'تعداد' }
        ];
        break;

      case "5":
        this.columnDefs1 = [
          { field: 'ServerName', headerName: 'مشتری' },
          { field: 'DeviceId', headerName: 'Device ID' },
          { field: 'StrDate', headerName: 'تاریخ' },
          { field: 'Explain', headerName: 'توضیح' },
          { field: 'DeviceAgant', headerName: 'Agent' },
          { field: 'SdkVersion', headerName: 'SDK' },
        ];
        break;

      case "6":
        this.columnDefs1 = [
          { field: 'ServerName', headerName: 'مشتری' },
          { field: 'BrokerRefsList', headerName: 'BrokerRefs' },
          { field: 'CountOfBrokerRefs', headerName: 'تعداد' },
        ];
        break;

      case "7":
        this.columnDefs1 = [
          { field: 'DeviceId', headerName: 'Device ID' },
          { field: 'ServerName', headerName: 'مشتری' },
          { field: 'DistinctExplainCount', headerName: 'تعداد توضیح های متفاوت' },
          { field: 'ExplainList', headerName: 'لیست Explain' }
        ];
        break;

      case "8":
        this.columnDefs1 = [
          { field: 'ServerName', headerName: 'مشتری' },
          { field: 'Explain', headerName: 'Explain' },
          { field: 'CountByExplain', headerName: 'تعداد' }
        ];
        break;
    }
  }



  // --------------------------
  // دریافت داده + تغییر ستون‌ها
  // --------------------------
  getList(): void {

    this.EditForm_AppLog.markAllAsTouched();
    if (!this.EditForm_AppLog.valid) return;

    this.loading = true;

    this.loadingService.show()
    this.repo.GetAppLogReport(this.EditForm_AppLog.value)
      .subscribe((data: any) => {
        this.loadingService.hide()

        this.selectedFlag = this.EditForm_AppLog.value.Flag!;

        // ابتدا ستون‌ها را عوض می‌کنیم
        this.changeColumns(this.selectedFlag);

        // سپس داده را رفرش می‌کنیم
        this.records = data?.AppLogs ?? [];
        this.appLogResult = data?.AppLogs ?? [];

        this.updateGridData(1, this.records);

        this.loading = false;
      });
  }

}
