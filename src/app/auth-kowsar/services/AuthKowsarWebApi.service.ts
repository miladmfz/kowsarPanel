import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';


@Injectable({
  providedIn: 'root'
})
export class AuthKowsarWebApiService {

  constructor(private client: HttpClient) { }

  baseUrl = environment.api_Url + "Support/";

  headers = new HttpHeaders()

    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('UserGuid', "X")




  ////////////////////////////////////////////////////////////////////



  IsUser(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "IsUser", command, { headers: this.headers });
  }






}
