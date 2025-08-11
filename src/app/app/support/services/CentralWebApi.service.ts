import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';


@Injectable({
  providedIn: 'root'
})
export class CentralWebApiService {


  baseUrl: string;
  kowsarWebUrl: string;
  headers: HttpHeaders;

  constructor(private client: HttpClient, private config: AppConfigService) {
    this.baseUrl = this.config.apiUrl + 'Support/';
    this.kowsarWebUrl = this.config.apiUrl + "kowsarWeb/";

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') ?? '');
  }






  GetKowsarCentral(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetKowsarCentral", { SearchTarget }, { headers: this.headers })
  }


  GetCentralById(CentralCode: string): Observable<any[]> {
    const params = new HttpParams().append('CentralCode', CentralCode)
    return this.client.get<any[]>(this.baseUrl + "GetCentralById", { headers: this.headers, params: params })

  }

  SendImageToServer(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "UploadImage", command, { headers: this.headers })
  }

  GetImageFromServer(ObjectRef: string): Observable<any[]> {
    const params = new HttpParams().append('pixelScale', '300').append('ClassName', 'Central').append('ObjectRef', ObjectRef)
    return this.client.get<any[]>(this.baseUrl + "GetWebImagess", { headers: this.headers, params: params })

  }

  GetApplicationForMenu(): Observable<any[]> {
    return this.client.get<any[]>(this.kowsarWebUrl + "GetApplicationForMenu", { headers: this.headers })

  }


  GetNotification(PersonInfoCode: string): Observable<any[]> {
    const params = new HttpParams().append('PersonInfoCode', PersonInfoCode)
    return this.client.get<any[]>(this.baseUrl + "GetNotification", { headers: this.headers, params: params })

  }

  AttendanceDashboard(): Observable<any[]> {
    const params = new HttpParams()
    return this.client.get<any[]>(this.baseUrl + "AttendanceDashboard", { headers: this.headers, params: params })
  }


  ManualAttendance(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "ManualAttendance", command, { headers: this.headers })
  }



}
