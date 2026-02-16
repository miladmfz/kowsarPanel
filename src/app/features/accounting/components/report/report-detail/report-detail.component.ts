import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

import { ReportWebApiService } from '../../../services/ReportWebApi.service';
import { BazaryabKarkardRptComponent } from './components/BazaryabKarkardRpt/BazaryabKarkardRpt.component';
import { CustomerCityRptComponent } from './components/CustomerCityRpt/CustomerCityRpt.component';
import { CustomerGroupRptComponent } from './components/CustomerGroupRpt/CustomerGroupRpt.component';
import { CustomerMandehRptComponent } from './components/CustomerMandehRpt/CustomerMandehRpt.component';
import { AccSanadBrowseRptComponent } from './components/AccSanadBrowseRpt/AccSanadBrowseRpt.component';
import { CustomerReceiveRptComponent } from './components/CustomerReceiveRpt/CustomerReceiveRpt.component';
import { CustomerPaymentRptComponent } from './components/CustomerPaymentRpt/CustomerPaymentRpt.component';
import { CustomerForoshRptComponent } from './components/CustomerForoshRpt/CustomerForoshRpt.component';
import { CustomerActionTypeRptComponent } from './components/CustomerActionTypeRpt/CustomerActionTypeRpt.component';
import { CustomerIdentificationEtebarRptComponent } from './components/CustomerIdentificationEtebarRpt/CustomerIdentificationEtebarRpt.component';
import { CustomerFactorEtebarRptComponent } from './components/CustomerFactorEtebarRpt/CustomerFactorEtebarRpt.component';
import { CustomerForoshCityRptComponent } from './components/CustomerForoshCityRpt/CustomerForoshCityRpt.component';
import { PeriodicCustomerPurchaseRptComponent } from './components/PeriodicCustomerPurchaseRpt/PeriodicCustomerPurchaseRpt.component';
import { SellReportRptComponent } from './components/SellReportRpt/SellReportRpt.component';
import { PeriodicSellRptComponent } from './components/PeriodicSellRpt/PeriodicSellRpt.component';
import { CustomerReceiveGroupRptComponent } from './components/CustomerReceiveGroupRpt/CustomerReceiveGroupRpt.component';
import { CustomerReceiveCityRptComponent } from './components/CustomerReceiveCityRpt/CustomerReceiveCityRpt.component';
import { CustomerPaymentGroupRptComponent } from './components/CustomerPaymentGroupRpt/CustomerPaymentGroupRpt.component';
import { CustomerPaymentCityRptComponent } from './components/CustomerPaymentCityRpt/CustomerPaymentCityRpt.component';
import { BulletinCitySellRptComponent } from './components/BulletinCitySellRpt/BulletinCitySellRpt.component';
import { CustomerFactorRptComponent } from './components/CustomerFactorRpt/CustomerFactorRpt.component';
import { FactorRowsRptComponent } from './components/FactorRowsRpt/FactorRowsRpt.component';
import { CustomerPreFactorRptComponent } from './components/CustomerPreFactorRpt/CustomerPreFactorRpt.component';
import { PreFactorRowsRptComponent } from './components/PreFactorRowsRpt/PreFactorRowsRpt.component';
import { CustomerReturnFactorRptComponent } from './components/CustomerReturnFactorRpt/CustomerReturnFactorRpt.component';
import { ReturnFactorRowsRptComponent } from './components/ReturnFactorRowsRpt/ReturnFactorRowsRpt.component';
import { SellReceivedFactorRptComponent } from './components/SellReceivedFactorRpt/SellReceivedFactorRpt.component';
import { ShopfactorByPriceRptComponent } from './components/ShopfactorByPriceRpt/ShopfactorByPriceRpt.component';
import { CustomerGoodRptComponent } from './components/CustomerGoodRpt/CustomerGoodRpt.component';
import { GoodForoshRptComponent } from './components/GoodForoshRpt/GoodForoshRpt.component';
import { GoodCustomerRptComponent } from './components/GoodCustomerRpt/GoodCustomerRpt.component';
import { GoodFactorRptComponent } from './components/GoodFactorRpt/GoodFactorRpt.component';
import { GoodFactorRowsRptComponent } from './components/GoodFactorRowsRpt/GoodFactorRowsRpt.component';
import { FactorTypeMonthlyGoodSellStateRptComponent } from './components/FactorTypeMonthlyGoodSellStateRpt/FactorTypeMonthlyGoodSellStateRpt.component';
import { BuyStyleMonthlyGoodSellStateRptComponent } from './components/BuyStyleMonthlyGoodSellStateRpt/BuyStyleMonthlyGoodSellStateRpt.component';
import { MonthlyGoodSellStateRptComponent } from './components/MonthlyGoodSellStateRpt/MonthlyGoodSellStateRpt.component';
import { SumofPeriodicGoodSellRptComponent } from './components/SumofPeriodicGoodSellRpt/SumofPeriodicGoodSellRpt.component';
import { PeriodicGoodSellRptComponent } from './components/PeriodicGoodSellRpt/PeriodicGoodSellRpt.component';
import { PeriodicCustomerPurchaseSeparateRptComponent } from './components/PeriodicCustomerPurchaseSeparateRpt/PeriodicCustomerPurchaseSeparateRpt.component';
import { BulletinGroupNameSellRptComponent } from './components/BulletinGroupNameSellRpt/BulletinGroupNameSellRpt.component';
import { GoodBulletinGroupSellRptComponent } from './components/GoodBulletinGroupSellRpt/GoodBulletinGroupSellRpt.component';
import { CustomerIdentificationRptComponent } from './components/CustomerIdentificationRpt/CustomerIdentificationRpt.component';
import { AllGoodsRptComponent } from './components/AllGoodsRpt/AllGoodsRpt.component';
import { GoodInStackRptComponent } from './components/GoodInStackRpt/GoodInStackRpt.component';
import { GoodHistoryRptComponent } from './components/GoodHistoryRpt/GoodHistoryRpt.component';
import { GoodGroupRptComponent } from './components/GoodGroupRpt/GoodGroupRpt.component';
import { GoodSefareshPointRptComponent } from './components/GoodSefareshPointRpt/GoodSefareshPointRpt.component';
import { PeriodicInOutGoodStateRptComponent } from './components/PeriodicInOutGoodStateRpt/PeriodicInOutGoodStateRpt.component';
import { StackTransferRptComponent } from './components/StackTransferRpt/StackTransferRpt.component';
import { StackTransferRowRptComponent } from './components/StackTransferRowRpt/StackTransferRowRpt.component';
import { LastGoodSubCodeHistoryRptComponent } from './components/LastGoodSubCodeHistoryRpt/LastGoodSubCodeHistoryRpt.component';
import { CashReceiveRptComponent } from './components/CashReceiveRpt/CashReceiveRpt.component';
import { CashPaymentRptComponent } from './components/CashPaymentRpt/CashPaymentRpt.component';
import { CashReceiveCheckRptComponent } from './components/CashReceiveCheckRpt/CashReceiveCheckRpt.component';
import { BankPaymentCheckRptComponent } from './components/BankPaymentCheckRpt/BankPaymentCheckRpt.component';
import { CheckHistoryRptComponent } from './components/CheckHistoryRpt/CheckHistoryRpt.component';
import { BrokerKarkardRptComponent } from './components/BrokerKarkardRpt/BrokerKarkardRpt.component';
import { CustomerWithoutGoodRptComponent } from './components/CustomerWithoutGoodRpt/CustomerWithoutGoodRpt.component';
import { GoodInStackVerticalRptComponent } from './components/GoodInStackVerticalRpt/GoodInStackVerticalRpt.component';
import { GoodSerialHistoryRptComponent } from './components/GoodSerialHistoryRpt/GoodSerialHistoryRpt.component';
import { GoodSerialAmountControlRptComponent } from './components/GoodSerialAmountControlRpt/GoodSerialAmountControlRpt.component';
import { HesabPeriodicForCustomerAndVendorRptComponent } from './components/HesabPeriodicForCustomerAndVendorRpt/HesabPeriodicForCustomerAndVendorRpt.component';
import { StackSellRptComponent } from './components/StackSellRpt/StackSellRpt.component';
import { StackSellWithGoodGroupingRptComponent } from './components/StackSellWithGoodGroupingRpt/StackSellWithGoodGroupingRpt.component';
import { TotalSellSanadTypeRptComponent } from './components/TotalSellSanadTypeRpt/TotalSellSanadTypeRpt.component';
import { GoodSerialsRptComponent } from './components/GoodSerialsRpt/GoodSerialsRpt.component';
import { GoodSellSerialsRptComponent } from './components/GoodSellSerialsRpt/GoodSellSerialsRpt.component';
import { SellStackGroupingRptComponent } from './components/SellStackGroupingRpt/SellStackGroupingRpt.component';
import { CustomerReceiveMablaghRptComponent } from './components/CustomerReceiveMablaghRpt/CustomerReceiveMablaghRpt.component';
import { LogHistoryByFilterRptComponent } from './components/LogHistoryByFilterRpt/LogHistoryByFilterRpt.component';
import { GoodCycleWithStackRptComponent } from './components/GoodCycleWithStackRpt/GoodCycleWithStackRpt.component';
import { SellUnPriceTipRptComponent } from './components/SellUnPriceTipRpt/SellUnPriceTipRpt.component';
import { PrefactorShortageRptComponent } from './components/PrefactorShortageRpt/PrefactorShortageRpt.component';
import { GoodCycleRptComponent } from './components/GoodCycleRpt/GoodCycleRpt.component';
import { FactorSellDariaftRptComponent } from './components/FactorSellDariaftRpt/FactorSellDariaftRpt.component';
import { PeriodicCustomerDailyPurchaseCashRptComponent } from './components/PeriodicCustomerDailyPurchaseCashRpt/PeriodicCustomerDailyPurchaseCashRpt.component';
import { PeriodicCustomerDailyPurchaseRptComponent } from './components/PeriodicCustomerDailyPurchaseRpt/PeriodicCustomerDailyPurchaseRpt.component';
import { GoodReceiptRptComponent } from './components/GoodReceiptRpt/GoodReceiptRpt.component';
import { GoodReceiptRowsRptComponent } from './components/GoodReceiptRowsRpt/GoodReceiptRowsRpt.component';
import { GoodIssueRptComponent } from './components/GoodIssueRpt/GoodIssueRpt.component';
import { GoodIssueRowsRptComponent } from './components/GoodIssueRowsRpt/GoodIssueRowsRpt.component';
import { GoodRevisionRptComponent } from './components/GoodRevisionRpt/GoodRevisionRpt.component';
import { AllGoodAccountingGrpRptComponent } from './components/AllGoodAccountingGrpRpt/AllGoodAccountingGrpRpt.component';
import { GoodKardexRptComponent } from './components/GoodKardexRpt/GoodKardexRpt.component';
import { KardexRialyRptComponent } from './components/KardexRialyRpt/KardexRialyRpt.component';
import { FactorsSanadStackRptComponent } from './components/FactorsSanadStackRpt/FactorsSanadStackRpt.component';
import { CustomerSponsorRptComponent } from './components/CustomerSponsorRpt/CustomerSponsorRpt.component';
import { CustomerDebitStateRptComponent } from './components/CustomerDebitStateRpt/CustomerDebitStateRpt.component';
import { LastGoodSubCodeHistoryInStackRptComponent } from './components/LastGoodSubCodeHistoryInStackRpt/LastGoodSubCodeHistoryInStackRpt.component';
import { BrokerKarkardDetailRptComponent } from './components/BrokerKarkardDetailRpt/BrokerKarkardDetailRpt.component';
import { TcPrintFactorRptComponent } from './components/TcPrintFactorRpt/TcPrintFactorRpt.component';
import { TcPrintFactorAttachedRptComponent } from './components/TcPrintFactorAttachedRpt/TcPrintFactorAttachedRpt.component';
import { TcPrintReturnFactorRptComponent } from './components/TcPrintReturnFactorRpt/TcPrintReturnFactorRpt.component';
import { TcPrintReturnFactorAttachedRptComponent } from './components/TcPrintReturnFactorAttachedRpt/TcPrintReturnFactorAttachedRpt.component';
import { TcPrintReturnPurchaseRptComponent } from './components/TcPrintReturnPurchaseRpt/TcPrintReturnPurchaseRpt.component';
import { TcPrintReturnPurchaseAttachedRptComponent } from './components/TcPrintReturnPurchaseAttachedRpt/TcPrintReturnPurchaseAttachedRpt.component';
import { LogHistoryByFieldRptComponent } from './components/LogHistoryByFieldRpt/LogHistoryByFieldRpt.component';
import { CustomerVasigheRptComponent } from './components/CustomerVasigheRpt/CustomerVasigheRpt.component';
import { CustomerFactor_SanadTypeRptComponent } from './components/CustomerFactor_SanadTypeRpt/CustomerFactor_SanadTypeRpt.component';
import { DailyWorkRptComponent } from './components/DailyWorkRpt/DailyWorkRpt.component';
import { LastGoodWeightedAutomaticRptComponent } from './components/LastGoodWeightedAutomaticRpt/LastGoodWeightedAutomaticRpt.component';
import { LastGoodWeightedRptComponent } from './components/LastGoodWeightedRpt/LastGoodWeightedRpt.component';
import { ReminderRptComponent } from './components/ReminderRpt/ReminderRpt.component';
import { SamaneGoodInputOutputRptComponent } from './components/SamaneGoodInputOutputRpt/SamaneGoodInputOutputRpt.component';
import { SamaneGoodInputOutputDetailRptComponent } from './components/SamaneGoodInputOutputDetailRpt/SamaneGoodInputOutputDetailRpt.component';
import { PersonInfoSummaryRptComponent } from './components/PersonInfoSummaryRpt/PersonInfoSummaryRpt.component';
import { PersonEtebarReceiveRptComponent } from './components/PersonEtebarReceiveRpt/PersonEtebarReceiveRpt.component';
import { PersonGoodRptComponent } from './components/PersonGoodRpt/PersonGoodRpt.component';
import { KowsarNumberService } from 'src/app/app-shell/framework-services/kowsar-number.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    NgPersianDatepickerModule,

    BazaryabKarkardRptComponent,
    CustomerCityRptComponent,
    CustomerGroupRptComponent,
    CustomerMandehRptComponent,
    AccSanadBrowseRptComponent,
    CustomerReceiveRptComponent,
    CustomerPaymentRptComponent,
    CustomerForoshRptComponent,
    CustomerActionTypeRptComponent,
    CustomerIdentificationEtebarRptComponent,
    CustomerFactorEtebarRptComponent,
    CustomerForoshCityRptComponent,
    PeriodicCustomerPurchaseRptComponent,
    SellReportRptComponent,
    PeriodicSellRptComponent,
    CustomerReceiveGroupRptComponent,
    CustomerReceiveCityRptComponent,
    CustomerPaymentGroupRptComponent,
    CustomerPaymentCityRptComponent,
    BulletinCitySellRptComponent,
    CustomerFactorRptComponent,
    FactorRowsRptComponent,
    CustomerPreFactorRptComponent,
    PreFactorRowsRptComponent,
    CustomerReturnFactorRptComponent,
    ReturnFactorRowsRptComponent,
    SellReceivedFactorRptComponent,
    ShopfactorByPriceRptComponent,
    CustomerGoodRptComponent,
    GoodForoshRptComponent,
    GoodCustomerRptComponent,
    GoodFactorRptComponent,
    GoodFactorRowsRptComponent,
    FactorTypeMonthlyGoodSellStateRptComponent,
    BuyStyleMonthlyGoodSellStateRptComponent,
    MonthlyGoodSellStateRptComponent,
    SumofPeriodicGoodSellRptComponent,
    PeriodicGoodSellRptComponent,
    PeriodicCustomerPurchaseSeparateRptComponent,
    BulletinGroupNameSellRptComponent,
    GoodBulletinGroupSellRptComponent,
    CustomerIdentificationRptComponent,
    AllGoodsRptComponent,
    GoodInStackRptComponent,
    GoodHistoryRptComponent,
    GoodGroupRptComponent,
    GoodSefareshPointRptComponent,
    PeriodicInOutGoodStateRptComponent,
    StackTransferRptComponent,
    StackTransferRowRptComponent,
    LastGoodSubCodeHistoryRptComponent,
    CashReceiveRptComponent,
    CashPaymentRptComponent,
    CashReceiveCheckRptComponent,
    BankPaymentCheckRptComponent,
    CheckHistoryRptComponent,
    BrokerKarkardRptComponent,
    CustomerWithoutGoodRptComponent,
    GoodInStackVerticalRptComponent,
    GoodSerialHistoryRptComponent,
    GoodSerialAmountControlRptComponent,
    HesabPeriodicForCustomerAndVendorRptComponent,
    StackSellRptComponent,
    StackSellWithGoodGroupingRptComponent,
    TotalSellSanadTypeRptComponent,
    GoodSerialsRptComponent,
    GoodSellSerialsRptComponent,
    SellStackGroupingRptComponent,
    CustomerReceiveMablaghRptComponent,
    LogHistoryByFilterRptComponent,
    GoodCycleWithStackRptComponent,
    SellUnPriceTipRptComponent,
    PrefactorShortageRptComponent,
    GoodCycleRptComponent,
    FactorSellDariaftRptComponent,
    PeriodicCustomerDailyPurchaseCashRptComponent,
    PeriodicCustomerDailyPurchaseRptComponent,
    GoodReceiptRptComponent,
    GoodReceiptRowsRptComponent,
    GoodIssueRptComponent,
    GoodIssueRowsRptComponent,
    GoodRevisionRptComponent,
    AllGoodAccountingGrpRptComponent,
    GoodKardexRptComponent,
    KardexRialyRptComponent,
    FactorsSanadStackRptComponent,
    CustomerSponsorRptComponent,
    CustomerDebitStateRptComponent,
    LastGoodSubCodeHistoryInStackRptComponent,
    BrokerKarkardDetailRptComponent,
    TcPrintFactorRptComponent,
    TcPrintFactorAttachedRptComponent,
    TcPrintReturnFactorRptComponent,
    TcPrintReturnFactorAttachedRptComponent,
    TcPrintReturnPurchaseRptComponent,
    TcPrintReturnPurchaseAttachedRptComponent,
    LogHistoryByFieldRptComponent,
    CustomerVasigheRptComponent,
    CustomerFactor_SanadTypeRptComponent,
    DailyWorkRptComponent,
    LastGoodWeightedAutomaticRptComponent,
    LastGoodWeightedRptComponent,
    ReminderRptComponent,
    SamaneGoodInputOutputRptComponent,
    SamaneGoodInputOutputDetailRptComponent,
    PersonInfoSummaryRptComponent,
    PersonEtebarReceiveRptComponent,
    PersonGoodRptComponent,

  ],
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',

})
export class ReportDetailComponent extends AgGridBaseComponent implements OnInit, OnDestroy {

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#0066cc',
    selectedText: '#ffffff',
  };


  records: any[] = [];
  records_detail: any[] = [];
  loading_detail = true;




  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl(''),
    CreationDate: new FormControl(''),
    OwnCentralRef: new FormControl(''),
    PersonInfoCode: new FormControl(''),
    OwnerPersonInfoRef: new FormControl(''),
    StartTime: new FormControl(''),
    EndTime: new FormControl(''),
    SelectedOption: new FormControl('0'),
  });


  ReportData: any;


  modal_title = '';
  title = '';
  dateValue = new FormControl();
  StartTime = new FormControl();
  EndTime = new FormControl();
  ReportCode: string = '';
  CentralRef: string = '';
  JobPersonRef: string = '';

  items: any[] = [];
  TextData: string = '';
  selectedOption: string = '0';
  searchTerm: string = '';
  ToDayDate: string = '';




  private readonly repo = inject(ReportWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly kowsarNumber = inject(KowsarNumberService);

  constructor() {
    super();
  }



  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.ReportCode = id ?? '';

    });


    this.initColumns();
    this.loadList();
  }




  private initColumns(): void {
    this.columnDefs1 = [
      // {
      //   field: 'عملیات',
      //   pinned: 'left',
      //   cellRenderer: CellActionAutletterList,
      //   cellRendererParams: { editUrl: '/support/letter-detail' },
      //   minWidth: 250,
      // },
      // {
      //   field: 'وضعیت',
      //   headerName: 'وضعیت',
      //   cellRenderer: CellStateAutletter,
      //   cellClass: 'text-center',
      //   minWidth: 100,
      // },
      {
        field: 'RowExecutorName',
        headerName: 'کاربر فعلی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },

    ];

  }






  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch { }
    }, 50);
  }


  noData: boolean = false;
  loadList(): void {
    this.records = []


    const CentralRef = sessionStorage.getItem('CentralRef') ?? '';
    const JobPersonRef = sessionStorage.getItem('JobPersonRef') ?? '';

    this.EditForm_SearchTarget.patchValue({
      SearchTarget: this.EditForm_SearchTarget.value.SearchTarget?.trim() || '',

    });


    this.repo.GetReportsByCode(this.ReportCode).subscribe({
      next: (data: any) => {


        const reports = data?.Reports ?? [];

        if (!reports.length) {
          this.title = 'گزارشی یافت نشد';
        }

        this.ReportData = data?.Reports[0]


      },
      error: () => {

        this.notificationService.error('❌ خطا در دریافت لیست نامه‌ها');
      },
    });

    //  
    //      
    ///this.repo.GetAutLetterList(this.EditForm_autletter.value).subscribe({
    // next: (data: any) => {
    //    
    //     this.records = data?.AutLetters ?? [];
    //     this.updateGridData(1, this.records);

    //   },
    //   error: () => {
    //      
    //     this.notify.error('❌ خطا در دریافت لیست نامه‌ها');
    //   },
    // });







  }

  clearFilter(): void {
    this.EditForm_SearchTarget.patchValue({
      SearchTarget: "",
      CentralRef: "",
      CreationDate: "",
      OwnCentralRef: "",
      PersonInfoCode: "",
      OwnerPersonInfoRef: "",
      StartTime: "",
      EndTime: "",
      SelectedOption: "0",
    });
    this.loadList()
  }




}
