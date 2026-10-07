import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { BiWebApiService } from '../../../services/BiWebApi/BiWebApi.service';
import { BiAnalyticsResponse, BiCatalog, BiNaturalLanguageResponse } from '../../../services/BiWebApi/bi.models';
import { BiAnalyticsComponent } from './bi-analytics.component';

interface AnalyticsView {
  analyze(): void;
  interpret(): void;
  selectPeriod(period: string): void;
  selectDepartment(code: number): void;
  activePeriod(): string;
  departmentRef: number;
  naturalLanguage: string;
}

describe('BiAnalyticsComponent', () => {
  let fixture: ComponentFixture<BiAnalyticsComponent>;
  let api: jasmine.SpyObj<BiWebApiService>;

  const catalog: BiCatalog = {
    datasets: [{ datasetKey: 'sales.summary', title: 'فروش', domain: 'Sales', description: 'summary', requiredPermission: 'REPORT_SALES_VIEW',
      maxRows: 500, maxRangeDays: 2200, cacheSeconds: 60, defaultDateField: 'date', definitionVersion: 2, status: 'Published',
      sourceName: 'MaliKowsar99', sourceDescription: 'Factor', freshnessSlaMinutes: 1440, fields: [],
      metrics: [{ metricKey: 'sales.net', title: 'فروش خالص', metricRole: 'Primary', definition: 'net', unit: 'ریال', precision: 0, status: 'Published', definitionVersion: 2 }] }],
    widgetTypes: ['trend'], departments: [{ departmentCode: 1, departmentName: 'مرکزی' }],
  };
  const analysis: BiAnalyticsResponse = {
    datasetKey: 'sales.summary', metricKey: 'sales.net', metricTitle: 'فروش خالص', unit: 'ریال', definitionVersion: 2,
    appliedDepartmentRefs: [1], observations: [{ period: '1404/01', value: 100 }, { period: '1404/02', value: 300 }],
    departmentBreakdown: [{ departmentCode: 1, departmentName: 'مرکزی', value: 400 }],
    anomalies: [{ period: '1404/02', actual: 300, baseline: 100, deviation: 200, deviationPercent: 200, score: 4, confidence: .82, direction: 'AboveBaseline', explanation: 'above rolling median' }],
    forecast: { status: 'Ready', method: 'LinearTrend', seasonality: 'None', horizon: 1, confidence: .8,
      backtest: { trainingPoints: 8, testPoints: 2, mae: 10, mape: 5, wape: 6, quality: 'High' },
      points: [{ period: '1404/03', value: 350, lowerBound: 320, upperBound: 380 }], warnings: [] },
    insights: [{ kind: 'Anomaly', severity: 'High', title: 'ناهنجاری', description: 'evidence', period: '1404/02', evidenceValue: 300, recommendedAction: 'review' }],
    source: { sourceName: 'MaliKowsar99', description: 'Factor', tables: ['dbo.Factor'], dataThroughDate: '1404/02/29', freshnessStatus: 'Current', freshnessSlaMinutes: 1440 },
    asOfUtc: '2026-09-30T00:00:00Z', warnings: [],
  };
  const interpretation: BiNaturalLanguageResponse = {
    status: 'ReadyForConfirmation', confidence: .98, normalizedText: 'فروش خالص ماهانه', datasetKey: 'sales.summary', datasetTitle: 'فروش',
    metricKey: 'sales.net', metricTitle: 'فروش خالص', query: { datasetKey: 'sales.summary', fromDate: '1402/01/01', toDate: '1405/06/03', grain: 'month', departmentRefs: [] },
    matchedTerms: ['فروش خالص'], warnings: ['confirm'], requiresConfirmation: true,
  };

  beforeEach(async () => {
    api = jasmine.createSpyObj<BiWebApiService>('BiWebApiService', ['getCatalog', 'analyze', 'interpret']);
    api.getCatalog.and.returnValue(of(catalog)); api.analyze.and.returnValue(of(analysis)); api.interpret.and.returnValue(of(interpretation));
    await TestBed.configureTestingModule({
      imports: [BiAnalyticsComponent], providers: [provideZonelessChangeDetection(), provideRouter([]),
        { provide: BiWebApiService, useValue: api }, { provide: SessionStorageService, useValue: { activeDate: '1405/06/03' } }],
    }).compileComponents();
    fixture = TestBed.createComponent(BiAnalyticsComponent); fixture.detectChanges();
  });

  it('renders evidence-backed anomaly, forecast and guided analysis', () => {
    const view = fixture.componentInstance as unknown as AnalyticsView; view.analyze(); fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(api.analyze).toHaveBeenCalled(); expect(text).toContain('پیش‌بینی Backtested'); expect(text).toContain('Robust rolling median'); expect(text).toContain('راهنمای بررسی');
  });

  it('uses period and department as broad cross-filters', () => {
    const view = fixture.componentInstance as unknown as AnalyticsView; view.analyze(); view.selectPeriod('1404/02');
    expect(view.activePeriod()).toBe('1404/02');
    view.selectDepartment(1);
    expect(view.departmentRef).toBe(1); expect(api.analyze).toHaveBeenCalledTimes(2);
  });

  it('requires confirmation after governed natural-language interpretation', () => {
    const view = fixture.componentInstance as unknown as AnalyticsView; view.naturalLanguage = 'فروش خالص ماهانه'; view.interpret(); fixture.detectChanges();
    expect(api.interpret).toHaveBeenCalled(); expect((fixture.nativeElement as HTMLElement).textContent).toContain('تأیید و اجرای تحلیل');
  });
});
