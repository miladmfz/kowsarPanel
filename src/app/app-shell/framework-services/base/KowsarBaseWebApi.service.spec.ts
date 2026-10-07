import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AppConfigService } from 'src/app/app-config.service';
import { LoadingService } from '../ui/loading.service';
import { KowsarBaseWebApi } from './KowsarBaseWebApi.service';

describe('KowsarBaseWebApi', () => {
  let service: KowsarBaseWebApi;
  let http: HttpTestingController;
  let loading: LoadingService;

  beforeEach(() => {
    const config = new AppConfigService();
    config.initialize({
      appVersion: '1',
      production: false,
      apiUrl: 'https://api.test/api/',
      baseHref: '/',
    });

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppConfigService, useValue: config },
      ],
    });

    service = TestBed.inject(KowsarBaseWebApi);
    http = TestBed.inject(HttpTestingController);
    loading = TestBed.inject(LoadingService);
  });

  afterEach(() => http.verify());

  it('preserves the typed grid schema envelope and class-name parameter', () => {
    service.GetGridSchemaVisible('TFactor').subscribe(result => {
      expect(result.GridSchemas[0].FieldName).toBe('FactorCode');
    });
    expect(loading.isVisible()).toBeTrue();

    const request = http.expectOne(req =>
      req.url === 'https://api.test/api/Base/GetGridSchemaVisible' &&
      req.params.get('ClassName') === 'TFactor');
    request.flush({
      GridSchemas: [{ FieldName: 'FactorCode', Caption: 'Code', Visible: 'True', Width: '120' }],
    });

    expect(loading.isVisible()).toBeFalse();
  });

  it('preserves lookup and server-date response contracts', () => {
    service.GetLookup('CentralRecType').subscribe(result => {
      expect(result.Lookups[0].Name).toBe('Customer');
    });
    const lookup = http.expectOne(req =>
      req.url === 'https://api.test/api/Base/GetLookup' &&
      req.params.get('SearchTarget') === 'CentralRecType');
    lookup.flush({ Lookups: [{ Code: '1', Name: 'Customer' }] });

    service.GetTodeyFromServer().subscribe(result => expect(result.Text).toBe('1405/06/23'));
    http.expectOne('https://api.test/api/Base/GetTodeyFromServer').flush({ Text: '1405/06/23' });
  });
});
