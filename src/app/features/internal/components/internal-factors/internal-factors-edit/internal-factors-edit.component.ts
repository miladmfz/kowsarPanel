import { Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, signal, ViewChild, } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { CellActionSupportGoodEdit } from './cell-action-support-good-edit';
import { CellActionSupportFactorRowsEdit } from './cell-action-support-factorrows-edit';
import { CellActionSupportFactorCustomerEdit } from './cell-action-support-factor-customer-edit';
import { CommonModule, Location } from '@angular/common';

import Swal from 'sweetalert2';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { CellActionSupportAutletterFactorList } from './cell-action-support-autletter-factor-list';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { AgGridAngular } from 'ag-grid-angular';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { AutletterWebApiService } from 'src/app/features/automation/services/AutletterWebApi.service';

@Component({
  selector: 'app-internal-factors-edit',
  templateUrl: './internal-factors-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridAngular
  ]
})
export class InternalFactorsEditComponent extends AgGridBaseComponent implements OnInit, OnDestroy {


  private readonly router = inject(Router);

  private readonly repo = inject(SupportFactorWebApiService);
  private readonly aut_repo = inject(AutletterWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly route = inject(ActivatedRoute);
  private readonly location = inject(Location);
  private readonly sharedService = inject(SharedService);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);
  protected readonly session = inject(SessionStorageService);


  constructor() {
    super();
  }







  // #region Declare
  @ViewChild('modalsearch') modalsearch!: ElementRef;
  @ViewChild('customerlist', { static: false }) customerlist!: ElementRef<HTMLDivElement>;
  @ViewChild('factorcustomerproperty', { static: false }) factorcustomerproperty!: ElementRef<HTMLDivElement>;
  @ViewChild('factorproperty', { static: false }) factorproperty!: ElementRef<HTMLDivElement>;
  @ViewChild('boxbuymodal', { static: false }) boxbuymodal!: ElementRef<HTMLDivElement>;
  @ViewChild('autlettercustomer', { static: false }) autlettercustomer!: ElementRef<HTMLDivElement>;


  title = signal('فاکتور پشتیبانی')

  FactorCode = signal('')
  CentralRef = signal('')
  LoginType = signal('')
  Searchtarget_customer = signal('')
  Searchtarget_Good = signal('')
  LetterCode = signal('')
  ExecuterCentral = signal('')
  letterexplain_modal_title = signal('')
  ToDayDate = signal('')

  HasFactorCode = signal(false);
  ShowGoodList = signal(false)
  loading_letterowener = signal(true)
  show_newletter = signal(false)
  loading = signal(false)

  users = signal<any[]>([])
  selectedRows = signal<any[]>([])
  reportData = signal<any[]>([])
  records_factor = signal<any[]>([])
  records_letterfromowner = signal<any[]>([])
  records_support_good = signal<any[]>([])
  records_support_factorrows = signal<any[]>([])
  records_support_customer = signal<any[]>([])


  time: Date = new Date();

  myForm: FormGroup;
  selectedfactor: any
  attendanceInterval: any;



  private searchSubject_customer: Subject<string> = new Subject();
  private searchSubject_Good: Subject<string> = new Subject();
  priceInput = new Subject<void>();
  discountInput = new Subject<void>();

  private readonly destroy$ = new Subject<void>();




  EditForm_factor = new FormGroup({
    ClassName: new FormControl(''),
    ObjectRef: new FormControl(''),
  });

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
  IsPrivate_Lookup: Base_Lookup[] = [

    { id: "0", name: "عمومی" },
    { id: "1", name: "محرمانه" },
  ]

  EditForm_AutLetterRowInsert = new FormGroup({
    LetterRef: new FormControl(''),
    LetterDate: new FormControl(''),
    Description: new FormControl(''),
    LetterState: new FormControl(''),
    LetterPriority: new FormControl(''),
    CreatorCentral: new FormControl(''),
    ExecuterCentral: new FormControl(''),
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
    CustName: new FormControl(''),
    CustomerCode: new FormControl('', Validators.required),
    Explain: new FormControl(''),
    Owner: new FormControl(''),
    OwnerName: new FormControl(''),
    ClassName: new FormControl('Factor'),
    StackRef: new FormControl('1'),
    IsShopFactor: new FormControl('0'),
    Active: new FormControl('0'),

  });

  EditForm_Factor_Row = new FormGroup({
    FactorRef: new FormControl(''),
    GoodRef: new FormControl(''),
    GoodName: new FormControl(''),
    ClassName: new FormControl('Factor'),
    Amount: new FormControl(''),
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
        cellRenderer: CellActionSupportGoodEdit,
        cellRendererParams: { editUrl: '/automation/letter-panel' },
        width: 80,

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
        cellRenderer: CellActionSupportFactorRowsEdit,
        cellRendererParams: { editUrl: '/automation/letter-panel' },
        width: 80,
      },
      {
        field: 'GoodName',
        headerName: ' نام آیتم',

        cellClass: 'text-center',
        minWidth: 150,
      },
    ];

    this.columnDefs3 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionSupportFactorCustomerEdit,
        cellRendererParams: { editUrl: '/automation/letter-panel' },
        width: 80,
      },

      {
        field: 'CustName_Small',
        headerName: 'نام مشتری  ',

        cellClass: 'text-center',
        width: 150,
      },

      {
        field: 'Manager',
        headerName: 'مدیریت',

        cellClass: 'text-center',
        width: 100
      },
      {
        field: 'ActiveStr',
        headerName: 'وضعیت',

        cellClass: 'text-center',
        width: 70
      },
      {
        field: 'Explain',
        headerName: 'پشتیبانی',

        cellClass: 'text-center',
        width: 100
      },
    ];

    this.columnDefs4 = [
      {
        field: 'FactorDate',
        headerName: 'تاریخ',

        cellClass: 'text-center',
        width: 120,
        maxWidth: 120,

        cellStyle: (params) => {

          const isSelected =
            params.value === this.EditForm_Factor_Header.value.FactorDate;

          if (!isSelected) {
            return null;
          }

          const isDark =
            document.documentElement.getAttribute('data-bs-theme') === 'dark';

          return isDark
            ? {
              background: 'rgba(255, 204, 51, .14)',
              color: '#ffd666',
              fontWeight: '700',
              border: '1px solid rgba(255, 204, 51, .18)'
            }
            : {
              background: 'rgba(255, 204, 51, .18)',
              color: '#b45309',
              fontWeight: '700',
              border: '1px solid rgba(217, 119, 6, .12)'
            };
        }
      },
      {
        field: 'OwnerName',
        headerName: 'نام پشتیبان',

        cellClass: 'text-center',
        width: 80,
        maxWidth: 200
      },
      {
        field: 'starttime',
        headerName: 'شروع',

        cellClass: 'text-center',
        width: 120,
        maxWidth: 120,
      },
      {
        field: 'Barbary',
        headerName: 'شرح',

        cellClass: 'text-center',
        width: 250,
        minWidth: 200,
      },

    ];

    this.columnDefs5 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionSupportAutletterFactorList,
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

  pipe_function() {
    this.searchSubject_customer.pipe(
      debounceTime(1000),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.GetCustomer();
    });

    this.searchSubject_Good.pipe(
      debounceTime(1000),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.GetGood();
    });
  }

  // #endregion

  // #region Func





  changeStatus(status: string) {
    this.sharedService.triggerRefresh('refresh');
  }


  ngOnInit(): void {


    this.themeSub = this.themeService.theme$.pipe(takeUntil(this.destroy$)).subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      var idtemp = params.get('id');

      if (idtemp != null) {
        this.FactorCode.set(idtemp);
        this.HasFactorCode.set(true);
        this.LoginType.set(this.session.getString("LoginType") ?? '')
        this.CentralRef.set(this.session.getString("CentralRef") ?? '')

        this.GetFactor();
      } else {
        this.getdate();
      }
    });

    this.Config_Declare();
    this.pipe_function();

    this.priceInput.pipe(debounceTime(1000), takeUntil(this.destroy$)).subscribe(() => {
      this.cal_takhfif_from_price();
    });

    this.discountInput.pipe(debounceTime(1000), takeUntil(this.destroy$)).subscribe(() => {
      this.cal_price_from_takhfif();
    });
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
    if (this.show_newletter()) {
      this.EditForm_LetterToEmployer.patchValue({
        DescriptionText: "",
        ExecuterCentral: "",
      });
    }
    this.show_newletter.set(!this.show_newletter())
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
        this.LetterCode.set(e[0].LetterCode);
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
        this.LetterCode.set('')
        this.toggel_show_newletter()
        this.Autletter_dialog_close()
      } else {
        //Todo notification erroor
      }
    });
  }



  NewFactor() {
    this.router.navigate(['/internal/internal-factors-edit']);
  }

  timeStringToDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  Set_StartFactorTime() {


    const currentTime = new Date();
    const hours = currentTime.getHours().toString().padStart(2, '0');
    const minutes = currentTime.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`;

    this.EditForm_supportfactor_property.patchValue({
      starttime: timeString,
    });


    this.repo.Support_StartFactorTime(this.EditForm_supportfactor_property.value).subscribe(() => {
      this.EditForm_Attendance.patchValue({
        CentralRef: this.session.getString("CentralRef"),
        Status: "2" //busy
      });


      this.base_repo.ManualAttendance(this.EditForm_Attendance.value).subscribe(() => {
        this.notificationService.succeded();
        this.router.navigate(['/internal/internal-factors-edit', this.FactorCode()]);

        this.sharedService.triggerActionAll('refresh');
      });
    });
  }

  handleEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.Set_ExplianFactorTime();
    }
  }

  Set_EndFactorTime() {
    if (this.records_support_factorrows() && this.records_support_factorrows().length > 0) {


      const currentTime = new Date();
      const hours = currentTime.getHours().toString().padStart(2, '0');
      const minutes = currentTime.getMinutes().toString().padStart(2, '0');
      const timeString = `${hours}:${minutes}`;

      this.EditForm_supportfactor_property.patchValue({
        Endtime: timeString,
      });

      const start1 = this.timeStringToDate(this.EditForm_supportfactor_property.value.starttime);
      const end1 = this.timeStringToDate(this.EditForm_supportfactor_property.value.Endtime);
      let duration = (end1.getTime() - start1.getTime()) / 1000 / 60; // minutes

      this.EditForm_supportfactor_property.patchValue({
        worktime: duration + "",
      });

      if (duration < 0) {
        this.EditForm_supportfactor_property.patchValue({ worktime: "0" });
      }


      this.repo.Support_EndFactorTime(this.EditForm_supportfactor_property.value).subscribe(() => {

        this.EditForm_SupportData.patchValue({
          DateTarget: "",
          Flag: "2"
        });


        this.repo.GetSupportPanel(this.EditForm_SupportData.value).subscribe((data: any) => {

          if (data.SupportDatas[0].EmptyEndTimeCount > 0) {
            this.notificationService.succeded();

            this.notificationService.warning(data.SupportDatas[0].EmptyEndTimeCount + " فاکتور باز وجود دارد");
            this.GetFactor()
            this.sharedService.triggerActionAll('refresh');
          } else {
            this.EditForm_Attendance.patchValue({
              CentralRef: this.session.getString("CentralRef"),
              Status: "1" //hozor
            });


            this.base_repo.ManualAttendance(this.EditForm_Attendance.value).subscribe(() => {
              this.notificationService.succeded();

              this.GetFactor()
              this.sharedService.triggerActionAll('refresh');
            });
          }
        });
      });
    } else {
      this.notificationService.error("هیچ ردیفی برای این فاکتور زده نشده", "اخطار");
    }
  }

  Set_ExplianFactorTime() {


    this.repo.Support_ExplainFactor(this.EditForm_supportfactor_property.value).subscribe(() => {
      this.notificationService.succeded();

      this.factor_property_dialog_close()
      this.GetFactor()
    });
  }

  insert_FactorRows() {
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
      this.EditForm_Factor_Row.patchValue({ takhfif: discount.toFixed(2) });
    }

    this.cal_totalprice();
  }

  cal_price_from_takhfif() {
    let discount = parseFloat(this.EditForm_Factor_Row.value.takhfif) || 0;
    let maxsellprice = parseFloat(this.EditForm_Factor_Row.value.maxsellprice) || 0;

    if (maxsellprice > 0) {
      let price = maxsellprice * (1 - discount / 100);
      this.EditForm_Factor_Row.patchValue({ Price: price.toFixed(2) });
    }

    this.cal_totalprice();
  }

  cal_totalprice() {
    const Amount_temp = parseFloat(this.EditForm_Factor_Row.value.Amount) || 0;
    const Price_temp = parseFloat(this.EditForm_Factor_Row.value.Price) || 0;
    const DefaultRatioValue_temp = parseFloat(this.EditForm_Factor_Row.value.DefaultRatioValue) || 1;
    const DefaultUnitValue_temp = parseFloat(this.EditForm_Factor_Row.value.DefaultUnitValue) || 1;

    const totalPrice_temp = Amount_temp * Price_temp * DefaultRatioValue_temp * DefaultUnitValue_temp;

    this.EditForm_Factor_Row.patchValue({ totalprice: "" + totalPrice_temp });
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

    this.insert_FactorRows()
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
    this.repo.WebSupportFactorInsert(this.EditForm_Factor_Header.value).subscribe((data: any) => {

      const factor = data?.Factors?.[0];

      if (!factor) {
        this.notificationService.error('فاکتور ایجاد نشد');
        return;
      }

      this.FactorCode.set(factor.FactorCode ?? '');

      this.notificationService.succeded();

      this.EditForm_supportfactor_property.patchValue({
        starttime: factor.starttime ?? '',
        Endtime: factor.Endtime ?? '',
        worktime: factor.worktime ?? '',
        Barbary: factor.Barbary ?? '',
        ObjectRef: factor.FactorCode ?? '',
      });

      this.Set_StartFactorTime();
    });
  }


  taggelShowGoodList() {
    this.ShowGoodList.set(!this.ShowGoodList())
  }

  onSelectionChanged(event: any) {
    this.selectedRows.set(event.api.getSelectedRows())
  }

  Set_Customer() {
    const selectedCustomer = this.selectedRows()?.[0];

    if (!selectedCustomer) {
      this.notificationService.warning('لطفاً یک مشتری انتخاب کنید');
      return;
    }

    this.EditForm_Factor_Header.patchValue({
      CustName: selectedCustomer.CustName_Small,
      CustomerCode: selectedCustomer.CustomerCode,
      OwnerName: this.session.phFullName,
      Active: selectedCustomer.Active,
    });

    this.selectedRows.set([]);
    this.customer_dialog_close();
  }

  GoBack() {
    this.location.back();
  }

  deleteFactor() {
    if (this.records_support_factorrows() && this.records_support_factorrows().length > 0) {
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

  delete(id: any) {
    this.fireDeleteSwal1().then((result) => {
      if (result.isConfirmed) {



        this.repo.DeleteWebFactorRowsSupport(id).subscribe(() => {


          this.GetFactorrows()
          this.notificationService.succeded();
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        this.notificationService.warning('اطلاعات تغییری نکرد');
      }
    });
  }

  deletefactorRecord() {



    this.repo.DeleteWebFactorSupport(this.FactorCode()).subscribe(() => {
      this.EditForm_Attendance.patchValue({
        CentralRef: this.session.getString("CentralRef"),
        Status: "1" //hozor
      });


      this.base_repo.ManualAttendance(this.EditForm_Attendance.value).subscribe(() => {


        this.notificationService.succeded();
        this.location.back();
        this.sharedService.triggerActionAll('refresh');
      });
    });
  }

  Show_Customer_Property(CustomerCode: any) {
    this.property_dialog_show()
    this.records_support_customer().forEach((customer: any) => {
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
      ClassName: "Factor",
      ObjectRef: this.FactorCode(),
    });


    this.repo.GetWebFactorSupport(this.FactorCode()).subscribe((data: any) => {

      if (!data?.Factors || data.Factors.length === 0) {
        this.notificationService.error("رکوردی برای نمایش وجود ندارد");

        history.back();

      }

      this.selectedfactor = data.Factors[0]

      this.FactorCode.set(data.Factors[0].FactorCode);
      this.HasFactorCode.set(true)
      this.EditForm_Factor_Header.patchValue({
        FactorCode: data.Factors[0].FactorCode,
        FactorDate: data.Factors[0].FactorDate,
        CustName: data.Factors[0].CustName,
        CustomerCode: data.Factors[0].CustomerCode,
        Explain: data.Factors[0].Explain,
        OwnerName: data.Factors[0].OwnerName,
        Owner: data.Factors[0].Owner,
      });

      this.EditForm_supportfactor_property.patchValue({
        starttime: data.Factors[0].starttime,
        Endtime: data.Factors[0].Endtime,
        worktime: data.Factors[0].worktime,
        Barbary: data.Factors[0].Barbary,
        ObjectRef: data.Factors[0].FactorCode,
      });



      this.Factor_Customer_Property(data.Factors[0].CustomerCode)

    });

    this.GetFactorrows()
    this.GetGood()
  }

  GetFactorrows() {



    this.repo.GetWebFactorRowsSupport(this.FactorCode()).subscribe((data: any) => {


      this.records_support_factorrows.set(data?.Factors ?? [])
      this.updateGridData(2, this.records_support_factorrows());
    });
  }

  getdate() {

    this.base_repo.GetTodeyFromServer()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {

        const today = data?.Text ?? '';

        this.ToDayDate.set(today);

        this.EditForm_Factor_Header.patchValue({
          FactorDate: today,
        });
      });
  }

  GetGood() {

    this.repo.GetGoodListSupport(this.Searchtarget_Good()).subscribe((data: any) => {

      this.records_support_good.set(data?.Goods ?? [])
      this.updateGridData(1, this.records_support_good());

    });
  }

  CallCustomer() {

    this.customer_dialog_show()
    this.GetCustomer()

  }

  GetCustomer() {


    this.EditForm_SearchTarget.patchValue({
      SearchTarget: this.Searchtarget_customer(),
      BrokerRef: "0",
    });



    this.base_repo.GetKowsarCustomer(this.EditForm_SearchTarget.value).subscribe((data: any) => {


      this.records_support_customer.set(data?.Customers ?? [])
      this.updateGridData(3, this.records_support_customer());

    });
  }

  // #endregion

  override ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.cleanupAllModals();
  }

  cleanupAllModals(): void {

    document
      .querySelectorAll('.modal-backdrop')
      .forEach((item) => item.remove());

    document
      .querySelectorAll('.modal.show')
      .forEach((modal) => {

        const element = modal as HTMLElement;

        element.classList.remove('show');

        element.style.display = 'none';

        element.setAttribute('aria-hidden', 'true');

      });

    document.body.classList.remove('modal-open');

    document.body.style.overflow = '';

    document.body.style.paddingRight = '';
  }

  // #region Modal






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






  // #endregion
}
