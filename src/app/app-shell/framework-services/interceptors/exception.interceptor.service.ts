import { inject } from '@angular/core';
import {
  HttpInterceptorFn,
  HttpErrorResponse,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../ui/notification.service';

/**
 * ExceptionInterceptor
 * کنترل‌کننده‌ی خطاها برای تمام درخواست‌های HTTP
 * برای درخواست‌های blob (دانلود فایل) هیچ تغییری نمی‌دهد
 */
export const ExceptionInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const notifier = inject(NotificationService);

  //   اگر درخواست blob یا دانلود فایل بود، مستقیماً عبور بده
  if (
    req.responseType === 'blob' ||
    req.url.toLowerCase().includes('getattachfile') ||
    req.url.toLowerCase().includes('download')
  ) {
    return next(req);
  }

  //   سایر درخواست‌ها
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let message = 'خطایی در ارتباط با سرور رخ داده است.';

      // 🧠 تشخیص نوع خطا
      if (error.error instanceof ErrorEvent) {
        message = `  خطای سمت کاربر: ${error.error.message}`;
      } else {
        switch (error.status) {
          case 0:
            message = '❌ ارتباط با سرور برقرار نشد.';
            break;
          case 400:
            message = 'درخواست نامعتبر است.';
            break;
          case 401:
            message = 'دسترسی غیرمجاز.';
            break;
          case 403:
            message = 'شما مجاز به انجام این عملیات نیستید.';
            break;
          case 404:
            message = 'موردی یافت نشد.';
            break;
          case 500:
            message = 'خطای داخلی سرور.';
            break;
          default:
            message = `❗ خطای ${error.status}: ${error.statusText}`;
        }
      }

      // 🚨 نمایش پیام خطا
      notifier.show(message, 'خطا', 'error', 5000);

      // 🧾 لاگ کامل برای بررسی
      console.error('❗ ExceptionInterceptor:', {
        url: req.url,
        method: req.method,
        status: error.status,
        statusText: error.statusText,
        responseType: req.responseType,
        error,
      });

      // ارسال خطا برای زنجیره observable
      return throwError(() => error);
    })
  );
};
