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
  selector: 'app-GoodHistoryRpt',
  templateUrl: '../InventoryReportShared/inventory-report.component.html',
})
export class GoodHistoryRptComponent extends InventoryReportBaseComponent {
  protected override readonly reportForm = 'GoodHistoryRpt';
  protected override readonly defaultTitle = 'گردش کالاها';
  override readonly chartTitle = 'ورودی و خروجی گردش کالا';
  override readonly filterConfig: InventoryFilterConfig = {
    dateRange: true,
    department: true,
    goodCode: true,
    stack: true,
    provider: true,
    mainCode: true,
  };
  protected override readonly initialFilters = {};
  protected override readonly numericFields = new Set([
    'StackCode',
    'InStack',
    'OutStack',
    'MaxSellPrice',
    'PerCode',
    'PeriodRef',
    'StackRef',
    'UnitRef',
    'GoodRef',
  ]);
  protected override readonly fallbackSchemas: InventoryGridSchema[] = [
    { FieldName: 'ksrRowNumber', Caption: 'ردیف', Width: 60, Visible: true },
    { FieldName: 'Date', Caption: 'تاریخ', Width: 100, Visible: true },
    {
      FieldName: 'PrivateCodeForSort',
      Caption: 'کد کالا',
      Width: 90,
      Visible: true,
    },
    { FieldName: 'GoodName', Caption: 'نام کالا', Width: 220, Visible: true },
    { FieldName: 'StackName', Caption: 'نام انبار', Width: 130, Visible: true },
    {
      FieldName: 'Comment',
      Caption: 'شرح/شماره فاکتور',
      Width: 180,
      Visible: true,
    },
    { FieldName: 'InStack', Caption: 'ورودی', Width: 90, Visible: true },
    { FieldName: 'OutStack', Caption: 'خروجی', Width: 90, Visible: true },
    {
      FieldName: 'PerSonName',
      Caption: 'مشتری/فروشنده',
      Width: 160,
      Visible: true,
    },
  ];

  protected override request(payload: unknown): Observable<any> {
    return this.repo.GoodHistoryRpt(payload);
  }

  protected override validateAdditionalFilters(): string | null {
    const value = this.EditForm_SearchTarget.getRawValue();
    if (
      value.GoodCode &&
      !value.WithMainCode &&
      !/^\d+$/.test(value.GoodCode.trim())
    ) {
      return 'در حالت کد جزئی، کد کالا باید کد سیستم عددی باشد.';
    }
    return null;
  }

  protected override buildChart(rows: any[]): InventoryChartModel {
    return {
      categories: rows.map((row) =>
        this.chartLabel(row, 'Date', 'GoodName', 'StackName'),
      ),
      series: [
        {
          name: 'ورودی',
          data: rows.map((row) => this.chartValue(row, 'InStack')),
        },
        {
          name: 'خروجی',
          data: rows.map((row) => this.chartValue(row, 'OutStack')),
        },
      ],
    };
  }

  protected override buildReportSummaries(rows: any[]): InventorySummary[] {
    let input = 0;
    let output = 0;
    for (const row of rows) {
      const difference =
        this.sumField([row], 'InStack') - this.sumField([row], 'OutStack');
      if (difference > 0) input += difference;
      else output += Math.abs(difference);
    }

    return [
      { label: 'جمع ورودی', value: input },
      { label: 'جمع خروجی', value: output },
      { label: 'خالص گردش', value: input - output },
      {
        label: 'ارزش ورودی به نرخ فروش',
        value: this.sumProduct(rows, 'InStack', 'MaxSellPrice'),
      },
      {
        label: 'ارزش خروجی به نرخ فروش',
        value: this.sumProduct(rows, 'OutStack', 'MaxSellPrice'),
      },
    ];
  }
}
