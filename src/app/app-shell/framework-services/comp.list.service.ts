import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ServiceBase } from './service.base';

@Injectable({
    providedIn: 'root'
})
export class CompListService extends ServiceBase {

    constructor(httpService: HttpService) {
        super("CompList", httpService)
    }

    getCurrentCompanyName(dbName: string) {
        const path = `${this.baseUrl}/GetCurrentCompanyName`
        return this.httpService.get(path, dbName)
    }
}
