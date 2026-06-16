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
export class GoodWebApiService {



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
    this.baseUrl = this.config.apiUrl + 'Good/';


  }











  GetLastGoodData(): Observable<any[]> {
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetLastGoodData", { headers: this.headerService.headers }))
  }






  Good_Insert(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodInsert", command, { headers: this.headerService.headers }))
  }

  Good_Update_base(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodUpdateBase", command, { headers: this.headerService.headers }))
  }

  Good_Update_Complete(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodUpdateComplete", command, { headers: this.headerService.headers }))
  }

  Good_Update_Units(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodUpdateUnits", command, { headers: this.headerService.headers }))
  }

  Good_Update_Relations(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodUpdateRelations", command, { headers: this.headerService.headers }))
  }




  GetGood_base(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGoodBase", { headers: this.headerService.headers, params: params }))
  }

  GetGood_Explain(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGoodExplain", { headers: this.headerService.headers, params: params }))
  }
  GetGood_Propertys(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGoodProperty", { headers: this.headerService.headers, params: params }))
  }

  GetGood_Complete(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGoodComplete", { headers: this.headerService.headers, params: params }))
  }

  GetGood_Units(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGoodUnits", { headers: this.headerService.headers, params: params }))
  }

  GetGood_Relations(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGoodRelations", { headers: this.headerService.headers, params: params }))
  }



  GetGood_Images(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGoodImages", { headers: this.headerService.headers, params: params }))
  }

  GetGood_Groups(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGoodGroups", { headers: this.headerService.headers, params: params }))
  }


  GetGood_Stacks(GoodCode: string): Observable<any[]> {
    const params = new HttpParams().append('GoodCode', GoodCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGoodStacks", { headers: this.headerService.headers, params: params }))
  }



  GoodCrudService(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodCrudService", command, { headers: this.headerService.headers }))

  }


  GetGoodList(): Observable<any[]> {
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGoodList", { headers: this.headerService.headers }))
  }




  GetStacks(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetStacks", command, { headers: this.headerService.headers }))

  }

  GetGoodsGrp(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetGoodsGrp", command, { headers: this.headerService.headers }))

  }

  GetUnits(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetUnits", command, { headers: this.headerService.headers }))

  }
  GetCentralGrp(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetCentralGrp", command, { headers: this.headerService.headers }))

  }


  GetProperty(command): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetProperty", command, { headers: this.headerService.headers }))

  }

  UploadImageForGood(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "UploadImageForGood", command, { headers: this.headerService.headers }))
  }

  GetImageFromServer(Pixel: string, KsrImageCode: string): Observable<any[]> {
    const params = new HttpParams().append('Pixel', Pixel).append('KsrImageCode', KsrImageCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetImageFromKsr", { headers: this.headerService.headers, params: params }))

  }


  DeleteGoodGroupCode(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteGoodGroupCode", { headers: this.headerService.headers, params: params }))

  }


  DeleteKsrImageCode(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "DeleteKsrImageCode", { headers: this.headerService.headers, params: params }))

  }

  GetBarcodeList(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetBarcodeList", { headers: this.headerService.headers, params: params }))

  }


  GetSimilarGood(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetSimilarGood", { headers: this.headerService.headers, params: params }))

  }



  IsbnToBarcode(Isbn: string, GoodCode: string): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "IsbnToBarcode", { Isbn, GoodCode }, { headers: this.headerService.headers }))

  }



  GetGoods(Searchtarget: string): Observable<any[]> {

    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetGoods", { Searchtarget }, { headers: this.headerService.headers }))

  }




}









