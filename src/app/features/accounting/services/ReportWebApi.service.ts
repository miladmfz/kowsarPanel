import { inject, Injectable } from '@angular/core';

import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AppConfigService } from 'src/app/app-config.service';

@Injectable({
  providedIn: 'root'
})
export class ReportWebApiService {


  baseUrl: string;
  headers: HttpHeaders;


  private readonly client = inject(HttpClient);
  private readonly config = inject(AppConfigService);

  constructor() {
    this.baseUrl = this.config.apiUrl + 'ReportWeb/';

    this.headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Access-Control-Allow-Origin', '*')
      .set('PersonInfoRef', sessionStorage.getItem('PersonInfoRef') ?? '');
  }



  GetGridSchemaAll(ClassName: string): Observable<any[]> {
    const params = new HttpParams().append('ClassName', ClassName)
    return this.client.get<any[]>(this.baseUrl + "GetGridSchemaAll", { headers: this.headers, params: params })
  }

  GetGridSchema(ClassName: string): Observable<any[]> {
    const params = new HttpParams().append('ClassName', ClassName)
    return this.client.get<any[]>(this.baseUrl + "GetGridSchema", { headers: this.headers, params: params })
  }

  GetStacks(): Observable<any[]> {
    return this.client.get<any[]>(this.baseUrl + "GetStacks", { headers: this.headers })
  }



  GetReports(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GetReports", command, { headers: this.headers })
  }

  GetReportsByCode(ReportCode: string): Observable<any[]> {
    const params = new HttpParams().append('ReportCode', ReportCode)
    return this.client.get<any[]>(this.baseUrl + "GetReportsByCode", { headers: this.headers, params: params })
  }

  BazaryabKarkardRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "BazaryabKarkardRpt", command, { headers: this.headers })
  }
  CustomerCityRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerCityRpt", command, { headers: this.headers })
  }
  CustomerGroupRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerGroupRpt", command, { headers: this.headers })
  }
  CustomerMandehRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerMandehRpt", command, { headers: this.headers })
  }
  AccSanadBrowseRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "AccSanadBrowseRpt", command, { headers: this.headers })
  }
  CustomerReceiveRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerReceiveRpt", command, { headers: this.headers })
  }
  CustomerPaymentRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerPaymentRpt", command, { headers: this.headers })
  }
  CustomerForoshRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerForoshRpt", command, { headers: this.headers })
  }
  CustomerActionTypeRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerActionTypeRpt", command, { headers: this.headers })
  }
  CustomerIdentificationEtebarRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerIdentificationEtebarRpt", command, { headers: this.headers })
  }
  CustomerFactorEtebarRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerFactorEtebarRpt", command, { headers: this.headers })
  }
  CustomerForoshCityRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerForoshCityRpt", command, { headers: this.headers })
  }
  PeriodicCustomerPurchaseRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "PeriodicCustomerPurchaseRpt", command, { headers: this.headers })
  }
  SellReportRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "SellReportRpt", command, { headers: this.headers })
  }
  PeriodicSellRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "PeriodicSellRpt", command, { headers: this.headers })
  }
  CustomerReceiveGroupRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerReceiveGroupRpt", command, { headers: this.headers })
  }
  CustomerReceiveCityRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerReceiveCityRpt", command, { headers: this.headers })
  }
  CustomerPaymentGroupRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerPaymentGroupRpt", command, { headers: this.headers })
  }
  CustomerPaymentCityRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerPaymentCityRpt", command, { headers: this.headers })
  }
  BulletinCitySellRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "BulletinCitySellRpt", command, { headers: this.headers })
  }
  CustomerFactorRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerFactorRpt", command, { headers: this.headers })
  }
  FactorRowsRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "FactorRowsRpt", command, { headers: this.headers })
  }
  CustomerPreFactorRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerPreFactorRpt", command, { headers: this.headers })
  }
  PreFactorRowsRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "PreFactorRowsRpt", command, { headers: this.headers })
  }
  CustomerReturnFactorRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerReturnFactorRpt", command, { headers: this.headers })
  }
  ReturnFactorRowsRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "ReturnFactorRowsRpt", command, { headers: this.headers })
  }
  SellReceivedFactorRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "SellReceivedFactorRpt", command, { headers: this.headers })
  }
  ShopfactorByPriceRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "ShopfactorByPriceRpt", command, { headers: this.headers })
  }
  CustomerGoodRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerGoodRpt", command, { headers: this.headers })
  }
  GoodForoshRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodForoshRpt", command, { headers: this.headers })
  }
  GoodCustomerRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodCustomerRpt", command, { headers: this.headers })
  }
  GoodFactorRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodFactorRpt", command, { headers: this.headers })
  }
  GoodFactorRowsRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodFactorRowsRpt", command, { headers: this.headers })
  }
  FactorTypeMonthlyGoodSellStateRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "FactorTypeMonthlyGoodSellStateRpt", command, { headers: this.headers })
  }
  BuyStyleMonthlyGoodSellStateRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "BuyStyleMonthlyGoodSellStateRpt", command, { headers: this.headers })
  }
  MonthlyGoodSellStateRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "MonthlyGoodSellStateRpt", command, { headers: this.headers })
  }
  SumofPeriodicGoodSellRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "SumofPeriodicGoodSellRpt", command, { headers: this.headers })
  }
  PeriodicGoodSellRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "PeriodicGoodSellRpt", command, { headers: this.headers })
  }
  PeriodicCustomerPurchaseSeparateRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "PeriodicCustomerPurchaseSeparateRpt", command, { headers: this.headers })
  }
  BulletinGroupNameSellRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "BulletinGroupNameSellRpt", command, { headers: this.headers })
  }
  GoodBulletinGroupSellRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodBulletinGroupSellRpt", command, { headers: this.headers })
  }
  CustomerIdentificationRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerIdentificationRpt", command, { headers: this.headers })
  }
  AllGoodsRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "AllGoodsRpt", command, { headers: this.headers })
  }
  GoodInStackRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodInStackRpt", command, { headers: this.headers })
  }
  GoodHistoryRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodHistoryRpt", command, { headers: this.headers })
  }
  GoodGroupRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodGroupRpt", command, { headers: this.headers })
  }
  GoodSefareshPointRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodSefareshPointRpt", command, { headers: this.headers })
  }
  PeriodicInOutGoodStateRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "PeriodicInOutGoodStateRpt", command, { headers: this.headers })
  }
  StackTransferRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "StackTransferRpt", command, { headers: this.headers })
  }
  StackTransferRowRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "StackTransferRowRpt", command, { headers: this.headers })
  }
  LastGoodSubCodeHistoryRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "LastGoodSubCodeHistoryRpt", command, { headers: this.headers })
  }
  CashReceiveRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CashReceiveRpt", command, { headers: this.headers })
  }
  CashPaymentRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CashPaymentRpt", command, { headers: this.headers })
  }
  CashReceiveCheckRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CashReceiveCheckRpt", command, { headers: this.headers })
  }
  BankPaymentCheckRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "BankPaymentCheckRpt", command, { headers: this.headers })
  }
  CheckHistoryRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CheckHistoryRpt", command, { headers: this.headers })
  }
  BrokerKarkardRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "BrokerKarkardRpt", command, { headers: this.headers })
  }
  CustomerWithoutGoodRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerWithoutGoodRpt", command, { headers: this.headers })
  }
  GoodInStackVerticalRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodInStackVerticalRpt", command, { headers: this.headers })
  }
  GoodSerialHistoryRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodSerialHistoryRpt", command, { headers: this.headers })
  }
  GoodSerialAmountControlRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodSerialAmountControlRpt", command, { headers: this.headers })
  }
  HesabPeriodicForCustomerAndVendorRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "HesabPeriodicForCustomerAndVendorRpt", command, { headers: this.headers })
  }
  StackSellRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "StackSellRpt", command, { headers: this.headers })
  }
  StackSellWithGoodGroupingRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "StackSellWithGoodGroupingRpt", command, { headers: this.headers })
  }
  TotalSellSanadTypeRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "TotalSellSanadTypeRpt", command, { headers: this.headers })
  }
  GoodSerialsRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodSerialsRpt", command, { headers: this.headers })
  }
  GoodSellSerialsRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodSellSerialsRpt", command, { headers: this.headers })
  }
  SellStackGroupingRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "SellStackGroupingRpt", command, { headers: this.headers })
  }
  CustomerReceiveMablaghRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerReceiveMablaghRpt", command, { headers: this.headers })
  }
  LogHistoryByFilterRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "LogHistoryByFilterRpt", command, { headers: this.headers })
  }
  GoodCycleWithStackRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodCycleWithStackRpt", command, { headers: this.headers })
  }
  SellUnPriceTipRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "SellUnPriceTipRpt", command, { headers: this.headers })
  }
  PrefactorShortageRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "PrefactorShortageRpt", command, { headers: this.headers })
  }
  GoodCycleRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodCycleRpt", command, { headers: this.headers })
  }
  FactorSellDariaftRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "FactorSellDariaftRpt", command, { headers: this.headers })
  }
  PeriodicCustomerDailyPurchaseCashRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "PeriodicCustomerDailyPurchaseCashRpt", command, { headers: this.headers })
  }
  PeriodicCustomerDailyPurchaseRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "PeriodicCustomerDailyPurchaseRpt", command, { headers: this.headers })
  }
  GoodReceiptRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodReceiptRpt", command, { headers: this.headers })
  }
  GoodReceiptRowsRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodReceiptRowsRpt", command, { headers: this.headers })
  }
  GoodIssueRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodIssueRpt", command, { headers: this.headers })
  }
  GoodIssueRowsRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodIssueRowsRpt", command, { headers: this.headers })
  }
  GoodRevisionRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodRevisionRpt", command, { headers: this.headers })
  }
  AllGoodAccountingGrpRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "AllGoodAccountingGrpRpt", command, { headers: this.headers })
  }
  GoodKardexRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "GoodKardexRpt", command, { headers: this.headers })
  }
  KardexRialyRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "KardexRialyRpt", command, { headers: this.headers })
  }
  FactorsSanadStackRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "FactorsSanadStackRpt", command, { headers: this.headers })
  }
  CustomerSponsorRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerSponsorRpt", command, { headers: this.headers })
  }
  CustomerDebitStateRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerDebitStateRpt", command, { headers: this.headers })
  }
  LastGoodSubCodeHistoryInStackRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "LastGoodSubCodeHistoryInStackRpt", command, { headers: this.headers })
  }
  BrokerKarkardDetailRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "BrokerKarkardDetailRpt", command, { headers: this.headers })
  }
  TcPrintFactorRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "TcPrintFactorRpt", command, { headers: this.headers })
  }
  TcPrintFactorAttachedRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "TcPrintFactorAttachedRpt", command, { headers: this.headers })
  }
  TcPrintReturnFactorRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "TcPrintReturnFactorRpt", command, { headers: this.headers })
  }
  TcPrintReturnFactorAttachedRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "TcPrintReturnFactorAttachedRpt", command, { headers: this.headers })
  }
  TcPrintReturnPurchaseRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "TcPrintReturnPurchaseRpt", command, { headers: this.headers })
  }
  TcPrintReturnPurchaseAttachedRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "TcPrintReturnPurchaseAttachedRpt", command, { headers: this.headers })
  }
  LogHistoryByFieldRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "LogHistoryByFieldRpt", command, { headers: this.headers })
  }
  CustomerVasigheRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerVasigheRpt", command, { headers: this.headers })
  }
  CustomerFactor_SanadTypeRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "CustomerFactor_SanadTypeRpt", command, { headers: this.headers })
  }
  DailyWorkRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "DailyWorkRpt", command, { headers: this.headers })
  }
  LastGoodWeightedAutomaticRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "LastGoodWeightedAutomaticRpt", command, { headers: this.headers })
  }
  LastGoodWeightedRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "LastGoodWeightedRpt", command, { headers: this.headers })
  }
  ReminderRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "ReminderRpt", command, { headers: this.headers })
  }
  SamaneGoodInputOutputRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "SamaneGoodInputOutputRpt", command, { headers: this.headers })
  }
  SamaneGoodInputOutputDetailRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "SamaneGoodInputOutputDetailRpt", command, { headers: this.headers })
  }
  PersonInfoSummaryRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "PersonInfoSummaryRpt", command, { headers: this.headers })
  }
  PersonEtebarReceiveRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "PersonEtebarReceiveRpt", command, { headers: this.headers })
  }
  PersonGoodRpt(command): Observable<any[]> {
    return this.client.post<any[]>(this.baseUrl + "PersonGoodRpt", command, { headers: this.headers })
  }

  /*
    GetKowsarCustomer(command): Observable<any[]> {
      return this.client.post<any[]>(this.baseUrl + "GetKowsarCustomer", command, { headers: this.headers })
    }
  
  
  
    DeleteWebPreFactorRows(FactorRowCode: string): Observable<any[]> {
      const params = new HttpParams().append('PreFactorRowCode', FactorRowCode)
      return this.client.get<any[]>(this.baseUrl + "DeleteWebPreFactorRows", { headers: this.headers, params: params })
    }
      */















}









