import { Component, OnInit, Renderer2 } from '@angular/core';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { SupportFactorWebApiService } from 'src/app/app/support/services/SupportFactorWebApi.service';
import { CellWithoutRowsSupportPanel } from './cell-withoutrows-label-support-panel';
import { CellOpenFactorSupportPanel } from './cell-openfactor-label-support-panel copy';
import { FormControl, FormGroup } from '@angular/forms';
import { CellActionAttendanceStatePanel } from './cell-action-attendance-panel';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import * as moment from 'jalali-moment';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';
@Component({
  selector: 'app-support-panel',
  templateUrl: './support-panel.component.html',
})
export class SupportPanelComponent
  extends AgGridBaseComponent
  implements OnInit {


  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };

  records
  records_history
  loading_supportpanel: boolean = true;
  BrokerRef: string = '';
  BrokerHistroyName: string = '';
  letterexplain_modal_title: string = '';
  ToDayDate: any;
  reportData: any[] = [];
  Attendance_Data: any[] = [];
  attendanceInterval: any;

  EditForm_SupportData = new FormGroup({
    DateTarget: new FormControl(''),
    BrokerCode: new FormControl('1'),
    Flag: new FormControl('1'),
  });

  Attendance_StatusDurations = new FormGroup({
    CentralRef: new FormControl('0'),
    TargetDate: new FormControl(''),
    UseTodayInstead: new FormControl('0'),
  });
  Attendance_StatusDurations_temp = new FormGroup({
    CentralRef: new FormControl('0'),
    TargetDate: new FormControl(''),
    UseTodayInstead: new FormControl('0'),
  });

  constructor(
    private repo: SupportFactorWebApiService,
    private sharedService: SharedService,
    private readonly notificationService: NotificationService,
    private renderer: Renderer2,

    private themeService: ThemeService
  ) {
    super();
  }

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
        field: 'CustName',
        headerName: 'نام مشتری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      }, {
        field: 'Barbary',
        headerName: 'شرح',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      }, {
        field: 'worktime',
        headerName: 'زمان کار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      }, {
        field: 'starttime',
        headerName: 'شروع',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      }, {
        field: 'Endtime',
        headerName: ' پایان',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },


    ];




    this.columnDefs = [

      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionAttendanceStatePanel,
        width: 70,
      },
      {
        field: 'FullName',
        headerName: 'کارشناس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },


      {
        field: 'Count1',
        headerName: 'تعداد وضعیت آزاد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50
      },
      {
        field: 'Duration1',
        headerName: 'زمان آزاد',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },

      {
        field: 'Count2',
        headerName: 'تعداد وضعیت کار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50
      },
      {
        field: 'Duration2',
        headerName: 'زمان کار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },

      {
        field: 'Count3',
        headerName: 'تعداد وضعیت مرخصی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50
      },
      {
        field: 'Duration3',
        headerName: 'زمان مرخصی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },

      {
        field: 'CustomerCount',
        headerName: 'تعداد مشتری پاسخ داده شده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50
      },
      {
        field: 'FactorCount',
        headerName: 'تعداد فاکتور   ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 50
      },

    ];




    // if (sessionStorage.getItem("PhAddress3") == '100') {
    //   this.BrokerRef = ''

    // } else {
    //   this.BrokerRef = sessionStorage.getItem("BrokerCode")
    // }


    this.getFirstpanel_data()

    this.sharedService.RefreshAllActions$.subscribe(action => {
      if (action === 'refresh') {
        this.refreshpage();
      }
    });
  }


  refreshpage() {
    this.getFirstpanel_data()
  }



  EditForm_supportfactor = new FormGroup({
    StartDateTarget: new FormControl(''),
    EndDateTarget: new FormControl(''),
    SearchTarget: new FormControl(''),
    BrokerRef: new FormControl(''),
    isShopFactor: new FormControl('0'),

  });

  onDateSubmit(): void {
    this.onDateChange();
  }


  Show_History_Broker_Factors(item: any) {

    this.BrokerHistroyName = item.FullName + ' ' + item.FactorDate
    this.EditForm_supportfactor.patchValue({
      StartDateTarget: item.FactorDate,
      EndDateTarget: item.FactorDate,
      BrokerRef: item.BrokerCode,
      isShopFactor: "0",
    });

    this.repo.GetSupportFactors(this.EditForm_supportfactor.value).subscribe((data: any) => {
      this.factorlisthistory_dialog_show()
      this.records_history = data.Factors;
    });
  }


  getFirstpanel_data() {


    if (sessionStorage.getItem("CentralRef") == '1274' ||
      sessionStorage.getItem("CentralRef") == '1139' ||
      sessionStorage.getItem("CentralRef") == '1843') {

      this.Attendance_StatusDurations.patchValue({
        TargetDate: '',
        UseTodayInstead: '1',
        CentralRef: '0'
      });

      this.repo.GetAttendance_StatusDurations(this.Attendance_StatusDurations.value).subscribe((data: any) => {
        this.loading_supportpanel = false

        this.records = data.Attendances;


      });
    }


  }


  getpanel_data() {


    // this.repo.GetSupportPanel(this.EditForm_SupportData.value).subscribe((data: any) => {
    //   this.loading_supportpanel = false


    //   if (this.BrokerRef == '') {
    //     // this.reportData = data.SupportDatas;
    //     this.records = data.SupportDatas;
    //   } else {
    //     // this.reportData = data.SupportDatas.filter(panel => panel.BrokerCode === this.BrokerRef);
    //     this.records = data.SupportDatas.filter(Single_SupportData => Single_SupportData.BrokerCode === this.BrokerRef);
    //   }


    // });


    if (sessionStorage.getItem("CentralRef") == '1139' || sessionStorage.getItem("CentralRef") == '1843') {

      this.repo.GetAttendance_StatusDurations(this.Attendance_StatusDurations.value).subscribe((data: any) => {
        this.loading_supportpanel = false

        this.records = data.Attendances;


      });
    }


  }


  onDateChange() {
    const miladi = moment
      .from(this.Attendance_StatusDurations_temp.value.TargetDate, 'fa', 'YYYY/MM/DD') // تبدیل از شمسی به میلادی
      .format('YYYY-MM-DD'); // خروجی: 2025-06-12

    this.Attendance_StatusDurations.patchValue({
      TargetDate: miladi,
      UseTodayInstead: '0',
      CentralRef: '0'
    });

    this.getpanel_data();
  }




  factorlisthistory_dialog_show() {

    const modal = this.renderer.selectRootElement('#factorlisthistory', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  factorlisthistory_dialog_close() {
    const modal = this.renderer.selectRootElement('#factorlisthistory', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }






}
