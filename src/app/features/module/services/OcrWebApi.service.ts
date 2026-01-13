import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
    providedIn: 'root'
})
export class OcrWebApiService {




    baseUrl: string;
    headers: HttpHeaders;

    constructor(private client: HttpClient, private config: AppConfigService) {
        this.baseUrl = this.config.apiUrl + 'OcrWeb/';

        this.headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Access-Control-Allow-Origin', '*')
            .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') ?? '');
    }


    //*********************************************************** */

    OcrFactorList(Searchtarget: string, SourceFlag: string): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "OcrFactorList", { Searchtarget, SourceFlag }, { headers: this.headers })
    }
    ocrGetFactorDetail(AppOCRFactorCode: string): Observable<any[]> {
        const params = new HttpParams().append('AppOCRFactorCode', AppOCRFactorCode)
        return this.client.get<any[]>(this.baseUrl + "ocrGetFactorDetail", { headers: this.headers, params: params })
    }

    ExitDelivery(AppOCRFactorCode: string): Observable<any[]> {
        const params = new HttpParams().append('AppOCRFactorCode', AppOCRFactorCode)
        return this.client.get<any[]>(this.baseUrl + "ExitDelivery", { headers: this.headers, params: params })
    }

    GetTodeyFromServer(Day: string): Observable<any[]> {
        const params = new HttpParams().append('Day', Day)
        return this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer", { headers: this.headers, params: params })
    }


    GetOcrPanel(StartDate: string, EndDate: string, State: string): Observable<any[]> {
        const params = new HttpParams().append('StartDate', StartDate).append('EndDate', EndDate).append('State', State)
        return this.client.get<any[]>(this.baseUrl + "GetOcrPanel", { headers: this.headers, params: params })
    }






    //*********************************************************** */



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
        return this.client.get<any[]>(this.baseUrl + "GetGoodType");
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









}









