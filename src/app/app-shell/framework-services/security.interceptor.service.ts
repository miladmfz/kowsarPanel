import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';
// import { AuthenticationService } from './authentication.service';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { getIdentityUrl } from 'src/environment/environment';
import { OidcSecurityService } from 'angular-auth-oidc-client';
import { ACCESS_TOKEN_NAME } from './configuration';

@Injectable()
export class SecurityInterceptor implements HttpInterceptor {
  constructor(private oidcSecurityService: OidcSecurityService) {}
  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!request.url.includes(getIdentityUrl())) {
      var token = localStorage.getItem(ACCESS_TOKEN_NAME);
      if (!token) {
        this.oidcSecurityService
          .logoffAndRevokeTokens()
          .subscribe((result) => console.log(result));
      }

      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
        responseType: 'json',
      });
    }

    return next.handle(request).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
          }
        },
        error: (err) => {
          if (err instanceof HttpErrorResponse) {
            if (
              err.status === 401 ||
              err.status === 402 ||
              err.status === 403
            ) {
              this.oidcSecurityService
                .logoff()
                .subscribe((result) => console.log(result));
            }
          }
        },
      })
    );
  }
}
