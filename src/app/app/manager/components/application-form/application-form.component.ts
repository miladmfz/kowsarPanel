import { Component, OnInit, Input } from '@angular/core';
import { ManagerWebApiService } from '../../services/ManagerWebApi.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { Location } from '@angular/common';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { operationSuccessful } from 'src/app/app-shell/framework-components/app-messages';
@Component({
  selector: 'app-application-form',
  templateUrl: './application-form.component.html',
})

export class ApplicationFormComponent implements OnInit {
  title = 'ایجاد نوع داده انتخابی';
  Code: string = '';
  SingleItems: any[] = [];
  EditForm = new FormGroup({
    AppBrokerCustomerCode: new FormControl(''),
    ActivationCode: new FormControl(''),
    AppType: new FormControl(''),
    DbImageName: new FormControl(''),
    DbName: new FormControl(''),
    EnglishCompanyName: new FormControl(''),
    PersianCompanyName: new FormControl(''),
    MaxDevice: new FormControl(''),
    SQLiteURL: new FormControl(''),
    SecendServerURL: new FormControl(''),
    ServerURL: new FormControl(''),
  });


  constructor(
    private repo: ManagerWebApiService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private location: Location,
  ) { }


  ngOnInit() {
    //debugger
    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.Code = id;
        this.getDetails();
      }
    });

  }

  getDetails() {


    this.repo.GetAppBrokerCustomerByCode(this.Code).subscribe(e => {


      this.SingleItems = e;
      this.LoadDataSet();
    });


  }


  LoadDataSet() {
    this.EditForm.patchValue({
      AppBrokerCustomerCode: this.SingleItems[0].AppBrokerCustomerCode,
      ActivationCode: this.SingleItems[0].ActivationCode,
      EnglishCompanyName: this.SingleItems[0].EnglishCompanyName,
      PersianCompanyName: this.SingleItems[0].PersianCompanyName,
      ServerURL: this.SingleItems[0].ServerURL,
      SQLiteURL: this.SingleItems[0].SQLiteURL,
      MaxDevice: this.SingleItems[0].MaxDevice,
      SecendServerURL: this.SingleItems[0].SecendServerURL,
      DbName: this.SingleItems[0].DbName,
      AppType: this.SingleItems[0].AppType,
    });

  }




  onBtnCancelClick() {
    this.router.navigateByUrl('incident/incident/list');
  }






  submit(action) {

    const command = this.EditForm.value;
    if (action == 'delete') {
      // this.incidentService.delete(command.id).subscribe((id) => {
      //   this.handleCreateEditOps(action, id);
      // });
    }

    if (this.Code != "0") {


      this.repo.UpdateAppBrokerCustomer(
        this.EditForm.value.ActivationCode,
        this.EditForm.value.EnglishCompanyName,
        this.EditForm.value.PersianCompanyName,
        this.EditForm.value.ServerURL,
        this.EditForm.value.SQLiteURL,
        this.EditForm.value.MaxDevice,
        this.EditForm.value.SecendServerURL,
        this.EditForm.value.DbName,
        this.EditForm.value.AppType

      ).subscribe(e => {


        if (e[0].AppBrokerCustomerCode.length > 0) {

          if (action == 'exit') {
            this.location.back();
          } else if (action == 'new') {
            window.location.reload();
          }
        }

      });



    } else {

      this.repo.InsertAppBrokerCustomer(
        this.EditForm.value.ActivationCode,
        this.EditForm.value.EnglishCompanyName,
        this.EditForm.value.PersianCompanyName,
        this.EditForm.value.ServerURL,
        this.EditForm.value.SQLiteURL,
        this.EditForm.value.MaxDevice,
        this.EditForm.value.SecendServerURL,
        this.EditForm.value.DbName,
        this.EditForm.value.AppType

      ).subscribe(e => {


        if (e[0].AppBrokerCustomerCode.length > 0) {

          if (action == 'exit') {
            this.location.back();
          } else if (action == 'new') {
            window.location.reload();
          }
        }


      });




    }

  }

  handleCreateEditOps(action, id) {

    this.EditForm.reset();
    //this.title = 'ایجاد کاربر جدید';
    this.Code = '';
    document.getElementById('ActivationCode').focus();
    //} else if (action == 'exit') {
    //   
    //} else {
    //  this.title = 'ویرایش کاربر';
    //   
    //}

    this.notificationService.succeded(operationSuccessful);
  }
}


