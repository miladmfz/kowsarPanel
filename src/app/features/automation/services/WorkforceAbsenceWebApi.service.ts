import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';

import { AppConfigService } from 'src/app/app-config.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';

@Injectable({
    providedIn: 'root',
})
export class WorkforceAbsenceWebApiService {

    baseUrl: string;

    private readonly client = inject(HttpClient);
    private readonly config = inject(AppConfigService);
    private readonly loadingService = inject(LoadingService);
    private readonly headerService = inject(HeaderService);

    protected readonly session = inject(SessionStorageService);

    constructor() {
        this.baseUrl = this.config.apiUrl + 'WorkforceAbsence/';
    }

    private withLoading<T>(obs$: Observable<T>): Observable<T> {
        this.loadingService.show();

        return obs$.pipe(
            finalize(() => this.loadingService.hide())
        );
    }

    // =============================================================
    // Type
    // =============================================================

    Type_Get(command: any): Observable<any[]> {
        return this.withLoading(
            this.client.post<any[]>(
                this.baseUrl + 'Type_Get',
                command,
                { headers: this.headerService.headers }
            )
        );
    }

    Type_Save(command: any): Observable<any[]> {
        return this.withLoading(
            this.client.post<any[]>(
                this.baseUrl + 'Type_Save',
                command,
                { headers: this.headerService.headers }
            )
        );
    }

    // =============================================================
    // Policy
    // =============================================================

    Policy_Get(command: any): Observable<any[]> {
        return this.withLoading(
            this.client.post<any[]>(
                this.baseUrl + 'Policy_Get',
                command,
                { headers: this.headerService.headers }
            )
        );
    }

    Policy_Save(command: any): Observable<any[]> {
        return this.withLoading(
            this.client.post<any[]>(
                this.baseUrl + 'Policy_Save',
                command,
                { headers: this.headerService.headers }
            )
        );
    }

    // =============================================================
    // Request
    // =============================================================

    Request_Get(command: any): Observable<any[]> {
        return this.withLoading(
            this.client.post<any[]>(
                this.baseUrl + 'Request_Get',
                command,
                { headers: this.headerService.headers }
            )
        );
    }

    Request_GetById(absenceRequestCode: string): Observable<any[]> {
        const params = new HttpParams()
            .append('AbsenceRequestCode', absenceRequestCode);

        return this.withLoading(
            this.client.get<any[]>(
                this.baseUrl + 'Request_GetById',
                {
                    headers: this.headerService.headers,
                    params,
                }
            )
        );
    }

    Request_Save(command: any): Observable<any[]> {
        return this.withLoading(
            this.client.post<any[]>(
                this.baseUrl + 'Request_Save',
                command,
                { headers: this.headerService.headers }
            )
        );
    }

    Request_Workflow(command: any): Observable<any[]> {
        return this.withLoading(
            this.client.post<any[]>(
                this.baseUrl + 'Request_Workflow',
                command,
                { headers: this.headerService.headers }
            )
        );
    }

    Request_Delete(command: any): Observable<any[]> {
        return this.withLoading(
            this.client.post<any[]>(
                this.baseUrl + 'Request_Delete',
                command,
                { headers: this.headerService.headers }
            )
        );
    }

    Request_Status(command: any): Observable<any[]> {
        return this.withLoading(
            this.client.post<any[]>(
                this.baseUrl + 'Request_Status',
                command,
                { headers: this.headerService.headers }
            )
        );
    }

    // =============================================================
    // Dashboard
    // =============================================================

    Dashboard_Get(command: any): Observable<any[]> {
        return this.withLoading(
            this.client.post<any[]>(
                this.baseUrl + 'Dashboard_Get',
                command,
                { headers: this.headerService.headers }
            )
        );
    }
}
