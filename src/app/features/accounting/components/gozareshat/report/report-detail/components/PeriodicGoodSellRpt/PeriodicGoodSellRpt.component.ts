import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { Observable } from 'rxjs';
import { KowsarChartColumnComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-column/kowsar-chart-column.component';
import {
  PeriodicGridSchema,
  PeriodicReportBaseComponent,
} from '../PeriodicReportShared/periodic-report.base';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridModule,
    KowsarChartColumnComponent,
  ],
  selector: 'app-PeriodicGoodSellRpt',
  templateUrl: '../PeriodicReportShared/periodic-report.component.html',
})
export class PeriodicGoodSellRptComponent extends PeriodicReportBaseComponent {
  protected override readonly reportForm = 'PeriodicGoodSellRpt';
  protected override readonly defaultTitle = 'فروش کالا در یک دوره زمانی';
  override readonly supportsAnnual = false;
  override readonly showPriceTotals = true;
  override readonly chartCategoryFields = ['GoodName', 'FactorDate'];
  protected override readonly fallbackSchemas: PeriodicGridSchema[] = [
    {
      FieldName: 'PrivateCodeForSort',
      Caption: 'کد کالا',
      Width: 100,
      Visible: true,
      Separator: false,
    },
    {
      FieldName: 'GoodName',
      Caption: 'نام کالا',
      Width: 200,
      Visible: true,
      Separator: false,
    },
    {
      FieldName: 'MaxSellPrice',
      Caption: 'قیمت فروش',
      Width: 120,
      Visible: true,
      Separator: true,
    },
    {
      FieldName: 'FactorDate',
      Caption: 'تاریخ فاکتور',
      Width: 100,
      Visible: true,
      Separator: false,
    },
    {
      FieldName: 'Amount',
      Caption: 'تعداد',
      Width: 100,
      Visible: true,
      Separator: true,
    },
    {
      FieldName: 'nSumPrice',
      Caption: 'مبلغ ناخالص',
      Width: 130,
      Visible: true,
      Separator: true,
    },
    {
      FieldName: 'SumPrice',
      Caption: 'مبلغ خالص',
      Width: 130,
      Visible: true,
      Separator: true,
    },
  ];

  protected override request(payload: unknown): Observable<any> {
    return this.repo.PeriodicGoodSellRpt(payload);
  }
}
