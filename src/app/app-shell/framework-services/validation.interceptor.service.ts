declare var $: any;
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { NotificationService } from './notification.service';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';

@Injectable()
export class ValidationInterceptor implements HttpInterceptor {
  constructor(private readonly notificationService: NotificationService) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const formId = '#submitForm';
    if (request.method == "POST" || request.method == "PUT") {
      if (request.headers.get("noValidate") == "true") {
        return next.handle(request);
      }

      const form = $(formId);
      if (form[0]) {
        form.addClass("was-validated");
        const errors = this.logErrors(formId);
        if (form[0].checkValidity()) {
          form.removeClass("was-validated");
          return next.handle(request);
        } else {
          this.notificationService.error(`لطفا '${errors.join(" و ")}' را به درستی وارد کنید.`);
          throw new Error();
        }
      } else {
        return next.handle(request);
      }
    } else {
      return next.handle(request);
    }
  }

  logErrors(formId) {
    const errors = [];
    $(`${formId} input, ${formId} select`).each(
      function (index, item) {
        if (!item.validity.valid) {
          logItemError(item, errors);
        }

        if (typeof $(item).data('date') !== 'undefined') {
          controlValidity(dateRegex, item, errors);
          item.addEventListener("input", function (event) {
            controlValidity(dateRegex, item, errors);
          })
        }

        if (typeof $(item).data('mobile') !== 'undefined') {
          controlValidity(mobileRegex, item, errors);
          item.addEventListener("input", function (event) {
            controlValidity(mobileRegex, item, errors);
          })
        }

        if (typeof $(item).data('national-code') !== 'undefined') {
          controlNationalCodeValidity(item, errors);
          item.addEventListener("input", function (event) {
            controlNationalCodeValidity(item, errors);
          })
        }


      }
    );

    return errors;
  }
}

var nationalCodeRegex = "\\d{10}";
var mobileRegex = "^(0|0098|\\+98)9(0[1-5]|[1 3]\\d|2[0-2]|98)\\d{7}$";
var dateRegex = "^[12][0-9][0-9][0-9]\/(0[1-9]|1[012])\/(0[1-9]|[12][0-9]|3[01])$";

function controlValidity(regex, item, errors) {
  let value = $(item).val();
  if (value.match(regex) || value == "") {
    item.setCustomValidity('');
  } else {
    logItemError(item, errors);
    item.setCustomValidity('invalid');
  }
}

function controlNationalCodeValidity(item, errors) {
  let value = $(item).val();
  if (isValidNationalCode(value) || isValidLegalNationalCode(value) || value == "") {
    item.setCustomValidity('');
  } else {
    logItemError(item, errors);
    item.setCustomValidity('invalid');
  }
}

function logItemError(item, errors: any[]) {
  const itemId = $(item).attr('id');
  const label = $(`span[for='${itemId}']`);
  var outerText = label[0].outerText.replace("*", "");
  if (!errors.includes(outerText)) {
    errors.push(outerText);
  }

  console.log(errors);
}

function isValidNationalCode(nationalCode) {
  if (nationalCode.length != 10)
    return false;

  if (!nationalCode.match(nationalCodeRegex))
    return false;

  var allDigitEqual = [
    "0000000000", "1111111111", "2222222222", "3333333333", "4444444444", "5555555555", "6666666666",
    "7777777777", "8888888888", "9999999999"
  ];

  if (allDigitEqual.includes(nationalCode)) return false;

  var chArray = nationalCode;
  var num0 = parseInt(chArray[0].toString()) * 10;
  var num2 = parseInt(chArray[1].toString()) * 9;
  var num3 = parseInt(chArray[2].toString()) * 8;
  var num4 = parseInt(chArray[3].toString()) * 7;
  var num5 = parseInt(chArray[4].toString()) * 6;
  var num6 = parseInt(chArray[5].toString()) * 5;
  var num7 = parseInt(chArray[6].toString()) * 4;
  var num8 = parseInt(chArray[7].toString()) * 3;
  var num9 = parseInt(chArray[8].toString()) * 2;
  var a = parseInt(chArray[9].toString());

  var b = num0 + num2 + num3 + num4 + num5 + num6 + num7 + num8 + num9;
  var c = b % 11;

  return c < 2 && a == c || c >= 2 && 11 - c == a;
}

function isValidLegalNationalCode(nationalCode) {
  if (nationalCode.length != 11)
    return false;

  return true;
}