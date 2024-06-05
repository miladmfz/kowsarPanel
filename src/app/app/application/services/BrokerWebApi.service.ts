import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment, } from 'src/environment/environment';

@Injectable({
    providedIn: 'root'
})
export class BrokerWebApiService {

    constructor(private client: HttpClient) { }
    headers = new HttpHeaders()

        .set('content-type', 'application/json')
        .set('Access-Control-Allow-Origin', '*')
        .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') + "")


    baseUrl = environment.api_Url + "BrokerWeb/";






    //------------------------------------------------

    UploadImage(ObjectCode: string, image: string): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "UploadImage", { ObjectCode, image });
    }


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


    BrokerCustomerRefresh(): Observable<any[]> {
        const params = new HttpParams()
        return this.client.get<any[]>(this.baseUrl + "BrokerCustomerRefresh");
    }


    //------------------------------------------------



    BasketColumnCard(Where: string, AppType: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where).append('AppType', AppType)
        return this.client.get<any[]>(this.baseUrl + "BasketColumnCard", { params: params })
    }


    Web_GetDbsetupObject(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "Web_GetDbsetupObject", { params: params })
    }


    CreateBasketColumn(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "CreateBasketColumn", { params: params })
    }




    GetBasketColumnList(AppType: string): Observable<any[]> {
        const params = new HttpParams().append('AppType', AppType)
        return this.client.get<any[]>(this.baseUrl + "GetBasketColumnList", { params: params })
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

    UpdatePrinter(command): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "UpdatePrinter", { command });

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



    SendImageToServer(command): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "UploadImage", command)
    }


    GetImageFromServer(ObjectRef: string): Observable<any[]> {
        const params = new HttpParams().append('pixelScale', '300').append('ClassName', 'Central').append('ObjectRef', ObjectRef)
        return this.client.get<any[]>(this.baseUrl + "GetWebImagess", { params: params })

    }



}









