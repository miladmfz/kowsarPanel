import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { HttpService } from './http.service';
import { ServiceBase } from './service.base';

@Injectable({
    providedIn: 'root'
})
export class SmartSearchService extends ServiceBase {

    constructor(httpService: HttpService, private readonly http: HttpClient) {
        super("SmartSearch", httpService);
    }

    search(searchModel) {
        return this.httpService.getWithParams<any>(this.baseUrl, searchModel, true);
    }
}