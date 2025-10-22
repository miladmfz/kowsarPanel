import { Component, ElementRef, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { FactorWebApiService } from '../../../services/FactorWebApi.service';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CellActionFactorRowsEdit } from './cell-action-factorrows-edit';
import { CellActionGoodEdit } from './cell-action-good-edit';
import { CellActionFactorCustomerEdit } from './cell-action-factor-customer-edit';
import { Location } from '@angular/common';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { CellActionAutletterFactorList } from './cell-action-autletter-factor-list';
import { LoadingService } from 'src/app/app-shell/framework-services/loading.service';

@Component({
  selector: 'app-factor-edit',
  templateUrl: './factor-edit.component.html',
})
export class FactorEditComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: FactorWebApiService,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private location: Location,
    private fb: FormBuilder,
    private readonly notificationService: NotificationService,
    private loadingService: LoadingService,
    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }


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


  title = 'فاکتور فروش';
  BrokerRef: string = '';
  LetterCode: string = '';
  ExecuterCentral: string = '';
  letterexplain_modal_title: string = '';


  Start_FactorTime: string = '';
  End_FactorTime: string = '';
  FactorCode: string = '';
  CentralRef: string = '';
  JobPersonRef: string = '';
  Searchtarget_customer: string = '';
  Searchtarget_Good: string = '';


  private searchSubject_customer: Subject<string> = new Subject();
  private searchSubject_Good: Subject<string> = new Subject();



  EditForm_factor = new FormGroup({
    StartDateTarget: new FormControl(''),
    EndDateTarget: new FormControl(''),
    SearchTarget: new FormControl(''),
    BrokerRef: new FormControl(''),
    isShopFactor: new FormControl('0'),
    ClassName: new FormControl('PreFactor'),
    ObjectRef: new FormControl('0'),


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



  EditForm_factor_property = new FormGroup({
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


  priceInput = new Subject<void>();
  discountInput = new Subject<void>();

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',
  };

  override ngOnInit(): void {
    super.ngOnInit();
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });

    this.route.paramMap.subscribe((params: ParamMap) => {
      var idtemp = params.get('id');
      if (idtemp != null) {
        this.FactorCode = idtemp;
        this.JobPersonRef = sessionStorage.getItem("JobPersonRef");
        this.CentralRef = sessionStorage.getItem("CentralRef");
      }
    });

    this.Config_Declare()
    this.pipe_function()

    if (this.FactorCode.length > 0) {
      this.GetFactor();
    } else {
      this.getdate();
    }

    this.priceInput.pipe(debounceTime(1000)).subscribe(() => {
      this.cal_takhfif_from_price();
    });

    // تنظیم تأخیر برای ورودی تخفیف
    this.discountInput.pipe(debounceTime(1000)).subscribe(() => {
      this.cal_price_from_takhfif();
    });
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

  Autletterfromcustomer() {

    this.Autletter_dialog_show()


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


      this.repo.GetLetterList(this.EditForm_autletter.value).subscribe((data) => {
        this.records_letterfromowner = data;
        this.loading_letterowener = false
      });



    });



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
      if (!isNaN(intValue) && intValue > 0) {

        this.LetterCode = e[0].LetterCode

        this.SendLetterRow()

      } else {
        //Todo notification erroor
      }
    });


  }



  SendLetterRow() {




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



  sanitizeDescriptionText(event: any) {
    const invalidChars = /[!@#$%^&*()|"'<>]/g;
    let value = event.target.value.replace(invalidChars, '');
    this.EditForm_LetterToEmployer.get('DescriptionText')?.setValue(value, { emitEvent: false });
  }

  // #region Declare


  Config_Declare() {
    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionGoodEdit,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 100,
      },
      {
        field: 'GoodName',
        headerName: 'نام آیتم',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
    ];

    this.columnDefs2 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionFactorRowsEdit,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 100,
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
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionFactorCustomerEdit,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 80,
      },
      {
        field: 'CustName_Small',
        headerName: 'نام مشتری  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
        checkboxSelection: true,
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
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 80,
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
      }, {
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

  pipe_function() {
    this.searchSubject_customer.pipe(
      debounceTime(1000)  // 1 second debounce time
    ).subscribe(searchText => {
      this.GetCustomer();
    });

    this.searchSubject_Good.pipe(
      debounceTime(1000)  // 1 second debounce time
    ).subscribe(searchText => {
      this.GetGood();
    });
  }

  // #endregion

  // #region Func
  NewFactor() {
    this.router.navigate(['/factor/factor-edit']);
  }



  handleEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  }


  ngOnDestroy(): void {
    this.searchSubject_customer.unsubscribe();
    this.searchSubject_Good.unsubscribe();
    this.themeSub.unsubscribe();
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
      this.FactorCode = data.Factors[0].FactorCode
      this.notificationService.succeded();
      this.loadingService.hide()
      this.GetFactor()
    });
  }

  taggelShowGoodList() {
    this.ShowGoodList = !this.ShowGoodList
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
      this.notificationService.error('این فاکتور دارای اقلام می باشد');
    } else {
      this.fireDeleteFactor().then((result) => {
        if (result.isConfirmed) {
          this.deletefactorRecord()
        } else {
          // اگر کاربر انصراف داد، پیام هشدار نشان بده
          this.notificationService.warning('اطلاعات تغییری نکرد');
        }
      });
    }
  }

  async fireDeleteFactor() {
    const Swal = (await import('sweetalert2')).default;
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
    // این متد هم lazy-load می‌کند و Promise برمی‌گرداند
    return (async () => {
      const Swal = (await import('sweetalert2')).default;
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
    })();
  }

  delete(id) {
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

  deletefactorRecord() {
    this.repo.DeleteWebFactor(this.FactorCode).subscribe((data: any) => {
      this.notificationService.succeded('ردیف فوق با موفقیت حذف شد.');
      this.location.back();
    });
  }

  // #endregion

  // #region Get_Data
  GetFactor() {
    this.loadingService.show()

    this.EditForm_factor.patchValue({
      ClassName: "Factor",
      ObjectRef: this.FactorCode,
      isShopFactor: "0",
    });



    this.repo.GetWebFactor(this.EditForm_factor.value).subscribe((data: any) => {
      this.selectedfactor = data.Factors[0]
      this.EditForm_Factor_Header.patchValue({
        FactorCode: data.Factors[0].FactorCode,
        FactorDate: data.Factors[0].FactorDate,
        CustName: data.Factors[0].CustName,
        CustomerCode: data.Factors[0].CustomerCode,
        Explain: data.Factors[0].Explain,
        BrokerName: data.Factors[0].BrokerName,
        BrokerRef: data.Factors[0].BrokerRef,
      });
    });




    this.GetFactorrows()
    this.GetGood()
  }

  GetFactorrows() {
    this.repo.GetWebFactorRows(this.EditForm_factor.value).subscribe((data: any) => {
      this.records_factorrows = data.Factors
      this.loadingService.hide()
    });
  }

  getdate() {
    this.repo.GetTodeyFromServer().subscribe(e => {
      this.EditForm_Factor_Header.patchValue({
        FactorDate: e[0].TodeyFromServer,
      });
    });
  }

  GetGood() {
    this.repo.GetGoodListSupport(this.Searchtarget_Good).subscribe((data: any) => {
      this.records_good = data.Goods;
    });
  }

  GetCustomer() {
    this.customer_dialog_show()
    this.loading = true;

    this.repo.GetKowsarCustomer(this.Searchtarget_customer).subscribe((data: any) => {
      this.records_customer = data.Customers;
      this.loading = false;
    });
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

  AddGoodToBasket(good) {
    this.EditForm_Factor_Row.patchValue({
      FactorRef: this.FactorCode,
      GoodRef: good.GoodCode,
      GoodName: good.GoodName,
      ClassName: 'Factor',
      Amount: '1',
      Price: '0',
      maxsellprice: good.MaxSellPrice,
      goodname: good.GoodName,
      takhfif: '0',
      totalprice: '0',
      DefaultRatioValue: good.DefaultRatioValue,
      DefaultUnitValue: good.DefaultUnitValue
    });

    this.boxbuy_dialog_show();
    //this.insert_FactorRows()
  }

  // #endregion

  // #region Modal
  customer_dialog_show() {
    const modal = this.renderer.selectRootElement('#customerlist', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
    this.modalsearch.nativeElement.focus();
  }
  customer_dialog_close() {
    const modal = this.renderer.selectRootElement('#customerlist', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  property_dialog_show() {
    const modal = this.renderer.selectRootElement('#factorcustomerproperty', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  property_dialog_close() {
    const modal = this.renderer.selectRootElement('#factorcustomerproperty', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  factor_property_dialog_show() {
    const modal = this.renderer.selectRootElement('#factorproperty', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  factor_property_dialog_close() {
    const modal = this.renderer.selectRootElement('#factorproperty', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  boxbuy_dialog_show() {
    const modal = this.renderer.selectRootElement('#boxbuymodal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  boxbuy_dialog_close() {
    const modal = this.renderer.selectRootElement('#boxbuymodal', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  Autletter_dialog_show() {
    const modal = this.renderer.selectRootElement('#autlettercustomer', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  Autletter_dialog_close() {
    const modal = this.renderer.selectRootElement('#autlettercustomer', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }
  // #endregion
}
