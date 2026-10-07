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
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { finalize, Observable } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarNumberService } from 'src/app/app-shell/framework-services/kowsar-number.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';

interface GridSchema {
  FieldName: string;
  Caption: string;
  Width: string | number;
  Visible: unknown;
  Separator: unknown;
}

const FALLBACK_SCHEMAS: GridSchema[] = [
  {
    FieldName: 'TheGoodCode',
    Caption: 'کد کالا',
    Width: 100,
    Visible: true,
    Separator: false,
  },
  {
    FieldName: 'GoodName',
    Caption: 'نام کالا',
    Width: 180,
    Visible: true,
    Separator: false,
  },
  {
    FieldName: 'FacAmountSell',
    Caption: 'تعداد فروش در دوره',
    Width: 120,
    Visible: true,
    Separator: true,
  },
  {
    FieldName: 'SumPriceSell',
    Caption: 'مبلغ خالص فروش در دوره',
    Width: 140,
    Visible: true,
    Separator: true,
  },
  {
    FieldName: 'SumnPriceSell',
    Caption: 'مبلغ ناخالص فروش در دوره',
    Width: 150,
    Visible: true,
    Separator: true,
  },
  {
    FieldName: 'AllFacAmount',
    Caption: 'تعداد فروش خالص تا تاریخ',
    Width: 140,
    Visible: true,
    Separator: true,
  },
  {
    FieldName: 'AllSumPriceSell',
    Caption: 'کل مبلغ خالص',
    Width: 130,
    Visible: true,
    Separator: true,
  },
];

@Directive()
export abstract class MonthlyGoodSellStateReportBaseComponent
  extends AgGridBaseComponent
  implements OnInit, OnDestroy
{
  protected readonly repo = inject(ReportWebApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly kowsarNumber = inject(KowsarNumberService);
  private readonly session = inject(SessionStorageService);

  protected abstract readonly reportForm: string;
  protected abstract readonly defaultTitle: string;
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
    periodAmount: this.sumField('FacAmountSell'),
    periodNet: this.sumField('SumPriceSell'),
    periodGross: this.sumField('SumnPriceSell'),
    allAmount: this.sumField('AllFacAmount'),
  }));
  chartModel = computed(() => {
    const rows = this.records().slice(0, 12);
    return {
      categories: rows.map((row) =>
        this.chartLabel(row, 'GoodName', 'TheGoodCode'),
      ),
      series: [
        {
          name: 'تعداد فروش دوره',
          data: rows.map((row) => this.chartValue(row, 'FacAmountSell')),
        },
        {
          name: 'فروش خالص دوره',
          data: rows.map((row) => this.chartValue(row, 'SumPriceSell')),
        },
        {
          name: 'فروش ناخالص دوره',
          data: rows.map((row) => this.chartValue(row, 'SumnPriceSell')),
        },
      ],
    };
  });

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#0066cc',
    selectedText: '#ffffff',
  };

  EditForm_SearchTarget = new FormGroup({
    ReportCode: new FormControl(''),
    ReportTitle: new FormControl(''),
    ClassName: new FormControl(''),
    FromDate: new FormControl(''),
    ToDate: new FormControl(''),
    Department: new FormControl(''),
    WithMainCode: new FormControl(false, { nonNullable: true }),
  });

  private baseColumnDefs: any[] = [];

  constructor() {
    super();
  }

  ngOnInit(): void {
    const defaultDates = this.defaultDateRange();
    this.title.set(this.ReportData?.ReportTitle || this.defaultTitle);
    this.EditForm_SearchTarget.patchValue({
      ReportCode: this.ReportData?.ReportCode ?? '',
      ReportTitle: this.ReportData?.ReportTitle ?? '',
      ClassName: this.ReportData?.ReportForm || this.reportForm,
      ...defaultDates,
    });

    this.initColumns();
  }

  private initColumns(): void {
    this.repo.GetGridSchemaVisible(`T${this.reportForm}`).subscribe({
      next: (data: any) => {
        const schemas = Array.isArray(data?.GridSchemas)
          ? data.GridSchemas.filter((schema: GridSchema) =>
              this.isTrue(schema.Visible),
            )
          : [];
        this.setBaseColumns(schemas.length > 0 ? schemas : FALLBACK_SCHEMAS);
      },
      error: () => {
        this.setBaseColumns(FALLBACK_SCHEMAS);
        this.notificationService.error('خطا در دریافت تنظیمات ستون‌های گزارش');
      },
    });
  }

  private setBaseColumns(schemas: GridSchema[]): void {
    this.baseColumnDefs = schemas.map((schema) => this.createColumn(schema));
    this.column_name_1 = [...this.baseColumnDefs];
  }

  private createColumn(schema: GridSchema): any {
    const width = Number.parseInt(String(schema.Width), 10);
    const isRowNumber = schema.FieldName === 'ksrRowNumber';
    const isDynamic =
      schema.FieldName.startsWith('[') && schema.FieldName.endsWith(']');
    const isNumeric =
      isRowNumber ||
      isDynamic ||
      this.isTrue(schema.Separator) ||
      /(Amount|Price)/i.test(schema.FieldName);
    const column: any = {
      field: schema.FieldName,
      headerName: schema.Caption || this.dynamicCaption(schema.FieldName),
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

  loadList(): void {
    if (this.loading()) return;

    const { FromDate, ToDate } = this.EditForm_SearchTarget.getRawValue();
    if (FromDate && ToDate && FromDate > ToDate) {
      this.notificationService.warning(
        'تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.',
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
          this.appendDynamicColumns(rows);
          this.updateGridData(1, rows);
        },
        error: () => {
          this.records.set([]);
          this.hasLoaded.set(true);
          this.errorMessage.set('دریافت اطلاعات گزارش با خطا مواجه شد.');
          this.column_name_1 = [...this.baseColumnDefs];
          this.updateGridData(1, []);
          this.notificationService.error(`خطا در دریافت گزارش ${this.title()}`);
        },
      });
  }

  clearFilter(): void {
    this.EditForm_SearchTarget.patchValue({
      Department: '',
      WithMainCode: false,
      ...this.defaultDateRange(),
    });
    this.records.set([]);
    this.hasLoaded.set(false);
    this.showChart.set(false);
    this.errorMessage.set('');
    this.column_name_1 = [...this.baseColumnDefs];
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

  private appendDynamicColumns(rows: any[]): void {
    const knownFields = new Set(
      this.baseColumnDefs.map((column) => String(column.field)),
    );
    const dynamicFields = Array.from(
      new Set(
        rows.flatMap((row) =>
          Object.keys(row ?? {}).filter(
            (field) => field.startsWith('[') && field.endsWith(']'),
          ),
        ),
      ),
    ).filter((field) => !knownFields.has(field));

    const dynamicColumns = dynamicFields.map((field) =>
      this.createColumn({
        FieldName: field,
        Caption: this.dynamicCaption(field),
        Width: 120,
        Visible: true,
        Separator: true,
      }),
    );
    this.column_name_1 = [...this.baseColumnDefs, ...dynamicColumns];
  }

  private dynamicCaption(field: string): string {
    return field.startsWith('[') && field.endsWith(']')
      ? field.slice(1, -1)
      : field;
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

  private chartValue(row: any, field: string): number {
    return this.kowsarNumber.parseKowsarNumber(row?.[field]) ?? 0;
  }

  private chartLabel(row: any, ...fields: string[]): string {
    const values = fields
      .map((field) => String(row?.[field] ?? '').trim())
      .filter(Boolean);
    return values.length > 0 ? values.join(' - ') : 'بدون عنوان';
  }

  private defaultDateRange(): { FromDate: string; ToDate: string } {
    const activeDate = this.session.activeDate.trim();
    const year = /^(\d{4})\/\d{2}\/\d{2}$/.exec(activeDate)?.[1];

    return year
      ? { FromDate: `${year}/01/01`, ToDate: activeDate }
      : { FromDate: '', ToDate: '' };
  }
}
