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
export class FactorWebApiService {


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
    this.baseUrl = this.config.apiUrl + 'Factor/';


  }





  GetWebFactor(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetWebFactor", command, { headers: this.headerService.headers }))

  }

  GetWebFactorRows(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetWebFactorRows", command, { headers: this.headerService.headers }))

  }





  UpdateFactorInvoiceState(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "UpdateFactorInvoiceState", command, { headers: this.headerService.headers }))
  }

  WebFactorUpdateRow(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WebFactorUpdateRow", command, { headers: this.headerService.headers }))
  }

  WebFactorInsert(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WebFactorInsert", command, { headers: this.headerService.headers }))
  }

  WebFactorInsertRow(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "WebFactorInsertRow", command, { headers: this.headerService.headers }))
  }

  DeleteWebFactorRows(FactorRowCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorRowCode', FactorRowCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteWebFactorRows", { headers: this.headerService.headers, params: params }))
  }
  DeleteWebFactor(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteWebFactor", { headers: this.headerService.headers, params: params }))
  }


  GetGoodListSupport(SearchTarget: string): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetGoodListSupport", { SearchTarget }, { headers: this.headerService.headers }))
  }



  GetCustomerById(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetCustomerById", command, { headers: this.headerService.headers }))
  }


  GetAutLetterList(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetAutLetterList", command, { headers: this.headerService.headers }))

  }




  GetFactor(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetFactor", command, { headers: this.headerService.headers }))
  }




}









