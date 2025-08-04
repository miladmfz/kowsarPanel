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

  GetAppActivation(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetAppActivation", { headers: this.headers });
  }


  GetAppActivationByCode(ActivationCode: string): Observable<any[]> {
    const params = new HttpParams().append('ActivationCode', ActivationCode)
    return this.client.get<any[]>(this.baseUrl + "GetAppActivationByCode", { headers: this.headers, params: params })
  }

  GetAppLogReport(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GetAppLogReport", command, { headers: this.headers })

  }




  CrudAppActivation(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "CrudAppActivation", command, { headers: this.headers })
  }

  CheckPort(
    Ip: string,
    Port: string,
  ): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "CheckPort", { Ip, Port }, { headers: this.headers })
  }





  GetActiveApplication(): Observable<any[]> {
    const params = new HttpParams().append('Filter', "6")
    return this.client.get<any[]>(this.baseUrl + "GetActiveApplication", { headers: this.headers, params: params })
  }


  GetWebLog(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetWebLog", { headers: this.headers });
  }


}
