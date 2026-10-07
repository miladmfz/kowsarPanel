import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AppConfigService } from 'src/app/app-config.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { WorkforceAbsenceTypeApiService } from './workforce-absence-type-api.service';

describe('WorkforceAbsenceTypeApiService', () => {
  let service: WorkforceAbsenceTypeApiService;
  let http: HttpTestingController;
  let loading: LoadingService;

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

    service = TestBed.inject(WorkforceAbsenceTypeApiService);
    http = TestBed.inject(HttpTestingController);
    loading = TestBed.inject(LoadingService);
  });

  afterEach(() => http.verify());

  it('uses the legacy Type_Get route with a typed response', () => {
    service.list({ AbsenceTypeCode: '0', OnlyActive: '1' }).subscribe(response => {
      expect(response.WorkforceAbsenceTypes[0].TypeKey).toBe('DAILY');
    });
    expect(loading.isVisible()).toBeTrue();

    const request = http.expectOne('https://api.test/api/WorkforceAbsence/Type_Get');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ AbsenceTypeCode: '0', OnlyActive: '1' });
    request.flush({ WorkforceAbsenceTypes: [{ AbsenceTypeCode: 1, TypeKey: 'DAILY' }] });

    expect(loading.isVisible()).toBeFalse();
  });

  it('uses the legacy Type_Save route and always closes loading', () => {
    service.save({ AbsenceTypeCode: '0', TypeKey: 'DAILY' }).subscribe();
    const request = http.expectOne('https://api.test/api/WorkforceAbsence/Type_Save');
    request.flush({ WorkforceAbsenceTypes: [] });
    expect(loading.isVisible()).toBeFalse();
  });
});
