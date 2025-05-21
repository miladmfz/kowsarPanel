import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import * as moment from 'jalali-moment';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { SupportFactorWebApiService } from 'src/app/app/support/services/SupportFactorWebApi.service';
import { CellActionAttendancePanel } from './cell-action-attendance-panel';
import { CellDateAttendancePanel } from './cell-date-label-attendance-panel';
import { CellStatusAttendancePanel } from './cell-status-label-attendance-panel';
import { CellNameAttendancePanel } from './cell-name-label-attendance-panel';

@Component({
  selector: 'app-attendance-panel',
  templateUrl: './attendance-panel.component.html',
})
export class AttendancePanelComponent
  extends AgGridBaseComponent
  implements OnInit {


  loading_attendance: boolean = true;
  records
  records_history


  EditForm_LetterToEmployer = new FormGroup({
    DescriptionText: new FormControl(''),
    ExecuterCentral: new FormControl(''),
  });

  EditForm_GetHistory = new FormGroup({
    CentralRef: new FormControl(''),
  });

  BrokerRef: string = '';
  letterexplain_modal_title: string = '';
  ToDayDate: any;
  reportData: any[] = [];
  attendanceInterval: any;


  constructor(
    private repo: SupportFactorWebApiService,
    private sharedService: SharedService,
    private readonly notificationService: NotificationService,
    private renderer: Renderer2,
  ) {
    super();
  }


  override ngOnInit(): void {
    super.ngOnInit();

    this.columnDefs = [

      {
        field: 'کارشناس',
        filter: 'agSetColumnFilter',
        cellRenderer: CellNameAttendancePanel,
        cellClass: 'text-center',
        minWidth: 70
      },
      {
        field: 'وضعیت حضور',
        cellRenderer: CellStatusAttendancePanel,
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionAttendancePanel,
        width: 200,
      },
      {
        field: 'تاریخ',
        cellRenderer: CellDateAttendancePanel,
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },
      {
        field: 'CustNames',
        headerName: 'مشتری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },



    ];


    this.columnDefs2 = [

      {
        field: 'گارشناس',
        filter: 'agSetColumnFilter',
        cellRenderer: CellNameAttendancePanel,
        cellClass: 'text-center',
        minWidth: 70
      },
      {
        field: 'وضعیت حضور',
        cellRenderer: CellStatusAttendancePanel,
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },

      {
        field: 'تاریخ',
        cellRenderer: CellDateAttendancePanel,
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 100
      },


    ];



    this.repo.GetTodeyFromServer().subscribe((data: any) => {

      this.ToDayDate = data[0].TodeyFromServer
      if (this.ToDayDate != sessionStorage.getItem("ActiveDate")) {
        sessionStorage.removeItem("ActiveDate")
        location.reload();
      }

    });


    if (sessionStorage.getItem("PhAddress3") == '100') {
      this.BrokerRef = ''

    } else {
      this.BrokerRef = sessionStorage.getItem("BrokerCode")
    }

    this.getAttendance_data()
    this.attendanceInterval = setInterval(() => {
      this.getAttendance_data();
    }, 15000);
    this.sharedService.RefreshAllActions$.subscribe(action => {
      if (action === 'refresh') {
        this.refreshpage();
      }
    });


  }

  refreshpage() {
    this.getAttendance_data();
  }


  formatToJalali(date: string | null | undefined): string {
    if (!date || date === '0001-01-01T00:00:00') {
      return '—'; // یا هر متنی که دوست داری نشون بده برای حالت‌های خالی
    }

    const m = moment(date);
    if (!m.isValid()) {
      return 'نامعتبر';
    }

    return m.locale('fa').format('jYYYY/jMM/jDD HH:mm');
  }


  ngOnDestroy() {
    // پاک کردن interval برای جلوگیری از memory leak
    if (this.attendanceInterval) {
      clearInterval(this.attendanceInterval);
    }
  }
  getAttendance_data() {

    this.repo.AttendanceDashboard().subscribe((data: any) => {
      this.loading_attendance = false

      this.records = data.Attendances;
      // } else {
      //   this.reportData = data.Panels.filter(panel => panel.BrokerCode === this.BrokerRef);
      // }
    });

    if (this.BrokerRef == '') {

    }


  }

  SendLetterToEmployer() {
    this.repo.LetterInsert(
      this.ToDayDate,
      "ارتباط با همکاران",
      this.EditForm_LetterToEmployer.value.DescriptionText,
      "",
      "عادی",
      sessionStorage.getItem("CentralRef"),
      "2"
    )
      .subscribe(e => {
        const intValue = parseInt(e[0].LetterCode, 10);
        if (!isNaN(intValue) && intValue > 0) {
          this.repo.AutLetterRowInsert(
            e[0].LetterCode,
            this.ToDayDate,
            this.EditForm_LetterToEmployer.value.DescriptionText,
            "",
            "عادی",
            sessionStorage.getItem("CentralRef"),
            this.EditForm_LetterToEmployer.value.ExecuterCentral,
          ).subscribe(e => {
            const intValue = parseInt(e[0].LetterRef, 10);
            if (!isNaN(intValue) && intValue > 0) {
              this.notificationService.succeded();
              this.letterexplain_dialog_close()
            } else {
              //Todo notification erroor
            }
          });
        } else {
          //Todo notification erroor
        }
      });
  }



  SetLetter_config(item: any) {

    this.EditForm_LetterToEmployer.patchValue({
      DescriptionText: "",
      ExecuterCentral: item.CentralRef
    });
    this.letterexplain_modal_title = " تیکت ارتباط با " + item.PhFirstName + ' ' + item.PhLastName
    this.letterexplain_dialog_show()
  }


  ShowHistory(item: any) {

    this.EditForm_GetHistory.patchValue({
      CentralRef: item.CentralRef
    });


    this.repo.AttendanceHistory(item.CentralRef).subscribe((data: any) => {
      this.attendancehistory_dialog_show()
      this.records_history = data.Attendances;

    });



  }



  letterexplain_dialog_show() {

    const modal = this.renderer.selectRootElement('#letterexplain', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  letterexplain_dialog_close() {
    const modal = this.renderer.selectRootElement('#letterexplain', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


  attendancehistory_dialog_show() {

    const modal = this.renderer.selectRootElement('#attendancehistory', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  attendancehistory_dialog_close() {
    const modal = this.renderer.selectRootElement('#attendancehistory', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


}
