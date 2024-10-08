import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environment/environment';


@Injectable({
  providedIn: 'root'
})
export class DownloadWebApiService {

  constructor(private client: HttpClient) { }

  baseUrl = environment.api_Url + "Support/";

  headers = new HttpHeaders()

    .set('Content-Type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') + "")



  ////////////////////////////////////////////////////////////////////



  GetTodeyFromServer(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer", { headers: this.headers })
  }


  GetAttachFile(Code: string): Observable<any[]> {
    const params = new HttpParams().append('Code', Code)
    return this.client.get<any[]>(this.baseUrl + "GetAttachFile", { headers: this.headers, params: params })
  }

  downloadFile(code: string, classname: string, ObjectRef: string): Observable<Blob> {
    const url = `${this.baseUrl}GetAttachFile`;
    const params = { AttachedFileCode: code, ClassName: classname, ObjectRef: ObjectRef };
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    return this.client.get(url, {
      params: params,
      headers: headers,
      responseType: 'blob' // Important! This tells HttpClient to parse the response as Blob
    });
  }


  KowsarAttachFile(SearchTarget: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "KowsarAttachFile", { SearchTarget }, { headers: this.headers })
  }


  SetAttachFile(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "SetAttachFile", command, { headers: this.headers })
  }




}
