import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class WorkItemWebApiService {



  baseUrl: string;
  headers: HttpHeaders;

  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private readonly AutoloadingService = inject(LoadingService);

  private withLoading<T>(obs$: Observable<T>): Observable<T> {
    this.AutoloadingService.show();
    return obs$.pipe(finalize(() => this.AutoloadingService.hide()));
  }

  constructor() {
    this.baseUrl = this.config.apiUrl + 'Support/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PIC', sessionStorage.getItem('PersonInfoRef') ?? '')
      .set('SessionId', sessionStorage.getItem('SessionId') ?? '')
      .set('UserName', encodeURIComponent(sessionStorage.getItem('UserName') ?? ''));
  }




  WorkItem_Insert(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WorkItem_Insert", command, { headers: this.headers }))
  }



  WorkItem_Update(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WorkItem_Update", command, { headers: this.headers }))
  }

  WorkItem_SetStatus(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WorkItem_SetStatus", command, { headers: this.headers }))
  }

  WorkItem_Get(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WorkItem_Get", command, { headers: this.headers }))
  }
  WorkItem_Delete(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WorkItem_Delete", command, { headers: this.headers }))
  }


  AttendanceDashboard(): Observable<any[]> {
    const params = new HttpParams()
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "AttendanceDashboard", { headers: this.headers, params: params }))
  }


}
