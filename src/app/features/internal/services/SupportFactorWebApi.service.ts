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
export class SupportFactorWebApiService {


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
    this.baseUrl = this.config.apiUrl + 'InternalFactor/';


  }







  GetGoodListSupport(SearchTarget: string): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetGoodListSupport", { SearchTarget }, { headers: this.headerService.headers }))
  }





  GetTasks(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetTasks", command, { headers: this.headerService.headers }))
  }

  InsertTask(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "InsertTask", command, { headers: this.headerService.headers }))
  }

  UpdateTask(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "UpdateTask", command, { headers: this.headerService.headers }))
  }

  DeleteTask(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "DeleteTask", command, { headers: this.headerService.headers }))
  }
  DeleteTaskAll(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "DeleteTaskAll", command, { headers: this.headerService.headers }))
  }

  GetFactor(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetFactor", command, { headers: this.headerService.headers }))
  }


  EditFactorProperty(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "EditFactorProperty", command, { headers: this.headerService.headers }))
  }



  GetWebFactorSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetWebFactorSupport", { headers: this.headerService.headers, params: params }))
  }


  GetWebFactorRowsSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetWebFactorRowsSupport", { headers: this.headerService.headers, params: params }))
  }



  DeleteWebFactorRowsSupport(FactorRowCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorRowCode', FactorRowCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteWebFactorRowsSupport", { headers: this.headerService.headers, params: params }))
  }
  DeleteWebFactorSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteWebFactorSupport", { headers: this.headerService.headers, params: params }))
  }

  Support_StartFactorTime(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "Support_StartFactorTime", command, { headers: this.headerService.headers }))
  }

  Support_EndFactorTime(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "Support_EndFactorTime", command, { headers: this.headerService.headers }))
  }

  Support_ExplainFactor(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "Support_ExplainFactor", command, { headers: this.headerService.headers }))
  }


  GetAllInternalFactor(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetAllInternalFactor", command, { headers: this.headerService.headers }))

  }

  WebSupportFactorInsert(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WebSupportFactorInsert", command, { headers: this.headerService.headers }))
  }

  WebSupportFactorInsertRow(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WebSupportFactorInsertRow", command, { headers: this.headerService.headers }))
  }


  WebFactorInsert(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WebFactorInsert", command, { headers: this.headerService.headers }))
  }

  WebFactorInsertRow(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WebFactorInsertRow", command, { headers: this.headerService.headers }))
  }

  GetCustomerFactor(CustomerCode: string): Observable<any[]> {
    const params = new HttpParams().append('Where', CustomerCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetCustomerFactor", { headers: this.headerService.headers, params: params }))

  }


  GetSupportPanel(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetSupportPanel", command, { headers: this.headerService.headers }))
  }




  GetGood_base(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGoodBase", { headers: this.headerService.headers, params: params }))
  }



  GetLastGoodData(): Observable<any[]> {
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetLastGoodData", { headers: this.headerService.headers }))
  }


  GoodCrudService(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodCrudService", command, { headers: this.headerService.headers }))

  }

  GetSimilarGood(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetSimilarGood", { headers: this.headerService.headers, params: params }))

  }




  GetCustomerById(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetCustomerById", command, { headers: this.headerService.headers }))
  }


  GetAutLetterList(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetAutLetterList", command, { headers: this.headerService.headers }))

  }



}









