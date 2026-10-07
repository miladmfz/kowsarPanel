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
  selector: 'app-BulletinGroupNameSellRpt',
  templateUrl: '../PeriodicReportShared/periodic-report.component.html',
})
export class BulletinGroupNameSellRptComponent extends PeriodicReportBaseComponent {
  protected override readonly reportForm = 'BulletinGroupNameSellRpt';
  protected override readonly defaultTitle = 'فروش یک گروه پژوهشی';
  override readonly supportsAnnual = true;
  override readonly showPriceTotals = true;
  override readonly chartCategoryFields = ['BulletinGroupName', 'FactorDate'];
  protected override readonly fallbackSchemas: PeriodicGridSchema[] = [
    {
      FieldName: 'BulletinGroupName',
      Caption: 'گروه پژوهشی',
      Width: 160,
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
    return this.repo.BulletinGroupNameSellRpt(payload);
  }
}
