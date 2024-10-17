import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';


@Injectable({
  providedIn: 'root'
})
export class ProfileWebApiService {

  constructor(private client: HttpClient) { }

  baseUrl = environment.api_Url + "Support/";

  headers = new HttpHeaders()

    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') + "")




  ////////////////////////////////////////////////////////////////////



  GetKowsarPersonInfo(PersonInfoCode: string): Observable<any[]> {
    const params = new HttpParams().append('PersonInfoCode', PersonInfoCode)
    return this.client.get<any[]>(this.baseUrl + "GetKowsarPersonInfo", { headers: this.headers, params: params })
  }


  UpdatePersonInfo(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "UpdatePersonInfo", command, { headers: this.headers })
  }




}
