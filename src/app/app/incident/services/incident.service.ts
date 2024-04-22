import { Injectable } from '@angular/core';
import { HttpService } from '../../../app-shell/framework-services/http.service';
import { ServiceBase } from '../../../app-shell/framework-services/service.base';
import { getServiceUrl } from 'src/environment/environment';

@Injectable({
  providedIn: 'root',
})
export class IncidentService extends ServiceBase {
  constructor(httpService: HttpService) {
    super('Incident', httpService);
  }

  // getList<T>() {
  //   let path = `${this.baseUrl}/GetList`;
  //   return this.httpService.getAll<T>(path);
  // }


  incidentItemCombo<T>(param) {
    return this.httpService.get<any>(`${getServiceUrl()}IncidentItem/GetForCombo/${param}`);
  }
}
