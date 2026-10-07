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
  selector: 'app-GoodGroupRpt',
  templateUrl: '../InventoryReportShared/inventory-report.component.html',
})
export class GoodGroupRptComponent extends InventoryReportBaseComponent {
  protected override readonly reportForm = 'GoodGroupRpt';
  protected override readonly defaultTitle = 'گزارش کالاها بر اساس گروه‌بندی';
  override readonly chartTitle = 'موجودی و ارزش کالاهای گروه‌بندی‌شده';
  override readonly autoLoad = true;
  override readonly filterConfig: InventoryFilterConfig = {
    goodCode: true,
    group: true,
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
    'PageNo',
    'SellPrice1',
    'SellPrice2',
    'SellPrice3',
    'SellPrice4',
    'SellPrice5',
    'SellPrice6',
    'MinAmount',
    'MaxAmount',
    'MinBuyPrice',
    'MaxBuyPrice',
  ]);
  protected override readonly fallbackSchemas: InventoryGridSchema[] = [
    { FieldName: 'ksrRowNumber', Caption: 'ردیف', Width: 60, Visible: true },
    { FieldName: 'GroupCode', Caption: 'کد گروه', Width: 90, Visible: true },
    { FieldName: 'Name', Caption: 'نام گروه', Width: 140, Visible: true },
    {
      FieldName: 'PrivateCodeForSort',
      Caption: 'کد کالا',
      Width: 90,
      Visible: true,
    },
    { FieldName: 'GoodName', Caption: 'نام کالا', Width: 220, Visible: true },
    { FieldName: 'Amount', Caption: 'موجودی', Width: 90, Visible: true },
    {
      FieldName: 'MaxSellPrice',
      Caption: 'قیمت فروش',
      Width: 120,
      Visible: true,
    },
    {
      FieldName: 'MinSellPrice',
      Caption: 'آخرین قیمت خرید',
      Width: 120,
      Visible: true,
    },
  ];

  protected override request(payload: unknown): Observable<any> {
    return this.repo.GoodGroupRpt(payload);
  }

  protected override buildChart(rows: any[]): InventoryChartModel {
    return {
      categories: rows.map((row) => this.chartLabel(row, 'Name', 'GoodName')),
      series: [
        {
          name: 'موجودی',
          data: rows.map((row) => this.chartValue(row, 'Amount')),
        },
        {
          name: 'ارزش فروش',
          data: rows.map((row) =>
            this.chartProduct(row, 'Amount', 'MaxSellPrice'),
          ),
        },
        {
          name: 'ارزش خرید',
          data: rows.map((row) =>
            this.chartProduct(row, 'Amount', 'MinSellPrice'),
          ),
        },
      ],
    };
  }

  protected override buildReportSummaries(rows: any[]): InventorySummary[] {
    return [
      { label: 'جمع موجودی', value: this.sumField(rows, 'Amount') },
      {
        label: 'ارزش فروش موجودی',
        value: this.sumProduct(rows, 'Amount', 'MaxSellPrice'),
      },
      {
        label: 'ارزش خرید موجودی',
        value: this.sumProduct(rows, 'Amount', 'MinSellPrice'),
      },
    ];
  }
}
