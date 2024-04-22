import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ServiceBase } from './service.base';

@Injectable({
    providedIn: 'root'
})
export class AttachService extends ServiceBase {

    constructor(httpService: HttpService, private readonly http: HttpClient) {
        super("Attach", httpService);
    }

    getListByMasterId(table, masterId) {
        return this.http.get<any>(`${this.baseUrl}/GetList/${table}/${masterId}`, { headers: this.httpService.setHeaders() });
    }

    deleteAttach(table, id) {
        return this.http.delete(`${this.baseUrl}/${table}/${id}`, { headers: this.httpService.setHeaders() })
    }

    download(schema, table, id) {
        return this.http.get(`${this.baseUrl}/Download/${schema}/${table}/${id}`,
            { responseType: 'blob', observe: 'response' });
    }
}