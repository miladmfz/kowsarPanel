import { Injectable } from '@angular/core';
import { HttpService } from './http.service';
import { ServiceBase } from './service.base';

@Injectable({
    providedIn: 'root'
})
export class FormGeneratorService extends ServiceBase {

    constructor(httpService: HttpService) {
        super("FormGenerator", httpService);
    }

    getTableReferenceItems(tableName, listFieldGroupId) {
        const path = `${this.baseUrl}/GetTableReferenceItems/${tableName}/${listFieldGroupId}`;
        return this.httpService.getAll<any>(path);
    }

    getStatementBy(id, tableName) {
        const path = `${this.baseUrl}/GetBy/${tableName}/${id}`;
        return this.httpService.getAll<any>(path, true);
    }

    getTableInfo(tableName) {
        const path = `${this.baseUrl}/GetTableInfo/${tableName}`;
        return this.httpService.getAll<any>(path, true);
    }

    setOrder(command) {
        const path = `${this.baseUrl}/SetOrder`;
        return this.httpService.put(path, command, true, true);
    }
}