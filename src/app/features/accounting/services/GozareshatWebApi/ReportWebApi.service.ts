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
export class ReportWebApiService {


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
    this.baseUrl = this.config.apiUrl + 'ReportWeb/';


  }



  GetAllGridSchemaReport(ClassName: string): Observable<any[]> {
    const params = new HttpParams().append('ClassName', ClassName)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetAllGridSchemaReport", { headers: this.headerService.headers, params: params }))
  }

  GetGridSchemaVisible(ClassName: string): Observable<any[]> {
    const params = new HttpParams().append('ClassName', ClassName)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetGridSchemaVisible", { headers: this.headerService.headers, params: params }))
  }



  GetStacks(): Observable<any[]> {
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetStacks", { headers: this.headerService.headers }))
  }

  GetReports(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GetReports", command, { headers: this.headerService.headers }))
  }











  GetReportsByCode(ReportCode: string): Observable<any[]> {
    const params = new HttpParams().append('ReportCode', ReportCode)
    return this.withLoading(this.client.get<any[]>(this.baseUrl + "GetReportsByCode", { headers: this.headerService.headers, params: params }))
  }

  BazaryabKarkardRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "BazaryabKarkardRpt", command, { headers: this.headerService.headers }))
  }
  CustomerCityRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerCityRpt", command, { headers: this.headerService.headers }))
  }
  CustomerGroupRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerGroupRpt", command, { headers: this.headerService.headers }))
  }
  CustomerMandehRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerMandehRpt", command, { headers: this.headerService.headers }))
  }
  AccSanadBrowseRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "AccSanadBrowseRpt", command, { headers: this.headerService.headers }))
  }
  CustomerReceiveRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerReceiveRpt", command, { headers: this.headerService.headers }))
  }
  CustomerPaymentRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerPaymentRpt", command, { headers: this.headerService.headers }))
  }
  CustomerForoshRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerForoshRpt", command, { headers: this.headerService.headers }))
  }
  CustomerActionTypeRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerActionTypeRpt", command, { headers: this.headerService.headers }))
  }
  CustomerIdentificationEtebarRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerIdentificationEtebarRpt", command, { headers: this.headerService.headers }))
  }
  CustomerFactorEtebarRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerFactorEtebarRpt", command, { headers: this.headerService.headers }))
  }
  CustomerForoshCityRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerForoshCityRpt", command, { headers: this.headerService.headers }))
  }
  PeriodicCustomerPurchaseRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PeriodicCustomerPurchaseRpt", command, { headers: this.headerService.headers }))
  }
  SellReportRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "SellReportRpt", command, { headers: this.headerService.headers }))
  }
  PeriodicSellRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PeriodicSellRpt", command, { headers: this.headerService.headers }))
  }
  CustomerReceiveGroupRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerReceiveGroupRpt", command, { headers: this.headerService.headers }))
  }
  CustomerReceiveCityRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerReceiveCityRpt", command, { headers: this.headerService.headers }))
  }
  CustomerPaymentGroupRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerPaymentGroupRpt", command, { headers: this.headerService.headers }))
  }
  CustomerPaymentCityRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerPaymentCityRpt", command, { headers: this.headerService.headers }))
  }
  BulletinCitySellRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "BulletinCitySellRpt", command, { headers: this.headerService.headers }))
  }
  CustomerFactorRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerFactorRpt", command, { headers: this.headerService.headers }))
  }
  FactorRowsRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "FactorRowsRpt", command, { headers: this.headerService.headers }))
  }
  CustomerPreFactorRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerPreFactorRpt", command, { headers: this.headerService.headers }))
  }
  PreFactorRowsRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PreFactorRowsRpt", command, { headers: this.headerService.headers }))
  }
  CustomerReturnFactorRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerReturnFactorRpt", command, { headers: this.headerService.headers }))
  }
  ReturnFactorRowsRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "ReturnFactorRowsRpt", command, { headers: this.headerService.headers }))
  }
  SellReceivedFactorRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "SellReceivedFactorRpt", command, { headers: this.headerService.headers }))
  }
  ShopfactorByPriceRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "ShopfactorByPriceRpt", command, { headers: this.headerService.headers }))
  }
  CustomerGoodRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerGoodRpt", command, { headers: this.headerService.headers }))
  }
  GoodForoshRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodForoshRpt", command, { headers: this.headerService.headers }))
  }
  GoodCustomerRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodCustomerRpt", command, { headers: this.headerService.headers }))
  }
  GoodFactorRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodFactorRpt", command, { headers: this.headerService.headers }))
  }
  GoodFactorRowsRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodFactorRowsRpt", command, { headers: this.headerService.headers }))
  }
  FactorTypeMonthlyGoodSellStateRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "FactorTypeMonthlyGoodSellStateRpt", command, { headers: this.headerService.headers }))
  }
  BuyStyleMonthlyGoodSellStateRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "BuyStyleMonthlyGoodSellStateRpt", command, { headers: this.headerService.headers }))
  }
  MonthlyGoodSellStateRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "MonthlyGoodSellStateRpt", command, { headers: this.headerService.headers }))
  }
  SumofPeriodicGoodSellRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "SumofPeriodicGoodSellRpt", command, { headers: this.headerService.headers }))
  }
  PeriodicGoodSellRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PeriodicGoodSellRpt", command, { headers: this.headerService.headers }))
  }
  PeriodicCustomerPurchaseSeparateRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PeriodicCustomerPurchaseSeparateRpt", command, { headers: this.headerService.headers }))
  }
  BulletinGroupNameSellRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "BulletinGroupNameSellRpt", command, { headers: this.headerService.headers }))
  }
  GoodBulletinGroupSellRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodBulletinGroupSellRpt", command, { headers: this.headerService.headers }))
  }
  CustomerIdentificationRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerIdentificationRpt", command, { headers: this.headerService.headers }))
  }
  AllGoodsRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "AllGoodsRpt", command, { headers: this.headerService.headers }))
  }
  GoodInStackRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodInStackRpt", command, { headers: this.headerService.headers }))
  }
  GoodHistoryRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodHistoryRpt", command, { headers: this.headerService.headers }))
  }
  GoodGroupRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodGroupRpt", command, { headers: this.headerService.headers }))
  }
  GoodSefareshPointRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodSefareshPointRpt", command, { headers: this.headerService.headers }))
  }
  PeriodicInOutGoodStateRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PeriodicInOutGoodStateRpt", command, { headers: this.headerService.headers }))
  }
  StackTransferRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "StackTransferRpt", command, { headers: this.headerService.headers }))
  }
  StackTransferRowRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "StackTransferRowRpt", command, { headers: this.headerService.headers }))
  }
  LastGoodSubCodeHistoryRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "LastGoodSubCodeHistoryRpt", command, { headers: this.headerService.headers }))
  }
  CashReceiveRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CashReceiveRpt", command, { headers: this.headerService.headers }))
  }
  CashPaymentRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CashPaymentRpt", command, { headers: this.headerService.headers }))
  }
  CashReceiveCheckRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CashReceiveCheckRpt", command, { headers: this.headerService.headers }))
  }
  BankPaymentCheckRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "BankPaymentCheckRpt", command, { headers: this.headerService.headers }))
  }
  CheckHistoryRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CheckHistoryRpt", command, { headers: this.headerService.headers }))
  }
  BrokerKarkardRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "BrokerKarkardRpt", command, { headers: this.headerService.headers }))
  }
  CustomerWithoutGoodRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerWithoutGoodRpt", command, { headers: this.headerService.headers }))
  }
  GoodInStackVerticalRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodInStackVerticalRpt", command, { headers: this.headerService.headers }))
  }
  GoodSerialHistoryRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodSerialHistoryRpt", command, { headers: this.headerService.headers }))
  }
  GoodSerialAmountControlRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodSerialAmountControlRpt", command, { headers: this.headerService.headers }))
  }
  HesabPeriodicForCustomerAndVendorRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "HesabPeriodicForCustomerAndVendorRpt", command, { headers: this.headerService.headers }))
  }
  StackSellRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "StackSellRpt", command, { headers: this.headerService.headers }))
  }
  StackSellWithGoodGroupingRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "StackSellWithGoodGroupingRpt", command, { headers: this.headerService.headers }))
  }
  TotalSellSanadTypeRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "TotalSellSanadTypeRpt", command, { headers: this.headerService.headers }))
  }
  GoodSerialsRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodSerialsRpt", command, { headers: this.headerService.headers }))
  }
  GoodSellSerialsRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodSellSerialsRpt", command, { headers: this.headerService.headers }))
  }
  SellStackGroupingRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "SellStackGroupingRpt", command, { headers: this.headerService.headers }))
  }
  CustomerReceiveMablaghRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerReceiveMablaghRpt", command, { headers: this.headerService.headers }))
  }
  LogHistoryByFilterRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "LogHistoryByFilterRpt", command, { headers: this.headerService.headers }))
  }
  GoodCycleWithStackRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodCycleWithStackRpt", command, { headers: this.headerService.headers }))
  }
  SellUnPriceTipRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "SellUnPriceTipRpt", command, { headers: this.headerService.headers }))
  }
  PrefactorShortageRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PrefactorShortageRpt", command, { headers: this.headerService.headers }))
  }
  GoodCycleRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodCycleRpt", command, { headers: this.headerService.headers }))
  }
  FactorSellDariaftRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "FactorSellDariaftRpt", command, { headers: this.headerService.headers }))
  }
  PeriodicCustomerDailyPurchaseCashRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PeriodicCustomerDailyPurchaseCashRpt", command, { headers: this.headerService.headers }))
  }
  PeriodicCustomerDailyPurchaseRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PeriodicCustomerDailyPurchaseRpt", command, { headers: this.headerService.headers }))
  }
  GoodReceiptRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodReceiptRpt", command, { headers: this.headerService.headers }))
  }
  GoodReceiptRowsRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodReceiptRowsRpt", command, { headers: this.headerService.headers }))
  }
  GoodIssueRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodIssueRpt", command, { headers: this.headerService.headers }))
  }
  GoodIssueRowsRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodIssueRowsRpt", command, { headers: this.headerService.headers }))
  }
  GoodRevisionRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodRevisionRpt", command, { headers: this.headerService.headers }))
  }
  AllGoodAccountingGrpRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "AllGoodAccountingGrpRpt", command, { headers: this.headerService.headers }))
  }
  GoodKardexRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "GoodKardexRpt", command, { headers: this.headerService.headers }))
  }
  KardexRialyRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "KardexRialyRpt", command, { headers: this.headerService.headers }))
  }
  FactorsSanadStackRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "FactorsSanadStackRpt", command, { headers: this.headerService.headers }))
  }
  CustomerSponsorRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerSponsorRpt", command, { headers: this.headerService.headers }))
  }
  CustomerDebitStateRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerDebitStateRpt", command, { headers: this.headerService.headers }))
  }
  LastGoodSubCodeHistoryInStackRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "LastGoodSubCodeHistoryInStackRpt", command, { headers: this.headerService.headers }))
  }
  BrokerKarkardDetailRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "BrokerKarkardDetailRpt", command, { headers: this.headerService.headers }))
  }
  TcPrintFactorRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "TcPrintFactorRpt", command, { headers: this.headerService.headers }))
  }
  TcPrintFactorAttachedRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "TcPrintFactorAttachedRpt", command, { headers: this.headerService.headers }))
  }
  TcPrintReturnFactorRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "TcPrintReturnFactorRpt", command, { headers: this.headerService.headers }))
  }
  TcPrintReturnFactorAttachedRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "TcPrintReturnFactorAttachedRpt", command, { headers: this.headerService.headers }))
  }
  TcPrintReturnPurchaseRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "TcPrintReturnPurchaseRpt", command, { headers: this.headerService.headers }))
  }
  TcPrintReturnPurchaseAttachedRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "TcPrintReturnPurchaseAttachedRpt", command, { headers: this.headerService.headers }))
  }
  LogHistoryByFieldRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "LogHistoryByFieldRpt", command, { headers: this.headerService.headers }))
  }
  CustomerVasigheRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerVasigheRpt", command, { headers: this.headerService.headers }))
  }
  CustomerFactor_SanadTypeRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "CustomerFactor_SanadTypeRpt", command, { headers: this.headerService.headers }))
  }
  DailyWorkRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "DailyWorkRpt", command, { headers: this.headerService.headers }))
  }
  LastGoodWeightedAutomaticRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "LastGoodWeightedAutomaticRpt", command, { headers: this.headerService.headers }))
  }
  LastGoodWeightedRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "LastGoodWeightedRpt", command, { headers: this.headerService.headers }))
  }
  ReminderRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "ReminderRpt", command, { headers: this.headerService.headers }))
  }
  SamaneGoodInputOutputRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "SamaneGoodInputOutputRpt", command, { headers: this.headerService.headers }))
  }
  SamaneGoodInputOutputDetailRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "SamaneGoodInputOutputDetailRpt", command, { headers: this.headerService.headers }))
  }
  PersonInfoSummaryRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PersonInfoSummaryRpt", command, { headers: this.headerService.headers }))
  }
  PersonEtebarReceiveRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PersonEtebarReceiveRpt", command, { headers: this.headerService.headers }))
  }
  PersonGoodRpt(command): Observable<any[]> {
    return this.withLoading(this.client.post<any[]>(this.baseUrl + "PersonGoodRpt", command, { headers: this.headerService.headers }))
  }











}









