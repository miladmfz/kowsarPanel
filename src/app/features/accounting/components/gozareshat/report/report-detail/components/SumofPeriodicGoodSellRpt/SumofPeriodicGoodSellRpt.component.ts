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
  selector: 'app-SumofPeriodicGoodSellRpt',
  templateUrl: '../PeriodicReportShared/periodic-report.component.html',
})
export class SumofPeriodicGoodSellRptComponent extends PeriodicReportBaseComponent {
  protected override readonly reportForm = 'SumofPeriodicGoodSellRpt';
  protected override readonly defaultTitle = 'فروش کالاها در سال';
  override readonly supportsAnnual = false;
  override readonly showPriceTotals = true;
  override readonly chartCategoryFields = ['FactorDate'];
  protected override readonly fallbackSchemas: PeriodicGridSchema[] = [
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
    return this.repo.SumofPeriodicGoodSellRpt(payload);
  }
}
