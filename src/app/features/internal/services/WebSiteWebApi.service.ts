import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';

import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class WebSiteWebApiService {





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



  WebSiteInsert(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WebSiteInsert", command, { headers: this.headers }))

  }

  WebSiteUpdate(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WebSiteUpdate", command, { headers: this.headers }))

  }

  GetWebSiteActivation(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetWebSiteActivation", command, { headers: this.headers }))

  }


  GetWebSiteActivationById(WebSiteActivationCode: string): Observable<any[]> {
    const params = new HttpParams().append('WebSiteActivationCode', WebSiteActivationCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetWebSiteActivationById", { headers: this.headers, params: params }))
  }


  DeleteWebSiteActivation(WebSiteActivationCode: string): Observable<any[]> {
    const params = new HttpParams().append('WebSiteActivationCode', WebSiteActivationCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteWebSiteActivation", { headers: this.headers, params: params }))
  }






}
