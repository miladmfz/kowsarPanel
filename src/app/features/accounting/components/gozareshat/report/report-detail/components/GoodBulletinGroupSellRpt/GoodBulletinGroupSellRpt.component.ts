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
  selector: 'app-GoodBulletinGroupSellRpt',
  templateUrl: '../PeriodicReportShared/periodic-report.component.html',
})
export class GoodBulletinGroupSellRptComponent extends PeriodicReportBaseComponent {
  protected override readonly reportForm = 'GoodBulletinGroupSellRpt';
  protected override readonly defaultTitle = 'فروش کالاهای یک گروه پژوهشی';
  override readonly supportsAnnual = true;
  override readonly showPriceTotals = true;
  override readonly chartCategoryFields = [
    'BulletinGroupName',
    'GoodName',
    'FactorDate',
  ];
  protected override readonly fallbackSchemas: PeriodicGridSchema[] = [
    {
      FieldName: 'BulletinGroupSerial',
      Caption: 'سری گروه پژوهشی',
      Width: 100,
      Visible: true,
      Separator: false,
    },
    {
      FieldName: 'BulletinGroupName',
      Caption: 'گروه پژوهشی',
      Width: 160,
      Visible: true,
      Separator: false,
    },
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
    return this.repo.GoodBulletinGroupSellRpt(payload);
  }
}
