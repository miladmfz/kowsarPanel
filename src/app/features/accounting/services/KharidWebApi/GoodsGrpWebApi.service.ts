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
export class GoodsGrpWebApiService {


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
    this.baseUrl = this.config.apiUrl + 'GoodsGrp/';


  }


  GetGoodsGrp(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetGoodsGrp", command, { headers: this.headerService.headers }))
  }

  GetReportsByCode(ReportCode: string): Observable<any[]> {
    const params = new HttpParams().append('ReportCode', ReportCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetReportsByCode", { headers: this.headerService.headers, params: params }))
  }






  GoodsGrpCrudService(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodsGrpCrudService", command, { headers: this.headerService.headers }))

  }









}









