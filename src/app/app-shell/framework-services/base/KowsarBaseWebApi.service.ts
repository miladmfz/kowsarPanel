import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
import { LoadingService } from '../ui/loading.service';
import { SessionStorageService } from '../storage/session.storage.service';
import { HeaderService } from '../HeaderService';

@Injectable({
  providedIn: 'root'
})
export class KowsarBaseWebApi {


  baseUrl: string;
  private readonly headerService = inject(HeaderService);

  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private readonly AutoloadingService = inject(LoadingService);
  protected readonly session = inject(SessionStorageService);

  private withLoading<T>(obs$: Observable<T>): Observable<T> {
    this.AutoloadingService.show();
    return obs$.pipe(finalize(() => this.AutoloadingService.hide()));
  }

  constructor() {

    this.baseUrl = this.config.apiUrl + 'Base/';


  }



  AttachFile_Insert(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "AttachFile_Insert", command, { headers: this.headerService.headers }))
  }

  GetAttachFileList(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetAttachFileList", command, { headers: this.headerService.headers }))
  }

  downloadFile(code: string, classname: string, objectRef: string): Observable<any> {
    const url = `${this.baseUrl}GetAttachFileNew`;
    const params = { AttachedFileCode: code, ClassName: classname, ObjectRef: objectRef };

    return this.withLoading(this.client.get<any>(url, { params }));
  }



  // GetNotification(): Observable<any[]> {
  //   const params = new HttpParams()
  //   return this.client.get<any[]>(this.baseUrl + "GetNotification", { headers: this.headerService.headers, params: params })

  // }

  GetCustomerNotification(): Observable<any[]> {
    const params = new HttpParams()
    return this.client.get<any[]>(this.baseUrl + "GetCustomerNotification", { headers: this.headerService.headers, params: params })

  }
  GetKowsarNotification(): Observable<any[]> {
    const params = new HttpParams()
    return this.client.get<any[]>(this.baseUrl + "GetKowsarNotification", { headers: this.headerService.headers, params: params })

  }


  DeleteAttachFile(AttachedFileCode: string, ClassName: string, ObjectRef: string,): Observable<any[]> {
    const params = new HttpParams().append('AttachedFileCode', AttachedFileCode).append('ClassName', ClassName).append('ObjectRef', ObjectRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteAttachFile", { headers: this.headerService.headers, params: params }))
  }

  GetWebLog(): Observable<any[]> {
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetWebLog", { headers: this.headerService.headers }))
  }


  GetGridSchemaVisible(ClassName: string): Observable<any[]> {
    const params = new HttpParams().append('ClassName', ClassName)

    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGridSchemaVisible", { headers: this.headerService.headers, params: params }))
  }

  GetAllGridSchema(ClassName: string): Observable<any[]> {
    const params = new HttpParams().append('ClassName', ClassName)

    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetAllGridSchema", { headers: this.headerService.headers, params: params }))
  }


  GetLookup(SearchTarget: string): Observable<any[]> {
    const params = new HttpParams().append('SearchTarget', SearchTarget)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetLookup", { headers: this.headerService.headers, params: params }))
  }


  GetObjectTypeFromDbSetup(ObjectType: string): Observable<any[]> {
    const params = new HttpParams().append('ObjectType', ObjectType)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetObjectTypeFromDbSetup", { headers: this.headerService.headers, params: params }))
  }

  GetTodeyFromServer(): Observable<any[]> {
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer", { headers: this.headerService.headers }))
  }


  GetTodeyFromServer_Days(Day: string): Observable<any[]> {
    const params = new HttpParams().append('Day', Day)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer", { headers: this.headerService.headers, params: params }))
  }


  GetApplicationForMenu(): Observable<any[]> {
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetApplicationForMenu", { headers: this.headerService.headers }))
  }



  GetKowsarCustomer(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetKowsarCustomer", command, { headers: this.headerService.headers }))
  }

  PropertyValueCrudService(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PropertyValueCrudService", command, { headers: this.headerService.headers }))
  }

  GetPropertyValue(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetPropertyValue", command, { headers: this.headerService.headers }))

  }

  GetPropertyValueData(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetPropertyValueData", command, { headers: this.headerService.headers }))

  }


  ChangeXUserPassword(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "ChangeXUserPassword", command, { headers: this.headerService.headers }))

  }



  GetImageFromServer(ObjectRef: string): Observable<any[]> {
    const params = new HttpParams().append('pixelScale', '300').append('ClassName', 'TGood').append('ObjectRef', ObjectRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetWebImagess", { headers: this.headerService.headers, params: params }))

  }

  ManualAttendance(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "ManualAttendance", command, { headers: this.headerService.headers }))
  }

  AttendanceDashboard(): Observable<any[]> {
    const params = new HttpParams()
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "AttendanceDashboard", { headers: this.headerService.headers, params: params }))
  }



  AttendanceHistory(CentralRef: string): Observable<any[]> {
    const params = new HttpParams().append('CentralRef', CentralRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "AttendanceHistory", { headers: this.headerService.headers, params: params }))
  }


  GetKowsarReport(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetKowsarReport", command, { headers: this.headerService.headers }))

  }











}









