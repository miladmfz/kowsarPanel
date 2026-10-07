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
  selector: 'app-PeriodicCustomerPurchaseSeparateRpt',
  templateUrl: '../PeriodicReportShared/periodic-report.component.html',
})
export class PeriodicCustomerPurchaseSeparateRptComponent extends PeriodicReportBaseComponent {
  protected override readonly reportForm =
    'PeriodicCustomerPurchaseSeparateRpt';
  protected override readonly defaultTitle =
    'خریدهای یک مشتری در یک دوره زمانی';
  override readonly supportsAnnual = true;
  override readonly showPriceTotals = false;
  override readonly chartCategoryFields = ['CustomerName', 'FactorDate'];
  protected override readonly fallbackSchemas: PeriodicGridSchema[] = [
    {
      FieldName: 'CustomerCode',
      Caption: 'کد مشتری',
      Width: 100,
      Visible: true,
      Separator: false,
    },
    {
      FieldName: 'CustomerName',
      Caption: 'نام مشتری',
      Width: 180,
      Visible: true,
      Separator: false,
    },
    {
      FieldName: 'FactorDate',
      Caption: 'تاریخ',
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
      FieldName: 'OstanName',
      Caption: 'استان',
      Width: 120,
      Visible: true,
      Separator: false,
    },
    {
      FieldName: 'CityName',
      Caption: 'شهر',
      Width: 120,
      Visible: true,
      Separator: false,
    },
    {
      FieldName: 'Address',
      Caption: 'آدرس',
      Width: 180,
      Visible: true,
      Separator: false,
    },
    {
      FieldName: 'Phone',
      Caption: 'تلفن',
      Width: 120,
      Visible: true,
      Separator: false,
    },
  ];

  protected override request(payload: unknown): Observable<any> {
    return this.repo.PeriodicCustomerPurchaseSeparateRpt(payload);
  }
}
