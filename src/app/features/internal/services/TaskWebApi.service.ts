import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class TaskWebApiService {


  baseUrl: string;
  headers: HttpHeaders;


  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  constructor() {
    this.baseUrl = this.config.apiUrl + 'Support/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') ?? '');
  }





  GetTasks(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetTasks", command, { headers: this.headers })
  }

  InsertTask(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "InsertTask", command, { headers: this.headers })
  }

  UpdateTask(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "UpdateTask", command, { headers: this.headers })
  }

  DeleteTask(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "DeleteTask", command, { headers: this.headers })
  }
  DeleteTaskAll(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "DeleteTaskAll", command, { headers: this.headers })
  }
}









