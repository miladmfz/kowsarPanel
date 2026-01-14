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





  GetKowsarCustomer(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetKowsarCustomer", command, { headers: this.headers })
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

  UpdateFactorInvoiceState(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "UpdateFactorInvoiceState", command, { headers: this.headers })
  }

  UpdatePreFactorPFState(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "UpdatePreFactorPFState", command, { headers: this.headers })
  }



  WebFactorInsertRow(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "WebFactorInsertRow", command, { headers: this.headers })
  }

  WebFactorUpdateRow(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "WebFactorUpdateRow", command, { headers: this.headers })
  }



  DeleteWebFactorRows(FactorRowCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorRowCode', FactorRowCode)
    return this.client.get<any[]>(this.baseUrl + "DeleteWebFactorRows", { headers: this.headers, params: params })
  }
  DeleteWebFactor(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('FactorCode', FactorCode)
    return this.client.get<any[]>(this.baseUrl + "DeleteWebFactor", { headers: this.headers, params: params })
  }

  DeleteWebPreFactorRows(FactorRowCode: string): Observable<any[]> {
    const params = new HttpParams().append('PreFactorRowCode', FactorRowCode)
    return this.client.get<any[]>(this.baseUrl + "DeleteWebPreFactorRows", { headers: this.headers, params: params })
  }
  DeleteWebPreFactor(FactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('PreFactorCode', FactorCode)
    return this.client.get<any[]>(this.baseUrl + "DeleteWebPreFactor", { headers: this.headers, params: params })
  }





  GetObjectTypeFromDbSetup(ObjectType: string): Observable<any[]> {
    const params = new HttpParams().append('ObjectType', ObjectType)
    return this.client.get<any[]>(this.baseUrl + "GetObjectTypeFromDbSetup", { headers: this.headers, params: params })
  }

  GetTodeyFromServer(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer", { headers: this.headers })
  }



  GetFactors(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GetFactors", { headers: this.headers })

  }


  GetGridSchema(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)

    return this.client.get<any[]>(this.baseUrl + "GetGridSchema", { headers: this.headers, params: params })
  }





  GetWebFactor(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GetWebFactor", command, { headers: this.headers })

  }
  GetWebFactorRows(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GetWebFactorRows", command, { headers: this.headers })

  }

  AutLetterRowInsert(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "AutLetterRowInsert", command, { headers: this.headers })

  }

  LetterInsert(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "LetterInsert", command, { headers: this.headers })

  }


  GetCustomerById(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetCustomerById", command, { headers: this.headers })
  }

  GetCentralByCode(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetCentralByCode", command, { headers: this.headers })
  }



  GetAutLetterList(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GetAutLetterList", command, { headers: this.headers })

  }

  GetAutLetterListByPerson(command): Observable<any[]> {

    return this.client.post<any[]>(this.baseUrl + "GetAutLetterListByPerson", command, { headers: this.headers })

  }


  GetCentralUser(
  ): Observable<any[]> {
    const params = new HttpParams()
    return this.client.get<any[]>(this.baseUrl + "GetCentralUser", { headers: this.headers });
  }

}









