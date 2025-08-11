import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class FactorWebApiService {


  baseUrl: string;
  headers: HttpHeaders;

  constructor(private client: HttpClient, private config: AppConfigService) {
    this.baseUrl = this.config.apiUrl + 'KowsarWeb/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') ?? '');
  }







  GetKowsarCustomer(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetKowsarCustomer", { SearchTarget }, { headers: this.headers })
  }


  GetGoodListSupport(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetGoodListSupport", { SearchTarget }, { headers: this.headers })
  }






  GetFactor(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetFactor", command, { headers: this.headers })
  }


  EditFactorProperty(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "EditFactorProperty", command, { headers: this.headers })
  }
  WebFactorInsert(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "WebFactorInsert", command, { headers: this.headers })
  }

  WebFactorInsertRow(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "WebFactorInsertRow", command, { headers: this.headers })
  }




  GetWebFactorSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.client.get<any[]>(this.baseUrl + "GetWebFactorSupport", { headers: this.headers, params: params })
  }


  GetWebFactorRowsSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.client.get<any[]>(this.baseUrl + "GetWebFactorRowsSupport", { headers: this.headers, params: params })
  }



  DeleteWebFactorRowsSupport(FactorRowCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorRowCode', FactorRowCode)
    return this.client.get<any[]>(this.baseUrl + "DeleteWebFactorRowsSupport", { headers: this.headers, params: params })
  }
  DeleteWebFactorSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.client.get<any[]>(this.baseUrl + "DeleteWebFactorSupport", { headers: this.headers, params: params })
  }


  GetObjectTypeFromDbSetup(ObjectType: string): Observable<any[]> {
    const params = new HttpParams().append('ObjectType', ObjectType)
    return this.client.get<any[]>(this.baseUrl + "GetObjectTypeFromDbSetup", { headers: this.headers, params: params })
  }

  GetTodeyFromServer(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer", { headers: this.headers })
  }



  Support_StartFactorTime(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "Support_StartFactorTime", command, { headers: this.headers })
  }

  Support_EndFactorTime(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "Support_EndFactorTime", command, { headers: this.headers })
  }

  Support_ExplainFactor(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "Support_ExplainFactor", command, { headers: this.headers })
  }


  GetFactors(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GetFactors", { headers: this.headers })

  }


  GetGridSchema(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)

    return this.client.get<any[]>(this.baseUrl + "GetGridSchema", { headers: this.headers, params: params })
  }



  // GetProperty(Where: string): Observable<any[]> {
  //   const params = new HttpParams().append('Where', Where)
  //   return this.client.get<any[]>(this.baseUrl + "GetProperty", { headers: this.headers, params: params })
  // }


  // Good_Insert(command): Observable<any[]> {
  //   return this.client.post<any[]>(this.baseUrl + "GoodInsert", command, { headers: this.headers })
  // }


  // GetProperty(Where: string): Observable<any[]> {
  //   const params = new HttpParams().append('Where', Where)
  //   return this.client.get<any[]>(this.baseUrl + "GetProperty", { headers: this.headers, params: params })
  // }


}









