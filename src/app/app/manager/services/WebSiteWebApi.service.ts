import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';


@Injectable({
  providedIn: 'root'
})
export class WebSiteWebApiService {





  baseUrl: string;
  headers: HttpHeaders;

  constructor(private client: HttpClient, private config: AppConfigService) {
    this.baseUrl = this.config.apiUrl + 'SupportApp/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') ?? '');
  }







  ////////////////////////////////////////////////////////////////////

  // GetAppActivation(): Observable<any[]> {
  //   return this.client.get<any[]>(this.baseUrl + "GetAppActivation", { headers: this.headers });
  // }


  // GetAppActivationByCode(ActivationCode: string): Observable<any[]> {
  //   const params = new HttpParams().append('ActivationCode', ActivationCode)
  //   return this.client.get<any[]>(this.baseUrl + "GetAppActivationByCode", { headers: this.headers, params: params })
  // }

  WebSiteInsert(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "WebSiteInsert", command, { headers: this.headers })

  }

  WebSiteUpdate(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "WebSiteUpdate", command, { headers: this.headers })

  }

  GetWebSiteActivation(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GetWebSiteActivation", command, { headers: this.headers })

  }


  GetWebSiteActivationById(WebSiteActivationCode: string): Observable<any[]> {
    const params = new HttpParams().append('WebSiteActivationCode', WebSiteActivationCode)
    return this.client.get<any[]>(this.baseUrl + "GetWebSiteActivationById", { headers: this.headers, params: params })
  }



}
