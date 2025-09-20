import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class SupportFactorWebApiService {


  baseUrl: string;
  headers: HttpHeaders;

  constructor(private client: HttpClient, private config: AppConfigService) {
    this.baseUrl = this.config.apiUrl + 'Support/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') ?? '');
  }



  GetKowsarCustomer(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetKowsarCustomer", { SearchTarget }, { headers: this.headers })
  }



  GetKowsarCentral(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetKowsarCentral", { SearchTarget }, { headers: this.headers })
  }



  GetGoodListSupport(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetGoodListSupport", { SearchTarget }, { headers: this.headers })
  }





  GetTasks(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetTasks", command, { headers: this.headers })
  }

  InsertTask(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "InsertTask", command, { headers: this.headers })
  }

  UpdateTask(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "UpdateTask", command, { headers: this.headers })
  }

  DeleteTask(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "DeleteTask", command, { headers: this.headers })
  }


  GetFactor(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetFactor", command, { headers: this.headers })
  }


  EditFactorProperty(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "EditFactorProperty", command, { headers: this.headers })
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


  GetSupportFactors(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GetSupportFactors", command, { headers: this.headers })

  }


  GetGridSchema(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)

    return this.client.get<any[]>(this.baseUrl + "GetGridSchema", { headers: this.headers, params: params })
  }

  WebSupportFactorInsert(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "WebSupportFactorInsert", command, { headers: this.headers })
  }

  WebSupportFactorInsertRow(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "WebSupportFactorInsertRow", command, { headers: this.headers })
  }


  WebFactorInsert(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "WebFactorInsert", command, { headers: this.headers })
  }

  WebFactorInsertRow(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "WebFactorInsertRow", command, { headers: this.headers })
  }

  GetCustomerFactor(CustomerCode: string): Observable<any[]> {
    const params = new HttpParams().append('Where', CustomerCode)
    return this.client.get<any[]>(this.baseUrl + "GetCustomerFactor", { headers: this.headers, params: params })

  }


  GetSupportPanel(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetSupportPanel", command, { headers: this.headers })
  }
  GetAttendance_StatusDurations(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetAttendance_StatusDurations", command, { headers: this.headers })
  }


  AttendanceDashboard(): Observable<any[]> {
    const params = new HttpParams()
    return this.client.get<any[]>(this.baseUrl + "AttendanceDashboard", { headers: this.headers, params: params })
  }


  GetAutLetterListByPerson(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GetAutLetterListByPerson", command, { headers: this.headers })

  }


  AttendanceHistory(CentralRef: string): Observable<any[]> {
    const params = new HttpParams().append('CentralRef', CentralRef)
    return this.client.get<any[]>(this.baseUrl + "AttendanceHistory", { headers: this.headers, params: params })
  }


  ManualAttendance(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "ManualAttendance", command, { headers: this.headers })
  }

  SendSmsAutLetter(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "SendSmsAutLetter", command, { headers: this.headers })
  }



  AutLetterRowInsert0(
    LetterRef: string,
    LetterDate: string,
    Description: string,
    LetterState: string,
    LetterPriority: string,
    CreatorCentral: string,
    ExecuterCentral: string
  ): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "AutLetterRowInsert", { LetterRef, LetterDate, Description, LetterState, LetterPriority, CreatorCentral, ExecuterCentral }, { headers: this.headers })
  }


  LetterInsert0(
    LetterDate: string,
    title: string,
    Description: string,
    LetterState: string,
    LetterPriority: string,
    CentralRef: string,
    InOutFlag: string,

  ): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "LetterInsert", { LetterDate, title, Description, LetterState, LetterPriority, CentralRef, InOutFlag }, { headers: this.headers })
  }


  AutLetterRowInsert(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "AutLetterRowInsert", command, { headers: this.headers })

  }





  LetterInsert(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "LetterInsert", command, { headers: this.headers })

  }




  GetGood_base(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.client.get<any[]>(this.baseUrl + "GetGoodBase", { headers: this.headers, params: params })
  }



  GetLastGoodData(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetLastGoodData", { headers: this.headers })
  }


  GoodCrudService(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GoodCrudService", command, { headers: this.headers })

  }

  GetSimilarGood(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.baseUrl + "GetSimilarGood", { headers: this.headers, params: params })

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









