import { Component, ElementRef, inject, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { CommonModule, Location } from '@angular/common';

import Swal from 'sweetalert2';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { AgGridAngular } from 'ag-grid-angular';
import { PreFactorWebApiService } from 'src/app/features/accounting/services/ForoshWebApi/PreFactorWebApi.service';
import { CellActionPreGoodEdit } from './cell-action-pregood-edit';
import { CellActionPreFactorRowsEdit } from './cell-action-prefactorrows-edit';
import { CellActionAutletterPreFactorList } from './cell-action-autletter-prefactor-list';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { AutletterWebApiService } from 'src/app/features/automation/services/AutletterWebApi.service';
@Component({
  selector: 'app-prefactor-edit',
  templateUrl: './prefactor-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridAngular
  ]
})
export class PrefactorEditComponent extends AgGridBaseComponent implements OnInit {


  private readonly router = inject(Router);

  private readonly repo = inject(PreFactorWebApiService);
  private readonly aut_repo = inject(AutletterWebApiService);

  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly sharedService = inject(SharedService);
  private readonly notificationService = inject(NotificationService);
  protected readonly permissionService = inject(PermissionService);
  protected readonly session = inject(SessionStorageService);
  constructor() {
    super();
  }



  ngOnInit(): void {


    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });

    this.route.paramMap.subscribe((params: ParamMap) => {
      var idtemp = params.get('id');

      if (idtemp != null) {
        this.PreFactorCode.set(idtemp);
        this.HasPreFactorCode.set(true);
        this.LoginType.set(this.session.getString("LoginType"))
        this.CentralRef.set(this.session.getString("CentralRef"))

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



  PFState_Lookup: Base_Lookup[] = [
    { id: "0", name: "یادداشت" },
    { id: "1", name: "موقت" },
    { id: "2", name: "نهایی" },
  ]

  priceInput = new Subject<void>();
  discountInput = new Subject<void>();



  @ViewChild('modalsearch') modalsearch: ElementRef;

  records_good = signal<any[]>([])
  records_factorrows = signal<any[]>([])
  records_customer = signal<any[]>([])
  records_letterfromowner = signal<any[]>([])



  users = signal<any[]>([])
  reportData = signal<any[]>([])
  myForm: FormGroup;
  selectedfactor: any
  ToDayDate = signal('')
  time: Date = new Date();

  attendanceInterval: any;



  loading_letterowener = signal(true)
  show_newletter = signal(false)
  loading = signal(false)
  ShowGoodList = signal(false)
  CanEdit_PFState = signal(false)
  IsManager = signal(false)

  title = signal('فاکتور فروش')
  LetterCode = signal('')
  ExecuterCentral = signal('')
  letterexplain_modal_title = signal('')


  Start_FactorTime = signal('')
  End_FactorTime = signal('')
  CentralRef = signal('')
  LoginType = signal('')
  Searchtarget_customer = signal('')

  Searchtarget_Good = signal('')

  private searchSubject_customer: Subject<string> = new Subject();
  private searchSubject_Good: Subject<string> = new Subject();

  PreFactorCode = signal('')
  HasPreFactorCode = signal(false);

  records_factor = signal<any[]>([])


  selectedRows = signal<any[]>([])


  Active_Lookup: Base_Lookup[] = [

    { id: "4", name: "همه" },
    { id: "0", name: "فعال" },
    { id: "1", name: "نيمه فعال" },
    { id: "2", name: "غير فعال" },
  ]

  // فرم‌های صفحه
  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    Active: new FormControl('0'),
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
    IsPrivate: new FormControl('0'),
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
    BrokerRef: new FormControl(null),
    IsShopFactor: new FormControl('0'),
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
    PFState: new FormControl(''),
    CustName: new FormControl(''),
    CustomerCode: new FormControl('', Validators.required),
    Explain: new FormControl(''),
    BrokerName: new FormControl(''),
    BrokerRef: new FormControl(null),
    ClassName: new FormControl('PreFactor'),
    StackRef: new FormControl('1'),
    IsShopFactor: new FormControl('0'),
    Active: new FormControl('0'),
  });

  EditForm_Factor_Row = new FormGroup({
    FactorRef: new FormControl(''),
    ObjectRef: new FormControl(''),

    GoodRef: new FormControl(''),
    GoodName: new FormControl(''),
    ClassName: new FormControl('PreFactor'),
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
  onActiveChange() {
    this.GetCustomer()
  }
  Config_Declare() {
    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionPreGoodEdit,
        cellRendererParams: { editUrl: '/automation/letter-panel' },
        minWidth: 80,

      },
      {
        field: 'GoodName',
        headerName: 'نام آیتم',

        cellClass: 'text-center',
        minWidth: 150,

      },
    ];

    this.columnDefs2 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionPreFactorRowsEdit,
        cellRendererParams: { editUrl: '/automation/letter-panel' },
        width: 120,
      },
      {
        field: 'GoodName',
        headerName: ' نام آیتم',

        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'FacAmount',
        headerName: 'تعداد',

        cellClass: 'text-center',
        minWidth: 50,
      },
      {
        field: 'Price',
        headerName: 'قیمت',

        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'SumPrice',
        headerName: 'قیمت کل',

        cellClass: 'text-center',
        minWidth: 150,
      },
    ];

    this.columnDefs3 = [

      {
        field: 'CustName_Small',
        headerName: 'نام مشتری  ',

        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'Manager',
        headerName: 'مدیریت',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'پشتیبانی',

        cellClass: 'text-center',
        minWidth: 150
      },
    ];


    this.columnDefs5 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionAutletterPreFactorList,
        cellRendererParams: { editUrl: '/automation/letter-panel' },
        minWidth: 80,
      },
      {
        field: 'RowLetterDate',
        headerName: 'تاریخ ارجاع ',

        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'LetterDescription',
        headerName: 'شرح ارجاع',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CreatorName',
        headerName: 'ایجاد کننده',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'RowExecutorName',
        headerName: 'انجام دهنده',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'RowLetterState',
        headerName: 'وضعیت',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'AutLetterRow_PropDescription1',
        headerName: 'شرح کار',

        cellClass: 'text-center',
        minWidth: 150
      },
    ];
  }


  // #endregion

  // #region Func
  NewPreFactor() {
    this.router.navigate(['/accounting/prefactor-edit']);
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




  onPFStateChange() {
    this.repo.UpdatePreFactorPFState(this.EditForm_Factor_Header.value).subscribe((data: any) => {

      this.PreFactorCode = data.Factors[0].PreFactorCode
      this.notificationService.succeded();

      location.reload()
    });

  }

  changeStatus(status: string) {
    this.sharedService.triggerRefresh('refresh');
  }


  Autletterfromcustomer() {
    this.Autletter_dialog_show()


    this.loading_letterowener.set(true)
    this.letterexplain_modal_title.set(" تیکت ارتباط با " + this.EditForm_Factor_Header.value.CustName)

    this.EditForm_search.patchValue({
      ObjectRef: this.EditForm_Factor_Header.value.CustomerCode,
    });


    this.aut_repo.GetCentralUser().subscribe(e => {
      this.users.set(e)
    });


    this.repo.GetCustomerById(this.EditForm_search.value).subscribe((data: any) => {

      this.EditForm_LetterToEmployer.patchValue({
        DescriptionText: "",
        LetterDate: this.ToDayDate(),
        ExecuterCentral: "",
        CreatorCentral: this.session.getString("CentralRef"),
        OwnerCentral: data.Customers[0].CentralRef,
        OwnerName: data.Customers[0].CustName_Small,
      });

      this.EditForm_autletter.patchValue({
        CentralRef: data.Customers[0].CentralRef,
        OwnCentralRef: "0",
      });


      this.repo.GetAutLetterList(this.EditForm_autletter.value).subscribe((data: any) => {



        this.records_letterfromowner.set(data?.AutLetters ?? [])
        this.updateGridData(5, this.records_letterfromowner());
        this.loading_letterowener.set(false)
      });
    });
  }

  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    setTimeout(() => {
      if (params.api && !params.api.isDestroyed?.()) {
        params.api.sizeColumnsToFit();
      }
    }, 50);
  }

  toggel_show_newletter() {
    if (this.show_newletter) {
      this.EditForm_LetterToEmployer.patchValue({
        DescriptionText: "",
        ExecuterCentral: "",
      });
    }
    this.show_newletter.set(!this.show_newletter)
  }

  SendLetter() {
    this.EditForm_LetterToEmployer.markAllAsTouched();
    if (!this.EditForm_LetterToEmployer.valid) return;



    this.EditForm_LetterInsert.patchValue({
      LetterDate: this.ToDayDate(),
      title: "ارتباط با همکاران",
      Description: this.EditForm_LetterToEmployer.value.DescriptionText,
      LetterState: "",
      LetterPriority: "عادی",
      CentralRef: this.session.getString("CentralRef"),
      InOutFlag: "2",
      CreatorCentral: this.EditForm_LetterToEmployer.value.CreatorCentral,
      OwnerCentral: this.EditForm_LetterToEmployer.value.OwnerCentral,
    });




    this.aut_repo.LetterInsert(this.EditForm_LetterInsert.value).subscribe(e => {
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
      LetterRef: this.LetterCode(),
      LetterDate: this.ToDayDate(),
      Description: this.EditForm_LetterToEmployer.value.DescriptionText,
      LetterState: "",
      LetterPriority: "عادی",
      CreatorCentral: this.session.getString("CentralRef"),
      ExecuterCentral: this.EditForm_LetterToEmployer.value.ExecuterCentral,
    });


    this.aut_repo.AutLetterRowInsert(this.EditForm_AutLetterRowInsert.value).subscribe(e => {
      const intValue = parseInt(e[0].LetterRef, 10);


      if (!isNaN(intValue) && intValue > 0) {
        this.notificationService.succeded();
        this.LetterCode.set("")
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

  getPFStateName(id: string) {
    return this.PFState_Lookup.find(x => x.id === id)?.name || '';
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
      FactorRef: this.PreFactorCode(),
      GoodRef: good.GoodCode,
      GoodName: good.GoodName,
      ClassName: 'PreFactor',
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
      ClassName: "PreFactor",
    });

    this.updaterow_dialog_show();
  }


  Submit_UpdateRow() {
    this.EditForm_UpdateRow.patchValue({
      Amount: this.EditForm_UpdateRow.value.Amount + "",
      Price: this.EditForm_UpdateRow.value.Price + "",
    });


    this.repo.WebFactorUpdateRow(this.EditForm_UpdateRow.value).subscribe((data: any) => {

      this.notificationService.succeded();
      this.updaterow_dialog_close()

      this.GetFactor()
    });
  }

  onInputChange_Customer() {
    this.searchSubject_customer.next(this.Searchtarget_customer());
  }

  onInputChange_Good() {
    this.searchSubject_Good.next(this.Searchtarget_Good());
  }

  Factor_Customer_Property(CustomerCode: any) {




    this.repo.GetCustomerFactor(CustomerCode).subscribe({
      next: (data: any) => {

        this.records_factor.set(data?.Factors ?? [])
        this.loading.set(false)
        this.updateGridData(4, this.records_factor());

      },
      error: () => {
        this.records_factor.set([])
        this.loading.set(false)
      },
    });



  }

  Factor_Header_insert() {
    this.EditForm_Factor_Header.markAllAsTouched();
    if (!this.EditForm_Factor_Header.valid) return;



    if (this.EditForm_Factor_Header.value.Active == "2") {
      this.notificationService.error("مشتری غیر فعال می باشد");
      return
    } else if (this.EditForm_Factor_Header.value.Active == "1") {
      this.notificationService.warning("مشتری نیمه فعال می باشد");


      this.SwalAlarm_InsertFactor().then((result) => {
        if (result.isConfirmed) {
          this.Factor_Header_insert_request()
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          this.notificationService.warning('مشتری دیگری انتخاب کنید');
        }
      });

    } else {
      this.Factor_Header_insert_request()
    }


  }


  Factor_Header_insert_request() {

    this.repo.WebFactorInsert(this.EditForm_Factor_Header.value).subscribe((data: any) => {

      this.PreFactorCode.set(data.Factors[0].FactorCode)
      this.notificationService.succeded();

    });
  }
  SwalAlarm_InsertFactor() {
    return Swal.fire({
      title: 'مشتری نیمه فعال',
      text: 'این مشتری نیمه فعال است مایل به ایجاد فاکتور می باشید ؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله',
      cancelButtonText: 'خیر',
      customClass: {
        confirmButton: 'btn btn-success mx-2',
        cancelButton: 'btn btn-danger',
      },
      buttonsStyling: false,
    });
  }

  taggelShowGoodList() {
    this.ShowGoodList.set(!this.ShowGoodList())
  }

  onSelectionChanged(event: any) {
    this.selectedRows = event.api.getSelectedRows();
  }

  Set_Customer() {
    this.EditForm_Factor_Header.patchValue({
      CustName: this.selectedRows()[0].CustName_Small,
      CustomerCode: this.selectedRows()[0].CustomerCode,
      BrokerName: this.session.getString("BrokerName"),
      Active: this.selectedRows()[0].Active,
    });
    this.selectedRows.set([])
    this.customer_dialog_close()
  }

  GoBack() {
    this.location.back();
  }

  deleteFactor() {
    if (this.records_factorrows() && this.records_factorrows().length > 0) {
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


    if (this.EditForm_Factor_Header.value.PFState == "1") {
      this.notificationService.error(" این فاکتور به حالت موقت تبدیل شده است ");

    } else if (this.EditForm_Factor_Header.value.PFState == "2") {
      this.notificationService.error(" این فاکتور به حالت نهایی تبدیل شده است ");

    } else {
      this.fireDeleteSwal1().then((result) => {
        if (result.isConfirmed) {



          this.repo.DeleteWebPreFactorRows(id).subscribe((data: any) => {

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



    this.repo.DeleteWebPreFactor(this.PreFactorCode()).subscribe((data: any) => {

      this.notificationService.succeded('ردیف فوق با موفقیت حذف شد.');
      this.location.back();
    });
  }

  Show_Customer_Property(CustomerCode: any) {
    this.property_dialog_show()
    this.records_customer().forEach((customer: any) => {
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

    this.EditForm_factor.patchValue({
      ClassName: "PreFactor",
      ObjectRef: this.PreFactorCode(),
      IsShopFactor: "0",
    });


    this.repo.GetWebFactor(this.EditForm_factor.value).subscribe((data: any) => {

      this.selectedfactor = data.Factors[0]
      this.PreFactorCode.set(data.Factors[0].PreFactorCode);
      this.HasPreFactorCode.set(true)

      this.EditForm_Factor_Header.patchValue({
        FactorCode: data.Factors[0].PreFactorCode,
        FactorDate: data.Factors[0].PreFactorDate,
        PFState: data.Factors[0].PFState,

        CustName: data.Factors[0].CustName,
        CustomerCode: data.Factors[0].CustomerCode,
        Explain: data.Factors[0].Explain,
        BrokerName: data.Factors[0].BrokerName,
      });


      if (this.permissionService.canManageRole) {
        this.IsManager.set(true)

        this.CanEdit_PFState.set(true)
      } else {
        this.IsManager.set(false)

        if (data.Factors[0].PFState == "2") {
          this.CanEdit_PFState.set(false)

        } else if (data.Factors[0].PFState == "1") {
          this.CanEdit_PFState.set(false)

        } else if (data.Factors[0].PFState == "0") {
          this.CanEdit_PFState.set(true)
        }
      }




    });

    this.GetFactorrows()
    this.GetGood()
  }

  GetFactorrows() {



    this.repo.GetWebFactorRows(this.EditForm_factor.value).subscribe((data: any) => {


      this.records_factorrows.set(data?.Factors ?? [])
      this.updateGridData(2, this.records_factorrows());
    });
  }

  getdate() {

    this.base_repo.GetTodeyFromServer().subscribe((data: any) => {

      this.EditForm_Factor_Header.patchValue({
        FactorDate: data.Text,
      });
    });
  }

  GetGood() {



    this.repo.GetGoodListSupport(this.Searchtarget_Good()).subscribe((data: any) => {

      this.records_good.set(data?.Goods ?? []);
      this.updateGridData(1, this.records_good());

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




    this.repo.WebFactorInsertRow(this.EditForm_Factor_Row.value).subscribe((data: any) => {

      this.notificationService.succeded();
      this.boxbuy_dialog_close()

      this.GetFactor()
    });
  }
  GetCustomer() {




    this.EditForm_SearchTarget.patchValue({
      SearchTarget: this.Searchtarget_customer(),
      BrokerRef: "0",
    });


    this.base_repo.GetKowsarCustomer(this.EditForm_SearchTarget.value).subscribe((data: any) => {


      this.customer_dialog_show()
      this.records_customer.set(data?.Customers ?? []);
      this.updateGridData(3, this.records_customer());

    });
  }

  // #endregion

  // #region Modal

  private readonly renderer = inject(Renderer2);


  @ViewChild('customerlist', { static: false }) customerlist!: ElementRef<HTMLDivElement>;
  @ViewChild('factorcustomerproperty', { static: false }) factorcustomerproperty!: ElementRef<HTMLDivElement>;
  @ViewChild('factorproperty', { static: false }) factorproperty!: ElementRef<HTMLDivElement>;
  @ViewChild('boxbuymodal', { static: false }) boxbuymodal!: ElementRef<HTMLDivElement>;
  @ViewChild('autlettercustomer', { static: false }) autlettercustomer!: ElementRef<HTMLDivElement>;
  @ViewChild('updaterowmodal', { static: false }) updaterowmodal!: ElementRef<HTMLDivElement>;




  customer_dialog_show(): void {
    const modal = this.customerlist?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  customer_dialog_close(): void {
    const modal = this.customerlist?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }




  property_dialog_show(): void {
    const modal = this.factorcustomerproperty?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  property_dialog_close(): void {
    const modal = this.factorcustomerproperty?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  factor_property_dialog_show(): void {
    const modal = this.factorproperty?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  factor_property_dialog_close(): void {
    const modal = this.factorproperty?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  boxbuy_dialog_show(): void {
    const modal = this.boxbuymodal?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  boxbuy_dialog_close(): void {
    const modal = this.boxbuymodal?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  Autletter_dialog_show(): void {
    const modal = this.autlettercustomer?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  Autletter_dialog_close(): void {
    const modal = this.autlettercustomer?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  updaterow_dialog_show(): void {
    const modal = this.updaterowmodal?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  updaterow_dialog_close(): void {
    const modal = this.updaterowmodal?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  // #endregion
}
