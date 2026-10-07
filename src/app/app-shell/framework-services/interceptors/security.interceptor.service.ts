import { inject } from '@angular/core';
import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from '../storage/session.storage.service';
import { AuthTokenService } from 'src/app/auth-kowsar/services/auth-token.service';

export const SecurityInterceptor: HttpInterceptorFn = (req, next) => {
  const config = inject(AppConfigService);
  const router = inject(Router);
  const session = inject(SessionStorageService);
  const authTokens = inject(AuthTokenService);
  const apiUrl = config.apiUrl;

  // فقط درخواست‌های همان Origin و مسیر API اصلی intercept شوند.
  if (!isRequestForApi(req.url, apiUrl)) {
    return next(req);
  }

  const token = session.accessToken;

  // 🔐 افزودن توکن در Header در صورت وجود
  const cloned = req.clone({
    setHeaders: token
      ? { Authorization: `Bearer ${token}` }
      : {},
    responseType: 'json',
  });

  //   کنترل پاسخ‌ها و خطاهای امنیتی
  return next(cloned).pipe(catchError(err => {
    if (!(err instanceof HttpErrorResponse) || ![401, 403].includes(err.status)) {
      return throwError(() => err);
    }

    const isRefreshRequest = req.url.includes('/Auth/v2/refresh');
    if (err.status === 401 && !isRefreshRequest && session.refreshToken && session.authSubject) {
      return authTokens.refreshAccessToken().pipe(
        switchMap(newToken => next(cloned.clone({
          setHeaders: { Authorization: `Bearer ${newToken}` },
        }))),
        catchError(refreshError => {
          clearAuthentication();
          return throwError(() => refreshError);
        })
      );
    }

    clearAuthentication();
    return throwError(() => err);
  }));

  function clearAuthentication(): void {
    const loginRoute = session.loginType.trim().toUpperCase() === 'GUEST'
      ? '/auth/guest-login'
      : session.loginRoute;
    session.clearAuthentication();
    void router.navigateByUrl(loginRoute);
  }
};

function isRequestForApi(requestUrl: string, apiUrl: string): boolean {
  try {
    const request = new URL(requestUrl, document.baseURI);
    const api = new URL(apiUrl, document.baseURI);
    const apiPath = api.pathname.endsWith('/') ? api.pathname : `${api.pathname}/`;

    return request.origin === api.origin && request.pathname.startsWith(apiPath);
  } catch {
    return false;
  }
}
