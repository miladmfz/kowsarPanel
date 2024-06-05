import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class KowsarWebApiService {

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

  Good_Update_base(command): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GoodUpdateBase", command)
  }

  Good_Update_Complete(command): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GoodUpdateComplete", command)
  }

  Good_Update_Units(command): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GoodUpdateUnits", command)
  }

  Good_Update_Relations(command): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GoodUpdateRelations", command)
  }




  GetGood_base(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodBase", { params: params })
  }

  GetGood_Explain(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodExplain", { params: params })
  }
  GetGood_Propertys(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodProperty", { params: params })
  }

  GetGood_Complete(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodComplete", { params: params })
  }

  GetGood_Units(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodUnits", { params: params })
  }

  GetGood_Relations(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodRelations", { params: params })
  }



  GetGood_Images(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodImages", { params: params })
  }

  GetGood_Groups(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodGroups", { params: params })
  }


  GetGood_Stacks(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetGoodStacks", { params: params })
  }





}









