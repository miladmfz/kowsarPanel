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




  BrokerRef: string = '';
  letterexplain_modal_title: string = '';
  ToDayDate: any;
  reportData: any[] = [];
  Attendance_Data: any[] = [];
  attendanceInterval: any;

  ngOnInit(): void {

    this.repo.GetTodeyFromServer()
      .subscribe((data: any) => {

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


  }










}






