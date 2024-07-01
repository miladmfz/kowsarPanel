import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';


@Injectable({
  providedIn: 'root'
})
export class EducationWebApiService {

  constructor(private client: HttpClient) { }

  baseUrl = environment.api_Url + "Support/";

  headers = new HttpHeaders()

    .set('content-type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('UserGuid', sessionStorage.getItem('UserGuid') + "")




  ////////////////////////////////////////////////////////////////////


  GetTodeyFromServer(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer")
  }



  KowsarAttachUrl(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "KowsarAttachUrl", { SearchTarget })
  }



}
