
import { Injectable } from '@angular/core';
import { HttpService } from '../../../app-shell/framework-services/http.service';
import { ServiceBase } from '../../../app-shell/framework-services/service.base';
import { getServiceUrl } from 'src/environment/environment';

@Injectable({
  providedIn: 'root',
})
export class OrgUnitService extends ServiceBase {
  constructor(httpService: HttpService) {
    super('OrgUnit', httpService);
  }

 // OrgUnitCombo<T>(param) {
   // return this.httpService.get<any>(`${getServiceUrl()}OrgUnit/GetForCombo/${param}`);
  //}
}