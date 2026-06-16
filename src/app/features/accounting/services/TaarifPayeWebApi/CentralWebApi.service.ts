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
export class CentralWebApiService {


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
    this.baseUrl = this.config.apiUrl + 'Central/';


  }




  GetCentral(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetCentral", command, { headers: this.headerService.headers }))
  }

  GetCentralGroup(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetCentralGrp", command, { headers: this.headerService.headers }))
  }


  GetCentralById(CentralCode: string): Observable<any[]> {
    const params = new HttpParams().append('CentralCode', CentralCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetCentralById", { headers: this.headerService.headers, params: params }))
  }




  GetZone_Ostan(): Observable<any[]> {
    const params = new HttpParams()
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetZone_Ostan", { headers: this.headerService.headers, params: params }))
  }

  GetZone_Shahr(SearchTarget: string): Observable<any[]> {
    const params = new HttpParams().append('SearchTarget', SearchTarget)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetZone_Shahr", { headers: this.headerService.headers, params: params }))
  }



  GetAddressByCentral(CentralRef: string): Observable<any[]> {
    const params = new HttpParams().append('CentralRef', CentralRef)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetAddressByCentral", { headers: this.headerService.headers, params: params }))
  }

  AddressCrudService(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "AddressCrudService", command, { headers: this.headerService.headers }))

  }


  CentralCrudService(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CentralCrudService", command, { headers: this.headerService.headers }))

  }


}









