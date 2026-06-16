import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';
@Injectable({
  providedIn: 'root'
})
export class PersonInfoWebApiService {



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
    this.baseUrl = this.config.apiUrl + 'PersonInfo/';


  }




  GetPersonInfo(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetPersonInfo", command, { headers: this.headerService.headers }))
  }


  GetPersonInfoById(PersonInfoCode: string): Observable<any[]> {
    const params = new HttpParams().append('PersonInfoCode', PersonInfoCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetPersonInfoById", { headers: this.headerService.headers, params: params }))
  }

  ResetXUserPassword(UserName: string): Observable<any[]> {
    const params = new HttpParams().append('UserName', UserName)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "ResetXUserPassword", { headers: this.headerService.headers, params: params }))
  }

  PersonInfoCrudService(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PersonInfoCrudService", command, { headers: this.headerService.headers }))
  }


  ChangeXUserInfo(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "ChangeXUserInfo", command, { headers: this.headerService.headers }))
  }






}









