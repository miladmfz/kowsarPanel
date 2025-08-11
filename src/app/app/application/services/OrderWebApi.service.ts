import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
    providedIn: 'root'
})
export class OrderWebApiService {





    baseUrl: string;
    headers: HttpHeaders;

    constructor(private client: HttpClient, private config: AppConfigService) {
        this.baseUrl = this.config.apiUrl + 'OrderWeb/';

        this.headers = new HttpHeaders()
            .set('Content-Type', 'application/json')
            .set('Access-Control-Allow-Origin', '*')
            .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') ?? '');
    }




    //-*---------------------------------------------------


    OrderMizList(InfoState: string, MizType: string): Observable<any[]> {
        const params = new HttpParams().append('InfoState', InfoState).append('MizType', MizType)
        return this.client.get<any[]>(this.baseUrl + "OrderMizList", { headers: this.headers, params: params })
    }

    GetAmountItem(Date: string, State: string): Observable<any[]> {
        const params = new HttpParams().append('Date', Date).append('State', State)
        return this.client.get<any[]>(this.baseUrl + "GetAmountItem", { headers: this.headers, params: params })
    }

    GetTodeyFromServer(Day: string): Observable<any[]> {
        const params = new HttpParams().append('Day', Day)
        return this.client.get<any[]>(this.baseUrl + "GetTodeyFromServer", { headers: this.headers, params: params })
    }



    GetOrderPanel(StartDate: string, EndDate: string, State: string): Observable<any[]> {
        const params = new HttpParams().append('StartDate', StartDate).append('EndDate', EndDate).append('State', State)
        return this.client.get<any[]>(this.baseUrl + "GetOrderPanel", { headers: this.headers, params: params })
    }

    GetCustomerMandeh(): Observable<any[]> {
        const params = new HttpParams()
        return this.client.get<any[]>(this.baseUrl + "GetCustomerMandeh", { headers: this.headers });
    }


    GetCustomerlastGood(CustomerCode: string): Observable<any[]> {
        const params = new HttpParams().append('CustomerCode', CustomerCode)

        return this.client.get<any[]>(this.baseUrl + "GetCustomerlastGood", { headers: this.headers, params: params })
    }


    //----------------------------------------------------



    GetOrderGoodList(RowCount: string, Where: string, GroupCode: string): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "GetOrderGoodList", { RowCount, Where, GroupCode }, { headers: this.headers })
    }


    GetOrdergroupList(GroupCode: string): Observable<any[]> {
        const params = new HttpParams().append('GroupCode', GroupCode)
        return this.client.get<any[]>(this.baseUrl + "GetOrdergroupList", { headers: this.headers, params: params })
    }



    kowsar_info(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "kowsar_info", { headers: this.headers, params: params })
    }

    GetGoodEdit(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "GetGoodEdit", { headers: this.headers, params: params })
    }



    GetGroupFromGood(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "GetGroupFromGood", { headers: this.headers, params: params })
    }



    GetGoodFromGroup(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "GetGoodFromGroup", { headers: this.headers, params: params })
    }


    Web_InsertGood(GoodCode: string, GoodName: string, MaxSellPrice: string, GoodExplain1: string, GoodExplain2: string, GoodExplain3: string, GoodExplain4: string, GoodExplain5: string, GoodExplain6: string): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "Web_InsertGood", { GoodCode, GoodName, MaxSellPrice, GoodExplain1, GoodExplain2, GoodExplain3, GoodExplain4, GoodExplain5, GoodExplain6 }, { headers: this.headers })
    }


    Web_UpdateGoodDetail(GoodCode: string, GoodName: string, MaxSellPrice: string, GoodExplain1: string, GoodExplain2: string, GoodExplain3: string, GoodExplain4: string, GoodExplain5: string, GoodExplain6: string): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "Web_UpdateGoodDetail", { GoodCode, GoodName, MaxSellPrice, GoodExplain1, GoodExplain2, GoodExplain3, GoodExplain4, GoodExplain5, GoodExplain6 }, { headers: this.headers })
    }

    DeleteGoodGroupCode(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "DeleteGoodGroupCode", { headers: this.headers, params: params })
    }

    ChangeGoodActive(GoodCode: string, ActiveFlag: string): Observable<any[]> {
        const params = new HttpParams().append('GoodCode', GoodCode).append('ActiveFlag', ActiveFlag)
        return this.client.get<any[]>(this.baseUrl + "ChangeGoodActive", { headers: this.headers, params: params })
    }

    GetActiveGood(GoodCode: string): Observable<any[]> {
        const params = new HttpParams().append('GoodCode', GoodCode)
        return this.client.get<any[]>(this.baseUrl + "GetActiveGood", { headers: this.headers, params: params })
    }





    //-----------------------------------------------------------------
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




    SendImageToServer(command): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "UploadImage", command, { headers: this.headers })
    }


    GetImageFromServer(ObjectRef: string): Observable<any[]> {
        const params = new HttpParams().append('pixelScale', '300').append('ClassName', 'TGood').append('ObjectRef', ObjectRef)
        return this.client.get<any[]>(this.baseUrl + "GetWebImagess", { headers: this.headers, params: params })

    }



}









