import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class FactorWebApiService {

  constructor(private client: HttpClient) { }




  headers = new HttpHeaders()

    .set('content-type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') + "")

  kowsarWebUrl = environment.api_Url + "kowsarWeb/";



  GetObjectTypeFromDbSetup(ObjectType: string): Observable<any[]> {
    const params = new HttpParams().append('ObjectType', ObjectType)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetObjectTypeFromDbSetup", { params: params })
  }


  GetProperty(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetProperty", { params: params })
  }


  Good_Insert(command): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GoodInsert", command)
  }






}









