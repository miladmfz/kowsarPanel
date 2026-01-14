import { ChangeDetectorRef, Component, ElementRef, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { CommonModule, Location } from '@angular/common';

import Swal from 'sweetalert2';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { AppConfigService } from 'src/app/app-config.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { AgGridAngular } from 'ag-grid-angular';
import { FactorWebApiService } from '../../../services/FactorWebApi.service';
import { CellActionGoodEdit } from './cell-action-good-edit';
import { CellActionFactorRowsEdit } from './cell-action-factorrows-edit';
import { CellActionFactorCustomerEdit } from './cell-action-factor-customer-edit';
import { CellActionAutletterFactorList } from './cell-action-autletter-factor-list';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
@Component({
  selector: 'app-factor-edit',
  templateUrl: './factor-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridAngular
  ]
})
export class FactorEditComponent extends AgGridBaseComponent implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: FactorWebApiService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private readonly notificationService: NotificationService,
    private loadingService: LoadingService,
    private config: AppConfigService,
    private cdr: ChangeDetectorRef
  ) {
    super();
  }



  ngOnInit(): void {


    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });

    this.route.paramMap.subscribe((params: ParamMap) => {
      var idtemp = params.get('id');

      if (idtemp != null) {
        this.FactorCode.set(idtemp);
        this.HasFactorCode.set(true);
        this.JobPersonRef = sessionStorage.getItem("JobPersonRef");
        this.CentralRef = sessionStorage.getItem("CentralRef");

        this.GetFactor();
      } else {
        this.getdate();
      }
    });

    this.Config_Declare();
    this.pipe_function();

    this.priceInput.pipe(debounceTime(1000)).subscribe(() => {
      this.cal_takhfif_from_price();
    });

    this.discountInput.pipe(debounceTime(1000)).subscribe(() => {
      this.cal_price_from_takhfif();
    });
  }




  // #region Declare



  InvoiceState_Lookup: Base_Lookup[] = [
    { id: "0", name: "یادداشت" },
    { id: "1", name: "موقت" },
    { id: "2", name: "نهایی" },
  ]

  priceInput = new Subject<void>();
  discountInput = new Subject<void>();



  @ViewChild('modalsearch') modalsearch: ElementRef;

  records_good;
  records_factorrows;
  records_customer;
  records_letterfromowner



  users: any[] = [];
  reportData: any[] = [];
  myForm: FormGroup;
  selectedfactor: any
  ToDayDate: any;
  time: Date = new Date();

  attendanceInterval: any;



  loading_letterowener: boolean = true;
  show_newletter: boolean = false;
  loading: boolean = false;
  ShowGoodList: boolean = false;
  CanEdit_InvoiceState: boolean = true;
  IsManager: boolean = false;

  title = 'فاکتور فروش';
  BrokerRef: string = '';
  LetterCode: string = '';
  ExecuterCentral: string = '';
  letterexplain_modal_title: string = '';


  Start_FactorTime: string = '';
  End_FactorTime: string = '';
  CentralRef: string = '';
  JobPersonRef: string = '';
  Searchtarget_customer: string = '';

  Searchtarget_Good: string = '';

  private searchSubject_customer: Subject<string> = new Subject();
  private searchSubject_Good: Subject<string> = new Subject();

  FactorCode = signal('');
  HasFactorCode = signal(false);

  records_factor: any;




  selectedRows: any[] = [];


  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    BrokerRef: new FormControl(''),
  });


  EditForm_autletter = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl(''),
    CreationDate: new FormControl(''),
    OwnCentralRef: new FormControl(''),
    PersonInfoCode: new FormControl(''),
    StartTime: new FormControl(''),
    EndTime: new FormControl(''),
  });

  EditForm_search = new FormGroup({
    SearchTarget: new FormControl(''),
    ObjectRef: new FormControl(''),
  });


  EditForm_LetterInsert = new FormGroup({
    LetterDate: new FormControl(''),
    title: new FormControl(''),
    Description: new FormControl(''),
    LetterState: new FormControl(''),
    LetterPriority: new FormControl(''),
    CentralRef: new FormControl(''),
    InOutFlag: new FormControl(''),
    CreatorCentral: new FormControl(''),
    OwnerCentral: new FormControl(''),
  });

  EditForm_AutLetterRowInsert = new FormGroup({
    LetterRef: new FormControl(''),
    LetterDate: new FormControl(''),
    Description: new FormControl(''),
    LetterState: new FormControl(''),
    LetterPriority: new FormControl(''),
    CreatorCentral: new FormControl(''),
    ExecuterCentral: new FormControl(''),
  });


  EditForm_factor = new FormGroup({
    StartDateTarget: new FormControl(''),
    EndDateTarget: new FormControl(''),
    SearchTarget: new FormControl(''),
    BrokerRef: new FormControl(''),
    isShopFactor: new FormControl('0'),
    ClassName: new FormControl('PreFactor'),
    ObjectRef: new FormControl('0'),
  });

  EditForm_UpdateRow = new FormGroup({
    GoodName: new FormControl(''),
    RowCode: new FormControl(''),
    Amount: new FormControl(''),
    Price: new FormControl(''),
    ClassName: new FormControl(''),
  });


  EditForm_LetterToEmployer = new FormGroup({
    DescriptionText: new FormControl('', [Validators.required, Validators.minLength(10)]),
    LetterDate: new FormControl(''),
    ExecuterCentral: new FormControl('', Validators.required),
    CreatorCentral: new FormControl(''),
    OwnerCentral: new FormControl('', Validators.required),
    OwnerName: new FormControl(''),
    LetterCode: new FormControl(''),
    LetterDescriptionText: new FormControl(''),
    SendSms: new FormControl('0'),
  });


  EditForm_SupportData = new FormGroup({
    DateTarget: new FormControl(''),
    BrokerCode: new FormControl('1'),
    Flag: new FormControl('1'),
  });

  EditForm_supportfactor_property = new FormGroup({
    starttime: new FormControl(''),
    Endtime: new FormControl(''),
    worktime: new FormControl(''),
    Barbary: new FormControl(''),
    ObjectRef: new FormControl('0'),
  });

  Customer_property = new FormGroup({
    AppNumber: new FormControl(''),
    DatabaseNumber: new FormControl(''),
    LockNumber: new FormControl(''),
    Address: new FormControl(''),
    CityName: new FormControl(''),
    OstanName: new FormControl(''),
    ObjectRef: new FormControl('0'),
  });

  EditForm_Factor_Header = new FormGroup({
    FactorCode: new FormControl(''),
    FactorDate: new FormControl(''),
    InvoiceState: new FormControl(''),
    CustName: new FormControl(''),
    CustomerCode: new FormControl('', Validators.required),
    Explain: new FormControl(''),
    BrokerName: new FormControl(''),
    BrokerRef: new FormControl('0'),
    ClassName: new FormControl('Factor'),
    StackRef: new FormControl('1'),
    isShopFactor: new FormControl('0'),
  });

  EditForm_Factor_Row = new FormGroup({
    FactorRef: new FormControl(''),
    ObjectRef: new FormControl(''),

    GoodRef: new FormControl(''),
    GoodName: new FormControl(''),
    ClassName: new FormControl('Factor'),
    Amount: new FormControl('1'),
    Price: new FormControl(''),
    MustHasAmount: new FormControl('0'),
    MergeFlag: new FormControl('1'),
    maxsellprice: new FormControl('1111111'),
    goodname: new FormControl('goodname'),
    takhfif: new FormControl('0'),
    pricetype: new FormControl('pricetype'),
    totalprice: new FormControl('totalprice'),
    DefaultRatioValue: new FormControl('1'),
    DefaultUnitValue: new FormControl('1'),
  });

  Good_maxsellprice: string = 'Good_maxsellprice';
  Good_goodname: string = 'Good_goodname';
  Good_takhfif: string = 'Good_takhfif';
  Good_pricetype: string = 'Good_pricetype';
  Good_totalprice: string = 'Good_totalprice';

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',
  };

  EditForm_Attendance = new FormGroup({
    CentralRef: new FormControl(''),
    Status: new FormControl(''),
  });

  sanitizeDescriptionText(event: any) {
    const invalidChars = /[!@#$%^&*()|"'<>]/g;
    let value = event.target.value.replace(invalidChars, '');
    this.EditForm_LetterToEmployer.get('DescriptionText')?.setValue(value, { emitEvent: false });
  }

  Config_Declare() {
    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionGoodEdit,
        cellRendererParams: { editUrl: '/support/letter-panel' },
        minWidth: 150,

      },
      {
        field: 'GoodName',
        headerName: 'نام آیتم',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },
    ];

    this.columnDefs2 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionFactorRowsEdit,
        cellRendererParams: { editUrl: '/support/letter-panel' },
        minWidth: 150,
      },
      {
        field: 'GoodName',
        headerName: ' نام آیتم',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'FacAmount',
        headerName: 'تعداد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50,
      },
      {
        field: 'Price',
        headerName: 'قیمت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'SumPrice',
        headerName: 'قیمت کل',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },
    ];

    this.columnDefs3 = [

      {
        field: 'CustName_Small',
        headerName: 'نام مشتری  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'Manager',
        headerName: 'مدیریت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'پشتیبانی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
    ];


    this.columnDefs5 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionAutletterFactorList,
        cellRendererParams: { editUrl: '/support/letter-panel' },
        minWidth: 150,
      },
      {
        field: 'RowLetterDate',
        headerName: 'تاریخ ارجاع ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'LetterDescription',
        headerName: 'شرح ارجاع',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CreatorName',
        headerName: 'ایجاد کننده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'RowExecutorName',
        headerName: 'انجام دهنده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'RowLetterState',
        headerName: 'وضعیت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'AutLetterRow_PropDescription1',
        headerName: 'شرح کار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
    ];
  }


  // #endregion

  // #region Func
  NewFactor() {
    this.router.navigate(['/accounting/factor-edit']);
  }

  pipe_function() {
    this.searchSubject_customer.pipe(
      debounceTime(1000)
    ).subscribe(() => {
      this.GetCustomer();
    });

    this.searchSubject_Good.pipe(
      debounceTime(1000)
    ).subscribe(() => {
      this.GetGood();
    });
  }





  onInvoiceStateChange() {

    this.loadingService.show()
    this.repo.UpdateFactorInvoiceState(this.EditForm_Factor_Header.value).subscribe((data: any) => {
      this.FactorCode = data.Factors[0].FactorCode
      this.notificationService.succeded();
      this.loadingService.hide()
      location.reload()
    });

  }

  changeStatus(status: string) {
    this.sharedService.triggerRefresh('refresh');
  }


  Autletterfromcustomer() {
    this.Autletter_dialog_show()
    this.loadingService.show()

    this.loading_letterowener = true
    this.letterexplain_modal_title = " تیکت ارتباط با " + this.EditForm_Factor_Header.value.CustName

    this.EditForm_search.patchValue({
      ObjectRef: this.EditForm_Factor_Header.value.CustomerCode,
    });

    this.repo.GetCentralUser().subscribe(e => {
      this.users = e;
    });

    this.repo.GetCustomerById(this.EditForm_search.value).subscribe((data: any) => {
      this.EditForm_LetterToEmployer.patchValue({
        DescriptionText: "",
        LetterDate: this.ToDayDate,
        ExecuterCentral: "",
        CreatorCentral: sessionStorage.getItem("CentralRef"),
        OwnerCentral: data.Customers[0].CentralRef,
        OwnerName: data.Customers[0].CustName_Small,
      });

      this.EditForm_autletter.patchValue({
        CentralRef: data.Customers[0].CentralRef,
        OwnCentralRef: "0",
      });

      this.repo.GetAutLetterList(this.EditForm_autletter.value).subscribe((data: any) => {
        this.loadingService.hide()

        this.records_letterfromowner = data?.AutLetters ?? [];
        this.updateGridData(5, this.records_letterfromowner);
        this.loading_letterowener = false
      });
    });
  }

  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    // ذخیره API درست
    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    // فیت کردن ستون‌ها با تأخیر کوتاه
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch { }
    }, 50);
  }
  toggel_show_newletter() {
    if (this.show_newletter) {
      this.EditForm_LetterToEmployer.patchValue({
        DescriptionText: "",
        ExecuterCentral: "",
      });
    }
    this.show_newletter = !this.show_newletter
  }

  SendLetter() {
    this.EditForm_LetterToEmployer.markAllAsTouched();
    if (!this.EditForm_LetterToEmployer.valid) return;

    this.loadingService.show()

    this.EditForm_LetterInsert.patchValue({
      LetterDate: this.ToDayDate,
      title: "ارتباط با همکاران",
      Description: this.EditForm_LetterToEmployer.value.DescriptionText,
      LetterState: "",
      LetterPriority: "عادی",
      CentralRef: sessionStorage.getItem("CentralRef"),
      InOutFlag: "2",
      CreatorCentral: this.EditForm_LetterToEmployer.value.CreatorCentral,
      OwnerCentral: this.EditForm_LetterToEmployer.value.OwnerCentral,
    });



    this.repo.LetterInsert(this.EditForm_LetterInsert.value).subscribe(e => {
      const intValue = parseInt(e[0].LetterCode, 10);
      this.loadingService.hide()

      if (!isNaN(intValue) && intValue > 0) {
        this.LetterCode = e[0].LetterCode
        this.SendLetterRow()
      } else {
        //Todo notification erroor
      }
    });
  }

  SendLetterRow() {
    this.loadingService.show()

    this.EditForm_AutLetterRowInsert.patchValue({
      LetterRef: this.LetterCode,
      LetterDate: this.ToDayDate,
      Description: this.EditForm_LetterToEmployer.value.DescriptionText,
      LetterState: "",
      LetterPriority: "عادی",
      CreatorCentral: sessionStorage.getItem("CentralRef"),
      ExecuterCentral: this.EditForm_LetterToEmployer.value.ExecuterCentral,
    });

    this.repo.AutLetterRowInsert(this.EditForm_AutLetterRowInsert.value).subscribe(e => {
      const intValue = parseInt(e[0].LetterRef, 10);
      this.loadingService.hide()

      if (!isNaN(intValue) && intValue > 0) {
        this.notificationService.succeded();
        this.LetterCode = ''
        this.toggel_show_newletter()
        this.Autletter_dialog_close()
      } else {
        //Todo notification erroor
      }
    });
  }



  timeStringToDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }




  override ngOnDestroy(): void {
    this.searchSubject_customer.unsubscribe();
    this.searchSubject_Good.unsubscribe();
    this.themeSub.unsubscribe();
  }
  getInvoiceStateName(id: string) {
    return this.InvoiceState_Lookup.find(x => x.id === id)?.name || '';
  }

  insert_FactorRows() {
    if (this.EditForm_Factor_Row.value.Amount + "" == "0") {
      this.EditForm_Factor_Row.patchValue({
        Amount: "1",
      });
    }
    this.EditForm_Factor_Row.patchValue({
      Amount: this.EditForm_Factor_Row.value.Amount + "",
      Price: this.EditForm_Factor_Row.value.Price + "",
      takhfif: this.EditForm_Factor_Row.value.takhfif + "",
    });

    this.loadingService.show()

    this.repo.WebFactorInsertRow(this.EditForm_Factor_Row.value).subscribe((data: any) => {
      const factor = data.Factors[0];
      const rowCode = Number(factor.RowCode);

      if (rowCode > 0) {
        this.notificationService.succeded();
        this.GetFactor()
      } else {
        this.notificationService.error(data.Factors[0].ErrDesc);
      }

      this.boxbuy_dialog_close()
      this.loadingService.hide()
    });
  }

  cal_takhfif_from_price() {
    let price = parseFloat(this.EditForm_Factor_Row.value.Price) || 0;
    let maxsellprice = parseFloat(this.EditForm_Factor_Row.value.maxsellprice) || 0;

    if (maxsellprice > 0) {
      let discount = ((maxsellprice - price) / maxsellprice) * 100;
      this.EditForm_Factor_Row.patchValue({
        takhfif: discount.toFixed(2)
      });
    }

    this.cal_totalprice();
  }

  cal_price_from_takhfif() {
    let discount = parseFloat(this.EditForm_Factor_Row.value.takhfif) || 0;
    let maxsellprice = parseFloat(this.EditForm_Factor_Row.value.maxsellprice) || 0;

    if (maxsellprice > 0) {
      let price = maxsellprice * (1 - discount / 100);
      this.EditForm_Factor_Row.patchValue({
        Price: price.toFixed(2)
      });
    }

    this.cal_totalprice();
  }

  cal_totalprice() {
    let Amount_temp = parseFloat(this.EditForm_Factor_Row.value.Amount);
    let Price_temp = parseFloat(this.EditForm_Factor_Row.value.Price);
    let DefaultRatioValue_temp = parseFloat(this.EditForm_Factor_Row.value.DefaultRatioValue);
    let DefaultUnitValue_temp = parseFloat(this.EditForm_Factor_Row.value.DefaultUnitValue);

    let totalPrice_temp = Amount_temp * Price_temp * DefaultRatioValue_temp * DefaultUnitValue_temp

    this.EditForm_Factor_Row.patchValue({
      totalprice: "" + totalPrice_temp,
    });
  }

  AddGoodToBasket(good: any) {
    this.EditForm_Factor_Row.patchValue({
      FactorRef: this.FactorCode(),
      GoodRef: good.GoodCode,
      GoodName: good.GoodName,
      ClassName: 'Factor',
      Amount: '1',
      Price: '0',
      maxsellprice: good.MaxSellPrice,
      takhfif: '0',
      totalprice: '0',
      DefaultRatioValue: good.DefaultRatioValue,
      DefaultUnitValue: good.DefaultUnitValue
    });

    this.boxbuy_dialog_show();
  }


  updateRow(data: any) {
    this.EditForm_UpdateRow.patchValue({
      GoodName: data.GoodName,
      RowCode: data.FactorRowCode,
      Amount: data.FacAmount,
      Price: data.Price,
      ClassName: "Factor",
    });

    this.updaterow_dialog_show();
  }


  Submit_UpdateRow() {
    this.EditForm_UpdateRow.patchValue({
      Amount: this.EditForm_UpdateRow.value.Amount + "",
      Price: this.EditForm_UpdateRow.value.Price + "",
    });
    this.loadingService.show()
    this.repo.WebFactorUpdateRow(this.EditForm_UpdateRow.value).subscribe((data: any) => {
      this.notificationService.succeded();
      this.updaterow_dialog_close()
      this.loadingService.hide()
      this.GetFactor()
    });
  }

  onInputChange_Customer() {
    this.searchSubject_customer.next(this.Searchtarget_customer);
  }

  onInputChange_Good() {
    this.searchSubject_Good.next(this.Searchtarget_Good);
  }



  Factor_Header_insert() {
    this.EditForm_Factor_Header.markAllAsTouched();
    if (!this.EditForm_Factor_Header.valid) return;
    this.loadingService.show()

    this.EditForm_Factor_Header.patchValue({
      BrokerRef: sessionStorage.getItem("BrokerCode")
    });

    this.repo.WebFactorInsert(this.EditForm_Factor_Header.value).subscribe((data: any) => {
      this.FactorCode.set(data.Factors[0].FactorCode)
      this.notificationService.succeded();
      this.loadingService.hide()
    });
  }
  taggelShowGoodList() {
    this.ShowGoodList = !this.ShowGoodList
  }

  onSelectionChanged(event: any) {
    this.selectedRows = event.api.getSelectedRows();
  }

  Set_Customer() {
    this.EditForm_Factor_Header.patchValue({
      CustName: this.selectedRows[0].CustName_Small,
      CustomerCode: this.selectedRows[0].CustomerCode,
      BrokerName: sessionStorage.getItem("BrokerName")
    });
    this.selectedRows = []
    this.customer_dialog_close()
  }

  GoBack() {
    this.location.back();
  }

  deleteFactor() {
    if (this.records_factorrows && this.records_factorrows.length > 0) {
      this.notificationService.error('این فاکتور دارای اقلام می باشد', "خطا");
    } else {
      this.fireDeleteFactor().then((result) => {
        if (result.isConfirmed) {
          this.deletefactorRecord()
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.notificationService.warning('اطلاعات تغییری نکرد');
        }
      });
    }
  }

  fireDeleteFactor() {
    return Swal.fire({
      title: 'آیا از حذف این ردیف اطمینان دارید؟',
      text: 'درصورت حذف دیگر قادر به بازیابی ردیف فوق نخواهید بود.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله، اطمینان دارم.',
      cancelButtonText: 'بستن پنجره',
      customClass: {
        confirmButton: 'btn btn-success mx-2',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
  }

  fireDeleteSwal1() {
    return Swal.fire({
      title: 'آیا از حذف این ردیف اطمینان دارید؟',
      text: 'درصورت حذف دیگر قادر به بازیابی ردیف فوق نخواهید بود.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله، اطمینان دارم.',
      cancelButtonText: 'خیر',
      customClass: {
        confirmButton: 'btn btn-success mx-2',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
  }

  deletefactorrow(id) {


    if (this.EditForm_Factor_Header.value.InvoiceState == "1") {
      this.notificationService.error(" این فاکتور به حالت موقت تبدیل شده است ");

    } else if (this.EditForm_Factor_Header.value.InvoiceState == "2") {
      this.notificationService.error(" این فاکتور به حالت نهایی تبدیل شده است ");

    } else {
      this.fireDeleteSwal1().then((result) => {
        if (result.isConfirmed) {
          this.repo.DeleteWebFactorRows(id).subscribe((data: any) => {
            this.GetFactorrows()
            this.notificationService.succeded('ردیف فوق با موفقیت حذف شد.');
          });
        } else {
          this.notificationService.warning('اطلاعات تغییری نکرد');
        }
      });
    }







  }

  deletefactorRecord() {
    this.repo.DeleteWebFactor(this.FactorCode()).subscribe((data: any) => {
      this.notificationService.succeded('ردیف فوق با موفقیت حذف شد.');
      this.location.back();
    });
  }

  Show_Customer_Property(CustomerCode: any) {
    this.property_dialog_show()
    this.records_customer.forEach((customer: any) => {
      if (customer.CustomerCode == CustomerCode) {
        this.Customer_property.patchValue({
          AppNumber: customer.AppNumber,
          DatabaseNumber: customer.DatabaseNumber,
          LockNumber: customer.LockNumber,
          ObjectRef: customer.CustomerCode,
          Address: customer.Address,
          CityName: customer.CityName,
          OstanName: customer.OstanName,
        });
      }
    })
  }
  // #endregion

  // #region Get_Data

  GetFactor() {
    this.loadingService.show()
    this.EditForm_factor.patchValue({
      ClassName: "Factor",
      ObjectRef: this.FactorCode(),
      isShopFactor: "0",
    });

    this.repo.GetWebFactor(this.EditForm_factor.value).subscribe((data: any) => {
      this.selectedfactor = data.Factors[0]
      this.FactorCode.set(data.Factors[0].FactorCode);
      this.HasFactorCode.set(true)

      this.EditForm_Factor_Header.patchValue({
        FactorCode: data.Factors[0].FactorCode,
        FactorDate: data.Factors[0].FactorDate,
        InvoiceState: data.Factors[0].InvoiceState,

        CustName: data.Factors[0].CustName,
        CustomerCode: data.Factors[0].CustomerCode,
        Explain: data.Factors[0].Explain,
        BrokerName: data.Factors[0].BrokerName,
        BrokerRef: data.Factors[0].BrokerRef,
      });
      if (sessionStorage.getItem("PhAddress3") == '100') {
        this.IsManager = true
        this.CanEdit_InvoiceState = true
      } else {
        this.IsManager = false

        if (data.Factors[0].InvoiceState == "2") {
          this.CanEdit_InvoiceState = false

        } else if (data.Factors[0].InvoiceState == "1") {
          this.CanEdit_InvoiceState = false

        } else if (data.Factors[0].InvoiceState == "0") {
          this.CanEdit_InvoiceState = true
        }
      }
      this.loadingService.hide()


    });

    this.GetFactorrows()
    this.GetGood()
  }

  GetFactorrows() {
    this.loadingService.show()

    this.repo.GetWebFactorRows(this.EditForm_factor.value).subscribe((data: any) => {
      this.loadingService.hide()

      this.records_factorrows = data?.Factors ?? [];
      this.updateGridData(2, this.records_factorrows);
    });
  }

  getdate() {
    this.repo.GetTodeyFromServer().subscribe((data: any) => {
      this.EditForm_Factor_Header.patchValue({
        FactorDate: data.Text,
      });
    });
  }

  GetGood() {
    this.repo.GetGoodListSupport(this.Searchtarget_Good).subscribe((data: any) => {
      this.records_good = data?.Goods ?? [];;
      this.updateGridData(1, this.records_good);

    });
  }

  CallCustomer() {

    this.customer_dialog_show()
    this.GetCustomer()

  }

  insert_FactorRows1() {
    this.EditForm_Factor_Row.patchValue({
      Amount: this.EditForm_Factor_Row.value.Amount + "",
      Price: this.EditForm_Factor_Row.value.Price + "",
      takhfif: this.EditForm_Factor_Row.value.takhfif + "",
    });

    this.loadingService.show()

    this.repo.WebFactorInsertRow(this.EditForm_Factor_Row.value).subscribe((data: any) => {
      this.notificationService.succeded();
      this.boxbuy_dialog_close()
      this.loadingService.hide()
      this.GetFactor()
    });
  }
  GetCustomer() {
    this.loadingService.show()

    // this.EditForm_SearchTarget.patchValue({
    //   SearchTarget: this.Searchtarget_customer,
    //   BrokerRef: sessionStorage.getItem("BrokerCode"),
    // });

    this.EditForm_SearchTarget.patchValue({
      SearchTarget: this.Searchtarget_customer,
      BrokerRef: "0",
    });


    this.repo.GetKowsarCustomer(this.EditForm_SearchTarget.value).subscribe((data: any) => {
      this.loadingService.hide()
      this.customer_dialog_show()
      this.records_customer = data?.Customers ?? [];;
      this.updateGridData(3, this.records_customer);

    });
  }

  // #endregion

  // #region Modal

  customer_dialog_show() { this.toggleModal('#customerlist', true); }
  customer_dialog_close() { this.toggleModal('#customerlist', false); }

  property_dialog_show() { this.toggleModal('#factorcustomerproperty', true); }
  property_dialog_close() { this.toggleModal('#factorcustomerproperty', false); }

  factor_property_dialog_show() { this.toggleModal('#factorproperty', true); }
  factor_property_dialog_close() { this.toggleModal('#factorproperty', false); }

  boxbuy_dialog_show() { this.toggleModal('#boxbuymodal', true); }
  boxbuy_dialog_close() { this.toggleModal('#boxbuymodal', false); }

  Autletter_dialog_show() { this.toggleModal('#autlettercustomer', true); }
  Autletter_dialog_close() { this.toggleModal('#autlettercustomer', false); }


  updaterow_dialog_show() { this.toggleModal('#updaterowmodal', true); }
  updaterow_dialog_close() { this.toggleModal('#updaterowmodal', false); }


  toggleModal(selector: string, show: boolean) {
    const modal: any = document.querySelector(selector);
    if (!modal) return;

    if (show) {
      // BACKDROP بساز
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade';
      backdrop.id = selector.replace('#', '') + '-backdrop';
      document.body.appendChild(backdrop);

      // کمی تاخیر برای fade
      setTimeout(() => backdrop.classList.add('show'), 10);

      // مودال را باز کن
      modal.classList.add('show', 'd-block');
      modal.removeAttribute('aria-hidden');
      modal.setAttribute('aria-modal', 'true');
      modal.style.display = 'block';

      // بستن با کلیک روی بک‌دراپ
      backdrop.addEventListener('click', () => this.toggleModal(selector, false));
    }
    else {
      // مودال را ببند
      modal.classList.remove('show');
      setTimeout(() => {
        modal.classList.remove('d-block');
        modal.style.display = 'none';
      }, 150);

      modal.setAttribute('aria-hidden', 'true');
      modal.removeAttribute('aria-modal');

      // بک‌دراپ را حذف کن
      const backdrop = document.getElementById(selector.replace('#', '') + '-backdrop');
      if (backdrop) {
        backdrop.classList.remove('show');
        setTimeout(() => backdrop.remove(), 150);
      }
    }
  }



  // #endregion
}
