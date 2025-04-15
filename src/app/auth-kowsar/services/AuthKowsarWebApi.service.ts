import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthKowsarWebApiService {

  constructor(private client: HttpClient) { }

  kowsarweb_baseUrl = environment.api_Url + "Support/";

  headers = new HttpHeaders()

    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('UserGuid', "X")




  ////////////////////////////////////////////////////////////////////



  IsUser(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarweb_baseUrl + "IsUser", command, { headers: this.headers });
  }


  ManualAttendance(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarweb_baseUrl + "ManualAttendance", command, { headers: this.headers })
  }




}
