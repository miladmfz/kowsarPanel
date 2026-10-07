import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { BiWebApiService } from '../../../services/BiWebApi/BiWebApi.service';
import { BiQueryResponse } from '../../../services/BiWebApi/bi.models';
import { BiWorkspaceComponent } from './bi-workspace.component';

describe('BiWorkspaceComponent', () => {
  let fixture: ComponentFixture<BiWorkspaceComponent>;
  let api: jasmine.SpyObj<BiWebApiService>;

  const queryResult: BiQueryResponse = {
    datasetKey: 'sales.summary',
    fromDate: '1403/01/01',
    toDate: '1403/03/20',
    grain: 'month',
    appliedDepartmentRefs: [1],
    summary: {
      netSales: 10_000,
      grossSales: 11_000,
      returnAmount: 1_000,
      invoiceCount: 2,
      quantity: 3,
      averageInvoiceValue: 5_000,
      returnRate: 9.09,
    },
    rows: [],
    segments: [],
    comparison: null,
    source: {
      sourceName: 'MaliKowsar99 operational sales', description: 'Factor sources', tables: ['dbo.Factor'],
      dataThroughDate: '1403/03/20', freshnessStatus: 'Current', freshnessSlaMinutes: 1440,
    },
    asOfUtc: '2026-09-28T00:00:00Z',
    elapsedMs: 12,
    truncated: false,
    cacheHit: false,
    definitionVersion: 1,
    warnings: [],
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj<BiWebApiService>('BiWebApiService', [
      'getCatalog', 'getDashboards', 'getDashboard', 'query', 'createDashboard',
      'updateDashboard', 'deleteDashboard', 'copyDashboard', 'interpret',
    ]);
    api.getCatalog.and.returnValue(of({
      datasets: [{
        datasetKey: 'sales.summary', title: 'فروش', domain: 'Sales', description: 'فروش کنترل‌شده',
        requiredPermission: 'BI_REPORT_VIEW', maxRows: 1000, maxRangeDays: 731, cacheSeconds: 60,
        defaultDateField: 'date', definitionVersion: 1, status: 'Published', sourceName: 'MaliKowsar99',
        sourceDescription: 'Factor sources', freshnessSlaMinutes: 1440, fields: [], metrics: [
          { metricKey: 'sales.net', title: 'فروش خالص', metricRole: 'KPI', definition: 'فروش ناخالص منهای برگشت', unit: 'ریال', precision: 0, status: 'Published', definitionVersion: 1 },
          { metricKey: 'sales.invoice_count', title: 'تعداد فاکتور', metricRole: 'Driver', definition: 'تعداد فاکتور قطعی', unit: 'عدد', precision: 0, status: 'Published', definitionVersion: 1 },
          { metricKey: 'sales.return_rate', title: 'نرخ برگشت', metricRole: 'Guardrail', definition: 'مبلغ برگشت تقسیم بر فروش ناخالص', unit: 'درصد', precision: 2, status: 'Published', definitionVersion: 1 },
        ],
      }], widgetTypes: ['kpi', 'trend', 'table'],
      departments: [{ departmentCode: 1, departmentName: 'واحد یک' }],
    }));
    api.getDashboards.and.returnValue(of([]));
    api.query.and.returnValue(of(queryResult));

    await TestBed.configureTestingModule({
      imports: [BiWorkspaceComponent],
      providers: [
        provideZonelessChangeDetection(),
        provideRouter([]),
        { provide: BiWebApiService, useValue: api },
        { provide: PermissionService, useValue: { canEditOwnBiDashboard: true, canManageBiCatalog: false } },
        { provide: SessionStorageService, useValue: { activeDate: '1403/03/20' } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BiWorkspaceComponent);
    fixture.detectChanges();
  });

  it('starts with a useful six-widget dashboard and applies the active fiscal date', () => {
    expect(api.query).toHaveBeenCalledOnceWith({
      datasetKey: 'sales.summary',
      fromDate: '1403/01/01',
      toDate: '1403/03/20',
      grain: 'month',
      departmentRefs: [],
      comparisonFromDate: '',
      comparisonToDate: '',
    });
    const component = fixture.componentInstance as any;
    expect(component.widgets().length).toBe(6);
    expect(component.metricValue(component.widgets()[0])).toBe(10_000);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('داشبورد مدیریتی');
    expect(element.querySelectorAll('.grid-stack-item').length).toBe(6);
    expect(element.textContent).toContain('واحدهای مجاز: 1');
  });

  it('adds widgets only from the supported semantic catalog', () => {
    const component = fixture.componentInstance as any;
    component.addWidget('kpi', 'sales.invoice_count');
    const widgets = component.widgets();
    expect(widgets.length).toBe(7);
    expect(widgets[6].datasetKey).toBe('sales.summary');
    expect(widgets[6].config.metric).toBe('sales.invoice_count');
    expect(widgets[6].configVersion).toBe(2);
  });

  it('supports every Phase 2 widget handler from the governed palette', () => {
    const component = fixture.componentInstance as any;
    for (const type of ['stackedBar', 'donut', 'pivot', 'summaryList']) component.addWidget(type);
    expect(component.widgets().slice(-4).map((item: any) => item.widgetType))
      .toEqual(['stackedBar', 'donut', 'pivot', 'summaryList']);
    expect(component.widgets().slice(-4).every((item: any) => item.config.schemaVersion === 2)).toBeTrue();
  });

  it('does not leak the global summary into a widget whose own filters have no rows', () => {
    const component = fixture.componentInstance as any;
    const widget = component.widgets()[0];
    widget.config.departmentRefs = [2];
    component.result.set({
      ...queryResult,
      segments: [{
        period: '1403/01', departmentRef: 1, departmentName: 'واحد یک', netSales: 10_000,
        grossSales: 11_000, returnAmount: 1_000, invoiceCount: 2, quantity: 3,
        averageInvoiceValue: 5_000, returnRate: 9.09,
      }],
    });

    expect(component.metricValue(widget)).toBe(0);
  });

  it('applies and clears a selected period across every workspace widget', () => {
    const component = fixture.componentInstance as any;
    component.result.set({
      ...queryResult,
      rows: [
        { period: '1403/01', netSales: 4_000, grossSales: 4_500, returnAmount: 500, invoiceCount: 1, quantity: 1, averageInvoiceValue: 4_000, returnRate: 11.11 },
        { period: '1403/02', netSales: 6_000, grossSales: 6_500, returnAmount: 500, invoiceCount: 1, quantity: 2, averageInvoiceValue: 6_000, returnRate: 7.69 },
      ],
    });

    const widgets = component.widgets();
    component.crossFilterByPeriod('1403/02');

    expect(component.widgetRows(widgets[0]).map((row: { period: string }) => row.period)).toEqual(['1403/02']);
    expect(component.widgetRows(widgets[1]).map((row: { period: string }) => row.period)).toEqual(['1403/02']);

    component.crossFilterByPeriod('1403/02');
    expect(component.widgetRows(widgets[0]).length).toBe(2);
  });

  it('builds a governed dashboard layout from selected dataset, metrics and dimensions', () => {
    const component = fixture.componentInstance as any;
    component.editing.set(true);
    component.openSmartBuilder();
    component.builderMetricKeys = ['sales.net', 'sales.invoice_count'];
    component.builderDimension = 'period';
    component.builderVisual = 'auto';
    component.builderReplaceLayout = true;
    fixture.detectChanges();
    const builder = fixture.nativeElement.querySelector('.bi-builder') as HTMLElement;
    expect(builder).not.toBeNull();
    expect(builder.textContent).toContain('محور X / دسته‌بندی');
    expect(builder.textContent).toContain('محور Y / مقدار');
    component.applySmartBuilder();

    const widgets = component.widgets();
    expect(widgets.map((item: any) => item.widgetType)).toEqual(['kpi', 'kpi', 'stackedBar', 'table']);
    expect(widgets.every((item: any) => item.datasetKey === 'sales.summary')).toBeTrue();
    expect(widgets.find((item: any) => item.widgetType === 'table').config.metrics)
      .toEqual(['sales.net', 'sales.invoice_count']);
    expect(api.query).toHaveBeenCalledTimes(2);
  });

  it('maps a Persian reporting question to governed catalog selections before execution', () => {
    api.interpret.and.returnValue(of({
      status: 'ReadyForConfirmation', confidence: .95, normalizedText: 'فروش خالص ماهانه',
      datasetKey: 'sales.summary', datasetTitle: 'فروش', metricKey: 'sales.net', metricTitle: 'فروش خالص',
      query: { datasetKey: 'sales.summary', fromDate: '1403/01/01', toDate: '1403/03/20', grain: 'month', departmentRefs: [] },
      matchedTerms: ['فروش خالص'], warnings: [], requiresConfirmation: true,
    }));
    const component = fixture.componentInstance as any;
    component.openSmartBuilder();
    component.builderQuestion = 'فروش خالص ماهانه را نشان بده';
    component.interpretBuilderQuestion();

    expect(api.interpret).toHaveBeenCalled();
    expect(component.builderDatasetKey).toBe('sales.summary');
    expect(component.builderMetricKeys).toEqual(['sales.net']);
    expect(component.builderMessage()).toContain('پیشنهاد آماده است');
  });
});
