import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment, } from 'src/environment/environment';

@Injectable({
    providedIn: 'root'
})
export class OrderWebApiService {

    constructor(private client: HttpClient) { }

    //baseUrl = environment.baseUrl_KowsarWeb;
    headers = new HttpHeaders()

        .set('content-type', 'application/json')
        .set('Access-Control-Allow-Origin', '*')
        .set('UserGuid', sessionStorage.getItem('UserGuid') + "")


    OrderWeb_url = environment.api_Url + "OrderWeb/";
    baseUrl = this.OrderWeb_url;



    //-*---------------------------------------------------


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



    minMaxGood(StartDate: string, EndDate: string, State: string): Observable<any[]> {
        const params = new HttpParams().append('StartDate', StartDate).append('EndDate', EndDate).append('State', State)
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


    //----------------------------------------------------



    GetOrderGoodList(RowCount: string, Where: string, GroupCode: string): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "GetOrderGoodList", { RowCount, Where, GroupCode })
    }


    GetOrdergroupList(GroupCode: string): Observable<any[]> {
        const params = new HttpParams().append('GroupCode', GroupCode)
        return this.client.get<any[]>(this.baseUrl + "GetOrdergroupList", { params: params })
    }



    kowsar_info(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "kowsar_info", { params: params })
    }

    GetGoodEdit(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "GetGoodEdit", { params: params })
    }



    GetGroupFromGood(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "GetGroupFromGood", { params: params })
    }



    GetGoodFromGroup(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "GetGoodFromGroup", { params: params })
    }


    Web_InsertGood(GoodCode: string, GoodName: string, MaxSellPrice: string, GoodExplain1: string, GoodExplain2: string, GoodExplain3: string, GoodExplain4: string, GoodExplain5: string, GoodExplain6: string): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "Web_InsertGood", { GoodCode, GoodName, MaxSellPrice, GoodExplain1, GoodExplain2, GoodExplain3, GoodExplain4, GoodExplain5, GoodExplain6 })
    }


    Web_UpdateGoodDetail(GoodCode: string, GoodName: string, MaxSellPrice: string, GoodExplain1: string, GoodExplain2: string, GoodExplain3: string, GoodExplain4: string, GoodExplain5: string, GoodExplain6: string): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "Web_UpdateGoodDetail", { GoodCode, GoodName, MaxSellPrice, GoodExplain1, GoodExplain2, GoodExplain3, GoodExplain4, GoodExplain5, GoodExplain6 })
    }

    DeleteGoodGroupCode(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.client.get<any[]>(this.baseUrl + "DeleteGoodGroupCode", { params: params })
    }

    ChangeGoodActive(GoodCode: string, ActiveFlag: string): Observable<any[]> {
        const params = new HttpParams().append('GoodCode', GoodCode).append('ActiveFlag', ActiveFlag)
        return this.client.get<any[]>(this.baseUrl + "ChangeGoodActive", { params: params })
    }

    GetActiveGood(GoodCode: string): Observable<any[]> {
        const params = new HttpParams().append('GoodCode', GoodCode)
        return this.client.get<any[]>(this.baseUrl + "GetActiveGood", { params: params })
    }





    //-----------------------------------------------------------------
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




    SendImageToServer(command): Observable<any[]> {
        return this.client.post<any[]>(this.baseUrl + "UploadImage", command)
    }


    GetImageFromServer(ObjectRef: string): Observable<any[]> {
        const params = new HttpParams().append('pixelScale', '300').append('ClassName', 'TGood').append('ObjectRef', ObjectRef)
        return this.client.get<any[]>(this.baseUrl + "GetWebImagess", { params: params })

    }



}









