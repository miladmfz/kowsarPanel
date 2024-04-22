import { Injectable } from '@angular/core';
import { HttpService } from '../../../app-shell/framework-services/http.service';
import { ServiceBase } from '../../../app-shell/framework-services/service.base';

@Injectable({
  providedIn: 'root',
})
export class UserWidgetService extends ServiceBase {
  constructor(httpService: HttpService) {
    super('UserWidget', httpService);
  }
}
