import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { Subscription } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { SupportFactorWebApiService } from 'src/app/app/support/services/SupportFactorWebApi.service';
import { CellActionKowsarReport } from './cell-action-attendance-panel';
import * as moment from 'jalali-moment';
import { Base_Lookup } from 'src/app/app/kowsar/lookup-type';
import { CellDateMinDate } from './cell-date-label-attendance-panel';

@Component({
  selector: 'app-kowsar-report',
  templateUrl: './kowsar-report.component.html',
})
export class KowsarReportComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private repo: SupportFactorWebApiService,
    private sharedService: SharedService,
    private readonly notificationService: NotificationService,
    private renderer: Renderer2,

    private themeService: ThemeService
  ) {
    super();
  }





  records_person

  records_personletterrow

  records_letterrowstate

  loading_person: boolean = true;
  loading_letterrowstate: boolean = true;
  BrokerRef: string = '';
  BrokerHistroyName: string = '';
  letterexplain_modal_title: string = '';
  ToDayDate: any;
  reportData: any[] = [];
  Attendance_Data: any[] = [];
  attendanceInterval: any;


  EditForm_KowsarReport1 = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl('0'),
    LetterRowCode: new FormControl('0'),
    Flag: new FormControl(''),
    DateTarget: new FormControl(''),
  });

  EditForm_KowsarReport2 = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl('0'),
    LetterRowCode: new FormControl('0'),
    Flag: new FormControl(''),
    DateTarget: new FormControl(''),
  });

  EditForm_KowsarReport3 = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl('0'),
    LetterRowCode: new FormControl('0'),
    Flag: new FormControl(''),
    DateTarget: new FormControl(''),
  });





  LetterState_Lookup: Base_Lookup[] = [
    { id: "", name: "دیده نشده" },
    { id: "منتظراقدام", name: "منتظراقدام" },
    { id: "درحال انجام", name: "درحال انجام" },
    { id: "تمام شده", name: "تمام شده" },
    { id: "ابطالی", name: "ابطالی" },
  ]





  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };






  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }
  ngOnDestroy() {

    this.themeSub.unsubscribe();

  }


  override ngOnInit(): void {
    super.ngOnInit();

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });





    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionKowsarReport,
        width: 70,
      },
      {
        field: 'Name',
        headerName: 'کارشناس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'تاریخ',
        cellRenderer: CellDateMinDate,
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'TotalLetters',
        headerName: 'کل ارجاعات',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },
      {
        field: 'Unread',
        headerName: 'دیده نشده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },
      {
        field: 'WaitingAction',
        headerName: 'منتظر اقدام',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },
      {
        field: 'InProgress',
        headerName: 'در حال انجام',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },
      {
        field: 'Completed',
        headerName: 'تمام شده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },
      {
        field: 'Status1Minutes',
        headerName: 'مدت آزاد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },
      {
        field: 'Status2Minutes',
        headerName: 'مدت کار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },


    ];





    this.columnDefs2 = [


      {
        field: 'RowLetterDate',
        headerName: 'تاریخ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'LetterRowDescription',
        headerName: 'توضیحات',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'OwnerName',
        headerName: 'مالکیت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'CreatorName',
        headerName: 'ایجاد کننده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'RowExecutorName',
        headerName: 'اقدام کننده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'RowLetterState',
        headerName: 'وضعیت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'AutLetterRow_PropDescription1',
        headerName: 'شرح کار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },


    ];




    this.columnDefs3 = [


      {
        field: 'RowLetterDate',
        headerName: 'تاریخ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'LetterRowDescription',
        headerName: 'توضیحات',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'OwnerName',
        headerName: 'مالکیت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'CreatorName',
        headerName: 'ایجاد کننده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'RowExecutorName',
        headerName: 'اقدام کننده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'RowLetterState',
        headerName: 'وضعیت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'AutLetterRow_PropDescription1',
        headerName: 'شرح کار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },


    ];



    this.getFirstpanel_data()


  }






  getFirstpanel_data() {

    if (sessionStorage.getItem("CentralRef") == '1274' ||
      sessionStorage.getItem("CentralRef") == '1139' ||
      sessionStorage.getItem("CentralRef") == '1843') {

      this.getpaneldata_report1()
      //this.getpaneldata_report2("0", "0")
      this.getpaneldata_report3()

    }







  }






  getpaneldata_report1() {

    this.EditForm_KowsarReport1.patchValue({
      Flag: "1",
    });

    this.repo.GetKowsarReport(this.EditForm_KowsarReport1.value).subscribe((data: any) => {
      this.loading_person = false

      this.records_person = data.KowsarReports;


    });



  }


  getpaneldata_report2(CentralRef, LetterRowCode) {

    this.EditForm_KowsarReport2.patchValue({
      CentralRef: CentralRef,
      LetterRowCode: LetterRowCode,
      Flag: "2",
    });

    this.repo.GetKowsarReport(this.EditForm_KowsarReport2.value).subscribe((data: any) => {

      this.records_personletterrow = data.KowsarReports;

      this.personletter_dialog_show()

    });


  }











  getpaneldata_report3() {

    this.EditForm_KowsarReport3.patchValue({
      Flag: "3",
    });

    this.repo.GetKowsarReport(this.EditForm_KowsarReport3.value).subscribe((data: any) => {
      this.loading_letterrowstate = false

      this.records_letterrowstate = data.KowsarReports;


    });

  }






  // onDateChange() {
  //   const miladi = moment
  //     .from(this.Attendance_StatusDurations_temp.value.TargetDate, 'fa', 'YYYY/MM/DD') // تبدیل از شمسی به میلادی
  //     .format('YYYY-MM-DD'); // خروجی: 2025-06-12

  //   this.Attendance_StatusDurations.patchValue({
  //     TargetDate: miladi,
  //     UseTodayInstead: '0',
  //     CentralRef: '0'
  //   });

  //   this.getpanel_data();
  // }




  personletter_dialog_show() {

    const modal = this.renderer.selectRootElement('#personletter', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  personletter_dialog_close() {
    const modal = this.renderer.selectRootElement('#personletter', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }






}
