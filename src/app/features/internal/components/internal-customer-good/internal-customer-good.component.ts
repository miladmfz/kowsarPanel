import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { SupportFactorWebApiService } from '../../services/SupportFactorWebApi.service';
import { TaskWebApiService } from '../../services/TaskWebApi.service';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { debounceTime, Subject, takeUntil } from 'rxjs';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { CellActionCustomerGoodList } from './cell-action-customer-good-list';
import { CellActionCustomerGood } from './cell-action-customer-good';
import { CustomerWebApiService } from '../../services/CustomerWebApi.service';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { CellActionPatternList } from './cell_action_pattern_list';
import { from, of } from 'rxjs';
import { concatMap, switchMap, toArray } from 'rxjs/operators';

@Component({
  selector: 'app-internal-customer-good',
  templateUrl: './internal-customer-good.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AgGridAngular
  ]
})
export class InternalCustomerGoodComponent extends AgGridBaseComponent implements OnInit, OnDestroy {


  private readonly router = inject(Router);

  private readonly repo = inject(SupportFactorWebApiService);
  private readonly task_repo = inject(TaskWebApiService);
  private readonly customer_repo = inject(CustomerWebApiService);
  protected readonly permissionService = inject(PermissionService);

  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);
  protected readonly session = inject(SessionStorageService);


  constructor() {
    super();
  }



  // #region Declare
  @ViewChild('modalsearch') modalsearch!: ElementRef;
  @ViewChild('allgoodtaskrow', { static: false }) allgoodtaskrow!: ElementRef<HTMLDivElement>;
  @ViewChild('goodtaskrow_factorrow', { static: false }) goodtaskrow_factorrow!: ElementRef<HTMLDivElement>;
  @ViewChild('patterngood', { static: false }) patterngood!: ElementRef<HTMLDivElement>;
  @ViewChild('pattern', { static: false }) pattern!: ElementRef<HTMLDivElement>;



  title = signal('شرح خدمات مشتری')

  modal_PatternGood_title = signal('')
  title_modal_goodtaskrow_factorrow = signal('')
  CustomerCode = signal('')
  error_msg = signal('')
  PatternCode_Selected = signal('0')
  CentralRef = signal('')
  LoginType = signal('')
  Searchtarget_Good = signal('')
  ToDayDate = signal('')

  ShowGoodList = signal(false)
  loading = signal(false)

  users = signal<any[]>([])
  selectedRows = signal<any[]>([])
  reportData = signal<any[]>([])

  records_pattern_Goods = signal<any[]>([])
  records_pattern = signal<any[]>([])
  records_customer_good = signal<any[]>([])
  records_all_good = signal<any[]>([])

  records_allgoodtaskrow = signal<any[]>([])


  time: Date = new Date();

  myForm: FormGroup;
  selectedfactor: any
  attendanceInterval: any;

  EditForm_Customer = new FormGroup({
    CustomerCode: new FormControl(''),
    FName: new FormControl('', Validators.required),
    LName: new FormControl('', Validators.required),
    CityCode: new FormControl(''),
    CityName: new FormControl('', Validators.required),
    Address: new FormControl(''),
    Phone: new FormControl('', Validators.required),
    Mobile: new FormControl(''),
    Email: new FormControl(''),
    Explain: new FormControl(''),
    ZipCode: new FormControl(''),
  });


  private searchSubject_Good: Subject<string> = new Subject();
  priceInput = new Subject<void>();
  discountInput = new Subject<void>();

  private readonly destroy$ = new Subject<void>();





  ngOnInit(): void {

    this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe((params: ParamMap) => {
      var idtemp = params.get('id');

      if (idtemp != null) {
        this.CustomerCode.set(idtemp);
        this.CentralRef.set(this.session.getString("CentralRef") ?? '')
        this.GetCustomerByCode()
      }
    });

    this.Config_Declare();
    this.pipe_function();


  }



  GetCustomerByCode() {


    this.customer_repo.GetCustomerByCode(this.CustomerCode())
      .subscribe((data: any) => {

        this.EditForm_Customer.patchValue({
          CustomerCode: data?.Customers[0].CustomerCode,
          FName: data?.Customers[0].FName,
          LName: data?.Customers[0].Name,
          CityCode: data?.Customers[0].CityCode,
          CityName: data?.Customers[0].CityName,
          Address: data?.Customers[0].Address,
          Phone: data?.Customers[0].Phone,
          Mobile: data?.Customers[0].Mobile,
          Email: data?.Customers[0].Email,
          Explain: data?.Customers[0].Explain,

        });


        this.GetCustomerGood()
        this.GetGood()


      });
  }





  GetCustomerGood() {



    this.task_repo.GetCustomerGood(this.CustomerCode()).subscribe((data: any) => {


      this.records_customer_good.set(data.CustomerGoods)
      this.updateGridData(2, this.records_customer_good());

    });
  }



  GetGood() {

    this.repo.GetGoodListSupport(this.Searchtarget_Good()).subscribe((data: any) => {

      this.records_all_good.set(data?.Goods ?? [])
      this.updateGridData(1, this.records_all_good());

    });
  }


  AddGoodToBasket(data: any) {

    this.task_repo.CustomerGood_AddNew(this.CustomerCode(), data.GoodCode).subscribe((data: any) => {

      this.task_repo.GoodTaskRow_Customer_Add(this.CustomerCode()).subscribe((data: any) => {
        this.notificationService.succeded("وظایف اضافه شد");
        this.GetCustomerGood()

      });

    });
  }



  ShowAllGoodTaskRow() {
    this.task_repo.GoodTaskRow_Get_ByCustomer(this.CustomerCode()).subscribe((data: any) => {

      this.records_allgoodtaskrow.set(data?.GoodTaskRows ?? [])
      this.updateGridData(6, this.records_allgoodtaskrow());

      this.allgoodtaskrow_dialog_show()
    });
  }



  ShowGoodTaskRow_CustomerGood(data: any) {

    this.title_modal_goodtaskrow_factorrow.set(" * شرح وظایف * " + data.GoodName);

    this.task_repo.GoodTaskRow_Get_ByCustomerRow(data.CustomerGoodCode)
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




  Show_Pattern() {
    this.getPatternList()
    this.pattern_dialog_show()
  }

  getPatternList(): void {

    this.task_repo.GetPatterns().subscribe((data: any) => {

      this.records_pattern.set(data?.Patterns ?? [])
      this.updateGridData(3, this.records_pattern());
    });
  }




  ShowGoodFromPattern(data: any): void {

    this.modal_PatternGood_title.set("لیست اقلام الگو " + data.Title)


    this.PatternCode_Selected.set(data.PatternCode)
    this.Get_PatternGood()

  }


  Get_PatternGood(): void {

    this.task_repo.GetGoodFromPattern(this.PatternCode_Selected()).subscribe((data: any) => {

      this.records_pattern_Goods.set(data?.Goods ?? [])
      this.updateGridData(4, this.records_pattern_Goods());
      this.patterngood_dialog_show()
    });
  }
  AddGoodsToCustomer(pattern: any): void {

    this.task_repo.GetGoodFromPattern(pattern.PatternCode)
      .pipe(

        switchMap((res: any) => {

          const goods = res?.Goods ?? [];

          if (goods.length === 0) {
            this.notificationService.warning('کالایی برای این الگو پیدا نشد');
            return of(null);
          }

          return from(goods).pipe(

            concatMap((good: any) =>
              this.task_repo.CustomerGood_AddNew(
                this.CustomerCode(),
                good.GoodCode
              )
            ),

            toArray(),

            switchMap(() =>
              this.task_repo.GoodTaskRow_Customer_Add(this.CustomerCode())
            )

          );

        })

      )
      .subscribe({
        next: (res: any) => {

          if (!res) {
            return;
          }

          this.notificationService.succeded('کالاها و وظایف با موفقیت اضافه شدند');

          this.GetCustomerGood();

          this.pattern_dialog_close();

        },

        error: (err: any) => {
          console.error('AddGoodsToCustomer Error:', err);
          this.notificationService.error('خطا در اضافه کردن کالاها');
        }
      });

  }

  DeleteCustomerGood(input_data: any) {

    this.task_repo.CustomerGood_Del(input_data.CustomerGoodCode).subscribe((data: any) => {

      this.task_repo.GoodTaskRow_Customer_Del(this.CustomerCode(), input_data.GoodRef).subscribe(() => {
        this.notificationService.succeded()
        this.GetCustomerGood()
      });

    });


  }
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


  EditForm_search = new FormGroup({
    SearchTarget: new FormControl(''),
    ObjectRef: new FormControl(''),
  });



  EditForm_SupportData = new FormGroup({
    DateTarget: new FormControl(''),
    Flag: new FormControl('1'),
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


  Config_Declare() {

    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionCustomerGoodList,
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
        cellRenderer: CellActionCustomerGood,
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
        cellRenderer: CellActionPatternList,
        width: 120,
      },
      {
        field: 'PatternCode',
        headerName: 'کد  ',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Title',
        headerName: 'نام ',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'توضیحات',

        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.columnDefs4 = [

      {
        field: 'Title',
        headerName: 'نام ',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'GoodName',
        headerName: 'نام آیتم',
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

    this.searchSubject_Good.pipe(
      debounceTime(1000),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.GetGood();
    });
  }

  // #endregion

  // #region Func




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


  timeStringToDate(timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  }


  onInputChange_Good() {
    this.searchSubject_Good.next(this.Searchtarget_Good());
  }


  taggelShowGoodList() {
    this.ShowGoodList.set(!this.ShowGoodList())
  }

  onSelectionChanged(event: any) {
    this.selectedRows.set(event.api.getSelectedRows())
  }




  goodtaskrow_factorrow_list = signal<any[]>([]);

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

  getDependencyTaskIds(row: any): string[] {
    const raw = (row?.DependencyTaskRefs ?? '').toString().trim();

    if (!raw || raw === '0' || raw === '000') {
      return [];
    }

    return raw
      .split(',')
      .map((x: string) => x.trim())
      .filter((x: string) => x.length > 0 && x !== '0' && x !== '000');
  }


  getDependencyRows(row: any): any[] {
    const ids = this.getDependencyTaskIds(row);

    if (ids.length === 0) {
      return [];
    }

    return (this.goodtaskrow_factorrow_list() ?? [])
      .filter((x: any) => ids.includes((x.TaskRef ?? '').toString()))
      .sort((a: any, b: any) => {
        const ai = ids.indexOf((a.TaskRef ?? '').toString());
        const bi = ids.indexOf((b.TaskRef ?? '').toString());
        return ai - bi;
      });
  }


  getDependencyTitlesFromString(row: any): string[] {
    const raw = (row?.DependencyTaskTitles ?? '').toString().trim();

    if (!raw) {
      return [];
    }

    return raw
      .split(',')
      .map((x: string) => x.trim())
      .filter((x: string) => x.length > 0);
  }


  validateStart(row: any): { ok: boolean; message?: string } {
    const dependencyIds = this.getDependencyTaskIds(row);

    if (dependencyIds.length === 0) {
      return { ok: true };
    }

    const dependencyRows = this.getDependencyRows(row);

    // اگر وابستگی در لیست همین کالا/ردیف وجود نداشت، طبق تصمیم قبلی مانع شروع نمی‌شویم.
    // چون ممکن است آن Task در مجموعه ردیف‌های فعلی نیامده باشد.
    if (dependencyRows.length === 0) {
      return { ok: true };
    }

    const notFinishedRows = dependencyRows.filter((d: any) => !this.hasEndTime(d));

    if (notFinishedRows.length > 0) {
      const titles = notFinishedRows
        .map((x: any) => `"${x.TaskTitle ?? 'بدون عنوان'}"`)
        .join(' و ');

      const endText = notFinishedRows.length > 1 ? 'شوند' : 'شود';

      return {
        ok: false,
        message: `ابتدا ${titles} باید تکمیل ${endText}`
      };
    }

    return { ok: true };
  }


  canStartByDependency(row: any): boolean {
    return this.validateStart(row).ok;
  }


  getDependencyErrorMessage(row: any): string {
    return this.validateStart(row).message ?? 'وابستگی‌ها تکمیل نشده‌اند';
  }


  getDependencyList(row: any): any[] {
    return this.getDependencyRows(row).map((x: any) => ({
      TaskRef: x.TaskRef,
      TaskTitle: x.TaskTitle,
      GoodTaskRowCode: x.GoodTaskRowCode,
      State: x.State,
      isDone: this.hasEndTime(x),
      StartTime: x.StartTime,
      EndTime: x.EndTime
    }));
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

    const validation = this.validateStart(row);

    if (!validation.ok) {
      this.notificationService.error(validation.message!);
      return;
    }

    const body = {
      GoodTaskRowCode: (row.GoodTaskRowCode ?? '').toString(),
      State: '1',
      TaskDate: (this.session.activeDate ?? '').toString(),
      StartTime: this.getNowTime(),
      EndTime: '',
      CentralRef: (this.session.centralRef ?? '').toString()
    };

    this.task_repo.GoodTaskRow_ChangeState(body)
      .subscribe((res: any) => {

        const result =
          res?.GoodTaskRows?.[0] ??
          res?.GoodTaskRow?.[0] ??
          res;

        const errCode = Number(result?.ErrCode ?? 0);

        if (errCode === 0) {

          this.notificationService.success('شروع شد');

          row.State = '1';
          row.StateTitle = 'در حال انجام';
          row.TaskDate = body.TaskDate;
          row.StartTime = body.StartTime;
          row.EndTime = '';

        } else {
          this.notificationService.error(result?.ErrMessage ?? 'خطا');
        }

      });
  }
  Finish_GoodTaskRow(row: any) {

    row._submitted = true;

    const body = {
      GoodTaskRowCode: (row.GoodTaskRowCode ?? '').toString(),
      State: '2',
      TaskDate: (row.TaskDate || this.session.activeDate || '').toString(),
      StartTime: (row.StartTime || '').toString(),
      EndTime: this.getNowTime(),
      CentralRef: (this.session.centralRef ?? '').toString()
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



  isGoodTaskRowReadonly(row: any): boolean {
    return (row.TaskDate ?? '').toString().trim().length > 0;
  }
  // #endregion

  // #region Get_Data














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




  patterngood_dialog_show(): void {
    const modal = this.patterngood?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  patterngood_dialog_close(): void {
    const modal = this.patterngood?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }




  pattern_dialog_show(): void {
    const modal = this.pattern?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  pattern_dialog_close(): void {
    const modal = this.pattern?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }







  // #endregion
}
