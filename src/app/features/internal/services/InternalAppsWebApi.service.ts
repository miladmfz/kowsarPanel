import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class InternalAppsWebApiService {



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
    this.baseUrl = this.config.apiUrl + 'SupportApp/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PIC', sessionStorage.getItem('PersonInfoRef') ?? '')
      .set('SessionId', sessionStorage.getItem('SessionId') ?? '')
      .set('UserName', encodeURIComponent(sessionStorage.getItem('UserName') ?? ''));
  }




  ////////////////////////////////////////////////////////////////////

  GetAppActivation(): Observable<any[]> {
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetAppActivation", { headers: this.headers }))
  }


  GetAppActivationByCode(ActivationCode: string): Observable<any[]> {
    const params = new HttpParams().append('ActivationCode', ActivationCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetAppActivationByCode", { headers: this.headers, params: params }))
  }

  GetAppLogReport(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetAppLogReport", command, { headers: this.headers }))

  }




  CrudAppActivation(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CrudAppActivation", command, { headers: this.headers }))
  }

  CheckPort(
    Ip: string,
    Port: string,
  ): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CheckPort", { Ip, Port }, { headers: this.headers }))
  }



  GetActiveApplication(): Observable<any[]> {
    const params = new HttpParams().append('Filter', "6")
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetActiveApplication", { headers: this.headers, params: params }))
  }

  DeleteAppActivation(AppActivationCode: string): Observable<any[]> {
    const params = new HttpParams().append('AppActivationCode', AppActivationCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteAppActivation", { headers: this.headers, params: params }))
  }



}
