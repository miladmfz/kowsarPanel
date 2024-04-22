import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { getServiceUrl } from 'src/environment/environment';
import { environment, } from 'src/environment/environment';

@Injectable({
  providedIn: 'root'
})
export class ApplicationWebApiService {

  constructor(private client: HttpClient) { }


  //baseUrl = environment.baseUrl_KowsarWeb;
  baseUrl = environment.baseUrl_KowsarWeb

  headers = new HttpHeaders()

    .set('content-type', 'application/json')
    .set('Access-Control-Allow-Origin', '*')
    .set('UserGuid', sessionStorage.getItem('UserGuid') + "")





  GetBrokers(): Observable<any[]> {

    return this.client.get<any[]>(this.baseUrl + "GetBrokers");
  }

  GetBrokerDetail(BrokerCode: string): Observable<any[]> {
    const params = new HttpParams().append('BrokerCode', BrokerCode)
    return this.client.get<any[]>(this.baseUrl + "GetBrokerDetail", { params: params })
  }

  GetPrefactorBroker(BrokerCode: string, Days: string): Observable<any[]> {
    const params = new HttpParams().append('BrokerCode', BrokerCode).append('Days', Days)
    return this.client.get<any[]>(this.baseUrl + "GetPrefactorBroker", { params: params })
  }

  GetCDCustName(BrokerCode: string, Days: string): Observable<any[]> {
    const params = new HttpParams().append('BrokerCode', BrokerCode).append('Days', Days)
    return this.client.get<any[]>(this.baseUrl + "GetCDCustName", { params: params })
  }

  GetCDPreFactorDate(BrokerCode: string, Days: string): Observable<any[]> {
    const params = new HttpParams().append('BrokerCode', BrokerCode).append('Days', Days)
    return this.client.get<any[]>(this.baseUrl + "GetCDPreFactorDate", { params: params })
  }


  CreateAppBroker(KowsarDb: string, KowsarImage: string): Observable<any[]> {
    const params = new HttpParams().append('KowsarDb', KowsarDb).append('KowsarImage', KowsarImage)
    return this.client.get<any[]>(this.baseUrl + "CreateAppBroker", { params: params })
  }

  Web_GetDbsetupObject(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.baseUrl + "Web_GetDbsetupObject", { params: params })
  }

  CreateBasketColumn(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.baseUrl + "CreateBasketColumn", { params: params })
  }


  BrokerCustomerRefresh(): Observable<any[]> {
    const params = new HttpParams()
    return this.client.get<any[]>(this.baseUrl + "BrokerCustomerRefresh");
  }

  GetBasketColumnList(AppType: string): Observable<any[]> {
    const params = new HttpParams().append('AppType', AppType)
    return this.client.get<any[]>(this.baseUrl + "GetBasketColumnList", { params: params })
  }

  BasketColumnCard(Where: string, AppType: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where).append('AppType', AppType)
    return this.client.get<any[]>(this.baseUrl + "BasketColumnCard", { params: params })
  }


  GetGoodType(): Observable<any[]> {
    const params = new HttpParams()
    return this.client.get<any[]>(this.baseUrl + "GetGoodType");
  }
  GetProperty(Where: string): Observable<any[]> {
    const params = new HttpParams().append('Where', Where)
    return this.client.get<any[]>(this.baseUrl + "GetProperty", { params: params })
  }


  InsertSingleColumn(
    ColumnName: string,
    ColumnDesc: string,
    ObjectType: string,
    DetailVisible: string,
    ListVisible: string,
    SearchVisible: string,
    ColumnType: string,
    AppType: string
  ): Observable<any[]> {
    const params = new HttpParams().append('ColumnName', ColumnName).append('ColumnDesc', ColumnDesc)
      .append('ObjectType', ObjectType).append('DetailVisible', DetailVisible)
      .append('ListVisible', ListVisible).append('SearchVisible', SearchVisible)
      .append('ColumnType', ColumnType).append('AppType', AppType)
    return this.client.get<any[]>(this.baseUrl + "InsertSingleColumn", { params: params })
  }




  UpdateDbSetup(DataValue: string, KeyId: string): Observable<any[]> {
    const params = new HttpParams().append('DataValue', DataValue).append('KeyId', KeyId)
    return this.client.get<any[]>(this.baseUrl + "UpdateDbSetup", { params: params })
  }


  GetAppPrinter(AppType: string): Observable<any[]> {
    const params = new HttpParams().append('AppType', AppType)
    return this.client.get<any[]>(this.baseUrl + "GetAppPrinter", { params: params })
  }




  UpdatePrinter(
    AppPrinterCode: string,
    PrinterName: string,
    PrinterExplain: string,
    GoodGroups: string,
    WhereClause: string,
    PrintCount: string,
    PrinterActive: string,
    FilePath: string,
    AppType: string
  ): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "UpdatePrinter", { AppPrinterCode, PrinterName, PrinterExplain, GoodGroups, WhereClause, PrintCount, PrinterActive, FilePath, AppType });

  }



  OcrFactorList(SearchTarget: string): Observable<any[]> {
    const params = new HttpParams().append('SearchTarget', SearchTarget)
    return this.client.get<any[]>(this.baseUrl + "OcrFactorList", { params: params })
  }
  ocrGetFactorDetail(AppOCRFactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('AppOCRFactorCode', AppOCRFactorCode)
    return this.client.get<any[]>(this.baseUrl + "ocrGetFactorDetail", { params: params })
  }

  ExitDelivery(AppOCRFactorCode: string): Observable<any[]> {
    const params = new HttpParams().append('AppOCRFactorCode', AppOCRFactorCode)
    return this.client.get<any[]>(this.baseUrl + "ExitDelivery", { params: params })
  }




  UploadImage(ObjectCode: string, image: string): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "UploadImage", { ObjectCode, image });
  }



  OrderMizList(InfoState: string, MizType: string): Observable<any[]> {
    const params = new HttpParams().append('InfoState', InfoState).append('MizType', MizType)
    return this.client.get<any[]>(this.baseUrl + "OrderMizList", { params: params })
  }

  GetAmountItem(Date: string, State: string): Observable<any[]> {
    const params = new HttpParams().append('Date', Date).append('State', State)
    return this.client.get<any[]>(this.baseUrl + "GetAmountItem", { params: params })
  }

  GetTodeyFromServer(Day: string): Observable<any[]> {
    const params = new HttpParams().append('Day', Day)
    return this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer", { params: params })
  }



  minMaxGood(Date: string, State: string): Observable<any[]> {
    const params = new HttpParams().append('Date', Date).append('State', State)
    return this.client.get<any[]>(this.baseUrl + "minMaxGood", { params: params })
  }

  GetCustomerMandeh(): Observable<any[]> {
    const params = new HttpParams()
    return this.client.get<any[]>(this.baseUrl + "GetCustomerMandeh");
  }


  GetCustomerlastGood(CustomerCode: string): Observable<any[]> {
    const params = new HttpParams().append('CustomerCode', CustomerCode)

    return this.client.get<any[]>(this.baseUrl + "GetCustomerlastGood", { params: params })
  }






}









