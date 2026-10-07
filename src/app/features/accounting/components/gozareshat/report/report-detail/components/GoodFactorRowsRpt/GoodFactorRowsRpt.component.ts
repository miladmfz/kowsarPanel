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

interface DelphiColumn {
  field: string;
  headerName: string;
  minWidth: number;
  numeric?: boolean;
}

const DELPHI_COLUMNS: DelphiColumn[] = [
  {
    field: 'FactorPrivateCode',
    headerName: 'کد فاکتور',
    minWidth: 100,
    numeric: true,
  },
  { field: 'FactorDate', headerName: 'تاریخ فاکتور', minWidth: 110 },
  { field: 'PrivateCodeForSort', headerName: 'کد کالا', minWidth: 100 },
  { field: 'GoodName', headerName: 'نام کالا', minWidth: 190 },
  { field: 'ShowAmount', headerName: 'تعداد', minWidth: 100, numeric: true },
  { field: 'Price', headerName: 'فی', minWidth: 110, numeric: true },
  {
    field: 'SumPrice',
    headerName: 'مبلغ فاکتور',
    minWidth: 130,
    numeric: true,
  },
  { field: 'BulletinGroupName', headerName: 'گروه پژوهشی', minWidth: 130 },
  {
    field: 'BulletinGroupSerial',
    headerName: 'سری گروه پژوهشی',
    minWidth: 130,
    numeric: true,
  },
  { field: 'SellPercent', headerName: 'درصد', minWidth: 90, numeric: true },
  {
    field: 'CustomerRef',
    headerName: 'کد مشتری',
    minWidth: 100,
    numeric: true,
  },
  { field: 'CustName', headerName: 'نام مشتری', minWidth: 170 },
  { field: 'OstanName', headerName: 'استان', minWidth: 110 },
  { field: 'CityName', headerName: 'شهر', minWidth: 110 },
  { field: 'ShowComment', headerName: 'توضیحات', minWidth: 160 },
];

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
  selector: 'app-GoodFactorRowsRpt',
  templateUrl: './GoodFactorRowsRpt.component.html',
})
export class GoodFactorRowsRptComponent
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
  title = signal('اقلام فاکتورهای فروش کالا به مشتریان');

  totals = computed(() => ({
    count: this.records().length,
    amount: this.sumField('FacAmount'),
    price: this.sumField('SumPrice'),
  }));
  chartModel = computed(() => {
    const rows = this.records().slice(0, 12);
    return {
      categories: rows.map((row) =>
        this.chartLabel(row, 'GoodName', 'FactorPrivateCode', 'FactorDate'),
      ),
      series: [
        {
          name: 'تعداد',
          data: rows.map((row) => this.chartValue(row, 'FacAmount')),
        },
        {
          name: 'مبلغ',
          data: rows.map((row) => this.chartValue(row, 'SumPrice')),
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
    ClassName: new FormControl('GoodFactorRowsRpt'),
    GoodCode: new FormControl(''),
    CustomerRef: new FormControl(''),
    FactorPrivateCode: new FormControl(''),
    FromDate: new FormControl(''),
    ToDate: new FormControl(''),
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    const defaultDates = this.defaultDateRange();
    this.title.set(
      this.ReportData?.ReportTitle || 'اقلام فاکتورهای فروش کالا به مشتریان',
    );
    this.EditForm_SearchTarget.patchValue({
      ReportCode: this.ReportData?.ReportCode ?? '',
      ReportTitle: this.ReportData?.ReportTitle ?? '',
      ClassName: this.ReportData?.ReportForm || 'GoodFactorRowsRpt',
      ...defaultDates,
    });

    this.initColumns();
  }

  private initColumns(): void {
    this.column_name_1 = DELPHI_COLUMNS.map((schema) => {
      const column: any = {
        field: schema.field,
        headerName: schema.headerName,
        cellClass: 'text-center',
        sortable: true,
        resizable: true,
        minWidth: schema.minWidth,
        filter: schema.numeric ? 'agNumberColumnFilter' : 'agSetColumnFilter',
      };

      if (schema.numeric) {
        column.valueFormatter = (params: any) =>
          this.kowsarNumber.formatKowsarNumber(params.value);
        column.comparator = (valueA: any, valueB: any) =>
          this.kowsarNumber.compareKowsarValues(valueA, valueB);
      }

      return column;
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
      .GoodFactorRowsRpt(this.EditForm_SearchTarget.getRawValue())
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
          this.notificationService.error(
            'خطا در دریافت گزارش اقلام فاکتورهای کالا',
          );
        },
      });
  }

  clearFilter(): void {
    this.EditForm_SearchTarget.patchValue({
      GoodCode: '',
      CustomerRef: '',
      FactorPrivateCode: '',
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
