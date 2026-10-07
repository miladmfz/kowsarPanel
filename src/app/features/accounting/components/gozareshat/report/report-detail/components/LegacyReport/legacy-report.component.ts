import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  inject,
  Input,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { finalize } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarChartColumnComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-column/kowsar-chart-column.component';
import { KowsarNumberService } from 'src/app/app-shell/framework-services/kowsar-number.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';
import { isLegacyReportForm } from '../../legacy-report.contracts';

interface LegacyReportDescriptor {
  ReportCode?: string | number;
  ReportForm?: string;
  ReportTitle?: string;
}

interface GridSchemaRow {
  Caption?: string;
  FieldName?: string;
  Separator?: boolean | number | string;
  Visible?: boolean | number | string;
  Width?: string | number;
}

type ReportRow = Record<string, unknown>;

@Component({
  standalone: true,
  selector: 'app-legacy-report',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridModule,
    NgPersianDatepickerModule,
    KowsarChartColumnComponent,
  ],
  templateUrl: './legacy-report.component.html',
})
export class LegacyReportComponent extends AgGridBaseComponent implements OnInit {
  private readonly repo = inject(ReportWebApiService);
  private readonly notifications = inject(NotificationService);
  private readonly numbers = inject(KowsarNumberService);
  private readonly session = inject(SessionStorageService);

  @Input({ required: true }) ReportData!: LegacyReportDescriptor;

  readonly records = signal<ReportRow[]>([]);
  readonly loading = signal(false);
  readonly hasLoaded = signal(false);
  readonly showChart = signal(false);
  readonly errorMessage = signal('');
  readonly numericFields = signal<string[]>([]);
  readonly fieldCaptions = signal<Record<string, string>>({});
  private schemaRows: GridSchemaRow[] = [];

  readonly customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#0066cc',
    selectedText: '#ffffff',
  };

  readonly filterForm = new FormGroup({
    ReportCode: new FormControl<string | number>(''),
    ReportTitle: new FormControl(''),
    ClassName: new FormControl(''),
    SearchTarget: new FormControl(''),
    FromDate: new FormControl(''),
    ToDate: new FormControl(''),
    Department: new FormControl(''),
    GoodCode: new FormControl(''),
    CustomerRef: new FormControl(''),
    FactorPrivateCode: new FormControl(''),
    StackCode: new FormControl(''),
    GroupCode: new FormControl(''),
    ProviderCode: new FormControl(''),
    BrokerRef: new FormControl(''),
    ActiveState: new FormControl('all'),
    WithMainCode: new FormControl(false, { nonNullable: true }),
    IsYear: new FormControl(false, { nonNullable: true }),
    IncludeSubgroups: new FormControl(false, { nonNullable: true }),
    WithStackGrouping: new FormControl(false, { nonNullable: true }),
    OrderBy: new FormControl(''),
  });

  readonly title = computed(() =>
    this.ReportData?.ReportTitle?.trim() || this.ReportData?.ReportForm || 'گزارش',
  );

  readonly summaries = computed(() =>
    this.numericFields().slice(0, 3).map((field) => ({
      field,
      caption: this.fieldCaptions()[field] || field,
      value: this.sumField(field),
    })),
  );

  readonly chartModel = computed(() => {
    const rows = this.records().slice(0, 12);
    const numeric = this.numericFields().slice(0, 3);
    const labelField = Object.keys(rows[0] ?? {}).find(
      (field) => !numeric.includes(field),
    );
    return {
      categories: rows.map((row, index) =>
        String(labelField ? row[labelField] ?? `ردیف ${index + 1}` : `ردیف ${index + 1}`),
      ),
      series:
        numeric.length > 0
          ? numeric.map((field) => ({
              name: this.fieldCaptions()[field] || field,
              data: rows.map((row) => this.numericValue(row[field])),
            }))
          : [{ name: 'تعداد رکورد', data: rows.map(() => 1) }],
    };
  });

  ngOnInit(): void {
    const reportForm = this.ReportData?.ReportForm;
    if (!isLegacyReportForm(reportForm)) {
      this.errorMessage.set('فرم گزارش معتبر نیست.');
      return;
    }

    this.filterForm.patchValue({
      ReportCode: this.ReportData.ReportCode ?? '',
      ReportTitle: this.ReportData.ReportTitle ?? '',
      ClassName: reportForm,
      Department: this.session.departmentCode,
      ...this.defaultDateRange(),
    });
    this.loadSchema(reportForm);
  }

  loadList(): void {
    const reportForm = this.ReportData?.ReportForm;
    if (this.loading() || !isLegacyReportForm(reportForm)) return;

    const { FromDate, ToDate } = this.filterForm.getRawValue();
    if (FromDate && ToDate && FromDate > ToDate) {
      this.notifications.warning('تاریخ شروع نمی‌تواند بعد از تاریخ پایان باشد.');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set('');
    this.repo
      .LegacyReport(reportForm, this.filterForm.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (response) => {
          const rows = Array.isArray(response?.Reports)
            ? (response.Reports as ReportRow[])
            : [];
          const resultColumns = Array.isArray(response?.ReportColumns)
            ? (response.ReportColumns as GridSchemaRow[])
            : [];
          this.records.set(rows);
          this.hasLoaded.set(true);
          this.reconcileColumnsWithResult(resultColumns, rows);
          this.updateGridData(1, rows);
        },
        error: () => {
          this.records.set([]);
          this.hasLoaded.set(true);
          this.updateGridData(1, []);
          this.errorMessage.set('دریافت اطلاعات گزارش با خطا مواجه شد.');
          this.notifications.error('خطا در دریافت گزارش');
        },
      });
  }

  clearFilter(): void {
    this.filterForm.patchValue({
      SearchTarget: '',
      Department: this.session.departmentCode,
      GoodCode: '',
      CustomerRef: '',
      FactorPrivateCode: '',
      StackCode: '',
      GroupCode: '',
      ProviderCode: '',
      BrokerRef: '',
      ActiveState: 'all',
      WithMainCode: false,
      IsYear: false,
      IncludeSubgroups: false,
      WithStackGrouping: false,
      OrderBy: '',
      ...this.defaultDateRange(),
    });
    this.records.set([]);
    this.hasLoaded.set(false);
    this.showChart.set(false);
    this.errorMessage.set('');
    this.updateGridData(1, []);
  }

  toggleReportView(): void {
    if (this.records().length > 0) this.showChart.update((value) => !value);
  }

  syncChartOrder(): void {
    this.syncSortedData(1, (rows) => this.records.set(rows as ReportRow[]));
  }

  formatNumber(value: unknown): string {
    return this.numbers.formatKowsarNumber(value);
  }

  private loadSchema(reportForm: string): void {
    this.repo.GetGridSchemaVisible(`T${reportForm}`).subscribe({
      next: (response: unknown) => {
        const schemas = this.extractSchemas(response);
        this.schemaRows = schemas;
        if (schemas.length > 0) this.configureColumns(schemas);
      },
      error: () => {
        // Some legacy reports have no GridSchema. Their returned row shape is
        // authoritative and is used to build the grid after the first load.
        this.schemaRows = [];
      },
    });
  }

  private configureColumns(schemas: GridSchemaRow[]): void {
    const captions: Record<string, string> = {};
    const numeric: string[] = [];
    this.column_name_1 = schemas
      .filter((schema) => this.isTrue(schema.Visible) && !!schema.FieldName)
      .map((schema) => {
        const field = schema.FieldName!;
        const isNumeric = this.isTrue(schema.Separator);
        const width = Number.parseInt(String(schema.Width ?? ''), 10);
        captions[field] = schema.Caption || field;
        if (isNumeric) numeric.push(field);
        return this.makeColumn(field, captions[field], isNumeric, width);
      });
    this.fieldCaptions.set(captions);
    this.numericFields.set(numeric);
  }

  private configureColumnsFromRows(rows: ReportRow[]): void {
    const fields = Object.keys(rows[0] ?? {});
    const captions: Record<string, string> = {};
    const numeric = fields.filter((field) => this.looksNumeric(rows, field));
    this.column_name_1 = fields.map((field) => {
      captions[field] = field;
      return this.makeColumn(field, field, numeric.includes(field), 120);
    });
    this.fieldCaptions.set(captions);
    this.numericFields.set(numeric);
  }

  private reconcileColumnsWithRows(rows: ReportRow[]): void {
    if (this.schemaRows.length === 0) {
      this.configureColumnsFromRows(rows);
      return;
    }

    const returnedFields = new Set(Object.keys(rows[0] ?? {}));
    const visibleSchema = this.schemaRows.filter(
      (schema) => this.isTrue(schema.Visible) && !!schema.FieldName,
    );
    const compatibleSchema = visibleSchema.filter((schema) =>
      returnedFields.has(schema.FieldName!),
    );

    if (compatibleSchema.length === visibleSchema.length) return;
    if (compatibleSchema.length === 0) {
      this.schemaRows = [];
      this.configureColumnsFromRows(rows);
      return;
    }

    this.schemaRows = compatibleSchema;
    this.configureColumns(compatibleSchema);
  }

  private reconcileColumnsWithResult(
    resultColumns: GridSchemaRow[],
    rows: ReportRow[],
  ): void {
    const authoritativeFields = new Set(
      resultColumns
        .map((column) => column.FieldName)
        .filter((field): field is string => !!field),
    );

    if (authoritativeFields.size === 0) {
      if (rows.length > 0) this.reconcileColumnsWithRows(rows);
      return;
    }

    const compatibleSchema = this.schemaRows.filter(
      (schema) =>
        this.isTrue(schema.Visible) &&
        !!schema.FieldName &&
        authoritativeFields.has(schema.FieldName),
    );

    if (compatibleSchema.length > 0) {
      this.schemaRows = compatibleSchema;
      this.configureColumns(compatibleSchema);
      return;
    }

    this.schemaRows = resultColumns;
    this.configureColumns(resultColumns);
  }

  private makeColumn(
    field: string,
    caption: string,
    isNumeric: boolean,
    width: number,
  ): Record<string, unknown> {
    const column: Record<string, unknown> = {
      field,
      headerName: caption,
      cellClass: 'text-center',
      sortable: true,
      resizable: true,
      minWidth: Number.isFinite(width) && width > 0 ? width : 100,
      filter: isNumeric ? 'agNumberColumnFilter' : 'agSetColumnFilter',
    };
    if (isNumeric) {
      column['valueFormatter'] = (params: { value: unknown }) =>
        this.numbers.formatKowsarNumber(params.value);
      column['comparator'] = (a: unknown, b: unknown) =>
        this.numbers.compareKowsarValues(a, b);
    }
    return column;
  }

  private extractSchemas(response: unknown): GridSchemaRow[] {
    if (!response || typeof response !== 'object') return [];
    const schemas = (response as { GridSchemas?: unknown }).GridSchemas;
    return Array.isArray(schemas) ? (schemas as GridSchemaRow[]) : [];
  }

  private looksNumeric(rows: ReportRow[], field: string): boolean {
    const values = rows
      .slice(0, 20)
      .map((row) => row[field])
      .filter((value) => value !== null && value !== undefined && value !== '');
    return values.length > 0 && values.every((value) => this.numbers.parseKowsarNumber(value) !== null);
  }

  private numericValue(value: unknown): number {
    return this.numbers.parseKowsarNumber(value) ?? 0;
  }

  private sumField(field: string): number {
    return this.records().reduce(
      (sum, row) => sum + this.numericValue(row[field]),
      0,
    );
  }

  private isTrue(value: unknown): boolean {
    return value === true || value === 1 || value === '1' || value === 'True' || value === 'true';
  }

  private defaultDateRange(): { FromDate: string; ToDate: string } {
    const activeDate = this.session.activeDate.trim();
    const year = /^(\d{4})\/\d{2}\/\d{2}$/.exec(activeDate)?.[1];
    return year
      ? { FromDate: `${year}/01/01`, ToDate: activeDate }
      : { FromDate: '', ToDate: '' };
  }
}
