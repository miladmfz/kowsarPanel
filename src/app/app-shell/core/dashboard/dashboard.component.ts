import { Component, OnInit } from '@angular/core';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { SupportFactorWebApiService } from 'src/app/app/support/services/SupportFactorWebApi.service';
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import * as moment from 'jalali-moment';
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  constructor(
    private repo: SupportFactorWebApiService,
  ) { }


  loading_supportpanel: boolean = true;
  loading_supportatt: boolean = true;


  BrokerRef: string = '';

  reportData: any[] = [];
  Attendance_Data: any[] = [];

  ngOnInit(): void {
    if (sessionStorage.getItem("PhAddress3") == '100') {
      this.BrokerRef = ''

    } else {
      this.BrokerRef = sessionStorage.getItem("BrokerCode")
    }

    this.getpanel_data()
    this.getAttendance_data()
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

}






