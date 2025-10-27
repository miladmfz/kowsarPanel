import { Component, OnInit, Renderer2 } from '@angular/core';
import { SupportFactorWebApiService } from 'src/app/app/support/services/SupportFactorWebApi.service';

import { SharedService } from '../../framework-services/shared.service';
import { NotificationService } from '../../framework-services/notification.service';
@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    standalone: false
})
export class DashboardComponent implements OnInit {
  constructor(
    private repo: SupportFactorWebApiService,
    private sharedService: SharedService,
    private readonly notificationService: NotificationService,
    private renderer: Renderer2,

  ) { }




  BrokerRef: string = '';
  JobPersonRef: string = '';

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

    if (sessionStorage.getItem("JobPersonRef").length > 0) {
      this.JobPersonRef = sessionStorage.getItem("JobPersonRef")
    } else {
      this.JobPersonRef = ''
    }

  }










}






