
import { Injectable } from '@angular/core';
import { HttpService } from '../../../app-shell/framework-services/http.service';
import { ServiceBase } from '../../../app-shell/framework-services/service.base';

@Injectable({
  providedIn: 'root',
})

export class OrgUnitService extends ServiceBase {
  constructor(httpService: HttpService) {
    super('OrgUnit', httpService);
  }
}