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
  selector: 'app-PeriodicInOutGoodStateRpt',
  templateUrl: '../InventoryReportShared/inventory-report.component.html',
})
export class PeriodicInOutGoodStateRptComponent extends InventoryReportBaseComponent {
  protected override readonly reportForm = 'PeriodicInOutGoodStateRpt';
  protected override readonly defaultTitle =
    'صورت وضعیت کلی ورود و خروج کالاها';
  override readonly chartTitle = 'وضعیت ورود، خروج و مانده کالاها';
  override readonly filterConfig: InventoryFilterConfig = {
    dateRange: true,
    department: true,
    mainCode: true,
    stackGrouping: true,
  };
  protected override readonly initialFilters = {};
  protected override readonly numericFields = new Set([
    'StackRef',
    'bInGoodAmount',
    'bInSumnPrice',
    'bOutGoodAmount',
    'bOutSumnPrice',
    'OutGoodAmount',
    'inGoodAmount',
    'EndPeriodAmount',
    'OutSumPrice',
    'inSumPrice',
    'bOutSumPrice',
    'OutSumnPrice',
    'inSumnPrice',
    'bInSumPrice',
    'NowAmount',
    'nowValue',
  ]);
  protected override readonly fallbackSchemas: InventoryGridSchema[] = [
    { FieldName: 'ksrRowNumber', Caption: 'ردیف', Width: 60, Visible: true },
    {
      FieldName: 'PrivateCodeForSort',
      Caption: 'کد کالا',
      Width: 90,
      Visible: true,
    },
    { FieldName: 'GoodName', Caption: 'نام کالا', Width: 220, Visible: true },
    { FieldName: 'Name', Caption: 'نام انبار', Width: 130, Visible: true },
    {
      FieldName: 'bInGoodAmount',
      Caption: 'ورودی تا دوره',
      Width: 100,
      Visible: true,
    },
    {
      FieldName: 'bOutGoodAmount',
      Caption: 'خروجی تا دوره',
      Width: 100,
      Visible: true,
    },
    {
      FieldName: 'inGoodAmount',
      Caption: 'ورودی در دوره',
      Width: 100,
      Visible: true,
    },
    {
      FieldName: 'OutGoodAmount',
      Caption: 'خروجی در دوره',
      Width: 100,
      Visible: true,
    },
    {
      FieldName: 'EndPeriodAmount',
      Caption: 'موجودی پایان دوره',
      Width: 120,
      Visible: true,
    },
    {
      FieldName: 'NowAmount',
      Caption: 'موجودی فعلی',
      Width: 100,
      Visible: true,
    },
    {
      FieldName: 'nowValue',
      Caption: 'ارزش موجودی فعلی',
      Width: 130,
      Visible: true,
    },
  ];

  protected override request(payload: unknown): Observable<any> {
    return this.repo.PeriodicInOutGoodStateRpt(payload);
  }

  protected override buildChart(rows: any[]): InventoryChartModel {
    return {
      categories: rows.map((row) => this.chartLabel(row, 'GoodName', 'Name')),
      series: [
        {
          name: 'ورودی دوره',
          data: rows.map((row) => this.chartValue(row, 'inGoodAmount')),
        },
        {
          name: 'خروجی دوره',
          data: rows.map((row) => this.chartValue(row, 'OutGoodAmount')),
        },
        {
          name: 'موجودی پایان دوره',
          data: rows.map((row) => this.chartValue(row, 'EndPeriodAmount')),
        },
        {
          name: 'موجودی فعلی',
          data: rows.map((row) => this.chartValue(row, 'NowAmount')),
        },
      ],
    };
  }

  protected override buildReportSummaries(rows: any[]): InventorySummary[] {
    return [
      { label: 'ورودی دوره', value: this.sumField(rows, 'inGoodAmount') },
      { label: 'خروجی دوره', value: this.sumField(rows, 'OutGoodAmount') },
      {
        label: 'موجودی پایان دوره',
        value: this.sumField(rows, 'EndPeriodAmount'),
      },
      { label: 'موجودی فعلی', value: this.sumField(rows, 'NowAmount') },
    ];
  }
}
