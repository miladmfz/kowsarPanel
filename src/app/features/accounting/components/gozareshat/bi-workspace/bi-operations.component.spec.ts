import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { BiWebApiService } from '../../../services/BiWebApi/BiWebApi.service';
import { BiCatalog, BiOperationsHealth, BiPilotParticipantConfiguration, BiPilotReadiness } from '../../../services/BiWebApi/bi.models';
import { BiOperationsComponent } from './bi-operations.component';

describe('BiOperationsComponent', () => {
  let fixture: ComponentFixture<BiOperationsComponent>;
  let api: jasmine.SpyObj<BiWebApiService>;
  let permissionStub: { canManageBiSchedules: boolean; canExportBi: boolean; canReviewBiPilot: boolean; isAdmin: boolean; hasPermission: jasmine.Spy };
  const catalog: BiCatalog = { widgetTypes: [], departments: [], datasets: [{
    datasetKey: 'sales.summary', title: 'خلاصه فروش', domain: 'Sales', description: '', requiredPermission: 'REPORT_SALES_VIEW',
    maxRows: 1000, maxRangeDays: 731, cacheSeconds: 60, defaultDateField: 'date', definitionVersion: 2, status: 'Published',
    sourceName: 'MaliKowsar99', sourceDescription: 'Factor', freshnessSlaMinutes: 1440, fields: [], metrics: [{
      metricKey: 'sales.net', title: 'فروش خالص', metricRole: 'Primary', definition: '', precision: 0, status: 'Published', definitionVersion: 2,
    }],
  }] };
  const health: BiOperationsHealth = {
    windowDays: 7, queryCount: 12, averageMs: 104, p95Ms: 218, maxMs: 336, cacheHitRate: .25,
    failureRate: 0, timeoutCount: 0, staleCount: 2, pendingJobs: 0, runningJobs: 0, failedJobs: 0, dueSchedules: 0,
    datasets: [], recommendations: ['Query audit volume is below 100.'],
  };
  const pilot: BiPilotReadiness = {
    datasetKey: 'sales.summary', datasetTitle: 'خلاصه فروش', definitionVersion: 2, windowDays: 90, targetQueries: 100,
    attemptedQueries: 3, eligibleQueries: 3, prePilotEligibleQueries: 12, remainingQueries: 97, syntheticQueries: 10, automatedQueries: 6,
    availablePilotUsers: 2, availablePilotDepartments: 2, selectedPilotUsers: 0, selectedPilotDepartments: 0,
    hasManagerParticipant: false, hasReportViewerParticipant: false, hasReportViewerRole: true, configurationReady: false,
    distinctActors: 2, distinctScopes: 3, progressPercentage: 3, averageMs: 100, p95Ms: 218, maxMs: 218,
    failureRate: 0, staleCount: 0, pilotEvidenceFrom: '2026-09-28T00:00:00Z',
    firstEligibleQueryAt: '2026-09-28T00:00:00Z', lastEligibleQueryAt: '2026-09-30T00:00:00Z',
    technicalGatePassed: false, rolloutReady: false, roleCoverageStatus: 'ManualVerificationRequired',
    businessSignOffStatus: 'PendingBusinessOwner',
    criteria: [
      { key: 'query-volume', title: 'Eligible query volume', status: 'Pending', currentValue: 3, targetValue: 100, unit: 'query', evidence: 'Only real users count.' },
      { key: 'available-users', title: 'Available Pilot users', status: 'Pending', currentValue: 1, targetValue: 2, unit: 'user', evidence: 'Two users are required.' },
      { key: 'audience', title: 'Distinct pilot users', status: 'Passed', currentValue: 2, targetValue: 2, unit: 'user', evidence: 'Two users observed.' },
      { key: 'business-signoff', title: 'KPI sign-off', status: 'Manual', currentValue: 0, targetValue: 1, unit: 'approval', evidence: 'Owner approval required.' },
    ],
    metrics: [{ metricKey: 'sales.net', title: 'فروش خالص', metricRole: 'Primary', definition: 'تعریف فنی', precision: 0, definitionVersion: 2, signOffStatus: 'PendingBusinessOwner' }],
    warnings: ['97 additional eligible interactive queries are required.'],
  };
  const participantConfiguration: BiPilotParticipantConfiguration = {
    datasetKey: 'sales.summary', definitionVersion: 2, rowVersion: null, participants: [], options: [
      { userRef: 11, departmentRef: 1, displayName: 'مدیر فروش', departmentName: 'فروش', isSelected: false },
      { userRef: 12, departmentRef: 2, displayName: 'کارشناس گزارش', departmentName: 'مالی', isSelected: false },
    ],
  };

  beforeEach(async () => {
    permissionStub = { canManageBiSchedules: true, canExportBi: true, canReviewBiPilot: true, isAdmin: true, hasPermission: jasmine.createSpy('hasPermission').and.returnValue(true) };
    api = jasmine.createSpyObj<BiWebApiService>('BiWebApiService', [
      'getCatalog', 'getOperationsHealth', 'getPilotReadiness', 'getPilotParticipants', 'getAsyncJobs', 'getSchedules', 'getSnapshots', 'getAlerts',
      'createAsyncJob', 'cancelAsyncJob', 'getAsyncJobResult', 'createSchedule', 'runSchedule', 'deleteSchedule', 'cleanupBiRetention',
      'savePilotReview', 'savePilotParticipants',
    ]);
    api.getCatalog.and.returnValue(of(catalog)); api.getOperationsHealth.and.returnValue(of(health));
    api.getPilotReadiness.and.returnValue(of(pilot)); api.getAsyncJobs.and.returnValue(of([]));
    api.getPilotParticipants.and.returnValue(of(participantConfiguration));
    api.getSchedules.and.returnValue(of([])); api.getSnapshots.and.returnValue(of([])); api.getAlerts.and.returnValue(of([]));
    api.savePilotReview.and.returnValue(of({ reviewCode: 1, datasetKey: 'sales.summary', definitionVersion: 2, roleCoverageStatus: 'Approved', businessSignOffStatus: 'Approved', decision: 'Approve', reviewedAt: '2026-10-03T00:00:00Z', rowVersion: 'AAAAAAAAB9E=' }));
    api.savePilotParticipants.and.returnValue(of({ ...participantConfiguration, rowVersion: 'AAAAAAAAB9F=', participants: [
      { participantCode: 1, userRef: 11, departmentRef: 1, displayName: 'مدیر فروش', departmentName: 'فروش', persona: 'Manager' },
      { participantCode: 2, userRef: 12, departmentRef: 2, displayName: 'کارشناس گزارش', departmentName: 'مالی', persona: 'ReportViewer' },
    ] }));
    api.createAsyncJob.and.returnValue(of({ jobCode: 1, jobType: 'Query', status: 'Pending', attemptCount: 0, createdAt: '', expiresAt: '', rowVersion: '' }));
    await TestBed.configureTestingModule({ imports: [BiOperationsComponent], providers: [
      provideZonelessChangeDetection(), provideRouter([]), { provide: BiWebApiService, useValue: api },
      { provide: PermissionService, useValue: permissionStub },
      { provide: SessionStorageService, useValue: { activeDate: '1405/07/08' } },
    ] }).compileComponents();
    fixture = TestBed.createComponent(BiOperationsComponent); fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('renders evidence-backed health without inventing a performance target', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('P95 latency'); expect(text).toContain('218 ms'); expect(text).toContain('Query audit volume is below 100.');
  });

  it('queues a scope-safe query contract without raw SQL', () => {
    (fixture.componentInstance as any).createJob();
    const request = api.createAsyncJob.calls.mostRecent().args[1];
    expect(request).toEqual({ datasetKey: 'sales.summary', fromDate: '1405/01/01', toDate: '1405/07/08', grain: 'month', departmentRefs: [] });
    expect(JSON.stringify(request)).not.toContain('sql');
  });

  it('separates real Pilot progress from synthetic and automated traffic', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(api.getPilotReadiness).toHaveBeenCalledOnceWith('sales.summary', 90, 100);
    expect(text).toContain('3 / 100');
    expect(text).toContain('97 Query دیگر لازم است');
    expect(text).toContain('در انتظار مالک کسب‌وکار');
    expect(text).toContain('کاربر آماده Pilot');
    expect(text).toContain('Department آماده');
    const prePilotCard = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.pilot-summary article'))
      .find(card => card.textContent?.includes('سابقه قبل از Pilot'))?.textContent ?? '';
    expect(prePilotCard).toContain('۱۲');
    expect(prePilotCard).not.toContain('12');
  });

  it('renders an evidence-backed Pilot setup assistant with the verified RBAC route', () => {
    (fixture.componentInstance as any).pilot.set({
      ...pilot,
      availablePilotUsers: 1,
      availablePilotDepartments: 1,
      hasReportViewerRole: false,
      staleCount: 12,
    });
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    const roleLink = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('.pilot-setup a'))
      .find(anchor => anchor.textContent?.includes('مدیریت نقش‌های Central'));
    const blockedSteps = (fixture.nativeElement as HTMLElement).querySelectorAll('.setup-steps article[data-status="Blocked"]');
    expect(text).toContain('مسیر تکمیل Pilot');
    expect(text).toContain('۱ کاربر فعال در ۱ Department');
    expect(text).toContain('۱۲ Query stale');
    expect(roleLink?.getAttribute('href')).toBe('/rbac/centralrole');
    expect(blockedSteps.length).toBeGreaterThanOrEqual(3);
  });

  it('keeps Operations usable when the user cannot read the Sales Pilot dataset', () => {
    permissionStub.isAdmin = false;
    permissionStub.hasPermission.and.returnValue(false);
    api.getPilotReadiness.calls.reset();
    api.getPilotParticipants.calls.reset();

    (fixture.componentInstance as any).load();
    fixture.detectChanges();

    expect(api.getPilotReadiness).not.toHaveBeenCalled();
    expect(api.getPilotParticipants).not.toHaveBeenCalled();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('آمادگی Pilot فروش');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('P95 latency');
  });

  it('does not present missing Pilot observations as zero latency or zero failures', () => {
    (fixture.componentInstance as any).pilot.set({ ...pilot, attemptedQueries: 0, eligibleQueries: 0, pilotEvidenceFrom: null, p95Ms: 0, failureRate: 0 });
    fixture.detectChanges();

    const cards = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('.pilot-summary article'));
    const p95 = cards.find(card => card.textContent?.includes('P95 تعاملی'))?.textContent ?? '';
    const failure = cards.find(card => card.textContent?.includes('Failure'))?.textContent ?? '';
    expect(p95).toContain('—');
    expect(p95).not.toContain('0 ms');
    expect(failure).toContain('—');
    expect(failure).not.toContain('۰٪');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('شروع نشده');
  });

  it('saves a version-bound Pilot review and reloads readiness', () => {
    (fixture.componentInstance as any).pilotRoleStatus = 'Approved';
    (fixture.componentInstance as any).pilotBusinessStatus = 'Approved';
    (fixture.componentInstance as any).pilotDecision = 'Approve';
    api.getPilotReadiness.calls.reset();

    (fixture.componentInstance as any).savePilotReview();

    expect(api.savePilotReview).toHaveBeenCalledWith(jasmine.objectContaining({
      datasetKey: 'sales.summary', definitionVersion: 2, roleCoverageStatus: 'Approved',
      businessSignOffStatus: 'Approved', decision: 'Approve', rowVersion: null,
    }));
    expect(api.getPilotReadiness).toHaveBeenCalledOnceWith('sales.summary', 90, 100);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('ثبت بازبینی Pilot');
  });

  it('selects Pilot personas only from server-provided Kowsar users without browser-supplied Central or actor', () => {
    (fixture.componentInstance as any).pilotManagerKey = '11:1';
    (fixture.componentInstance as any).pilotReportViewerKey = '12:2';
    api.getPilotReadiness.calls.reset();

    (fixture.componentInstance as any).savePilotParticipants();

    const request = api.savePilotParticipants.calls.mostRecent().args[0];
    expect(request).toEqual({
      datasetKey: 'sales.summary', definitionVersion: 2, rowVersion: null,
      participants: [
        { userRef: 11, departmentRef: 1, persona: 'Manager' },
        { userRef: 12, departmentRef: 2, persona: 'ReportViewer' },
      ],
    });
    expect(JSON.stringify(request)).not.toContain('centralRef');
    expect(JSON.stringify(request)).not.toContain('actor');
    expect(api.getPilotReadiness).toHaveBeenCalledOnceWith('sales.summary', 90, 100);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('تعیین شرکت‌کنندگان Pilot');
  });
});
