import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { BiWebApiService } from '../../../services/BiWebApi/BiWebApi.service';
import { BiAdminCatalog, BiAdminMetric } from '../../../services/BiWebApi/bi.models';
import { BiCatalogAdminComponent } from './bi-catalog-admin.component';

describe('BiCatalogAdminComponent', () => {
  let fixture: ComponentFixture<BiCatalogAdminComponent>;
  let api: jasmine.SpyObj<BiWebApiService>;

  const metric: BiAdminMetric = {
    metricCode: 1, metricKey: 'sales.net', title: 'فروش خالص', metricRole: 'Primary', definition: 'تعریف',
    formula: 'gross-return', unit: 'ریال', precision: 0, status: 'Published', definitionVersion: 2,
    sortOrder: 10, rowVersion: 'AAAAAAAAB9E=', widgetDependencyCount: 3,
    versions: [{ definitionVersion: 2, title: 'فروش خالص', metricRole: 'Primary', definition: 'تعریف',
      formula: 'gross-return', unit: 'ریال', precision: 0, status: 'Published', changedBy: 'ADMIN', changedAt: '2026-09-29T00:00:00Z' }],
  };
  const catalog: BiAdminCatalog = { datasets: [{
    datasetCode: 1, datasetKey: 'sales.summary', title: 'خلاصه فروش', domain: 'Sales', description: 'فروش',
    handlerKey: 'SalesSummaryV1', requiredPermission: 'REPORT_SALES_VIEW', defaultDateField: 'date',
    maxRows: 1000, maxRangeDays: 731, cacheSeconds: 60, definitionVersion: 2, status: 'Published',
    sourceName: 'MaliKowsar99', sourceDescription: 'Factor', freshnessSlaMinutes: 1440, sortOrder: 100,
    rowVersion: 'AAAAAAAAB9E=', fields: [], metrics: [metric],
  }] };

  beforeEach(async () => {
    api = jasmine.createSpyObj<BiWebApiService>('BiWebApiService', ['getAdminCatalog', 'updateDataset', 'updateMetric', 'updateField']);
    api.getAdminCatalog.and.returnValue(of(catalog));
    api.updateMetric.and.returnValue(of({ ...metric, definitionVersion: 3, rowVersion: 'AAAAAAAAB9I=' }));
    await TestBed.configureTestingModule({ imports: [BiCatalogAdminComponent], providers: [
      provideZonelessChangeDetection(), provideRouter([]), { provide: BiWebApiService, useValue: api },
    ] }).compileComponents();
    fixture = TestBed.createComponent(BiCatalogAdminComponent); fixture.detectChanges();
  });

  it('loads governed datasets and exposes handler identity as read-only metadata', () => {
    expect(fixture.nativeElement.textContent).toContain('خلاصه فروش');
    expect(fixture.nativeElement.textContent).toContain('SalesSummaryV1');
  });

  it('versions a metric without sending widget layout', () => {
    const component = fixture.componentInstance as any;
    component.selectMetric(metric); component.saveMetric();
    const request = api.updateMetric.calls.mostRecent().args[1];
    expect(api.updateMetric).toHaveBeenCalled();
    expect(JSON.stringify(request)).not.toContain('widgets');
    expect(component.selectedMetric().definitionVersion).toBe(3);
  });
});
