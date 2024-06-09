import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';


@Injectable({
  providedIn: 'root'
})
export class CentralWebApiService {

  constructor(private client: HttpClient) { }

  kowsarweb_baseUrl = environment.api_Url + "Support/";


  headers = new HttpHeaders()

    .set('content-type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') + "")



  GetKowsarCentral(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarweb_baseUrl + "GetKowsarCentral", { SearchTarget })
  }


  GetCentralById(CentralCode: string): Observable<any[]> {
    const params = new HttpParams().append('CentralCode', CentralCode)
    return this.client.get<any[]>(this.kowsarweb_baseUrl + "GetCentralById", { params: params })

  }

  SendImageToServer(command): Observable<any[]> {
    return this.client.post<any[]>(this.kowsarweb_baseUrl + "UploadImage", command)
  }

  GetImageFromServer(ObjectRef: string): Observable<any[]> {
    const params = new HttpParams().append('pixelScale', '300').append('ClassName', 'Central').append('ObjectRef', ObjectRef)
    return this.client.get<any[]>(this.kowsarweb_baseUrl + "GetWebImagess", { params: params })

  }


}
