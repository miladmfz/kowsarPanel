import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
import { LoadingService } from '../ui/loading.service';
import { SessionStorageService } from '../storage/session.storage.service';
import { HeaderService } from '../HeaderService';
import {
  BaseApiResponse,
  BaseFileDownloadResponse,
  BaseImageResponse,
  GridSchemaResponse,
  LookupResponse,
  PasswordChangeResponse,
  ServerDateResponse,
} from './base-api.models';

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



  AttachFile_Insert(command: unknown): Observable<BaseApiResponse> {
    return this.withLoading(this.client.post<BaseApiResponse>(this.baseUrl + "AttachFile_Insert", command, { headers: this.headerService.headers }))
  }

  GetAttachFileList(command: unknown): Observable<BaseApiResponse> {
    return this.withLoading(this.client.post<BaseApiResponse>(this.baseUrl + "GetAttachFileList", command, { headers: this.headerService.headers }))
  }

  downloadFile(code: string, classname: string, objectRef: string): Observable<BaseFileDownloadResponse> {
    const url = `${this.baseUrl}GetAttachFileNew`;
    const params = { AttachedFileCode: code, ClassName: classname, ObjectRef: objectRef };

    return this.withLoading(this.client.get<BaseFileDownloadResponse>(url, { params }));
  }



  // Deprecated notification endpoint intentionally remains disabled.
  //   const params = new HttpParams()
  GetCustomerNotification(): Observable<BaseApiResponse> {
    const params = new HttpParams()
    return this.client.get<BaseApiResponse>(this.baseUrl + "GetCustomerNotification", { headers: this.headerService.headers, params: params })

  }
  GetKowsarNotification(): Observable<BaseApiResponse> {
    const params = new HttpParams()
    return this.client.get<BaseApiResponse>(this.baseUrl + "GetKowsarNotification", { headers: this.headerService.headers, params: params })

  }


  DeleteAttachFile(AttachedFileCode: string, ClassName: string, ObjectRef: string,): Observable<BaseApiResponse> {
    const params = new HttpParams().append('AttachedFileCode', AttachedFileCode).append('ClassName', ClassName).append('ObjectRef', ObjectRef)
    return this.withLoading(this.client.get<BaseApiResponse>(this.baseUrl + "DeleteAttachFile", { headers: this.headerService.headers, params: params }))
  }

  GetWebLog(): Observable<BaseApiResponse> {
    return this.withLoading(this.client.get<BaseApiResponse>(this.baseUrl + "GetWebLog", { headers: this.headerService.headers }))
  }


  GetGridSchemaVisible(ClassName: string): Observable<GridSchemaResponse> {
    const params = new HttpParams().append('ClassName', ClassName)

    return this.withLoading(this.client.get<GridSchemaResponse>(this.baseUrl + "GetGridSchemaVisible", { headers: this.headerService.headers, params: params }))
  }

  GetAllGridSchema(ClassName: string): Observable<GridSchemaResponse> {
    const params = new HttpParams().append('ClassName', ClassName)

    return this.withLoading(this.client.get<GridSchemaResponse>(this.baseUrl + "GetAllGridSchema", { headers: this.headerService.headers, params: params }))
  }


  GetLookup(SearchTarget: string): Observable<LookupResponse> {
    const params = new HttpParams().append('SearchTarget', SearchTarget)
    return this.withLoading(this.client.get<LookupResponse>(this.baseUrl + "GetLookup", { headers: this.headerService.headers, params: params }))
  }


  GetObjectTypeFromDbSetup(ObjectType: string): Observable<BaseApiResponse> {
    const params = new HttpParams().append('ObjectType', ObjectType)
    return this.withLoading(this.client.get<BaseApiResponse>(this.baseUrl + "GetObjectTypeFromDbSetup", { headers: this.headerService.headers, params: params }))
  }

  GetTodeyFromServer(): Observable<ServerDateResponse> {
    return this.withLoading(this.client.get<ServerDateResponse>(this.baseUrl + "GetTodeyFromServer", { headers: this.headerService.headers }))
  }


  GetTodeyFromServer_Days(Day: string): Observable<ServerDateResponse> {
    const params = new HttpParams().append('Day', Day)
    return this.withLoading(this.client.get<ServerDateResponse>(this.baseUrl + "GetTodeyFromServer", { headers: this.headerService.headers, params: params }))
  }


  GetApplicationForMenu(): Observable<BaseApiResponse> {
    return this.withLoading(this.client.get<BaseApiResponse>(this.baseUrl + "GetApplicationForMenu", { headers: this.headerService.headers }))
  }



  GetKowsarCustomer(command: unknown): Observable<BaseApiResponse> {
    return this.withLoading(this.client.post<BaseApiResponse>(this.baseUrl + "GetKowsarCustomer", command, { headers: this.headerService.headers }))
  }

  PropertyValueCrudService(command: unknown): Observable<BaseApiResponse> {
    return this.withLoading(this.client.post<BaseApiResponse>(this.baseUrl + "PropertyValueCrudService", command, { headers: this.headerService.headers }))
  }

  GetPropertyValue(command: unknown): Observable<BaseApiResponse> {

    return this.withLoading(this.client.post<BaseApiResponse>(this.baseUrl + "GetPropertyValue", command, { headers: this.headerService.headers }))

  }

  GetPropertyValueData(command: unknown): Observable<BaseApiResponse> {

    return this.withLoading(this.client.post<BaseApiResponse>(this.baseUrl + "GetPropertyValueData", command, { headers: this.headerService.headers }))

  }


  ChangeXUserPassword(command: unknown): Observable<PasswordChangeResponse> {

    return this.withLoading(this.client.post<PasswordChangeResponse>(this.baseUrl + "ChangeXUserPassword", command, { headers: this.headerService.headers }))

  }



  GetImageFromServer(ObjectRef: string, ClassName: string): Observable<BaseImageResponse> {
    const params = new HttpParams().append('pixelScale', '300').append('ClassName', ClassName).append('ObjectRef', ObjectRef)
    return this.withLoading(this.client.get<BaseImageResponse>(this.baseUrl + "GetWebImagess", { headers: this.headerService.headers, params: params }))

  }


  ManualAttendance(command: unknown): Observable<BaseApiResponse> {
    return this.withLoading(this.client.post<BaseApiResponse>(this.baseUrl + "ManualAttendance", command, { headers: this.headerService.headers }))
  }

  AttendanceDashboard(): Observable<BaseApiResponse> {
    const params = new HttpParams()
    return this.client.get<BaseApiResponse>(this.baseUrl + "AttendanceDashboard", { headers: this.headerService.headers, params: params })
  }



  AttendanceHistory(CentralRef: string): Observable<BaseApiResponse> {
    const params = new HttpParams().append('CentralRef', CentralRef)
    return this.withLoading(this.client.get<BaseApiResponse>(this.baseUrl + "AttendanceHistory", { headers: this.headerService.headers, params: params }))
  }


  GetKowsarReport(command: unknown): Observable<BaseApiResponse> {

    return this.withLoading(this.client.post<BaseApiResponse>(this.baseUrl + "GetKowsarReport", command, { headers: this.headerService.headers }))

  }


  GetCentralUser(): Observable<BaseApiResponse> {
    const params = new HttpParams()
    return this.withLoading(this.client.get<BaseApiResponse>(this.baseUrl + "GetCentralUser", { headers: this.headerService.headers }))
  }










}









