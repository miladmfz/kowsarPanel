import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment, } from 'src/environment/environment';

@Injectable({
    providedIn: 'root'
})
export class OcrWebApiService {

    constructor(private client: HttpClient) { }

    //baseUrl = environment.baseUrl_KowsarWeb;
    headers = new HttpHeaders()

        .set('content-type', 'application/json')
        .set('Access-Control-Allow-Origin', '*')
        .set('UserGuid', sessionStorage.getItem('UserGuid') + "")

    OcrWeb_url = environment.api_Url + "OcrWeb/";

    baseUrl = this.OcrWeb_url;


    //*********************************************************** */

    OcrFactorList(Searchtarget: string, SourceFlag: string): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "OcrFactorList", { Searchtarget, SourceFlag })
    }
    ocrGetFactorDetail(AppOCRFactorCode: string): Observable<any[]> {
        const params = new HttpParams().append('AppOCRFactorCode', AppOCRFactorCode)
        return this.client.get<any[]>(this.baseUrl + "ocrGetFactorDetail", { params: params })
    }

    ExitDelivery(AppOCRFactorCode: string): Observable<any[]> {
        const params = new HttpParams().append('AppOCRFactorCode', AppOCRFactorCode)
        return this.client.get<any[]>(this.baseUrl + "ExitDelivery", { params: params })
    }


    //*********************************************************** */



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









}









