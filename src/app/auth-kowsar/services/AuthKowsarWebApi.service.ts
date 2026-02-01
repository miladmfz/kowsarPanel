import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';


@Injectable({
  providedIn: 'root'
})
export class AuthKowsarWebApiService {


  baseUrl: string;
  headers: HttpHeaders;


  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  constructor() {
    this.baseUrl = this.config.apiUrl + 'Support/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PIC', sessionStorage.getItem('PersonInfoRef') ?? '')
      .set('SessionId', sessionStorage.getItem('SessionId') ?? '')
      .set('UserName', encodeURIComponent(sessionStorage.getItem('UserName') ?? ''));
  }



  ////////////////////////////////////////////////////////////////////



  IsUser(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "IsUser", command, { headers: this.headers });
  }


  ManualAttendance(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "ManualAttendance", command, { headers: this.headers })
  }




}



