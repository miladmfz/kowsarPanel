import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from 'src/app/app-config.service';
import { BiDashboardWriteRequest, BiPilotParticipantWriteRequest, BiQueryRequest } from './bi.models';
import { BiWebApiService } from './BiWebApi.service';

describe('BiWebApiService', () => {
  let service: BiWebApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    const config = new AppConfigService();
    config.initialize({ appVersion: '1', production: false, apiUrl: 'https://api.test/api/', baseHref: '/' });
    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppConfigService, useValue: config },
      ],
    });
    service = TestBed.inject(BiWebApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('posts the semantic query contract without accepting raw SQL', () => {
    const request: BiQueryRequest = {
      datasetKey: 'sales.summary',
      fromDate: '1403/01/01',
      toDate: '1403/12/29',
      grain: 'month',
      departmentRefs: [],
    };
    service.query(request).subscribe();
    const call = http.expectOne('https://api.test/api/bi/query');
    expect(call.request.method).toBe('POST');
    expect(call.request.body).toEqual(request);
    expect(JSON.stringify(call.request.body)).not.toContain('sql');
    call.flush({});
  });

  it('uses the dashboard concurrency contract on update', () => {
    const request: BiDashboardWriteRequest = {
      title: 'مدیریت فروش',
      isDefault: true,
      rowVersion: 'AAAAAAAAB9E=',
      filters: {
        fromDate: '1403/01/01', toDate: '1403/12/29', grain: 'month', departmentRefs: [1],
        comparisonMode: 'none', comparisonFromDate: '', comparisonToDate: '',
      },
      widgets: [],
    };
    service.updateDashboard(12, request).subscribe();
    const call = http.expectOne('https://api.test/api/bi/dashboards/12');
    expect(call.request.method).toBe('PUT');
    expect(call.request.body).toEqual(request);
    call.flush({});
  });

  it('uses governed admin endpoints without accepting handler or SQL changes', () => {
    const request = {
      title: 'فروش خالص', metricRole: 'Primary', definition: 'تعریف کنترل‌شده', formula: 'sales.gross-sales.return_amount',
      unit: 'ریال', precision: 0, status: 'Published' as const, sortOrder: 10, rowVersion: 'AAAAAAAAB9E=',
    };
    service.updateMetric('sales.net', request).subscribe();
    const call = http.expectOne('https://api.test/api/bi/admin/metrics/sales.net');
    expect(call.request.method).toBe('PUT');
    expect(JSON.stringify(call.request.body)).not.toContain('handlerKey');
    expect(JSON.stringify(call.request.body)).not.toContain('sql');
    call.flush({});
  });

  it('uses owner-scoped Phase 3 pack and favorite endpoints', () => {
    service.getManagementPacks().subscribe();
    const packs = http.expectOne('https://api.test/api/bi/packs');
    expect(packs.request.method).toBe('GET'); packs.flush([]);

    service.installManagementPack('cash-receivables').subscribe();
    const install = http.expectOne('https://api.test/api/bi/packs/cash-receivables/install');
    expect(install.request.method).toBe('POST'); install.flush({});

    service.setFavorite(12, true).subscribe();
    const favorite = http.expectOne('https://api.test/api/bi/dashboards/12/favorite');
    expect(favorite.request.method).toBe('PATCH'); expect(favorite.request.body).toEqual({ isFavorite: true }); favorite.flush({});
  });

  it('uses governed Phase 4 sharing, publish, bookmark and audit endpoints', () => {
    service.saveShare(12, { targetType: 'Role', targetKey: 'REPORT_VIEWER', accessLevel: 'Copy', isDefault: true, priority: 10 }).subscribe();
    let call = http.expectOne('https://api.test/api/bi/dashboards/12/shares');
    expect(call.request.method).toBe('PUT'); expect(call.request.body.accessLevel).toBe('Copy'); call.flush({});

    service.publish(12, { isTemplate: true, changeNote: 'v1' }).subscribe();
    call = http.expectOne('https://api.test/api/bi/dashboards/12/publish');
    expect(call.request.method).toBe('POST'); expect(call.request.body.isTemplate).toBeTrue(); call.flush({});

    service.createBookmark(12, 'فروش من', { filters: { fromDate: '1403/01/01', toDate: '1403/12/29', grain: 'month', departmentRefs: [1], comparisonMode: 'none', comparisonFromDate: '', comparisonToDate: '' }, widgets: [{ widgetKey: 'table', sortField: 'sales.net', sortDirection: 'desc', drillDimension: 'department', drillValue: '1' }] }).subscribe();
    call = http.expectOne('https://api.test/api/bi/dashboards/12/bookmarks');
    expect(call.request.method).toBe('POST'); expect(call.request.body.state.widgets[0].drillValue).toBe('1'); call.flush({});

    service.getAudit(200).subscribe();
    call = http.expectOne(request => request.url === 'https://api.test/api/bi/audit' && request.params.get('take') === '200');
    expect(call.request.method).toBe('GET'); call.flush([]);
  });

  it('uses Phase 5 async, schedule and operations endpoints without raw SQL', () => {
    const query: BiQueryRequest = { datasetKey: 'sales.summary', fromDate: '1405/01/01', toDate: '1405/06/31', grain: 'month', departmentRefs: [] };
    service.createAsyncJob('export', query).subscribe();
    let call = http.expectOne('https://api.test/api/bi/operations/jobs/export');
    expect(call.request.method).toBe('POST'); expect(call.request.body).toEqual({ query }); expect(JSON.stringify(call.request.body)).not.toContain('sql'); call.flush({});

    service.getOperationsHealth(30).subscribe();
    call = http.expectOne(request => request.url === 'https://api.test/api/bi/operations/health' && request.params.get('days') === '30');
    expect(call.request.method).toBe('GET'); call.flush({});

    service.createSchedule({ title: 'روزانه', scheduleType: 'Snapshot', cadence: 'Daily', query, isEnabled: true, retentionDays: 30 }).subscribe();
    call = http.expectOne('https://api.test/api/bi/operations/schedules');
    expect(call.request.method).toBe('POST'); expect(call.request.body.query).toEqual(query); call.flush({});

    service.cleanupBiRetention().subscribe();
    call = http.expectOne('https://api.test/api/bi/operations/retention/cleanup');
    expect(call.request.method).toBe('POST'); call.flush({});
  });

  it('uses governed Phase 6 analytics endpoints without accepting raw SQL', () => {
    const query: BiQueryRequest = { datasetKey: 'sales.summary', fromDate: '1402/01/01', toDate: '1405/06/03', grain: 'month', departmentRefs: [] };
    service.analyze({ query, metricKey: 'sales.net', horizon: 3, sensitivity: 3 }).subscribe();
    let call = http.expectOne('https://api.test/api/bi/analytics/analyze');
    expect(call.request.method).toBe('POST'); expect(call.request.body.metricKey).toBe('sales.net'); expect(JSON.stringify(call.request.body)).not.toContain('sql'); call.flush({});

    service.interpret({ text: 'فروش خالص ماهانه', fromDate: query.fromDate, toDate: query.toDate, grain: 'month', departmentRefs: [] }).subscribe();
    call = http.expectOne('https://api.test/api/bi/analytics/interpret');
    expect(call.request.method).toBe('POST'); expect(call.request.body.text).toBe('فروش خالص ماهانه'); call.flush({});
  });

  it('reads Pilot evidence with explicit dataset, window and query target', () => {
    service.getPilotReadiness('sales.summary', 90, 100).subscribe();
    const call = http.expectOne(request => request.url === 'https://api.test/api/bi/operations/pilot/readiness'
      && request.params.get('datasetKey') === 'sales.summary'
      && request.params.get('days') === '90'
      && request.params.get('targetQueries') === '100');
    expect(call.request.method).toBe('GET');
    call.flush({});
  });

  it('writes a version-bound Pilot review without accepting actor identity from the browser', () => {
    const request = {
      datasetKey: 'sales.summary', definitionVersion: 2,
      roleCoverageStatus: 'Approved' as const, roleCoverageNote: 'دو persona بررسی شد',
      businessSignOffStatus: 'Approved' as const, businessSignOffNote: 'KPI و SLA تأیید شد',
      decision: 'Approve' as const, rowVersion: null,
    };
    service.savePilotReview(request).subscribe();
    const call = http.expectOne('https://api.test/api/bi/operations/pilot/review');
    expect(call.request.method).toBe('PUT');
    expect(call.request.body).toEqual(request);
    expect(JSON.stringify(call.request.body)).not.toContain('subject');
    expect(JSON.stringify(call.request.body)).not.toContain('userRef');
    call.flush({});
  });

  it('reads tenant-derived Pilot options and writes only selected Kowsar user references', () => {
    service.getPilotParticipants('sales.summary').subscribe();
    let call = http.expectOne(request => request.url === 'https://api.test/api/bi/operations/pilot/participants'
      && request.params.get('datasetKey') === 'sales.summary');
    expect(call.request.method).toBe('GET');
    call.flush({});

    const request: BiPilotParticipantWriteRequest = {
      datasetKey: 'sales.summary', definitionVersion: 2, rowVersion: null,
      participants: [
        { userRef: 11, departmentRef: 1, persona: 'Manager' },
        { userRef: 12, departmentRef: 2, persona: 'ReportViewer' },
      ],
    };
    service.savePilotParticipants(request).subscribe();
    call = http.expectOne('https://api.test/api/bi/operations/pilot/participants');
    expect(call.request.method).toBe('PUT');
    expect(call.request.body).toEqual(request);
    expect(JSON.stringify(call.request.body)).not.toContain('centralRef');
    expect(JSON.stringify(call.request.body)).not.toContain('actor');
    call.flush({});
  });
});
