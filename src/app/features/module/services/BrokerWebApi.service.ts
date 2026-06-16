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
export class BrokerWebApiService {



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
        this.baseUrl = this.config.apiUrl + 'BrokerWeb/';


    }





    //------------------------------------------------


    GetGpstracker(BrokerCode: string, StartDate: string, EndDate: string): Observable<any[]> {
        const params = new HttpParams().append('BrokerCode', BrokerCode).append('StartDate', StartDate).append('EndDate', EndDate)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGpstracker", { headers: this.headerService.headers, params: params }))
    }



    GetBrokerCustomer(BrokerCode: string, FactorDate: string): Observable<any[]> {
        const params = new HttpParams().append('BrokerCode', BrokerCode).append('FactorDate', FactorDate)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetBrokerCustomer", { headers: this.headerService.headers, params: params }))
    }




    GetBrokers(): Observable<any[]> {

        return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetBrokers", { headers: this.headerService.headers }))
    }



    GetBrokerDetail(BrokerCode: string): Observable<any[]> {
        const params = new HttpParams().append('BrokerCode', BrokerCode)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetBrokerDetail", { headers: this.headerService.headers, params: params }))
    }

    GetAppBrokerReport(command): Observable<any[]> {

        // flag report
        //   
        //  1- GetCDPreFactorDate
        //  2- GetCDCustName
        //  3- GetPrefactorBroker
        //  4-
        return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetAppBrokerReport", command, { headers: this.headerService.headers }))

    }

    GetPrefactorBroker(BrokerCode: string, Days: string): Observable<any[]> {
        const params = new HttpParams().append('BrokerCode', BrokerCode).append('Days', Days)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetPrefactorBroker", { headers: this.headerService.headers, params: params }))
    }



    GetCDCustName(BrokerCode: string, Days: string): Observable<any[]> {
        const params = new HttpParams().append('BrokerCode', BrokerCode).append('Days', Days)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetCDCustName", { headers: this.headerService.headers, params: params }))
    }



    GetCDPreFactorDate(BrokerCode: string, Days: string): Observable<any[]> {
        const params = new HttpParams().append('BrokerCode', BrokerCode).append('Days', Days)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetCDPreFactorDate", { headers: this.headerService.headers, params: params }))
    }

    CreateAppBroker(KowsarDb: string, KowsarImage: string): Observable<any[]> {
        const params = new HttpParams().append('KowsarDb', KowsarDb).append('KowsarImage', KowsarImage)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "CreateAppBroker", { headers: this.headerService.headers, params: params }))
    }


    BrokerCustomerRefresh(): Observable<any[]> {
        const params = new HttpParams()
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "BrokerCustomerRefresh", { headers: this.headerService.headers }))
    }


    BasketColumnCard(Where: string, AppType: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where).append('AppType', AppType)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "BasketColumnCard", { headers: this.headerService.headers, params: params }))
    }


    Web_GetDbsetupObject(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "Web_GetDbsetupObject", { headers: this.headerService.headers, params: params }))
    }


    CreateBasketColumn(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "CreateBasketColumn", { headers: this.headerService.headers, params: params }))
    }




    GetBasketColumnList(AppType: string): Observable<any[]> {
        const params = new HttpParams().append('AppType', AppType)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetBasketColumnList", { headers: this.headerService.headers, params: params }))
    }


    GetGoodType(): Observable<any[]> {
        const params = new HttpParams()
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGoodType", { headers: this.headerService.headers }))
    }
    GetProperty(Where: string): Observable<any[]> {
        const params = new HttpParams().append('Where', Where)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetProperty", { headers: this.headerService.headers, params: params }))
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
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "InsertSingleColumn", { headers: this.headerService.headers, params: params }))
    }




    UpdateDbSetup(DataValue: string, KeyId: string): Observable<any[]> {
        const params = new HttpParams().append('DataValue', DataValue).append('KeyId', KeyId)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "UpdateDbSetup", { headers: this.headerService.headers, params: params }))
    }



    GetAppPrinter(AppType: string): Observable<any[]> {
        const params = new HttpParams().append('AppType', AppType)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetAppPrinter", { headers: this.headerService.headers, params: params }))
    }

    UpdatePrinter(command): Observable<any[]> {
        return this.withLoading(this.client.post<any[]>(this.baseUrl + "UpdatePrinter", command, { headers: this.headerService.headers }));

    }


    OcrFactorList(SearchTarget: string): Observable<any[]> {
        const params = new HttpParams().append('SearchTarget', SearchTarget)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "OcrFactorList", { headers: this.headerService.headers, params: params }))
    }
    ocrGetFactorDetail(AppOCRFactorCode: string): Observable<any[]> {
        const params = new HttpParams().append('AppOCRFactorCode', AppOCRFactorCode)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "ocrGetFactorDetail", { headers: this.headerService.headers, params: params }))
    }

    ExitDelivery(AppOCRFactorCode: string): Observable<any[]> {
        const params = new HttpParams().append('AppOCRFactorCode', AppOCRFactorCode)
        return this.withLoading(this.client.get<any[]>(this.baseUrl + "ExitDelivery", { headers: this.headerService.headers, params: params }))
    }








}









