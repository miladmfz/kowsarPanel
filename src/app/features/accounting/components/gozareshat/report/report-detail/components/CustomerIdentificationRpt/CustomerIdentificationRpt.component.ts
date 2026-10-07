import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { finalize } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarChartColumnComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-column/kowsar-chart-column.component';
import { KowsarNumberService } from 'src/app/app-shell/framework-services/kowsar-number.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';

interface GridSchema {
  FieldName: string;
  Caption: string;
  Width: string | number;
  Visible: unknown;
}

const FALLBACK_SCHEMAS: GridSchema[] = [
  { FieldName: 'CustomerCode', Caption: 'کد مشتری', Width: 90, Visible: true },
  {
    FieldName: 'CustomerName',
    Caption: 'نام مشتری',
    Width: 200,
    Visible: true,
  },
  { FieldName: 'OstanName', Caption: 'استان', Width: 120, Visible: true },
  { FieldName: 'CityName', Caption: 'شهر', Width: 120, Visible: true },
  {
    FieldName: 'AllTypeSumPrice',
    Caption: 'کل خریدها خالص',
    Width: 130,
    Visible: true,
  },
  {
    FieldName: 'aTypeSellSumPrice',
    Caption: 'تسویه نشده مبلغ خالص',
    Width: 150,
    Visible: true,
  },
  { FieldName: 'EtebarCheck', Caption: 'اعتبار', Width: 120, Visible: true },
  {
    FieldName: 'MandehEtebar',
    Caption: 'مانده اعتبار',
    Width: 130,
    Visible: true,
  },
];

const NUMERIC_FIELDS = new Set([
  'CustomerCode',
  'AllTypeSumPrice',
  'aTypeSellSumPrice',
  'EtebarCheck',
  'MandehEtebar',
]);

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridModule,
    KowsarChartColumnComponent,
  ],
  selector: 'app-CustomerIdentificationRpt',
  templateUrl: './CustomerIdentificationRpt.component.html',
})
export class CustomerIdentificationRptComponent
  extends AgGridBaseComponent
  implements OnInit, OnDestroy
{
  private readonly repo = inject(ReportWebApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly kowsarNumber = inject(KowsarNumberService);

  @Input() ReportData: any;

  records = signal<any[]>([]);
  loading = signal(false);
  hasLoaded = signal(false);
  showChart = signal(false);
  errorMessage = signal('');
  title = signal('گزارش اطلاعات مشتریان');

  totals = computed(() => ({
    count: this.records().length,
    allPurchase: this.sumField('AllTypeSumPrice'),
    unsettled: this.sumField('aTypeSellSumPrice'),
    credit: this.sumField('EtebarCheck'),
    remainingCredit: this.sumField('MandehEtebar'),
  }));
  chartModel = computed(() => {
    const rows = this.records().slice(0, 12);
    return {
      categories: rows.map((row) =>
        this.chartLabel(row, 'CustomerName', 'CustomerCode'),
      ),
      series: [
        {
          name: 'کل خرید خالص',
          data: rows.map((row) => this.chartValue(row, 'AllTypeSumPrice')),
        },
        {
          name: 'تسویه‌نشده',
          data: rows.map((row) => this.chartValue(row, 'aTypeSellSumPrice')),
        },
        {
          name: 'مانده اعتبار',
          data: rows.map((row) => this.chartValue(row, 'MandehEtebar')),
        },
      ],
    };
  });

  EditForm_SearchTarget = new FormGroup({
    ReportCode: new FormControl(''),
    ReportTitle: new FormControl(''),
    ClassName: new FormControl('CustomerIdentificationRpt'),
    Department: new FormControl(''),
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.title.set(this.ReportData?.ReportTitle || 'گزارش اطلاعات مشتریان');
    this.EditForm_SearchTarget.patchValue({
      ReportCode: this.ReportData?.ReportCode ?? '',
      ReportTitle: this.ReportData?.ReportTitle ?? '',
      ClassName: this.ReportData?.ReportForm || 'CustomerIdentificationRpt',
    });
    this.initColumns();
  }

  loadList(): void {
    if (this.loading()) return;

    const department =
      this.EditForm_SearchTarget.controls.Department.value?.trim() ?? '';
    if (department && !/^\d+(\s*,\s*\d+)*$/.test(department)) {
      this.notificationService.warning(
        'کد دپارتمان باید عدد یا فهرست اعداد باشد؛ مانند 1 یا 1,2.',
      );
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.repo
      .CustomerIdentificationRpt(this.EditForm_SearchTarget.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (data: any) => {
          const rows = Array.isArray(data?.Reports) ? data.Reports : [];
          this.records.set(rows);
          this.hasLoaded.set(true);
          this.updateGridData(1, rows);
        },
        error: () => {
          this.records.set([]);
          this.hasLoaded.set(true);
          this.errorMessage.set(
            'دریافت گزارش اطلاعات مشتریان با خطا مواجه شد.',
          );
          this.updateGridData(1, []);
          this.notificationService.error('خطا در دریافت گزارش اطلاعات مشتریان');
        },
      });
  }

  clearFilter(): void {
    this.EditForm_SearchTarget.patchValue({ Department: '' });
    this.records.set([]);
    this.hasLoaded.set(false);
    this.showChart.set(false);
    this.errorMessage.set('');
    this.updateGridData(1, []);
  }

  formatNumber(value: unknown): string {
    return this.kowsarNumber.formatKowsarNumber(value);
  }

  toggleReportView(): void {
    if (this.records().length > 0) this.showChart.update((value) => !value);
  }

  syncChartOrder(): void {
    this.syncSortedData(1, (rows) => this.records.set(rows));
  }

  private chartValue(row: any, field: string): number {
    return this.kowsarNumber.parseKowsarNumber(row?.[field]) ?? 0;
  }

  private chartLabel(row: any, ...fields: string[]): string {
    const values = fields
      .map((field) => String(row?.[field] ?? '').trim())
      .filter(Boolean);
    return values.length > 0 ? values.join(' - ') : 'بدون عنوان';
  }

  override onGridReady(params: any, index: number): void {
    super.onGridReady(params, index);
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch {}
    }, 50);
  }

  private initColumns(): void {
    this.repo.GetGridSchemaVisible('TCustomerIdentificationRpt').subscribe({
      next: (data: any) => {
        const schemas = Array.isArray(data?.GridSchemas)
          ? data.GridSchemas.filter((schema: GridSchema) =>
              this.isTrue(schema.Visible),
            )
          : [];
        this.column_name_1 = (schemas.length ? schemas : FALLBACK_SCHEMAS).map(
          (schema) => this.createColumn(schema),
        );
        this.loadList();
      },
      error: () => {
        this.column_name_1 = FALLBACK_SCHEMAS.map((schema) =>
          this.createColumn(schema),
        );
        this.notificationService.error('خطا در دریافت تنظیمات ستون‌های گزارش');
        this.loadList();
      },
    });
  }

  private createColumn(schema: GridSchema): any {
    const width = Number.parseInt(String(schema.Width), 10);
    const isRowNumber = schema.FieldName === 'ksrRowNumber';
    const isNumeric = isRowNumber || NUMERIC_FIELDS.has(schema.FieldName);
    const column: any = {
      field: schema.FieldName,
      headerName: schema.Caption || schema.FieldName,
      cellClass: 'text-center',
      sortable: true,
      resizable: true,
      minWidth: Number.isFinite(width) && width > 0 ? Math.max(width, 80) : 100,
      filter: isNumeric ? 'agNumberColumnFilter' : 'agSetColumnFilter',
    };

    if (isRowNumber) {
      column.valueGetter = (params: any) => (params.node?.rowIndex ?? 0) + 1;
    } else if (isNumeric) {
      column.valueFormatter = (params: any) =>
        this.kowsarNumber.formatKowsarNumber(params.value);
      column.comparator = (valueA: any, valueB: any) =>
        this.kowsarNumber.compareKowsarValues(valueA, valueB);
    }

    return column;
  }

  private isTrue(value: unknown): boolean {
    return (
      value === true ||
      value === 1 ||
      value === '1' ||
      value === 'True' ||
      value === 'true'
    );
  }

  private sumField(field: string): number {
    return this.records().reduce((sum, row) => {
      const parsed = this.kowsarNumber.parseKowsarNumber(row?.[field]);
      return sum + (parsed ?? 0);
    }, 0);
  }
}
