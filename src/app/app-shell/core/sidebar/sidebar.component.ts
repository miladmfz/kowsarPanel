import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CentralWebApiService } from 'src/app/app/support/services/CentralWebApi.service';
import { SharedService } from '../../framework-services/shared.service';
declare var $: any;

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent implements OnInit {
  constructor(
    private repo: CentralWebApiService,
    private sharedService: SharedService,
    private readonly router: Router,

  ) { }
  PhFullName = '';
  JobPersonRef = '';
  CustName_Small = '';
  Explain = '';
  CentralRef = '';
  BrokerRef = '';
  imageData: string = '';
  Imageitem: string = '';

  currentStatus: string = "";  // پیش فرض وضعیت: 1 (حاضر)


  AlarmActive_Row: number = 0;
  AlarmActtive_Conversation: number = 0;
  reportData: any[] = [];


  status_att: string = '';


  apporder: string = '';
  appbroker: string = '';
  appocr: string = '';


  array_applications: any[] = [];

  EditForm_Attendance = new FormGroup({
    CentralRef: new FormControl(''),
    Status: new FormControl(''),
  });

  ngOnInit(): void {
    this.PhFullName = sessionStorage.getItem("PhFullName")
    this.JobPersonRef = sessionStorage.getItem("JobPersonRef")
    this.CustName_Small = sessionStorage.getItem("CustName_Small")
    this.Explain = sessionStorage.getItem("Explain")
    this.CentralRef = sessionStorage.getItem("CentralRef")

    this.AlarmActive_Row = parseInt(sessionStorage.getItem("AlarmActive_Row"))
    this.AlarmActtive_Conversation = parseInt(sessionStorage.getItem("AlarmActtive_Conversation"))
    if (sessionStorage.getItem("PhAddress3") == '100') {
      this.BrokerRef = ''
    } else {
      this.BrokerRef = sessionStorage.getItem("BrokerCode")
    }

    this.EditForm_Attendance.patchValue({
      CentralRef: this.CentralRef,
    });


    this.fetchImageData()

    this.sharedService.RefreshAllActions$.subscribe(action => {
      if (action === 'refresh') {
        this.refreshpage();
      }
    });


  }

  refreshpage() {

    this.Get_AttendanceDashboard();
    this.Get_Notification();
  }

  logout() {

    sessionStorage.removeItem("ActiveDate")
    location.reload();

  }

  // Variable to hold the image data


  fetchImageData() {

    this.repo.GetImageFromServer(this.CentralRef).subscribe((data: any) => {

      this.Imageitem = `data:${Image};base64,${data.Text}`;

    });








    this.repo.GetApplicationForMenu().subscribe((data: any) => {

      if (data.applications != null) {
        this.array_applications = data.applications;
        for (var single_applications of this.array_applications) {

          if (single_applications.KeyValue === 'AppOrder_ActivationCode') {
            this.apporder = single_applications.DataValue
          }
          if (single_applications.KeyValue === 'AppBroker_ActivationCode') {
            this.appbroker = single_applications.DataValue

          }
          if (single_applications.KeyValue === 'AppOcr_ActivationCode') {
            this.appocr = single_applications.DataValue

          }
        }

      }

    });


    this.Get_Notification()
    this.Get_AttendanceDashboard()

  }
  Get_Notification() {
    this.repo.GetNotification(sessionStorage.getItem("PersonInfoRef")).subscribe((data: any) => {


      sessionStorage.setItem("AlarmActive_Row", data.users[0].AlarmActive_Row)
      sessionStorage.setItem("AlarmActtive_Conversation", data.users[0].AlarmActtive_Conversation)

      this.AlarmActive_Row = parseInt(sessionStorage.getItem("AlarmActive_Row"))
      this.AlarmActtive_Conversation = parseInt(sessionStorage.getItem("AlarmActtive_Conversation"))

    });
  }

  Get_AttendanceDashboard() {

    this.repo.AttendanceDashboard().subscribe((data: any) => {
      //this.reportData = data.Attendances;
      this.reportData = data.Attendances.filter(Attendance => Attendance.CentralRef === this.CentralRef);
      console.log(this.reportData)

      this.currentStatus = this.reportData[0].Status;

      if (this.BrokerRef != '') {

      }


    });
  }

  setStatus(status: string): void {

    this.EditForm_Attendance.patchValue({
      Status: status,
    });

    this.currentStatus = status;
    this.repo.ManualAttendance(this.EditForm_Attendance.value).subscribe((data: any) => {
      this.Get_AttendanceDashboard()
      this.sharedService.triggerActionAll('refresh');

    });

  }

}
