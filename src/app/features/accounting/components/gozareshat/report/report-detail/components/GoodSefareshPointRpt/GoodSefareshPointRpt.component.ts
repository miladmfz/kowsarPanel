import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { Observable } from 'rxjs';
import { KowsarChartColumnComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-column/kowsar-chart-column.component';
import {
  InventoryChartModel,
  InventoryGridSchema,
  InventoryFilterConfig,
  InventoryReportBaseComponent,
  InventorySummary,
} from '../InventoryReportShared/inventory-report.base';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridModule,
    KowsarChartColumnComponent,
  ],
  selector: 'app-GoodSefareshPointRpt',
  templateUrl: '../InventoryReportShared/inventory-report.component.html',
})
export class GoodSefareshPointRptComponent extends InventoryReportBaseComponent {
  protected override readonly reportForm = 'GoodSefareshPointRpt';
  protected override readonly defaultTitle = 'کالاهای کمتر از نقطه سفارش';
  override readonly chartTitle = 'موجودی در مقایسه با نقاط سفارش و بحرانی';
  override readonly autoLoad = true;
  override readonly filterConfig: InventoryFilterConfig = {
    department: true,
    stack: true,
    mainCode: true,
  };
  protected override readonly initialFilters = {};
  protected override readonly numericFields = new Set([
    'Amount',
    'MaxSellPrice',
    'MinSellPrice',
    'SefareshPoint',
    'SefareshTaf',
    'CriticalPoint',
    'CriticalTaf',
    'Tiraj',
    'PrintPeriod',
    'BulletinGroupSerial',
    'SellPrice1',
    'SellPrice2',
    'SellPrice3',
    'SellPrice4',
    'SellPrice5',
    'SellPrice6',
    'FinalPrice',
    'FormNo',
  ]);
  protected override readonly fallbackSchemas: InventoryGridSchema[] = [
    {
      FieldName: 'PrivateCodeForSort',
      Caption: 'کد کالا',
      Width: 90,
      Visible: true,
    },
    { FieldName: 'GoodName', Caption: 'نام کالا', Width: 220, Visible: true },
    { FieldName: 'Amount', Caption: 'تعداد', Width: 90, Visible: true },
    {
      FieldName: 'SefareshPoint',
      Caption: 'نقطه سفارش',
      Width: 100,
      Visible: true,
    },
    {
      FieldName: 'SefareshTaf',
      Caption: 'اختلاف نقطه سفارش',
      Width: 120,
      Visible: true,
    },
    {
      FieldName: 'CriticalPoint',
      Caption: 'نقطه بحرانی',
      Width: 100,
      Visible: true,
    },
    {
      FieldName: 'CriticalTaf',
      Caption: 'اختلاف نقطه بحرانی',
      Width: 120,
      Visible: true,
    },
    { FieldName: 'Writer', Caption: 'مولف', Width: 140, Visible: true },
  ];

  protected override request(payload: unknown): Observable<any> {
    return this.repo.GoodSefareshPointRpt(payload);
  }

  protected override buildChart(rows: any[]): InventoryChartModel {
    return {
      categories: rows.map((row) =>
        this.chartLabel(row, 'GoodName', 'PrivateCodeForSort'),
      ),
      series: [
        {
          name: 'موجودی',
          data: rows.map((row) => this.chartValue(row, 'Amount')),
        },
        {
          name: 'نقطه سفارش',
          data: rows.map((row) => this.chartValue(row, 'SefareshPoint')),
        },
        {
          name: 'نقطه بحرانی',
          data: rows.map((row) => this.chartValue(row, 'CriticalPoint')),
        },
      ],
    };
  }

  protected override buildReportSummaries(rows: any[]): InventorySummary[] {
    return [
      { label: 'جمع موجودی', value: this.sumField(rows, 'Amount') },
      { label: 'جمع نقطه سفارش', value: this.sumField(rows, 'SefareshPoint') },
      { label: 'اختلاف نقطه سفارش', value: this.sumField(rows, 'SefareshTaf') },
    ];
  }
}
