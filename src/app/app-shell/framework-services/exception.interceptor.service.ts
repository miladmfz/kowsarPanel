import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
declare var $: any;

@Injectable()
export class ExceptionInterceptor implements HttpInterceptor {

  constructor() { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
    } else {
      if (error.status === 400) {
        if (error.error.error == "invalid_client") {
          $.NotificationApp.send(
            "خطای ورود",
            "نام کاربر یا رمز عبور اشتباه است.",
            "top-right",
            "#bf441d",
            "error"
          );

          $("#loginBtn").attr("disabled", false);
          $("#loginBtnSpinner").addClass("d-none");

          throw new Error("");
        }

        $.NotificationApp.send(
          "خطا فرم",
          "اطلاعات فرم به درستی وارد نشده است.",
          "top-right",
          "#bf441d",
          "error"
        );
      } else if (error.status == 500) {
        console.log(error);
        $.NotificationApp.send(
          "خطا سرور",
          "خطایی رخ داده است. لطفا با مدیر سیستم تماس بگیرید.",
          "top-right",
          "#bf441d",
          "error"
        );
      } else if (error.status == 410) {
        console.log(error);
        $.NotificationApp.send(
          "خطا",
          error.error,
          "top-right",
          "#bf441d",
          "error"
        );
      }
    }

    return throwError(
      'مشکلی رخ داده است. لطفا مجددا تلاش نمایید. در صورتی که مشکل حل نشد، با مدیر سیستم تماس بگیرید.');
  }
}
