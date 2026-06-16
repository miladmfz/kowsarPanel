import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Good, GoodsResponse } from '../models/Good';
import { GroupsResponse } from '../models/group';
import { TextValue } from '../models/textvalue';
import { BasketInfo } from '../models/BasketInfo';
import { AppConfigService } from 'src/app/app-config.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { HeaderService } from 'src/app/app-shell/framework-services/HeaderService';



@Injectable({
  providedIn: 'root'
})
export class OrderRepoService {
  baseUrl: string;
  private readonly headerService = inject(HeaderService);
  basketItems: any[] = [];

  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);
  private readonly AutoloadingService = inject(LoadingService);
  constructor() {

    this.baseUrl = this.config.MenuapiUrl;

  }

  // baseUrl = 'http://localhost:60009/login/index.php?tag=';

  //baseUrl = 'http://94.139.164.68:60005/login/index.php?tag=';


  getAllGood(GroupCode: string, AppBasketInfoRef: string): Observable<GoodsResponse> {

    const params = new HttpParams()
      .append('GroupCode', GroupCode)
      .append('AppBasketInfoRef', AppBasketInfoRef)

    return this.client.get<GoodsResponse>(this.baseUrl + 'GetOrderGoodList', { params: params })
  }
  GetMenuGoodList(GroupCode: string, AppBasketInfoRef: string): Observable<GoodsResponse> {

    const params = new HttpParams()
      .append('GroupCode', GroupCode)
      .append('AppBasketInfoRef', AppBasketInfoRef)

    return this.client.get<GoodsResponse>(this.baseUrl + 'GetMenuGoodList', { params: params })
  }

  getAllGroup(): Observable<GroupsResponse> {
    const params = new HttpParams().append('GroupCode', '71')

    return this.client.get<GroupsResponse>(this.baseUrl + 'GetMenuOnlinegroups', { params: params })
  }


  GetGroupCode(): Observable<TextValue> {
    const params = new HttpParams().append('Where', 'AppOrder_DefaultGroupCode')

    return this.client.get<TextValue>(this.baseUrl + 'kowsar_info', { params: params })

  }

  getGroupsByCode(groupCode: string): Observable<GroupsResponse> {
    const params = new HttpParams().append('GroupCode', groupCode)

    return this.client.get<GroupsResponse>(this.baseUrl + 'GetMenuOnlinegroups', { params: params })
  }


  GetRstMizData(id: string): Observable<BasketInfo[]> {
    const params = new HttpParams().append('RstMizCode', id)

    return this.client.get<BasketInfo[]>(this.baseUrl + 'WebOrderMizData', { params: params })
  }

  OrderInfoInsert(rstmizCode: string, today: string): Observable<BasketInfo[]> {
    const params = new HttpParams().append('Miz', rstmizCode).append('Date', today)
    return this.client.get<BasketInfo[]>(this.baseUrl + 'WebOrderInfoInsert', { params: params })
  }


  GetBasketOrder(AppBasketInfoRef: string): Observable<GoodsResponse> {
    const params = new HttpParams().append('AppType', '3').append('AppBasketInfoRef', AppBasketInfoRef)

    return this.client.get<GoodsResponse>(this.baseUrl + 'OrderGet', { params: params })
  }


  OrderRowInsert(good: Good, amount: string, desc: string, AppBasketInfoRef: string): Observable<GoodsResponse> {
    const params = new HttpParams()
      .append('GoodRef', good.GoodCode + '')
      .append('FacAmount', amount)
      .append('Price', good.MaxSellPrice + '')
      .append('bUnitRef', good.GoodUnitRef + '')
      .append('bRatio', good.DefaultUnitValue + '')
      .append('Explain', desc)
      .append('InfoRef', AppBasketInfoRef)
      .append('RowCode', good.RowCode + '')

    return this.client.get<GoodsResponse>(this.baseUrl + 'OrderRowInsert', { params: params })
  }

  OrderRowDelete(good: Good, AppBasketInfoRef: string): Observable<GoodsResponse> {
    const params = new HttpParams().append('AppBasketInfoRef', AppBasketInfoRef).append('RowCode', good.RowCode + '')

    return this.client.get<GoodsResponse>(this.baseUrl + 'DeleteGoodFromBasket', { params: params })
  }



  OrderGetSummmary(AppBasketInfoRef: string): Observable<GoodsResponse> {
    const params = new HttpParams().append('AppBasketInfoRef', AppBasketInfoRef)

    return this.client.get<GoodsResponse>(this.baseUrl + 'OrderGetSummmary', { params: params })
  }




  GetImage(GoodCode: string): Observable<TextValue> {

    const params = new HttpParams()

      .append('ClassName', 'TGood')
      .append('IX', '0')
      .append('Scale', '200')
      .append('ObjectRef', GoodCode)

    return this.client.get<any>(this.baseUrl + 'getImage', { params: params })

  }



  GetGoodsGrp(GoodCode: string): Observable<TextValue> {

    const params = new HttpParams()

      .append('ClassName', 'TGoodsGrp')
      .append('IX', '0')
      .append('Scale', '50')
      .append('ObjectRef', GoodCode)

    return this.client.get<any>(this.baseUrl + 'getImage', { params: params })

  }









}
