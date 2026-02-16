import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class CustomerWebApiService {



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




  GetKowsarCustomer(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetKowsarCustomer", command, { headers: this.headers }))
  }





  EditCustomerProperty(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "EditCustomerProperty", command, { headers: this.headers }))
  }


  EditCustomerExplain(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "EditCustomerExplain", command, { headers: this.headers }))
  }


  GetCustomerFactor(CustomerCode: string): Observable<any[]> {
    const params = new HttpParams().append('Where', CustomerCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetCustomerFactor", { headers: this.headers, params: params }))

  }

  GetWebFactorRowsSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetWebFactorRowsSupport", { headers: this.headers, params: params }))
  }



  AttendanceDashboard(): Observable<any[]> {
    const params = new HttpParams()
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "AttendanceDashboard", { headers: this.headers, params: params }))
  }


  ManualAttendance(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "ManualAttendance", command, { headers: this.headers }))
  }


  GetCustomerByCode(CustomerCode: string): Observable<any[]> {
    const params = new HttpParams().append('CustomerCode', CustomerCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetCustomerByCode", { headers: this.headers, params: params }))
  }


  GetCity(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetCity", command, { headers: this.headers }))
  }




  CustomerCrud(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerCrud", command, { headers: this.headers }))
  }




}
