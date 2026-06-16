import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';

@Injectable({
  providedIn: 'root'
})
export class WorkItemWebApiService {



  baseUrl: string;
  private readonly headerService = inject(HeaderService);

  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private readonly AutoloadingService = inject(LoadingService);
  protected readonly session = inject(SessionStorageService);
  private withLoading<T>(obs$: Observable<T>): Observable<T> {
    this.AutoloadingService.show();
    return obs$.pipe(finalize(() => this.AutoloadingService.hide()));
  }

  constructor() {
    this.baseUrl = this.config.apiUrl + 'InternalWorkItem/';


  }




  WorkItem_Insert(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WorkItem_Insert", command, { headers: this.headerService.headers }))
  }



  WorkItem_Update(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WorkItem_Update", command, { headers: this.headerService.headers }))
  }

  WorkItem_SetStatus(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WorkItem_SetStatus", command, { headers: this.headerService.headers }))
  }

  WorkItem_Get(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WorkItem_Get", command, { headers: this.headerService.headers }))
  }
  WorkItem_Delete(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WorkItem_Delete", command, { headers: this.headerService.headers }))
  }




}
