import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpHeaders } from '@angular/common/http';
import { finalize, Observable } from 'rxjs';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AppConfigService } from 'src/app/app-config.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';
@Injectable({
  providedIn: 'root'
})
export class TaskWebApiService {


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
    this.baseUrl = this.config.apiUrl + 'InternalTask/';


  }





  GetTasks(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetTasks", command, { headers: this.headerService.headers }))
  }

  InsertTask(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "InsertTask", command, { headers: this.headerService.headers }))
  }

  UpdateTask(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "UpdateTask", command, { headers: this.headerService.headers }))
  }

  DeleteTask(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "DeleteTask", command, { headers: this.headerService.headers }))
  }
  DeleteTaskAll(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "DeleteTaskAll", command, { headers: this.headerService.headers }))
  }
}









