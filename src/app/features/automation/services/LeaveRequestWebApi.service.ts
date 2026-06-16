import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';

@Injectable({
  providedIn: 'root'
})
export class LeaveRequestWebApiService {


  baseUrl: string;
  baseUrl_Attach: string;
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
    this.baseUrl = this.config.apiUrl + 'LeaveRequest/';



  }





  DeleteLeaveRequest(LeaveRequestCode: string): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "DeleteLeaveRequest", { LeaveRequestCode }, { headers: this.headerService.headers }))
  }


  GetLeaveRequest(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetLeaveRequest", command, { headers: this.headerService.headers }))
  }


  GetLeaveRequestById(LeaveRequestCode: string): Observable<any[]> {
    const params = new HttpParams().append('LeaveRequestCode', LeaveRequestCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetLeaveRequestById", { headers: this.headerService.headers, params: params }))

  }

  GetLeaveRequestPerson(TargetDate: string): Observable<any[]> {
    const params = new HttpParams().append('TargetDate', TargetDate)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetLeaveRequestPerson", { headers: this.headerService.headers, params: params }))
  }


  LeaveRequest_Insert(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "LeaveRequest_Insert", command, { headers: this.headerService.headers }))
  }


  LeaveRequest_Update(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "LeaveRequest_Update", command, { headers: this.headerService.headers }))
  }


  LeaveRequest_WorkFlow(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "LeaveRequest_WorkFlow", command, { headers: this.headerService.headers }))
  }



}









