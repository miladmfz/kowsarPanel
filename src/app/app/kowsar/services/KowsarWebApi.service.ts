import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class KowsarWebApiService {

  constructor(private client: HttpClient) { }


  baseUrl = environment.baseUrl;
  kowsarWebUrl = environment.api_Url + "kowsarWeb/";

  headers = new HttpHeaders()

    .set('content-type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('UserGuid', sessionStorage.getItem('UserGuid') + "")



  GetOrdergroupList(GroupCode: string): Observable<any[]> {
    const params = new HttpParams().append('GroupCode', GroupCode)
    return this.client.get<any[]>(this.baseUrl + "GetOrdergroupList", { params: params })
  }


  GetOrderGoodList(RowCount: string, Where: string, GroupCode: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetOrderGoodList", { RowCount, Where, GroupCode })
  }

  kowsar_info(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.baseUrl + "kowsar_info", { params: params })
  }

  GetGoodEdit(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.baseUrl + "GetGoodEdit", { params: params })
  }



  GetGroupFromGood(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.baseUrl + "GetGroupFromGood", { params: params })
  }



  GetGoodFromGroup(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.baseUrl + "GetGoodFromGroup", { params: params })
  }


  Web_InsertGood(GoodCode: string, GoodName: string, MaxSellPrice: string, GoodExplain1: string, GoodExplain2: string, GoodExplain3: string, GoodExplain4: string, GoodExplain5: string, GoodExplain6: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "Web_InsertGood", { GoodCode, GoodName, MaxSellPrice, GoodExplain1, GoodExplain2, GoodExplain3, GoodExplain4, GoodExplain5, GoodExplain6 })
  }


  Web_UpdateGoodDetail(GoodCode: string, GoodName: string, MaxSellPrice: string, GoodExplain1: string, GoodExplain2: string, GoodExplain3: string, GoodExplain4: string, GoodExplain5: string, GoodExplain6: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "Web_UpdateGoodDetail", { GoodCode, GoodName, MaxSellPrice, GoodExplain1, GoodExplain2, GoodExplain3, GoodExplain4, GoodExplain5, GoodExplain6 })
  }

  DeleteGoodGroupCode(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.baseUrl + "DeleteGoodGroupCode", { params: params })
  }

  ChangeGoodActive(GoodCode: string, ActiveFlag: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode).append('ActiveFlag', ActiveFlag)
    return this.client.get<any[]>(this.baseUrl + "ChangeGoodActive", { params: params })
  }

  GetActiveGood(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.baseUrl + "GetActiveGood", { params: params })
  }




















  ///////////////////////////////////////////////////////////////






  GetObjectTypeFromDbSetup(ObjectType: string): Observable<any[]> {
    const params = new HttpParams().append('ObjectType', ObjectType)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetObjectTypeFromDbSetup", { params: params })
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







}









