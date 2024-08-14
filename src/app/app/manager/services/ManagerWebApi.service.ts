import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';


@Injectable({
  providedIn: 'root'
})
export class ManagerWebApiService {

  constructor(private client: HttpClient) { }

  baseUrl = environment.api_Url + "SupportApp/";


  headers = new HttpHeaders()

    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') + "")




  ////////////////////////////////////////////////////////////////////

  GetAppBrokerCustomer(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetAppBrokerCustomer", { headers: this.headers });
  }


  GetAppBrokerCustomerByCode(AppBrokerCustomerCode: string): Observable<any[]> {
    const params = new HttpParams().append('AppBrokerCustomerCode', AppBrokerCustomerCode)
    return this.client.get<any[]>(this.baseUrl + "GetAppBrokerCustomerByCode", { headers: this.headers, params: params })
  }

  InsertAppBrokerCustomer(
    ActivationCode: string,
    EnglishCompanyName: string,
    PersianCompanyName: string,
    ServerURL: string,
    SQLiteURL: string,
    MaxDevice: string,
    SecendServerURL: string,
    DbName: string,
    AppType: string
  ): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "InsertAppBrokerCustomer", { ActivationCode, EnglishCompanyName, PersianCompanyName, ServerURL, SQLiteURL, MaxDevice, SecendServerURL, DbName, AppType }, { headers: this.headers })

  }


  UpdateAppBrokerCustomer(
    ActivationCode: string,
    EnglishCompanyName: string,
    PersianCompanyName: string,
    ServerURL: string,
    SQLiteURL: string,
    MaxDevice: string,
    SecendServerURL: string,
    DbName: string,
    AppType: string
  ): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "UpdateAppBrokerCustomer", { ActivationCode, EnglishCompanyName, PersianCompanyName, ServerURL, SQLiteURL, MaxDevice, SecendServerURL, DbName, AppType }, { headers: this.headers })
  }



  GetActiveApplication(): Observable<any[]> {
    const params = new HttpParams().append('Filter', "6")
    return this.client.get<any[]>(this.baseUrl + "GetActiveApplication", { headers: this.headers, params: params })
  }


  GetWebLog(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetWebLog", { headers: this.headers });
  }


}
