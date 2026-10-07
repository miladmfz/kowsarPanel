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
  selector: 'app-GoodInStackRpt',
  templateUrl: '../InventoryReportShared/inventory-report.component.html',
})
export class GoodInStackRptComponent extends InventoryReportBaseComponent {
  protected override readonly reportForm = 'GoodInStackRpt';
  protected override readonly defaultTitle = 'موجودی کالا در انبارها';
  override readonly chartTitle = 'موجودی کالا به تفکیک انبار';
  override readonly filterConfig: InventoryFilterConfig = {
    department: true,
    stack: true,
    activeState: true,
    mainCode: true,
  };
  protected override readonly initialFilters = { ActiveState: 'active' };
  protected override readonly numericFields = new Set([
    'StackCode',
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
    { FieldName: 'StackCode', Caption: 'کد انبار', Width: 80, Visible: true },
    { FieldName: 'StackName', Caption: 'نام انبار', Width: 130, Visible: true },
    {
      FieldName: 'PrivateCodeForSort',
      Caption: 'کد کالا',
      Width: 90,
      Visible: true,
    },
    { FieldName: 'GoodName', Caption: 'نام کالا', Width: 220, Visible: true },
    { FieldName: 'Amount', Caption: 'تعداد', Width: 90, Visible: true },
    {
      FieldName: 'MaxSellPrice',
      Caption: 'قیمت فروش',
      Width: 120,
      Visible: true,
    },
    { FieldName: 'UnitName', Caption: 'واحد', Width: 90, Visible: true },
    { FieldName: 'Active', Caption: 'فعال', Width: 80, Visible: true },
  ];

  protected override request(payload: unknown): Observable<any> {
    return this.repo.GoodInStackRpt(payload);
  }

  protected override buildChart(rows: any[]): InventoryChartModel {
    return {
      categories: rows.map((row) =>
        this.chartLabel(row, 'GoodName', 'StackName'),
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
