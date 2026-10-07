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
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';

export interface InventoryGridSchema {
  FieldName: string;
  Caption: string;
  Width: string | number;
  Visible: unknown;
  Separator?: unknown;
}

export interface InventoryFilterConfig {
  dateRange?: boolean;
  department?: boolean;
  goodCode?: boolean;
  stack?: boolean;
  provider?: boolean;
  group?: boolean;
  activeState?: boolean;
  mainCode?: boolean;
  stackGrouping?: boolean;
}

export interface InventorySummary {
  label: string;
  value: number;
}

export interface InventoryChartModel {
  categories: string[];
  series: Array<{
    name: string;
    data: number[];
  }>;
}

interface StackOption {
  StackCode: string | number;
  Name: string;
}

@Directive()
export abstract class InventoryReportBaseComponent
  extends AgGridBaseComponent
  implements OnInit, OnDestroy
{
  protected readonly repo = inject(ReportWebApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly kowsarNumber = inject(KowsarNumberService);

  protected abstract readonly reportForm: string;
  protected abstract readonly defaultTitle: string;
  protected abstract readonly fallbackSchemas: InventoryGridSchema[];
  protected abstract readonly numericFields: ReadonlySet<string>;
  protected abstract readonly initialFilters: Record<string, unknown>;
  abstract readonly chartTitle: string;
  readonly filterConfig: InventoryFilterConfig = {};
  readonly autoLoad: boolean = false;

  protected abstract request(payload: unknown): Observable<any>;
  protected abstract buildReportSummaries(rows: any[]): InventorySummary[];
  protected abstract buildChart(rows: any[]): InventoryChartModel;

  @Input() ReportData: any;

  records = signal<any[]>([]);
  stacks = signal<StackOption[]>([]);
  loading = signal(false);
  hasLoaded = signal(false);
  showChart = signal(false);
  errorMessage = signal('');
  title = signal('');

  summaryCards = computed<InventorySummary[]>(() => [
    { label: 'تعداد رکورد', value: this.records().length },
    ...this.buildReportSummaries(this.records()),
  ]);
  chartModel = computed<InventoryChartModel>(() =>
    this.buildChart(this.records().slice(0, 12)),
  );
  chartButtonLabel = computed(() =>
    this.showChart() ? 'نمایش به صورت لیستی' : 'نمایش به صورت چارتی',
  );

  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    ReportCode: new FormControl(''),
    ReportTitle: new FormControl(''),
    ClassName: new FormControl(''),
    FromDate: new FormControl(''),
    ToDate: new FormControl(''),
    Department: new FormControl(''),
    GoodCode: new FormControl(''),
    StackCode: new FormControl(''),
    ProviderCode: new FormControl(''),
    GroupCode: new FormControl(''),
    ActiveState: new FormControl('all', { nonNullable: true }),
    WithMainCode: new FormControl(false, { nonNullable: true }),
    IncludeSubgroups: new FormControl(false, { nonNullable: true }),
    WithStackGrouping: new FormControl(false, { nonNullable: true }),
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
      ...this.initialFilters,
    });

    if (this.filterConfig.stack) this.loadStacks();
    this.initColumns();
  }

  loadList(): void {
    if (this.loading()) return;

    const validationMessage = this.validateFilters();
    if (validationMessage) {
      this.notificationService.warning(validationMessage);
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
      SearchTarget: '',
      FromDate: '',
      ToDate: '',
      Department: '',
      GoodCode: '',
      StackCode: '',
      ProviderCode: '',
      GroupCode: '',
      ActiveState: 'all',
      WithMainCode: false,
      IncludeSubgroups: false,
      WithStackGrouping: false,
      ...this.initialFilters,
    });
    this.records.set([]);
    this.hasLoaded.set(false);
    this.showChart.set(false);
    this.errorMessage.set('');
    this.updateGridData(1, []);
  }

  toggleReportView(): void {
    if (this.records().length === 0) return;
    this.showChart.update((value) => !value);
  }

  syncChartOrder(): void {
    this.syncSortedData(1, (rows) => this.records.set(rows));
  }

  formatNumber(value: unknown): string {
    return this.kowsarNumber.formatKowsarNumber(value);
  }

  protected sumField(rows: any[], field: string): number {
    return rows.reduce((sum, row) => {
      const parsed = this.kowsarNumber.parseKowsarNumber(row?.[field]);
      return sum + (parsed ?? 0);
    }, 0);
  }

  protected sumProduct(rows: any[], first: string, second: string): number {
    return rows.reduce((sum, row) => {
      const firstValue = this.kowsarNumber.parseKowsarNumber(row?.[first]) ?? 0;
      const secondValue =
        this.kowsarNumber.parseKowsarNumber(row?.[second]) ?? 0;
      return sum + firstValue * secondValue;
    }, 0);
  }

  protected chartValue(row: any, field: string): number {
    return this.kowsarNumber.parseKowsarNumber(row?.[field]) ?? 0;
  }

  protected chartProduct(row: any, first: string, second: string): number {
    return this.chartValue(row, first) * this.chartValue(row, second);
  }

  protected chartLabel(row: any, ...fields: string[]): string {
    const values = fields
      .map((field) => String(row?.[field] ?? '').trim())
      .filter((value) => value.length > 0);
    return values.length > 0 ? values.join(' - ') : 'بدون عنوان';
  }

  protected validateAdditionalFilters(): string | null {
    return null;
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
          ? data.GridSchemas.filter((schema: InventoryGridSchema) =>
              this.isTrue(schema.Visible),
            )
          : [];
        this.column_name_1 = (
          schemas.length ? schemas : this.fallbackSchemas
        ).map((schema) => this.createColumn(schema));
        if (this.autoLoad) this.loadList();
      },
      error: () => {
        this.column_name_1 = this.fallbackSchemas.map((schema) =>
          this.createColumn(schema),
        );
        this.notificationService.error('خطا در دریافت تنظیمات ستون‌های گزارش');
        if (this.autoLoad) this.loadList();
      },
    });
  }

  private loadStacks(): void {
    this.repo.GetStacks().subscribe({
      next: (data: any) => {
        this.stacks.set(Array.isArray(data?.Stacks) ? data.Stacks : []);
      },
      error: () => {
        this.stacks.set([]);
        this.notificationService.error('خطا در دریافت فهرست انبارها');
      },
    });
  }

  private createColumn(schema: InventoryGridSchema): any {
    const width = Number.parseInt(String(schema.Width), 10);
    const isRowNumber = schema.FieldName === 'ksrRowNumber';
    const isNumeric = isRowNumber || this.numericFields.has(schema.FieldName);
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

  private validateFilters(): string | null {
    const value = this.EditForm_SearchTarget.getRawValue();
    const searchTarget = value.SearchTarget?.trim() ?? '';
    if (
      searchTarget.length > 120 ||
      /[\u0000-\u001f\u007f]/.test(searchTarget)
    ) {
      return 'عبارت جستجو معتبر نیست یا بیش از ۱۲۰ کاراکتر است.';
    }

    if (this.filterConfig.dateRange) {
      if (
        !this.isValidDate(value.FromDate) ||
        !this.isValidDate(value.ToDate)
      ) {
        return 'تاریخ باید با قالب YYYY/MM/DD وارد شود؛ مانند 1405/02/23.';
      }
      if (value.FromDate && value.ToDate && value.FromDate > value.ToDate) {
        return 'تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.';
      }
    }

    if (this.filterConfig.department && !this.isIntegerList(value.Department)) {
      return 'کد دپارتمان باید عدد یا فهرست اعداد باشد؛ مانند 1 یا 1,2.';
    }

    const numericFilters: Array<[boolean | undefined, string | null, string]> =
      [
        [this.filterConfig.stack, value.StackCode, 'کد انبار'],
        [this.filterConfig.provider, value.ProviderCode, 'کد فروشنده'],
        [this.filterConfig.group, value.GroupCode, 'کد گروه'],
      ];
    for (const [enabled, filterValue, label] of numericFilters) {
      if (enabled && filterValue && !/^\d+$/.test(filterValue.trim())) {
        return `${label} باید یک عدد صحیح غیرمنفی باشد.`;
      }
    }

    return this.validateAdditionalFilters();
  }

  private isValidDate(value: string | null): boolean {
    if (!value) return true;
    const match = /^(\d{4})\/(\d{2})\/(\d{2})$/.exec(value.trim());
    if (!match) return false;
    const month = Number(match[2]);
    const day = Number(match[3]);
    return month >= 1 && month <= 12 && day >= 1 && day <= 31;
  }

  private isIntegerList(value: string | null): boolean {
    return !value || /^\d+(\s*,\s*\d+)*$/.test(value.trim());
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
}
