import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthKowsarWebApiService } from '../services/AuthKowsarWebApi.service';
import { Router } from '@angular/router';
import { AppConfigService } from 'src/app/app-config.service';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  constructor(
    private repo: AuthKowsarWebApiService,
    private readonly router: Router,
    private fb: FormBuilder,
    private config: AppConfigService,
  ) {
    this.LoginForm = this.fb.group({
      UName: ['', Validators.required],
      UPass: ['', Validators.required],
    });

  }

  isLoading: boolean = false;
  LoginForm: FormGroup;

  // LoginForm = new FormGroup({
  //   UName: new FormControl('', Validators.required),
  //   UPass: new FormControl('', Validators.required),
  // });
  // @ViewChild('username') usernameField: ElementRef;

  // ngAfterViewInit() {
  //   this.usernameField.nativeElement.focus();
  // }
  ngOnInit() {
    this.isLoading = false
    this.LoginForm = this.fb.group({
      UName: ['', Validators.required],
      UPass: ['', Validators.required],
    });



    if (this.config.apiUrl == 'http://192.168.1.25:60006/api/') {
      this.developLogin()
    }

    if (sessionStorage.getItem("ActiveDate") != null) {
      this.router.navigate(['/auth/login']);
    } else {

    }

  }

  developLogin() {





    // this.LoginForm.setValue({
    //   UName: 'mfz',
    //   UPass: '123456'
    // });

    // this.LoginForm.setValue({
    //   UName: 'بختیاری',
    //   UPass: '123456'
    // });


    this.LoginForm.setValue({
      UName: 'خسروی',
      UPass: '123456'
    });



    // this.LoginForm.setValue({
    //   UName: 'سیروس',
    //   UPass: '123456'
    // });


    // this.LoginForm.setValue({
    //   UName: 'sadeghzade',
    //   UPass: '53568286'
    // });





    const command = this.LoginForm.value;

    // this.repo.IsUser(command).subscribe((data: any) => {



    // });




    this.repo.IsUser(command).subscribe((data: any) => {
      this.isLoading = false
      if (data.users[0].ErrCode != "0") {
        alert(data.users[0].ErrDesc);
        this.LoginForm.reset();
      } else {
        sessionStorage.setItem("Active", data.users[0].Active)
        sessionStorage.setItem("ActiveDate", data.users[0].ActiveDate)
        sessionStorage.setItem("CentralRef", data.users[0].CentralRef)
        sessionStorage.setItem("JobPersonRef", data.users[0].JobPersonRef)
        sessionStorage.setItem("PersonInfoRef", data.users[0].PersonInfoRef)
        sessionStorage.setItem("PhFullName", data.users[0].PhFullName)
        sessionStorage.setItem("UserName", data.users[0].UserName)
        sessionStorage.setItem("CustName_Small", data.users[0].CustName_Small)
        sessionStorage.setItem("Explain", data.users[0].Explain)

        sessionStorage.setItem("PhAddress3", data.users[0].PhAddress3)
        sessionStorage.setItem("BrokerCode", data.users[0].BrokerCode)
        sessionStorage.setItem("BrokerName", data.users[0].BrokerName)

        sessionStorage.setItem("AlarmActive_Row", data.users[0].AlarmActive_Row)
        sessionStorage.setItem("AlarmActtive_Conversation", data.users[0].AlarmActtive_Conversation)



        if (String(data.users[0].JobPersonRef).length > 0) {

          this.setAttendance()
        } else {
          this.router.navigate(['/dashboard']);

        }

      }
    });
  }


  showPassword: boolean = false;

  EditForm_Attendance = new FormGroup({
    CentralRef: new FormControl(''),
    Status: new FormControl(''),
  });

  setAttendance() {

    this.EditForm_Attendance.patchValue({
      CentralRef: sessionStorage.getItem("CentralRef"),
      Status: "1" //hozor
    });

    this.repo.ManualAttendance(this.EditForm_Attendance.value)
      .subscribe((data: any) => {
        this.router.navigate(['/dashboard']);
      });

  }


  toggleShowPassword() {
    this.showPassword = !this.showPassword;
  }

  submit(action) {
    this.isLoading = true
    this.LoginForm.markAllAsTouched();
    if (!this.LoginForm.valid) return;
    const command = this.LoginForm.value;

    this.repo.IsUser(command).subscribe((data: any) => {
      this.isLoading = false
      if (data.users[0].ErrCode != "0") {
        alert(data.users[0].ErrDesc);
        this.LoginForm.reset();
      } else {
        sessionStorage.setItem("Active", data.users[0].Active)
        sessionStorage.setItem("ActiveDate", data.users[0].ActiveDate)
        sessionStorage.setItem("CentralRef", data.users[0].CentralRef)
        sessionStorage.setItem("JobPersonRef", data.users[0].JobPersonRef)
        sessionStorage.setItem("PersonInfoRef", data.users[0].PersonInfoRef)
        sessionStorage.setItem("PhFullName", data.users[0].PhFullName)
        sessionStorage.setItem("UserName", data.users[0].UserName)
        sessionStorage.setItem("CustName_Small", data.users[0].CustName_Small)
        sessionStorage.setItem("CustomerCode", data.users[0].CustomerCode)

        sessionStorage.setItem("Explain", data.users[0].Explain)

        sessionStorage.setItem("PhAddress3", data.users[0].PhAddress3)
        sessionStorage.setItem("BrokerCode", data.users[0].BrokerCode)
        sessionStorage.setItem("BrokerName", data.users[0].BrokerName)

        sessionStorage.setItem("AlarmActive_Row", data.users[0].AlarmActive_Row)
        sessionStorage.setItem("AlarmActtive_Conversation", data.users[0].AlarmActtive_Conversation)



        this.router.navigate(['/dashboard']);
      }
    });


  }


}
