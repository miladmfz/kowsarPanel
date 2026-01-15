import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class DbSetupWebApiService {


  baseUrl: string;
  headers: HttpHeaders;

  constructor(private client: HttpClient, private config: AppConfigService) {
    this.baseUrl = this.config.apiUrl + 'KowsarWeb/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') ?? '');
  }


  GetDbSetup(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetDbSetup", command, { headers: this.headers })
  }

  GetReportsByCode(ReportCode: string): Observable<any[]> {
    const params = new HttpParams().append('ReportCode', ReportCode)
    return this.client.get<any[]>(this.baseUrl + "GetReportsByCode", { headers: this.headers, params: params })
  }


  UpdateDbSetup(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "UpdateDbSetup", command, { headers: this.headers })
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









