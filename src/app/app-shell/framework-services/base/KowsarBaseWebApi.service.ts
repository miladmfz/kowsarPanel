import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class KowsarBaseWebApi {


  baseUrl: string;
  headers: HttpHeaders;

  constructor(private client: HttpClient, private config: AppConfigService) {

    this.baseUrl = this.config.apiUrl + 'Support/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') ?? '');
  }




  AttachFile_Insert(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "AttachFile_Insert", command, { headers: this.headers })
  }

  GetAttachFileList(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetAttachFileList", command, { headers: this.headers })
  }

  downloadFile(code: string, classname: string, objectRef: string): Observable<any> {
    const url = `${this.baseUrl}GetAttachFileNew`;
    const params = { AttachedFileCode: code, ClassName: classname, ObjectRef: objectRef };

    return this.client.get<any>(url, { params });
  }



  GetTodeyFromServer(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer", { headers: this.headers })
  }


  DeleteAttachFile(AttachedFileCode: string, ClassName: string, ObjectRef: string,): Observable<any[]> {
    const params = new HttpParams().append('AttachedFileCode', AttachedFileCode).append('ClassName', ClassName).append('ObjectRef', ObjectRef)
    return this.client.get<any[]>(this.baseUrl + "DeleteAttachFile", { headers: this.headers, params: params })
  }

  GetWebLog(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetWebLog", { headers: this.headers });
  }


}









