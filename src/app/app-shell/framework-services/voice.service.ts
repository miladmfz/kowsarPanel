import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ServiceBase } from './service.base';

@Injectable({
  providedIn: 'root'
})
export class VoiceService extends ServiceBase {

  constructor(httpService: HttpService) {
    super("Voice", httpService);
  }

  getListByMasterId(masterId: number, table: string) {
    let path = `${this.baseUrl}/GetList/${masterId}/${table}`;
    return this.httpService.getAll<any>(path);
  }

  deleteNote(table, id) {
    let path = `${this.baseUrl}/${table}/${id}`;
    return this.httpService.delete(path);
  }
}
