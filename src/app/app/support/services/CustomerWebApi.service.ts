import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';


@Injectable({
  providedIn: 'root'
})
export class CustomerWebApiService {

  constructor(private client: HttpClient) { }

  kowsarweb_baseUrl = environment.api_Url + "Support/";


  headers = new HttpHeaders()

    .set('content-type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') + "")



  GetKowsarCustomer(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarweb_baseUrl + "GetKowsarCustomer", { SearchTarget })
  }





  EditCustomerProperty(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarweb_baseUrl + "EditCustomerProperty", command)
  }


  EditCustomerExplain(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarweb_baseUrl + "EditCustomerExplain", command)
  }

}
