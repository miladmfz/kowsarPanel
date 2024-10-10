import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthKowsarWebApiService } from '../services/AuthKowsarWebApi.service';
import { Router } from '@angular/router';
import { environment } from 'src/environment/environment';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  constructor(private repo: AuthKowsarWebApiService, private readonly router: Router, private fb: FormBuilder
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
  @ViewChild('username') usernameField: ElementRef;

  ngAfterViewInit() {
    this.usernameField.nativeElement.focus();
  }
  ngOnInit() {
    this.isLoading = false
    this.LoginForm = this.fb.group({
      UName: ['', Validators.required],
      UPass: ['', Validators.required],
    });
    if (environment.api_Url == 'http://localhost:60006/api/') {
      this.developLogin()
    }

    if (sessionStorage.getItem("ActiveDate") != null) {
      this.router.navigate(['/auth/login']);
    } else {

    }

  }

  developLogin() {

    this.LoginForm.setValue({
      UName: 'mfz',
      UPass: '123456'
    });

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
        sessionStorage.setItem("Explain", data.users[0].Explain)

        sessionStorage.setItem("PhAddress3", data.users[0].PhAddress3)
        sessionStorage.setItem("BrokerCode", data.users[0].BrokerCode)
        sessionStorage.setItem("BrokerName", data.users[0].BrokerName)

        sessionStorage.setItem("AlarmActive_Row", data.users[0].AlarmActive_Row)
        sessionStorage.setItem("AlarmActtive_Conversation", data.users[0].AlarmActtive_Conversation)


        console.log(sessionStorage.getItem("ActiveDate"))

        this.router.navigate(['/dashboard']);
      }
    });
  }


  showPassword: boolean = false;

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
        sessionStorage.setItem("Explain", data.users[0].Explain)

        sessionStorage.setItem("PhAddress3", data.users[0].PhAddress3)
        sessionStorage.setItem("BrokerCode", data.users[0].BrokerCode)
        sessionStorage.setItem("BrokerName", data.users[0].BrokerName)

        sessionStorage.setItem("AlarmActive_Row", data.users[0].AlarmActive_Row)
        sessionStorage.setItem("AlarmActtive_Conversation", data.users[0].AlarmActtive_Conversation)


        console.log(sessionStorage.getItem("ActiveDate"))

        this.router.navigate(['/dashboard']);
      }
    });


  }


}
