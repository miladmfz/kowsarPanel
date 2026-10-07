import {
  computed,
  Directive,
  inject,
  Input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { finalize, Observable } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarNumberService } from 'src/app/app-shell/framework-services/kowsar-number.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';

export interface PeriodicGridSchema {
  FieldName: string;
  Caption: string;
  Width: string | number;
  Visible: unknown;
  Separator: unknown;
}

@Directive()
export abstract class PeriodicReportBaseComponent
  extends AgGridBaseComponent
  implements OnInit, OnDestroy
{
  protected readonly repo = inject(ReportWebApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly kowsarNumber = inject(KowsarNumberService);
  private readonly session = inject(SessionStorageService);

  protected abstract readonly reportForm: string;
  protected abstract readonly defaultTitle: string;
  protected abstract readonly fallbackSchemas: PeriodicGridSchema[];
  abstract readonly supportsAnnual: boolean;
  abstract readonly showPriceTotals: boolean;
  abstract readonly chartCategoryFields: string[];
  protected abstract request(payload: unknown): Observable<any>;

  @Input() ReportData: any;

  records = signal<any[]>([]);
  loading = signal(false);
  hasLoaded = signal(false);
  showChart = signal(false);
  errorMessage = signal('');
  title = signal('');

  totals = computed(() => ({
    count: this.records().length,
    amount: this.sumField('Amount'),
    net: this.sumFirstAvailableField(['SumPrice', 'FacSumPrice']),
    gross: this.sumFirstAvailableField(['nSumPrice', 'FacnSumPrice']),
  }));
  chartModel = computed(() => {
    const rows = this.records().slice(0, 12);
    const series = [
      {
        name: 'تعداد',
        data: rows.map((row) => this.chartValue(row, 'Amount')),
      },
    ];
    if (this.showPriceTotals) {
      series.push(
        {
          name: 'مبلغ خالص',
          data: rows.map((row) =>
            this.chartFirstAvailableValue(row, ['SumPrice', 'FacSumPrice']),
          ),
        },
        {
          name: 'مبلغ ناخالص',
          data: rows.map((row) =>
            this.chartFirstAvailableValue(row, ['nSumPrice', 'FacnSumPrice']),
          ),
        },
      );
    }
    return {
      categories: rows.map((row) => this.chartLabel(row)),
      series,
    };
  });

  EditForm_SearchTarget = new FormGroup({
    ReportCode: new FormControl(''),
    ReportTitle: new FormControl(''),
    ClassName: new FormControl(''),
    FromDate: new FormControl(''),
    ToDate: new FormControl(''),
    Department: new FormControl(''),
    IsYear: new FormControl(false, { nonNullable: true }),
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.title.set(this.ReportData?.ReportTitle || this.defaultTitle);
    this.EditForm_SearchTarget.patchValue({
      ReportCode: this.ReportData?.ReportCode ?? '',
      ReportTitle: this.ReportData?.ReportTitle ?? '',
      ClassName: this.ReportData?.ReportForm || this.reportForm,
      ...this.defaultMonthRange(),
    });
    this.initColumns();
  }

  loadList(): void {
    if (this.loading()) return;

    const { FromDate, ToDate } = this.EditForm_SearchTarget.getRawValue();
    if (!this.isValidMonth(FromDate) || !this.isValidMonth(ToDate)) {
      this.notificationService.warning(
        'تاریخ باید با قالب ماهانه YYYY/MM وارد شود؛ مانند 1405/06.',
      );
      return;
    }
    if (FromDate && ToDate && FromDate > ToDate) {
      this.notificationService.warning(
        'ماه شروع نمی‌تواند بعد از ماه پایان باشد.',
      );
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.request(this.EditForm_SearchTarget.getRawValue())
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
          this.errorMessage.set('دریافت اطلاعات گزارش با خطا مواجه شد.');
          this.updateGridData(1, []);
          this.notificationService.error(`خطا در دریافت گزارش ${this.title()}`);
        },
      });
  }

  clearFilter(): void {
    this.EditForm_SearchTarget.patchValue({
      Department: '',
      IsYear: false,
      ...this.defaultMonthRange(),
    });
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
    this.repo.GetGridSchemaVisible(`T${this.reportForm}`).subscribe({
      next: (data: any) => {
        const schemas = Array.isArray(data?.GridSchemas)
          ? data.GridSchemas.filter((schema: PeriodicGridSchema) =>
              this.isTrue(schema.Visible),
            )
          : [];
        this.column_name_1 = (
          schemas.length ? schemas : this.fallbackSchemas
        ).map((schema) => this.createColumn(schema));
      },
      error: () => {
        this.column_name_1 = this.fallbackSchemas.map((schema) =>
          this.createColumn(schema),
        );
        this.notificationService.error('خطا در دریافت تنظیمات ستون‌های گزارش');
      },
    });
  }

  private createColumn(schema: PeriodicGridSchema): any {
    const width = Number.parseInt(String(schema.Width), 10);
    const isRowNumber = schema.FieldName === 'ksrRowNumber';
    const isNumeric =
      isRowNumber ||
      this.isTrue(schema.Separator) ||
      /(Amount|Price|Code$)/i.test(schema.FieldName);
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

  private isValidMonth(value: string | null): boolean {
    return !value || /^\d{4}\/(0[1-9]|1[0-2])$/.test(value.trim());
  }

  private defaultMonthRange(): { FromDate: string; ToDate: string } {
    const activeDate = this.session.activeDate.trim();
    const match = /^(\d{4})\/(\d{2})(?:\/\d{2})?$/.exec(activeDate);
    return match
      ? { FromDate: `${match[1]}/01`, ToDate: `${match[1]}/${match[2]}` }
      : { FromDate: '', ToDate: '' };
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

  private sumFirstAvailableField(fields: string[]): number {
    const field = fields.find((candidate) =>
      this.records().some((row) => row?.[candidate] !== undefined),
    );
    return field ? this.sumField(field) : 0;
  }

  private chartValue(row: any, field: string): number {
    return this.kowsarNumber.parseKowsarNumber(row?.[field]) ?? 0;
  }

  private chartFirstAvailableValue(row: any, fields: string[]): number {
    const field = fields.find((candidate) => row?.[candidate] !== undefined);
    return field ? this.chartValue(row, field) : 0;
  }

  private chartLabel(row: any): string {
    const values = this.chartCategoryFields
      .map((field) => String(row?.[field] ?? '').trim())
      .filter(Boolean);
    return values.length > 0 ? values.join(' - ') : 'بدون عنوان';
  }
}
