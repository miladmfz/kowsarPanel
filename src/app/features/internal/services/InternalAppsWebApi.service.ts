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
export class InternalAppsWebApiService {



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




  ////////////////////////////////////////////////////////////////////

  GetAppActivation(): Observable<any[]> {
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetAppActivation", { headers: this.headerService.headers }))
  }


  GetAppActivationByCode(ActivationCode: string): Observable<any[]> {
    const params = new HttpParams().append('ActivationCode', ActivationCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetAppActivationByCode", { headers: this.headerService.headers, params: params }))
  }

  GetAppLogReport(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetAppLogReport", command, { headers: this.headerService.headers }))

  }




  CrudAppActivation(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CrudAppActivation", command, { headers: this.headerService.headers }))
  }

  CheckPort(
    Ip: string,
    Port: string,
  ): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CheckPort", { Ip, Port }, { headers: this.headerService.headers }))
  }



  GetActiveApplication(): Observable<any[]> {
    const params = new HttpParams().append('Filter', "6")
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetActiveApplication", { headers: this.headerService.headers, params: params }))
  }

  DeleteAppActivation(AppActivationCode: string): Observable<any[]> {
    const params = new HttpParams().append('AppActivationCode', AppActivationCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteAppActivation", { headers: this.headerService.headers, params: params }))
  }




  GetModuleConfig(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetModuleConfig", command, { headers: this.headerService.headers }))
  }



  GetModuleValue(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetModuleValue", command, { headers: this.headerService.headers }))
  }



  ModuleConfigInsert(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "ModuleConfigInsert", command, { headers: this.headerService.headers }))
  }



  ModuleValueInsert(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "ModuleValueInsert", command, { headers: this.headerService.headers }))
  }


  DeleteModuleValue(ModuleValueCode: string): Observable<any[]> {
    const params = new HttpParams().append('ModuleValueCode', ModuleValueCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteModuleValue", { headers: this.headerService.headers, params: params }))
  }






}
