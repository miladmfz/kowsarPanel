import { Component, OnInit, Renderer2 } from '@angular/core';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { SupportFactorWebApiService } from 'src/app/app/support/services/SupportFactorWebApi.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import * as moment from 'jalali-moment';
import { SharedService } from '../../framework-services/shared.service';
import { NotificationService } from '../../framework-services/notification.service';
import { FormControl, FormGroup } from '@angular/forms';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  constructor(
    private repo: SupportFactorWebApiService,
    private sharedService: SharedService,
    private readonly notificationService: NotificationService,
    private renderer: Renderer2,

  ) { }


  loading_supportpanel: boolean = true;
  loading_supportatt: boolean = true;


  EditForm_LetterToEmployer = new FormGroup({
    DescriptionText: new FormControl(''),
    ExecuterCentral: new FormControl(''),
  });
  BrokerRef: string = '';
  letterexplain_modal_title: string = '';
  ToDayDate: any;
  reportData: any[] = [];
  Attendance_Data: any[] = [];
  attendanceInterval: any;

  ngOnInit(): void {

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

    this.getpanel_data()
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
    this.getpanel_data()
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

  getpanel_data() {

    this.repo.GetSupportPanel().subscribe((data: any) => {
      this.loading_supportpanel = false
      if (this.BrokerRef == '') {
        this.reportData = data.Panels;
      } else {
        this.reportData = data.Panels.filter(panel => panel.BrokerCode === this.BrokerRef);
      }

    });



  }
  ngOnDestroy() {
    // پاک کردن interval برای جلوگیری از memory leak
    if (this.attendanceInterval) {
      clearInterval(this.attendanceInterval);
    }
  }
  getAttendance_data() {

    this.repo.AttendanceDashboard().subscribe((data: any) => {
      this.loading_supportatt = false

      this.Attendance_Data = data.Attendances;
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
      "درحال انجام",
      "عادی",
      sessionStorage.getItem("CentralRef")
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



}






