import { Component, OnInit } from '@angular/core';
import { SharedService } from '../../framework-services/shared.service';
import { ThemeService } from '../../framework-services/theme.service';
import { CentralWebApiService } from 'src/app/app/support/services/CentralWebApi.service';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
})
export class HeaderComponent implements OnInit {


  constructor(
    private sharedService: SharedService,
    private repo: CentralWebApiService,
    private themeService: ThemeService
  ) { }


  isDarkMode = false;
  AlarmActive_Row = 0;
  AlarmActtive_Conversation = 0;
  AlarmActtive_LeaveRequest = 0;
  attendanceInterval: any;
  Imageitem: string = '';
  PhFullName: string = '';
  JobPersonRef: string = '';
  currentStatus: string = "";




  ngOnInit(): void {

    const savedTheme = localStorage.getItem('theme') || 'light';
    this.isDarkMode = savedTheme === 'dark';
    this.PhFullName = sessionStorage.getItem("PhFullName")

    this.setTheme(savedTheme as 'light' | 'dark');

    if (sessionStorage.getItem("JobPersonRef").length > 0) {
      this.JobPersonRef = sessionStorage.getItem("JobPersonRef")
    } else {
      this.JobPersonRef = ''
    }


    this.attendanceInterval = setInterval(() => {
      this.Get_Notification();
    }, 15000);
    this.Get_Notification();
    this.repo.GetImageFromServer(sessionStorage.getItem("CentralRef"))
      .subscribe((data: any) => {

        this.Imageitem = `data:${Image};base64,${data.Text}`;

      });
  }



  Get_Notification() {
    this.repo.GetNotification(sessionStorage.getItem("PersonInfoRef"))
      .subscribe((data: any) => {


        sessionStorage.setItem("AlarmActive_Row", data.users[0].AlarmActive_Row)
        sessionStorage.setItem("AlarmActtive_Conversation", data.users[0].AlarmActtive_Conversation)

        this.AlarmActive_Row = parseInt(sessionStorage.getItem("AlarmActive_Row"))
        this.AlarmActtive_Conversation = parseInt(sessionStorage.getItem("AlarmActtive_Conversation"))




        if (sessionStorage.getItem("PhAddress3") == '100') {
          sessionStorage.setItem("AlarmActtive_LeaveRequest", data.users[0].AlarmActtive_LeaveRequest)
          this.AlarmActtive_LeaveRequest = parseInt(sessionStorage.getItem("AlarmActtive_LeaveRequest"))
        }
      });
  }


  toggleTheme(event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    this.isDarkMode = checked;
    this.setTheme(checked ? 'dark' : 'light');

    location.reload();
  }


  setTheme(mode: 'light' | 'dark') {
    const bsLight = document.getElementById('bs-default-stylesheet') as HTMLLinkElement;
    const appLight = document.getElementById('app-default-stylesheet') as HTMLLinkElement;
    const bsDark = document.getElementById('bs-dark-stylesheet') as HTMLLinkElement;
    const appDark = document.getElementById('app-dark-stylesheet') as HTMLLinkElement;

    if (mode === 'dark') {
      bsLight.disabled = true;
      appLight.disabled = true;
      bsDark.disabled = false;
      appDark.disabled = false;
    } else {
      bsLight.disabled = false;
      appLight.disabled = false;
      bsDark.disabled = true;
      appDark.disabled = true;
    }
    localStorage.setItem('theme', mode);
  }

  logout() {
    sessionStorage.removeItem("ActiveDate")
    location.reload();
  }


}
