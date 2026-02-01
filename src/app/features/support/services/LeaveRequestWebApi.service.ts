import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpResponse } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestWebApiService {


  baseUrl: string;
  baseUrl_Attach: string;
  headers: HttpHeaders;


  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  constructor() {
    this.baseUrl = this.config.apiUrl + 'KowsarWeb/';

    this.baseUrl_Attach = this.config.apiUrl + 'Support/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PIC', sessionStorage.getItem('PersonInfoRef') ?? '')
      .set('SessionId', sessionStorage.getItem('SessionId') ?? '')
      .set('UserName', encodeURIComponent(sessionStorage.getItem('UserName') ?? ''));
  }


  /*
    GetKowsarCustomer(SearchTarget: string): Observable<any[]> {
      return this.client.post<any[]>(this.baseUrl + "GetKowsarCustomer", { SearchTarget }, { headers: this.headers })
    }
  
    DeleteTaskAll(command): Observable<any[]> {
      return this.client.post<any[]>(this.baseUrl + "DeleteTaskAll", command, { headers: this.headers })
    }
  */



  AttachFile_Insert(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl_Attach + "AttachFile_Insert", command, { headers: this.headers })
  }

  GetAttachFileList(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl_Attach + "GetAttachFileList", command, { headers: this.headers })
  }

  downloadFile(code: string, classname: string, objectRef: string): Observable<any> {
    const url = `${this.baseUrl_Attach}GetAttachFileNew`;
    const params = { AttachedFileCode: code, ClassName: classname, ObjectRef: objectRef };

    return this.client.get<any>(url, { params });
  }







  GetTodeyFromServer(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer", { headers: this.headers })
  }



  DeleteLeaveRequest(LeaveRequestCode: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "DeleteLeaveRequest", { LeaveRequestCode }, { headers: this.headers })
  }


  GetLeaveRequest(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetLeaveRequest", command, { headers: this.headers })
  }


  GetLeaveRequestById(LeaveRequestCode: string): Observable<any[]> {
    const params = new HttpParams().append('LeaveRequestCode', LeaveRequestCode)
    return this.client.get<any[]>(this.baseUrl + "GetLeaveRequestById", { headers: this.headers, params: params })

  }




  LeaveRequest_Insert(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "LeaveRequest_Insert", command, { headers: this.headers })
  }


  LeaveRequest_Update(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "LeaveRequest_Update", command, { headers: this.headers })
  }


  LeaveRequest_WorkFlow(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "LeaveRequest_WorkFlow", command, { headers: this.headers })
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
  DeleteAttachFile(AttachedFileCode: string, ClassName: string, ObjectRef: string,): Observable<any[]> {
    const params = new HttpParams().append('AttachedFileCode', AttachedFileCode).append('ClassName', ClassName).append('ObjectRef', ObjectRef)
    return this.client.get<any[]>(this.baseUrl + "DeleteAttachFile", { headers: this.headers, params: params })
  }

}









