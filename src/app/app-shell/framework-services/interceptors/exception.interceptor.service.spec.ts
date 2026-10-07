import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClient, HttpErrorResponse, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AppConfigService } from 'src/app/app-config.service';
import { NotificationService } from '../ui/notification.service';
import { ExceptionInterceptor, getHttpErrorMessage } from './exception.interceptor.service';
import { BrowserErrorMonitoringService } from '../logging/browser-error-monitoring.service';

describe('getHttpErrorMessage', () => {
  function error(status: number, body?: unknown): HttpErrorResponse {
    return new HttpErrorResponse({ status, error: body });
  }

  it('maps a network failure', () => {
    expect(getHttpErrorMessage(error(0))).toBe('ارتباط با سرور برقرار نشد.');
  });

  it('uses a backend validation message for bad requests', () => {
    expect(getHttpErrorMessage(error(400, { ErrDesc: 'کد واردشده نامعتبر است' })))
      .toBe('کد واردشده نامعتبر است');
  });

  it('does not expose backend details for unauthorized responses', () => {
    expect(getHttpErrorMessage(error(401, { message: 'sensitive detail' })))
      .toBe('نشست شما منقضی شده است؛ لطفاً دوباره وارد شوید.');
  });

  it('maps forbidden and not-found responses', () => {
    expect(getHttpErrorMessage(error(403))).toBe('شما مجاز به انجام این عملیات نیستید.');
    expect(getHttpErrorMessage(error(404))).toBe('مورد درخواستی یافت نشد.');
  });

  it('maps conflict and validation responses', () => {
    expect(getHttpErrorMessage(error(409))).toContain('تداخل');
    expect(getHttpErrorMessage(error(422))).toContain('معتبر نیست');
  });

  it('maps rate limiting', () => {
    expect(getHttpErrorMessage(error(429))).toContain('بیش از حد مجاز');
  });

  it('hides server error details', () => {
    expect(getHttpErrorMessage(error(500, { ErrDesc: 'database password leaked' })))
      .toBe('سرویس موقتاً با مشکل مواجه شده است.');
  });

  it('does not attempt to expose details from Blob download errors', () => {
    const payload = new Blob(['{"ErrDesc":"sensitive detail"}'], { type: 'application/json' });

    expect(getHttpErrorMessage(error(400, payload))).toBe('درخواست نامعتبر است.');
  });
});

describe('ExceptionInterceptor', () => {
  let http: HttpClient;
  let httpTesting: HttpTestingController;
  let notification: jasmine.SpyObj<NotificationService>;
  let monitoring: jasmine.SpyObj<BrowserErrorMonitoringService>;

  beforeEach(() => {
    const config = new AppConfigService();
    config.initialize({
      appVersion: '1.0.0',
      production: true,
      apiUrl: 'https://api.example.test/api/',
      baseHref: '/',
    });
    notification = jasmine.createSpyObj<NotificationService>('NotificationService', ['show']);
    monitoring = jasmine.createSpyObj<BrowserErrorMonitoringService>('BrowserErrorMonitoringService', ['report']);

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        provideHttpClient(withInterceptors([ExceptionInterceptor])),
        provideHttpClientTesting(),
        { provide: AppConfigService, useValue: config },
        { provide: NotificationService, useValue: notification },
        { provide: BrowserErrorMonitoringService, useValue: monitoring },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('notifies with the standardized message and preserves the original HTTP error', () => {
    let receivedError: HttpErrorResponse | undefined;
    http.get('/api/factor').subscribe({
      error: errorResponse => receivedError = errorResponse,
    });

    const request = httpTesting.expectOne('/api/factor');
    request.flush({ ErrDesc: 'مقدار نامعتبر است' }, { status: 400, statusText: 'Bad Request' });

    expect(notification.show).toHaveBeenCalledOnceWith(
      'مقدار نامعتبر است',
      'خطا',
      'error',
      5000,
    );
    expect(receivedError?.status).toBe(400);
  });

  it('reports network and server failures to production monitoring', () => {
    http.get('/api/factor').subscribe({ error: () => undefined });

    const request = httpTesting.expectOne('/api/factor');
    request.flush({}, { status: 503, statusText: 'Unavailable' });

    expect(monitoring.report).toHaveBeenCalledOnceWith(jasmine.any(HttpErrorResponse));
  });
});
