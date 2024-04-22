import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ServiceBase } from './service.base';

@Injectable({
  providedIn: 'root'
})
export class RefService extends ServiceBase {

  constructor(httpService: HttpService) {
    super("Ref", httpService);
  }

  getListByMasterId(masterId: number, table: string) {
    let path = `${this.baseUrl}/GetList/${masterId}/${table}`;
    return this.httpService.getAll<any>(path);
  }

  deleteReference(table, id) {
    let path = `${this.baseUrl}/${table}/${id}`;
    return this.httpService.delete(path);
  }
}
