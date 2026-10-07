import { inject } from '@angular/core';
import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';

import { AppConfigService } from 'src/app/app-config.service';
import { NotificationService } from '../ui/notification.service';
import { BrowserErrorMonitoringService } from '../logging/browser-error-monitoring.service';

export const ExceptionInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const notifier = inject(NotificationService);
  const config = inject(AppConfigService);
  const monitoring = inject(BrowserErrorMonitoringService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notifier.show(getHttpErrorMessage(error), 'خطا', 'error', 5000);

      if (error.status === 0 || error.status >= 500) {
        monitoring.report(error);
      }

      if (!config.all.production) {
        console.error('HTTP request failed', {
          method: req.method,
          status: error.status,
          statusText: error.statusText,
          responseType: req.responseType,
        });
      }

      return throwError(() => error);
    })
  );
};

export function getHttpErrorMessage(error: HttpErrorResponse): string {
  const serverMessage = extractServerMessage(error.error);

  if (error.error instanceof ErrorEvent) {
    return 'خطایی در مرورگر رخ داده است.';
  }

  switch (error.status) {
    case 0:
      return 'ارتباط با سرور برقرار نشد.';
    case 400:
      return serverMessage || 'درخواست نامعتبر است.';
    case 401:
      return 'نشست شما منقضی شده است؛ لطفاً دوباره وارد شوید.';
    case 403:
      return 'شما مجاز به انجام این عملیات نیستید.';
    case 404:
      return serverMessage || 'مورد درخواستی یافت نشد.';
    case 409:
      return serverMessage || 'اطلاعات با وضعیت فعلی سیستم تداخل دارد.';
    case 422:
      return serverMessage || 'اطلاعات ارسال‌شده معتبر نیست.';
    case 429:
      return 'تعداد درخواست‌ها بیش از حد مجاز است؛ کمی بعد دوباره تلاش کنید.';
    default:
      return error.status >= 500
        ? 'سرویس موقتاً با مشکل مواجه شده است.'
        : serverMessage || 'خطایی در ارتباط با سرور رخ داده است.';
  }
}

function extractServerMessage(payload: unknown): string {
  if (!payload || typeof payload !== 'object' || payload instanceof Blob) {
    return '';
  }

  const value = payload as Record<string, unknown>;
  const candidate = value['ErrDesc'] ?? value['errDesc'] ?? value['Message'] ?? value['message'];

  return typeof candidate === 'string'
    ? candidate.trim().slice(0, 500)
    : '';
}
