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

        .set('Content-Type', 'application/json')
        .set('Access-Control-Allow-Origin', '*')
        .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') + "")


    baseUrl = environment.api_Url + "BrokerWeb/";






    //------------------------------------------------


    GetGpstracker(BrokerCode: string, StartDate: string, EndDate: string): Observable<any[]> {
        const params = new HttpParams().append('BrokerCode', BrokerCode).append('StartDate', StartDate).append('EndDate', EndDate)
        return this.client.get<any[]>(this.baseUrl + "GetGpstracker", { headers: this.headers, params: params })
    }



    GetBrokerCustomer(BrokerCode: string, FactorDate: string): Observable<any[]> {
        const params = new HttpParams().append('BrokerCode', BrokerCode).append('FactorDate', FactorDate)
        return this.client.get<any[]>(this.baseUrl + "GetBrokerCustomer", { headers: this.headers, params: params })
    }


    UploadImage(ObjectCode: string, image: string): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "UploadImage", { ObjectCode, image }, { headers: this.headers });
    }


    GetBrokers(): Observable<any[]> {

        return this.client.get<any[]>(this.baseUrl + "GetBrokers", { headers: this.headers });
    }



    GetBrokerDetail(BrokerCode: string): Observable<any[]> {
        const params = new HttpParams().append('BrokerCode', BrokerCode)
        return this.client.get<any[]>(this.baseUrl + "GetBrokerDetail", { headers: this.headers, params: params })
    }

    GetAppBrokerReport(command): Observable<any[]> {

        // flag report
        //   
        //  1- GetCDPreFactorDate
        //  2- GetCDCustName
        //  3- GetPrefactorBroker
        //  4-
        return this.client.post<any[]>(this.baseUrl + "GetAppBrokerReport", command, { headers: this.headers })

    }

    GetPrefactorBroker(BrokerCode: string, Days: string): Observable<any[]> {
        const params = new HttpParams().append('BrokerCode', BrokerCode).append('Days', Days)
        return this.client.get<any[]>(this.baseUrl + "GetPrefactorBroker", { headers: this.headers, params: params })
    }



    GetCDCustName(BrokerCode: string, Days: string): Observable<any[]> {
        const params = new HttpParams().append('BrokerCode', BrokerCode).append('Days', Days)
        return this.client.get<any[]>(this.baseUrl + "GetCDCustName", { headers: this.headers, params: params })
    }



    GetCDPreFactorDate(BrokerCode: string, Days: string): Observable<any[]> {
        const params = new HttpParams().append('BrokerCode', BrokerCode).append('Days', Days)
        return this.client.get<any[]>(this.baseUrl + "GetCDPreFactorDate", { headers: this.headers, params: params })
    }

    CreateAppBroker(KowsarDb: string, KowsarImage: string): Observable<any[]> {
        const params = new HttpParams().append('KowsarDb', KowsarDb).append('KowsarImage', KowsarImage)
        return this.client.get<any[]>(this.baseUrl + "CreateAppBroker", { headers: this.headers, params: params })
    }


    BrokerCustomerRefresh(): Observable<any[]> {
        const params = new HttpParams()
        return this.client.get<any[]>(this.baseUrl + "BrokerCustomerRefresh", { headers: this.headers });
    }


    //------------------------------------------------



    BasketColumnCard(Where: string, AppType: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where).append('AppType', AppType)
        return this.client.get<any[]>(this.baseUrl + "BasketColumnCard", { headers: this.headers, params: params })
    }


    Web_GetDbsetupObject(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "Web_GetDbsetupObject", { headers: this.headers, params: params })
    }


    CreateBasketColumn(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "CreateBasketColumn", { headers: this.headers, params: params })
    }




    GetBasketColumnList(AppType: string): Observable<any[]> {
        const params = new HttpParams().append('AppType', AppType)
        return this.client.get<any[]>(this.baseUrl + "GetBasketColumnList", { headers: this.headers, params: params })
    }


    GetGoodType(): Observable<any[]> {
        const params = new HttpParams()
        return this.client.get<any[]>(this.baseUrl + "GetGoodType", { headers: this.headers });
    }
    GetProperty(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "GetProperty", { headers: this.headers, params: params })
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
        return this.client.get<any[]>(this.baseUrl + "InsertSingleColumn", { headers: this.headers, params: params })
    }




    UpdateDbSetup(DataValue: string, KeyId: string): Observable<any[]> {
        const params = new HttpParams().append('DataValue', DataValue).append('KeyId', KeyId)
        return this.client.get<any[]>(this.baseUrl + "UpdateDbSetup", { headers: this.headers, params: params })
    }



    GetAppPrinter(AppType: string): Observable<any[]> {
        const params = new HttpParams().append('AppType', AppType)
        return this.client.get<any[]>(this.baseUrl + "GetAppPrinter", { headers: this.headers, params: params })
    }

    UpdatePrinter(command): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "UpdatePrinter", command, { headers: this.headers });

    }





















    OcrFactorList(SearchTarget: string): Observable<any[]> {
        const params = new HttpParams().append('SearchTarget', SearchTarget)
        return this.client.get<any[]>(this.baseUrl + "OcrFactorList", { headers: this.headers, params: params })
    }
    ocrGetFactorDetail(AppOCRFactorCode: string): Observable<any[]> {
        const params = new HttpParams().append('AppOCRFactorCode', AppOCRFactorCode)
        return this.client.get<any[]>(this.baseUrl + "ocrGetFactorDetail", { headers: this.headers, params: params })
    }

    ExitDelivery(AppOCRFactorCode: string): Observable<any[]> {
        const params = new HttpParams().append('AppOCRFactorCode', AppOCRFactorCode)
        return this.client.get<any[]>(this.baseUrl + "ExitDelivery", { headers: this.headers, params: params })
    }



    SendImageToServer(command): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "UploadImage", command, { headers: this.headers })
    }


    GetImageFromServer(ObjectRef: string): Observable<any[]> {
        const params = new HttpParams().append('pixelScale', '300').append('ClassName', 'Central').append('ObjectRef', ObjectRef)
        return this.client.get<any[]>(this.baseUrl + "GetWebImagess", { headers: this.headers, params: params })

    }



}









