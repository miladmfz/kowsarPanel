import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { ManagerWebApiService } from '../../../services/ManagerWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { Base_Lookup } from 'src/app/app/kowsar/lookup-type';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';

@Component({
  selector: 'app-application-report',
  templateUrl: './application-report.component.html',
})
export class ApplicationReportComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private router: Router,
    private repo: ManagerWebApiService,
    private readonly notificationService: NotificationService,
    private renderer: Renderer2


  ) {
    super();
  }






  Title_Lookup: Base_Lookup[] = [

    { id: "1", name: "تعداد دستگاه‌های فعال برای هر مشتری (تعداد دستگاه های غیرتکراری)" },
    { id: "2", name: "تعداد دستگاه‌هایی که در بازه زمانی مشخص فعالیت داشتند (براساس تاریخ و مشتری)" },
    { id: "3", name: "لیست دستگاه‌ها (دستگاه  ها) فعال برای هر مشتری همراه با تاریخ آخرین اتصال" },
    { id: "4", name: "تعداد کل ورودهای لاگ ثبت شده برای هر مشتری (شامل رکوردهای تکراری)" },
    { id: "5", name: "جزئیات آخرین ورود هر دستگاه (مشتری، دستگاه ، تاریخ و توضیحات)" },
    { id: "6", name: "تعداد  بازاریاب های مرتبط با هر مشتری به صورت رشته (به همراه تعداد کل  بازاریاب ها)" },
    { id: "7", name: "دستگاه‌هایی که برای یک مشتری بیش از یک نسخه متفاوت ثبت شده‌اند" },
    { id: "8", name: "تعداد دفعات تکرار هر نسخه برای هر مشتری (بدون فیلتر بر اساس تعداد نسخه متفاوت)" }
  ];


  records;
  title = 'گزارش ماژول های نرم افزاری ';
  dateValue = new FormControl();
  StartTime = new FormControl();

  EndTime = new FormControl();
  selectedFlag: string = "1";

  CentralRef: string = '';
  JobPersonRef: string = '';

  items: any[] = [];
  TextData: string = '';
  selectedOption: string = '0';

  searchTerm: string = '';
  ToDayDate: string = '';

  loading: boolean = true;

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };



  EditForm_AppLog = new FormGroup({
    FromDate: new FormControl(''),
    ToDate: new FormControl(''),
    ServerName: new FormControl(''),
    Flag: new FormControl('', Validators.required),
  });




  column_declare() {
    this.columnDefs = [
      // {
      //   field: 'عملیات',
      //   pinned: 'left',
      //   cellRenderer: CellActionAutletterList,
      //   cellRendererParams: {
      //     editUrl: '/support/letter-detail',
      //   },
      //   width: 200,
      // },
      // {
      //   field: 'وضعیت',
      //   cellRenderer: ValidateionStateCellAutletterRenderer,
      //   cellClass: 'text-center',
      //   minWidth: 80

      // },
      {
        field: 'RowExecutorName',
        headerName: 'کاربر فعلی	',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },




    ];
  }


  appLogResult: any[] = [];

  override ngOnInit(): void {
    super.ngOnInit();
    this.JobPersonRef = sessionStorage.getItem("JobPersonRef");

    this.column_declare()
    this.getList()


  }






  getList() {


    this.EditForm_AppLog.markAllAsTouched();
    if (!this.EditForm_AppLog.valid) return;

    //this.loading = true


    this.repo.GetAppLogReport(this.EditForm_AppLog.value)
      .subscribe((data) => {
        this.selectedFlag = this.EditForm_AppLog.value.Flag
        this.appLogResult = data;
        this.loading = false

      });




  }





}

