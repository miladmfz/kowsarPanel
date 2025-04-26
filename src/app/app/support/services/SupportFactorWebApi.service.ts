import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class SupportFactorWebApiService {

  constructor(private client: HttpClient) { }




  headers = new HttpHeaders()
    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') + "")





  kowsarWebUrl = environment.api_Url + "Support/";


  GetKowsarCustomer(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "GetKowsarCustomer", { SearchTarget }, { headers: this.headers })
  }


  GetGoodListSupport(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "GetGoodListSupport", { SearchTarget }, { headers: this.headers })
  }






  GetFactor(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "GetFactor", command, { headers: this.headers })
  }


  EditFactorProperty(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "EditFactorProperty", command, { headers: this.headers })
  }






  GetWebFactorSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetWebFactorSupport", { headers: this.headers, params: params })
  }


  GetWebFactorRowsSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetWebFactorRowsSupport", { headers: this.headers, params: params })
  }



  DeleteWebFactorRowsSupport(FactorRowCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorRowCode', FactorRowCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "DeleteWebFactorRowsSupport", { headers: this.headers, params: params })
  }
  DeleteWebFactorSupport(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.client.get<any[]>(this.kowsarWebUrl + "DeleteWebFactorSupport", { headers: this.headers, params: params })
  }


  GetObjectTypeFromDbSetup(ObjectType: string): Observable<any[]> {
    const params = new HttpParams().append('ObjectType', ObjectType)
    return this.client.get<any[]>(this.kowsarWebUrl + "GetObjectTypeFromDbSetup", { headers: this.headers, params: params })
  }

  GetTodeyFromServer(): Observable<any[]> {
    return this.client.get<any[]>(this.kowsarWebUrl + "GetTodeyFromServer", { headers: this.headers })
  }



  Support_StartFactorTime(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "Support_StartFactorTime", command, { headers: this.headers })
  }

  Support_EndFactorTime(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "Support_EndFactorTime", command, { headers: this.headers })
  }

  Support_ExplainFactor(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "Support_ExplainFactor", command, { headers: this.headers })
  }


  GetSupportFactors(command): Observable<any[]> {

    return this.client.post<any[]>(this.kowsarWebUrl + "GetSupportFactors", command, { headers: this.headers })

  }


  GetGridSchema(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)

    return this.client.get<any[]>(this.kowsarWebUrl + "GetGridSchema", { headers: this.headers, params: params })
  }

  WebSupportFactorInsert(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "WebSupportFactorInsert", command, { headers: this.headers })
  }

  WebSupportFactorInsertRow(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "WebSupportFactorInsertRow", command, { headers: this.headers })
  }


  WebFactorInsert(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "WebFactorInsert", command, { headers: this.headers })
  }

  WebFactorInsertRow(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "WebFactorInsertRow", command, { headers: this.headers })
  }


  GetSupportPanel(): Observable<any[]> {
    const params = new HttpParams().append('Where', 'aa')
    return this.client.get<any[]>(this.kowsarWebUrl + "GetSupportPanel", { headers: this.headers, params: params })
  }

  AttendanceDashboard(): Observable<any[]> {
    const params = new HttpParams()
    return this.client.get<any[]>(this.kowsarWebUrl + "AttendanceDashboard", { headers: this.headers, params: params })
  }



  AttendanceHistory(CentralRef: string): Observable<any[]> {
    const params = new HttpParams().append('CentralRef', CentralRef)
    return this.client.get<any[]>(this.kowsarWebUrl + "AttendanceHistory", { headers: this.headers, params: params })
  }


  ManualAttendance(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "ManualAttendance", command, { headers: this.headers })
  }


  AutLetterRowInsert(
    LetterRef: string,
    LetterDate: string,
    Description: string,
    LetterState: string,
    LetterPriority: string,
    CreatorCentral: string,
    ExecuterCentral: string
  ): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "AutLetterRowInsert", { LetterRef, LetterDate, Description, LetterState, LetterPriority, CreatorCentral, ExecuterCentral }, { headers: this.headers })
  }


  LetterInsert(
    LetterDate: string,
    title: string,
    Description: string,
    LetterState: string,
    LetterPriority: string,
    CentralRef: string
  ): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarWebUrl + "LetterInsert", { LetterDate, title, Description, LetterState, LetterPriority, CentralRef }, { headers: this.headers })
  }

  // GetProperty(Where: string): Observable<any[]> {
  //   const params = new HttpParams().append('Where', Where)
  //   return this.client.get<any[]>(this.kowsarWebUrl + "GetProperty", { headers: this.headers, params: params })
  // }


  // Good_Insert(command): Observable<any[]> {
  //   return this.client.post<any[]>(this.kowsarWebUrl + "GoodInsert", command, { headers: this.headers })
  // }


  // GetProperty(Where: string): Observable<any[]> {
  //   const params = new HttpParams().append('Where', Where)
  //   return this.client.get<any[]>(this.kowsarWebUrl + "GetProperty", { headers: this.headers, params: params })
  // }


}









