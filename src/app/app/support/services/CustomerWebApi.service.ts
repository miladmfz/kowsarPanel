import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';


@Injectable({
  providedIn: 'root'
})
export class CustomerWebApiService {

  constructor(private client: HttpClient) { }

  kowsarweb_baseUrl = environment.api_Url + "Support/";


  headers = new HttpHeaders()

    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') + "")



  GetKowsarCustomer(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarweb_baseUrl + "GetKowsarCustomer", { SearchTarget }, { headers: this.headers })
  }





  EditCustomerProperty(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarweb_baseUrl + "EditCustomerProperty", command, { headers: this.headers })
  }


  EditCustomerExplain(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarweb_baseUrl + "EditCustomerExplain", command, { headers: this.headers })
  }


  GetCustomerFactor(CustomerCode: string): Observable<any[]> {
    const params = new HttpParams().append('Where', CustomerCode)
    return this.client.get<any[]>(this.kowsarweb_baseUrl + "GetCustomerFactor", { headers: this.headers, params: params })

  }

  GetWebFactorRowsSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.client.get<any[]>(this.kowsarweb_baseUrl + "GetWebFactorRowsSupport", { headers: this.headers, params: params })
  }



  AttendanceDashboard(): Observable<any[]> {
    const params = new HttpParams()
    return this.client.get<any[]>(this.kowsarweb_baseUrl + "AttendanceDashboard", { headers: this.headers, params: params })
  }


  ManualAttendance(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarweb_baseUrl + "ManualAttendance", command, { headers: this.headers })
  }





}
