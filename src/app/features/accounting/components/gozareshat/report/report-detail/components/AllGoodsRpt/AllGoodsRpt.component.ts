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
  selector: 'app-AllGoodsRpt',
  templateUrl: '../InventoryReportShared/inventory-report.component.html',
})
export class AllGoodsRptComponent extends InventoryReportBaseComponent {
  protected override readonly reportForm = 'AllGoodsRpt';
  protected override readonly defaultTitle = 'لیست موجودی تمام کالاها';
  override readonly chartTitle = 'موجودی و ارزش فروش کالاها';
  override readonly filterConfig: InventoryFilterConfig = {
    department: true,
    mainCode: true,
  };
  protected override readonly initialFilters = {};
  protected override readonly numericFields = new Set([
    'Amount',
    'MaxSellPrice',
    'MinSellPrice',
    'SefareshPoint',
    'CriticalPoint',
    'Tiraj',
    'BulletinGroupSerial',
    'PrintPeriod',
    'SellPrice1',
    'SellPrice2',
    'SellPrice3',
    'SellPrice4',
    'SellPrice5',
    'SellPrice6',
  ]);
  protected override readonly fallbackSchemas: InventoryGridSchema[] = [
    {
      FieldName: 'PrivateCodeForSort',
      Caption: 'کد کالا',
      Width: 90,
      Visible: true,
    },
    { FieldName: 'GoodMainCode', Caption: 'کد اصلی', Width: 90, Visible: true },
    { FieldName: 'GoodName', Caption: 'نام کالا', Width: 220, Visible: true },
    { FieldName: 'Amount', Caption: 'تعداد', Width: 90, Visible: true },
    {
      FieldName: 'MaxSellPrice',
      Caption: 'قیمت فروش',
      Width: 120,
      Visible: true,
    },
    { FieldName: 'UnitName', Caption: 'واحد', Width: 90, Visible: true },
    {
      FieldName: 'SefareshPoint',
      Caption: 'نقطه سفارش',
      Width: 100,
      Visible: true,
    },
    {
      FieldName: 'CriticalPoint',
      Caption: 'نقطه بحرانی',
      Width: 100,
      Visible: true,
    },
  ];

  protected override request(payload: unknown): Observable<any> {
    return this.repo.AllGoodsRpt(payload);
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
          name: 'ارزش موجودی به نرخ فروش',
          data: rows.map((row) =>
            this.chartProduct(row, 'Amount', 'MaxSellPrice'),
          ),
        },
      ],
    };
  }

  protected override buildReportSummaries(rows: any[]): InventorySummary[] {
    return [
      { label: 'جمع تعداد', value: this.sumField(rows, 'Amount') },
      {
        label: 'ارزش موجودی به نرخ فروش',
        value: this.sumProduct(rows, 'Amount', 'MaxSellPrice'),
      },
    ];
  }
}
