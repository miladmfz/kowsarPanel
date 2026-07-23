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
import { TaskWebApiService } from '../../../services/TaskWebApi.service';

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
  private readonly task_repo = inject(TaskWebApiService);

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
  @ViewChild('allgoodtaskrow', { static: false }) allgoodtaskrow!: ElementRef<HTMLDivElement>;

  @ViewChild('goodtaskrow_factorrow', { static: false }) goodtaskrow_factorrow!: ElementRef<HTMLDivElement>;



  title = signal('فاکتور پشتیبانی')
  title_modal_goodtaskrow_factorrow = signal('')
  FactorCode = signal('')
  error_msg = signal('')
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
  records_allgoodtaskrow = signal<any[]>([])


  time: Date = new Date();

  myForm: FormGroup;
  selectedfactor: any
  attendanceInterval: any;



  private searchSubject_customer: Subject<string> = new Subject();
  private searchSubject_Good: Subject<string> = new Subject();
  priceInput = new Subject<void>();
  discountInput = new Subject<void>();

  private readonly destroy$ = new Subject<void>();


  hoursList = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  minutesList = Array.from({ length: 60 }, (_, i) =>
    i.toString().padStart(2, '0')
  );

  getTimePart(value: any, part: 'hour' | 'minute'): string {
    const time = (value ?? '').toString();

    if (!time.includes(':')) {
      return '';
    }

    const [hour, minute] = time.split(':');

    return part === 'hour' ? (hour ?? '') : (minute ?? '');
  }

  setTimePart(
    row: any,
    field: 'StartTime' | 'EndTime',
    part: 'hour' | 'minute',
    value: string
  ) {
    const current = (row[field] ?? '').toString();

    let hour = '';
    let minute = '';

    if (current.includes(':')) {
      const parts = current.split(':');
      hour = parts[0] ?? '';
      minute = parts[1] ?? '';
    }

    if (part === 'hour') {
      hour = value;
    } else {
      minute = value;
    }

    if (!hour && !minute) {
      row[field] = '';
      return;
    }

    row[field] = `${hour || '00'}:${minute || '00'}`;
  }

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
    Barbary: new FormControl('', [
      Validators.required,
      Validators.minLength(20)
    ]),
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


    this.columnDefs6 = [

      {
        field: 'GoodName',
        headerName: 'نام آیتم',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'TaskTitle',
        headerName: 'وظیفه',
        cellClass: 'text-center',
        minWidth: 200,
      },
      {
        field: 'CompanyPerson',
        headerName: 'کارمند',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'TaskDate',
        headerName: 'تاریخ',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'StartTime',
        headerName: 'شروع',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'EndTime',
        headerName: 'پایان',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'Explain',
        headerName: 'توضیحات',
        cellClass: 'text-center',
        minWidth: 150,
      },

      {
        field: 'StateTitle',
        headerName: 'وضعیت',
        cellClass: 'text-center',
        minWidth: 150,
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

        this.sharedService.triggerRefresh('refresh');
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

    if (this.records_support_factorrows() && this.records_support_factorrows().length > 0 && this.EditForm_supportfactor_property.value.Barbary.length > 10) {


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
            this.sharedService.triggerRefresh('refresh');
          } else {
            this.EditForm_Attendance.patchValue({
              CentralRef: this.session.getString("CentralRef"),
              Status: "1" //hozor
            });


            this.base_repo.ManualAttendance(this.EditForm_Attendance.value).subscribe(() => {
              this.notificationService.succeded();

              this.GetFactor()
              this.sharedService.triggerRefresh('refresh');
            });
          }
        });
      });
    } else {
      this.error_msg.set("");

      const errors: string[] = [];

      const rows = this.records_support_factorrows();

      if (!rows || rows.length === 0) {
        errors.push("هیچ ردیفی برای این فاکتور ثبت نشده است");
      }

      const barbary = String(this.EditForm_supportfactor_property.value?.Barbary ?? "").trim();

      if (barbary.length < 15) {
        errors.push("لطفاً شرح کار را تکمیل کنید");
      }

      if (errors.length > 0) {
        const msg = errors.join("، ");
        this.error_msg.set(msg);
        this.notificationService.error(msg, "اخطار");
      }
    }
  }

  Set_ExplianFactorTime() {


    this.EditForm_supportfactor_property.patchValue(
      {
        Barbary: this.cleanText(this.EditForm_supportfactor_property.value.Barbary),
      },
    );



    this.EditForm_supportfactor_property.markAllAsTouched();

    if (!this.EditForm_supportfactor_property.valid) return;


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


        this.task_repo.GoodTaskRow_Factor_Add(this.FactorCode()).subscribe((data: any) => {
          this.notificationService.succeded("وظایف اضافه شد");
          this.GetFactor()

        });

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

  DeleteFactorRow(data: any) {
    this.fireDeleteSwal1().then((result) => {
      if (result.isConfirmed) {



        this.repo.DeleteWebFactorRowsSupport(data.FactorRowCode).subscribe(() => {


          this.task_repo.GoodTaskRow_Factor_Del(data.FactorRowCode, data.GoodRef).subscribe(() => {
            this.GetFactorrows()
            this.notificationService.succeded();
          });
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
        this.sharedService.triggerRefresh('refresh');
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

  goodtaskrow_factorrow_list = signal<any[]>([]);
  ShowGoodTaskRow_FactorRow(data: any) {

    this.title_modal_goodtaskrow_factorrow.set(" * شرح وظایف * " + data.GoodName);

    this.task_repo.GoodTaskRow_Get_ByFactorRow(data.FactorRowCode)
      .subscribe((res: any) => {

        const rows = (res?.GoodTaskRows ?? []).map((x: any) => ({
          ...x,
          _submitted: false,
          State: (x.State ?? '0').toString(),
          TaskDate: x.TaskDate ?? '',
          StartTime: x.StartTime ?? '',
          EndTime: x.EndTime ?? '',
          CompanyPerson: x.CompanyPerson ?? '',
          Explain: x.Explain ?? '',
          CentralRef: x.CentralRef ?? ''
        }));

        this.goodtaskrow_factorrow_list.set(rows);

        console.log('GoodTaskRows:', rows);

        this.goodtaskrow_factorrow_dialog_show();

      });
  }
  Save_GoodTaskRow_Info(row: any) {

    row._submitted = true;

    const companyPerson = (row.CompanyPerson ?? '').toString().trim();
    const explain = (row.Explain ?? '').toString().trim();

    if (companyPerson.length === 0 || explain.length === 0) {
      this.notificationService.warning('لطفاً نماینده و توضیحات را وارد کنید');
      return;
    }

    const body = {
      GoodTaskRowCode: row.GoodTaskRowCode,
      CompanyPerson: companyPerson,
      Explain: explain,
      CentralRef: this.session.centralRef
    };

    this.task_repo.GoodTaskRow_EditInfo(body)
      .subscribe((res: any) => {

        console.log('EditInfo Result:', res);

        const result =
          res?.GoodTaskRows?.[0] ??
          res?.GoodTaskRow?.[0] ??
          res?.GoodTaskRows ??
          res;

        const errCode = Number(result?.ErrCode ?? 0);
        const errMessage = result?.ErrMessage ?? 'خطا در ثبت اطلاعات';

        if (errCode === 0) {
          this.notificationService.success('اطلاعات با موفقیت ثبت شد');

          row.CompanyPerson = companyPerson;
          row.Explain = explain;
          row.CentralRef = body.CentralRef;
          row._submitted = false;
        } else {
          this.notificationService.error(errMessage);
        }

      });
  }


  getDependencyRow(row: any): any | null {
    const dependencyGoodTaskCode = (row?.DependencyGoodTaskCode ?? '0').toString();

    if (dependencyGoodTaskCode === '0') {
      return null;
    }

    return this.goodtaskrow_factorrow_list()
      .find((x: any) =>
        (x.GoodTaskCode ?? '').toString() === dependencyGoodTaskCode
      ) ?? null;
  }

  canStartByDependency(row: any): boolean {

    const deps = this.getDependencyRows(row);

    // ❌ اگر حتی dependency STRING وجود دارد ولی match نشده
    // => یعنی دیتا ناقصه → نباید اجازه بدیم
    const hasDependencyDefinition =
      (row.DependencyTaskRefs ?? '').toString().trim().length > 0 &&
      (row.DependencyTaskRefs ?? '0') !== '0' &&
      (row.DependencyTaskRefs ?? '000') !== '000';

    // اگر dependency تعریف شده ولی نتونستیم resolve کنیم
    if (hasDependencyDefinition && deps.length === 0) {
      return false;
    }

    // اگر dependency نداریم → آزاد
    if (!hasDependencyDefinition) {
      return true;
    }

    // اگر داریم → همه باید done باشن
    return deps.every(d =>
      this.getState(d) === 2 && this.hasEndTime(d)
    );
  }
  validateStart(row: any): { ok: boolean, message?: string } {

    const deps = this.getDependencyRows(row);

    const ids = (row.DependencyTaskRefs ?? '')
      .toString()
      .trim()
      .split(',')
      .filter(x => x && x !== '0');

    // اگر dependency تعریف شده ولی پیدا نشده
    if (ids.length > 0 && deps.length === 0) {
      return {
        ok: false,
        message: `وابستگی‌های این وظیفه قابل شناسایی نیست`
      };
    }

    // 🔥 همه انجام‌نشده‌ها
    const notDoneList = deps.filter(d => Number(d.State) !== 2);

    if (notDoneList.length > 0) {

      const titles = notDoneList.map(x => `"${x.TaskTitle}"`).join(' و ');

      return {
        ok: false,
        message: `ابتدا ${titles} باید تکمیل شود`
      };
    }

    return { ok: true };
  }
  getDependencyErrorMessage(row: any): string {

    const deps = this.getDependencyRows(row);

    if (!deps.length) {
      return 'این وظیفه وابستگی ندارد یا قابل بررسی نیست';
    }

    const notDone = deps.find(d => this.getState(d) !== 2);

    if (notDone) {
      return `ابتدا «${notDone.TaskTitle}» باید تکمیل شود`;
    }

    return 'وابستگی‌ها تکمیل نشده‌اند';
  }
  getDependencyList(row: any): any[] {

    const raw = (row.DependencyTaskRefs ?? '')
      .toString()
      .trim();

    if (!raw || raw === '0' || raw === '000') return [];

    const ids = raw.split(',').map(x => Number(x));

    return this.goodtaskrow_factorrow_list()
      .filter(x => ids.includes(Number(x.TaskRef)))
      .map(x => ({
        TaskRef: x.TaskRef,
        TaskTitle: x.TaskTitle,
        GoodTaskRowCode: x.GoodTaskRowCode,
        State: x.State,
        isDone: Number(x.State) === 2,
        StartTime: x.StartTime,
        EndTime: x.EndTime
      }));
  }
  getDependencyRows(row: any): any[] {

    const ids = this.getDependencyIds(row);

    if (ids.length === 0) return [];

    return this.goodtaskrow_factorrow_list()
      .filter(x => ids.includes(Number(x.TaskRef))); // 🔥 مهم: TaskRef نه GoodTaskCode
  }

  getDependencyIds(row: any): number[] {
    const raw = (row.DependencyTaskRefs ?? '').toString().trim();

    if (!raw || raw === '0' || raw === '000') return [];

    return raw
      .split(',')
      .map(x => Number(x))
      .filter(x => !isNaN(x) && x > 0);
  }
  Start_GoodTaskRow(row: any) {

    if (!this.isNotStarted(row)) {
      this.notificationService.warning('این شرح وظیفه در وضعیت قابل شروع نیست');
      return;
    }

    if ((row.StartTime ?? '').toString().trim().length > 0) {
      this.notificationService.warning('این شرح وظیفه قبلاً شروع شده است');
      return;
    }

    // 🔥 validation جدید
    const validation = this.validateStart(row);

    if (!validation.ok) {
      this.notificationService.error(validation.message!);
      return;
    }

    const body = {
      GoodTaskRowCode: String(row.GoodTaskRowCode),
      State: '1',
      TaskDate: this.session.activeDate,
      StartTime: this.getNowTime(),
      EndTime: '',
      CentralRef: String(this.session.centralRef)
    };

    this.task_repo.GoodTaskRow_ChangeState(body)
      .subscribe((res: any) => {

        const result = res?.GoodTaskRows?.[0] ?? res;

        if (Number(result?.ErrCode ?? 0) === 0) {

          this.notificationService.success('شروع شد');

          row.State = '1';
          row.StateTitle = 'در حال انجام';
          row.StartTime = body.StartTime;
          row.TaskDate = body.TaskDate;
          row.CentralRef = body.CentralRef;
        } else {
          this.notificationService.error(result?.ErrMessage ?? 'خطا در شروع');
        }
      });
  }
  Finish_GoodTaskRow(row: any) {

    row._submitted = true;

    const body = {
      GoodTaskRowCode: row.GoodTaskRowCode,
      State: '2',
      TaskDate: row.TaskDate || this.session.activeDate,
      StartTime: row.StartTime || '',
      EndTime: this.getNowTime(),
      CentralRef: this.session.centralRef
    };

    this.task_repo.GoodTaskRow_ChangeState(body)
      .subscribe((res: any) => {

        console.log('Finish Result:', res);

        const result =
          res?.GoodTaskRows?.[0] ??
          res?.GoodTaskRow?.[0] ??
          res?.GoodTaskRows ??
          res;

        const errCode = Number(result?.ErrCode ?? 0);
        const errMessage = result?.ErrMessage ?? 'خطا در اتمام کار';

        if (errCode === 0) {
          this.notificationService.success('شرح وظیفه تمام شد');

          row.State = '2';
          row.StateTitle = 'تمام شده';
          row.TaskDate = body.TaskDate;
          row.StartTime = body.StartTime;
          row.EndTime = body.EndTime;
          row.CentralRef = body.CentralRef;
          row._submitted = false;
        } else {
          this.notificationService.error(errMessage);
        }

      });
  }
  hasEndTime(row: any): boolean {
    return (row.EndTime ?? '').toString().trim().length > 0;
  }
  getNowTime(): string {
    const now = new Date();

    const hh = now.getHours().toString().padStart(2, '0');
    const mm = now.getMinutes().toString().padStart(2, '0');

    return `${hh}:${mm}`;
  }

  getState(row: any): number {
    return Number(row?.State ?? 0);
  }

  isNotStarted(row: any): boolean {
    return this.getState(row) === 0;
  }

  isDoing(row: any): boolean {
    return this.getState(row) === 1;
  }

  isDone(row: any): boolean {
    return this.getState(row) === 2;
  }



  getStateTitle(state: any): string {
    const value = Number(state);

    switch (value) {
      case 0:
        return 'انجام نشده';
      case 1:
        return 'در حال انجام';
      case 2:
        return 'انجام شده';
      case 3:
        return 'لغو شده';
      default:
        return '-';
    }
  }
  Save_GoodTaskRow(row: any) {

    row._submitted = true;

    const explain = (row.Explain ?? '').toString().trim();
    const companyPerson = (row.CompanyPerson ?? '').toString().trim();
    const state = row.State ?? '0';

    if (companyPerson.length === 0 || state == '0' || explain.length === 0) {
      this.notificationService.warning('لطفاً فیلدهای الزامی را تکمیل کنید');
      return;
    }

    const body = {
      GoodTaskRowCode: Number(row.GoodTaskRowCode),

      TaskDate: this.session.activeDate,
      StartTime: (row.StartTime ?? '').toString().trim(),
      EndTime: (row.EndTime ?? '').toString().trim(),

      State: state,
      CompanyPerson: companyPerson,
      Explain: explain,

      CentralRef: Number(this.session.centralRef)
    };

    this.task_repo.GoodTaskRow_Edit(body)
      .subscribe((res: any) => {

        console.log('Edit Result:', res);

        const result =
          res?.GoodTaskRows?.[0] ??
          res?.GoodTaskRow?.[0] ??
          res?.GoodTaskRows ??
          res;

        const errCode = Number(result?.ErrCode ?? 0);
        const errMessage = result?.ErrMessage ?? 'خطا در ثبت اطلاعات';

        if (errCode === 0) {
          this.notificationService.success('اطلاعات با موفقیت ثبت شد');

          row.TaskDate = body.TaskDate;
          row.StartTime = body.StartTime;
          row.EndTime = body.EndTime;
          row.State = body.State.toString();
          row.CompanyPerson = body.CompanyPerson;
          row.Explain = body.Explain;
          row.CentralRef = body.CentralRef;

          row._submitted = false;
        } else {
          this.notificationService.error(errMessage);
        }

      });
  }

  ShowAllGoodTaskRow() {
    this.task_repo.GoodTaskRow_Get_ByFactor(this.FactorCode()).subscribe((data: any) => {

      this.records_allgoodtaskrow.set(data?.GoodTaskRows ?? [])
      this.updateGridData(6, this.records_allgoodtaskrow());

      this.allgoodtaskrow_dialog_show()
    });
  }

  isGoodTaskRowReadonly(row: any): boolean {
    return (row.TaskDate ?? '').toString().trim().length > 0;
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





  private cleanText(value: any): any {
    if (value === null || value === undefined) return value;

    return value
      .toString()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/([^\w\s\u0600-\u06FF])\1+/g, '$1');
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



  allgoodtaskrow_dialog_show(): void {
    const modal = this.allgoodtaskrow?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  allgoodtaskrow_dialog_close(): void {
    const modal = this.allgoodtaskrow?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  goodtaskrow_factorrow_dialog_show(): void {
    const modal = this.goodtaskrow_factorrow?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  goodtaskrow_factorrow_dialog_close(): void {
    const modal = this.goodtaskrow_factorrow?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }




  // #endregion
}
