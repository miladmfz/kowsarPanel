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
import { RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import {
  IDatepickerTheme,
  NgPersianDatepickerModule,
} from 'ng-persian-datepicker';
import { finalize } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarChartColumnComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-column/kowsar-chart-column.component';
import { KowsarNumberService } from 'src/app/app-shell/framework-services/kowsar-number.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    NgPersianDatepickerModule,
    KowsarChartColumnComponent,
  ],
  selector: 'app-GoodFactorRpt',
  templateUrl: './GoodFactorRpt.component.html',
})
export class GoodFactorRptComponent
  extends AgGridBaseComponent
  implements OnInit, OnDestroy
{
  private readonly repo = inject(ReportWebApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly kowsarNumber = inject(KowsarNumberService);
  private readonly session = inject(SessionStorageService);

  @Input() ReportData: any;

  records = signal<any[]>([]);
  loading = signal(false);
  hasLoaded = signal(false);
  showChart = signal(false);
  errorMessage = signal('');
  title = signal('فاکتورهای فروش یک کالا به مشتریان');

  totals = computed(() => ({
    count: this.records().length,
    amount: this.sumField('Meghdar'),
    grossPrice: this.sumField('nMablagh'),
    discount: this.sumField('MablaghTakhfif'),
    netPrice: this.sumField('Mablagh'),
  }));
  chartModel = computed(() => {
    const rows = this.records().slice(0, 12);
    return {
      categories: rows.map((row) =>
        this.chartLabel(row, 'FactorDate', 'CustName'),
      ),
      series: [
        {
          name: 'تعداد',
          data: rows.map((row) => this.chartValue(row, 'Meghdar')),
        },
        {
          name: 'ناخالص',
          data: rows.map((row) => this.chartValue(row, 'nMablagh')),
        },
        {
          name: 'خالص',
          data: rows.map((row) => this.chartValue(row, 'Mablagh')),
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
    ClassName: new FormControl('GoodFactorRpt'),
    GoodCode: new FormControl(''),
    CustomerRef: new FormControl(''),
    FromDate: new FormControl(''),
    ToDate: new FormControl(''),
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    const defaultDates = this.defaultDateRange();
    this.title.set(
      this.ReportData?.ReportTitle || 'فاکتورهای فروش یک کالا به مشتریان',
    );
    this.EditForm_SearchTarget.patchValue({
      ReportCode: this.ReportData?.ReportCode ?? '',
      ReportTitle: this.ReportData?.ReportTitle ?? '',
      ClassName: this.ReportData?.ReportForm || 'GoodFactorRpt',
      ...defaultDates,
    });

    this.initColumns();
  }

  private initColumns(): void {
    this.repo.GetGridSchemaVisible('TGoodFactorRpt').subscribe({
      next: (data: any) => {
        const schemas = Array.isArray(data?.GridSchemas)
          ? data.GridSchemas
          : [];

        this.column_name_1 = schemas
          .filter((schema: any) => this.isTrue(schema.Visible))
          .map((schema: any) => {
            const isNumeric = this.isTrue(schema.Separator);
            const width = Number.parseInt(schema.Width, 10);
            const column: any = {
              field: schema.FieldName,
              headerName: schema.Caption,
              cellClass: 'text-center',
              sortable: true,
              resizable: true,
              minWidth: Number.isFinite(width) && width > 0 ? width : 90,
              filter: isNumeric ? 'agNumberColumnFilter' : 'agSetColumnFilter',
            };

            if (isNumeric) {
              column.valueFormatter = (params: any) =>
                this.kowsarNumber.formatKowsarNumber(params.value);
              column.comparator = (valueA: any, valueB: any) =>
                this.kowsarNumber.compareKowsarValues(valueA, valueB);
            }

            return column;
          });
      },
      error: () => {
        this.errorMessage.set(
          'امکان دریافت تنظیمات ستون‌های گزارش وجود ندارد.',
        );
        this.notificationService.error('خطا در دریافت تنظیمات ستون‌های گزارش');
      },
    });
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

    this.repo
      .GoodFactorRpt(this.EditForm_SearchTarget.getRawValue())
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
          this.notificationService.error('خطا در دریافت گزارش فاکتورهای کالا');
        },
      });
  }

  clearFilter(): void {
    this.EditForm_SearchTarget.patchValue({
      GoodCode: '',
      CustomerRef: '',
      ...this.defaultDateRange(),
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

  private chartValue(row: any, field: string): number {
    return this.kowsarNumber.parseKowsarNumber(row?.[field]) ?? 0;
  }

  private chartLabel(row: any, ...fields: string[]): string {
    const values = fields
      .map((field) => String(row?.[field] ?? '').trim())
      .filter(Boolean);
    return values.length > 0 ? values.join(' - ') : 'بدون عنوان';
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

  private defaultDateRange(): { FromDate: string; ToDate: string } {
    const activeDate = this.session.activeDate.trim();
    const year = /^(\d{4})\/\d{2}\/\d{2}$/.exec(activeDate)?.[1];

    return year
      ? { FromDate: `${year}/01/01`, ToDate: activeDate }
      : { FromDate: '', ToDate: '' };
  }
}
