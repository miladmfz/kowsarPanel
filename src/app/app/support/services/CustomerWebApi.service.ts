import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';


@Injectable({
  providedIn: 'root'
})
export class CustomerWebApiService {



  baseUrl: string;
  headers: HttpHeaders;

  constructor(private client: HttpClient, private config: AppConfigService) {
    this.baseUrl = this.config.apiUrl + 'Support/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') ?? '');
  }




  GetKowsarCustomer(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetKowsarCustomer", { SearchTarget }, { headers: this.headers })
  }





  EditCustomerProperty(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "EditCustomerProperty", command, { headers: this.headers })
  }


  EditCustomerExplain(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "EditCustomerExplain", command, { headers: this.headers })
  }


  GetCustomerFactor(CustomerCode: string): Observable<any[]> {
    const params = new HttpParams().append('Where', CustomerCode)
    return this.client.get<any[]>(this.baseUrl + "GetCustomerFactor", { headers: this.headers, params: params })

  }

  GetWebFactorRowsSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.client.get<any[]>(this.baseUrl + "GetWebFactorRowsSupport", { headers: this.headers, params: params })
  }



  AttendanceDashboard(): Observable<any[]> {
    const params = new HttpParams()
    return this.client.get<any[]>(this.baseUrl + "AttendanceDashboard", { headers: this.headers, params: params })
  }


  ManualAttendance(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "ManualAttendance", command, { headers: this.headers })
  }





}
