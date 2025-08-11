import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';


@Injectable({
  providedIn: 'root'
})
export class AuthKowsarWebApiService {



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



  IsUser(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "IsUser", command, { headers: this.headers });
  }


  ManualAttendance(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "ManualAttendance", command, { headers: this.headers })
  }




}
