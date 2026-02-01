import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class GoodsGrpWebApiService {


  baseUrl: string;
  headers: HttpHeaders;


  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  constructor() {
    this.baseUrl = this.config.apiUrl + 'KowsarWeb/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PIC', sessionStorage.getItem('PersonInfoRef') ?? '')
      .set('SessionId', sessionStorage.getItem('SessionId') ?? '')
      .set('UserName', encodeURIComponent(sessionStorage.getItem('UserName') ?? ''));
  }


  GetGoodsGrp(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetGoodsGrp", command, { headers: this.headers })
  }

  GetReportsByCode(ReportCode: string): Observable<any[]> {
    const params = new HttpParams().append('ReportCode', ReportCode)
    return this.client.get<any[]>(this.baseUrl + "GetReportsByCode", { headers: this.headers, params: params })
  }



  /*
    GetKowsarCustomer(command): Observable<any[]> {
      return this.client.post<any[]>(this.baseUrl + "GetKowsarCustomer", command, { headers: this.headers })
    }
  
  
  
    DeleteWebPreFactorRows(FactorRowCode: string): Observable<any[]> {
      const params = new HttpParams().append('PreFactorRowCode', FactorRowCode)
      return this.client.get<any[]>(this.baseUrl + "DeleteWebPreFactorRows", { headers: this.headers, params: params })
    }
      */















}









