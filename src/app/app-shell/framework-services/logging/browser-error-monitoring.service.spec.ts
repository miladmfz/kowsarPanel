import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AppConfigService } from '../../../app-config.service';
import { SessionStorageService } from '../storage/session.storage.service';
import {
  BrowserErrorMonitoringService,
  sanitizeRuntimeError,
} from './browser-error-monitoring.service';

describe('BrowserErrorMonitoringService', () => {
  const config = {
    all: { production: true },
    apiUrl: 'https://panel.example.test/api/',
    AppVersion: '15.02.05',
  };
  const session = { accessToken: 'access-token' };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        BrowserErrorMonitoringService,
        provideZonelessChangeDetection(),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AppConfigService, useValue: config },
        { provide: SessionStorageService, useValue: session },
      ],
    });
  });

  afterEach(() => TestBed.inject(HttpTestingController).verify());

  it('reports a sanitized production error through the existing authenticated endpoint', () => {
    const service = TestBed.inject(BrowserErrorMonitoringService);
    service.report(new Error('request failed?access_token=secret-value'));

    const request = TestBed.inject(HttpTestingController).expectOne(
      candidate => candidate.url === 'https://panel.example.test/api/Kits/ErrorLog',
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.get('Authorization')).toBe('Bearer access-token');
    expect(request.request.body.ErrorLog).toContain('access_token=[redacted]');
    expect(request.request.body.ErrorLog).not.toContain('secret-value');
    expect(request.request.body.VersionName).toBe('15.02.05');
    request.flush('done');
  });

  it('does not send a report before an authenticated session exists', () => {
    session.accessToken = '';
    TestBed.inject(BrowserErrorMonitoringService).report(new Error('startup failure'));
    expect(() => TestBed.inject(HttpTestingController).expectNone(() => true)).not.toThrow();
    session.accessToken = 'access-token';
  });

  it('redacts credentials, tokens, and secrets without serializing arbitrary objects', () => {
    const sanitized = sanitizeRuntimeError(
      'Bearer abc.def https://user:pass@example.test/a?api_key=value password=hunter2',
    );

    expect(sanitized).not.toContain('abc.def');
    expect(sanitized).not.toContain('user:pass');
    expect(sanitized).not.toContain('value');
    expect(sanitized).not.toContain('hunter2');
    expect(sanitizeRuntimeError({ accessToken: 'never-serialize' })).toBe('Unknown browser error');
  });
});
