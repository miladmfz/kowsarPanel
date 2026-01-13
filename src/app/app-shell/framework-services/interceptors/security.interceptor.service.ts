import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { AppConfigService } from 'src/app/app-config.service';
import { ACCESS_TOKEN_NAME } from '../base/configuration';

export const SecurityInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(AppConfigService);
  const apiUrl = config.apiUrl;

  // فقط درخواست‌های مربوط به API اصلی intercept شوند
  if (!req.url.includes(apiUrl)) {
    return next(req);
  }

  const token = localStorage.getItem(ACCESS_TOKEN_NAME);

  // 🔐 افزودن توکن در Header در صورت وجود
  const cloned = req.clone({
    setHeaders: token
      ? { Authorization: `Bearer ${token}` }
      : {},
    responseType: 'json',
  });

  //   کنترل پاسخ‌ها و خطاهای امنیتی
  return next(cloned).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          // پاسخ موفق - در صورت نیاز می‌توانی لاگ بزنی
        }
      },
      error: (err) => {
        if (err instanceof HttpErrorResponse) {
          if ([401, 403].includes(err.status)) {
            console.warn('🚫 دسترسی غیرمجاز - لطفاً دوباره وارد شوید');
            localStorage.removeItem(ACCESS_TOKEN_NAME);
            sessionStorage.clear();
            // در صورت نیاز، ریدایرکت به صفحه لاگین:
            // window.location.href = '/auth/login';
          }
        }
      },
    })
  );
};
