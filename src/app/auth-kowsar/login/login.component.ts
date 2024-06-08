import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthKowsarWebApiService } from '../services/ManagerWebApi.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {

  constructor(private repo: AuthKowsarWebApiService, private readonly router: Router,
  ) {


  }

  isLoading: boolean = false;

  LoginForm = new FormGroup({
    UName: new FormControl('', Validators.required),
    UPass: new FormControl('', Validators.required),
  });


  ngOnInit() {
    this.isLoading = false

    if (sessionStorage.getItem("ActiveDate") != null) {
      this.router.navigate(['/auth/login']);
    }

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
        console.log(sessionStorage.getItem("ActiveDate"))

        this.router.navigate(['/dashboard']);
      }
    });


  }


}
