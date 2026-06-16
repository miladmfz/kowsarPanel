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
export class WebSiteWebApiService {





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
    this.baseUrl = this.config.apiUrl + 'SupportApp/';


  }



  WebSiteInsert(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WebSiteInsert", command, { headers: this.headerService.headers }))

  }

  WebSiteUpdate(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WebSiteUpdate", command, { headers: this.headerService.headers }))

  }

  GetWebSiteActivation(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetWebSiteActivation", command, { headers: this.headerService.headers }))

  }


  GetWebSiteActivationById(WebSiteActivationCode: string): Observable<any[]> {
    const params = new HttpParams().append('WebSiteActivationCode', WebSiteActivationCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetWebSiteActivationById", { headers: this.headerService.headers, params: params }))
  }


  DeleteWebSiteActivation(WebSiteActivationCode: string): Observable<any[]> {
    const params = new HttpParams().append('WebSiteActivationCode', WebSiteActivationCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteWebSiteActivation", { headers: this.headerService.headers, params: params }))
  }


  GetModuleValue(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetModuleValue", command, { headers: this.headerService.headers }))
  }


  GetModuleValueByConfigName(ConfigName: string): Observable<any[]> {
    const params = new HttpParams().append('ConfigName', ConfigName)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetModuleValueByConfigName", { headers: this.headerService.headers, params: params }))
  }


  GetRssBySource(name: string): Observable<any[]> {
    const params = new HttpParams().append('name', name)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetRssBySource", { headers: this.headerService.headers, params: params }))
  }



}
