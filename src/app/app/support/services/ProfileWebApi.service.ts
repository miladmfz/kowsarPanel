import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';


@Injectable({
  providedIn: 'root'
})
export class ProfileWebApiService {



  baseUrl: string;
  headers: HttpHeaders;

  constructor(private client: HttpClient, private config: AppConfigService) {
    this.baseUrl = this.config.apiUrl + 'Support/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') ?? '');
  }





  ////////////////////////////////////////////////////////////////////



  GetKowsarPersonInfo(PersonInfoCode: string): Observable<any[]> {
    const params = new HttpParams().append('PersonInfoCode', PersonInfoCode)
    return this.client.get<any[]>(this.baseUrl + "GetKowsarPersonInfo", { headers: this.headers, params: params })
  }


  UpdatePersonInfo(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "UpdatePersonInfo", command, { headers: this.headers })
  }




}
