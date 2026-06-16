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
export class CustomerWebApiService {



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
    this.baseUrl = this.config.apiUrl + 'InternalCustomer/';


  }



  EditCustomerProperty(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "EditCustomerProperty", command, { headers: this.headerService.headers }))
  }




  GetCustomerFactor(CustomerCode: string): Observable<any[]> {
    const params = new HttpParams().append('Where', CustomerCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetCustomerFactor", { headers: this.headerService.headers, params: params }))

  }

  GetWebFactorRowsSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetWebFactorRowsSupport", { headers: this.headerService.headers, params: params }))
  }



  GetCustomerReport(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetCustomerReport", command, { headers: this.headerService.headers }))
  }







  GetCustomerByCode(CustomerCode: string): Observable<any[]> {
    const params = new HttpParams().append('CustomerCode', CustomerCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetCustomerByCode", { headers: this.headerService.headers, params: params }))
  }


  GetCity(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetCity", command, { headers: this.headerService.headers }))
  }




  CustomerCrud(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerCrud", command, { headers: this.headerService.headers }))
  }




}
