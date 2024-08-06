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





  kowsarWebUrl = environment.api_Url + "Support/";


  GetKowsarCustomer(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "GetKowsarCustomer", { SearchTarget })
  }


  GetGoodListSupport(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "GetGoodListSupport", { SearchTarget })
  }






  GetFactor(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "GetFactor", command)
  }


  EditFactorProperty(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "EditFactorProperty", command)
  }
  WebFactorInsert(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "WebFactorInsert", command)
  }

  WebFactorInsertRow(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "WebFactorInsertRow", command)
  }




  GetWebFactorSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetWebFactorSupport", { params: params })
  }


  GetWebFactorRowsSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetWebFactorRowsSupport", { params: params })
  }



  DeleteWebFactorRowsSupport(FactorRowCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorRowCode', FactorRowCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "DeleteWebFactorRowsSupport", { params: params })
  }
  DeleteWebFactorSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "DeleteWebFactorSupport", { params: params })
  }


  GetObjectTypeFromDbSetup(ObjectType: string): Observable<any[]> {
    const params = new HttpParams().append('ObjectType', ObjectType)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetObjectTypeFromDbSetup", { params: params })
  }

  GetTodeyFromServer(): Observable<any[]> {
    return this.client.get<any[]>(this.kowsarWebUrl + "GetTodeyFromServer",)
  }



  Support_StartFactorTime(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "Support_StartFactorTime", command)
  }

  Support_EndFactorTime(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "Support_EndFactorTime", command)
  }

  Support_ExplainFactor(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "Support_ExplainFactor", command)
  }

  // GetProperty(Where: string): Observable<any[]> {
  //   const params = new HttpParams().append('Where', Where)
  //   return this.client.get<any[]>(this.kowsarWebUrl + "GetProperty", { params: params })
  // }


  // Good_Insert(command): Observable<any[]> {
  //   return this.client.post<any[]>(this.kowsarWebUrl + "GoodInsert", command)
  // }


  // GetProperty(Where: string): Observable<any[]> {
  //   const params = new HttpParams().append('Where', Where)
  //   return this.client.get<any[]>(this.kowsarWebUrl + "GetProperty", { params: params })
  // }


}









