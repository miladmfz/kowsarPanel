import { Component, OnInit } from '@angular/core';
import { ManagerWebApiService } from '../../../services/ManagerWebApi.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { FormControl, FormGroup } from '@angular/forms';
import { Base_Lookup } from 'src/app/app/kowsar/lookup-type';

@Component({
  selector: 'app-application-edit',
  templateUrl: './application-edit.component.html',
})
export class ApplicationEditComponent implements OnInit {


  constructor(
    private repo: ManagerWebApiService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
    private location: Location,
  ) { }

  title = 'ایجاد نوع داده انتخابی';
  ActivationCode: string = '';
  SingleItems: any[] = [];



  EditForm = new FormGroup({
    ActivationCode: new FormControl(''),
    EnglishCompanyName: new FormControl(''),
    PersianCompanyName: new FormControl(''),
    ServerURL: new FormControl(''),
    SQLiteURL: new FormControl('D:\\\\KowsarAcc\\\\WebApiLocation\\\\database\\\\111111\\\\KowsarDb_new.sqlite'),
    UsedDevice: new FormControl('0'),
    MaxDevice: new FormControl('1'),
    SecendServerURL: new FormControl(''),
    DbName: new FormControl(''),
    DbImageName: new FormControl(''),
    AppType: new FormControl('1'),
    ServerIp: new FormControl(''),
    ServerPort: new FormControl('60005'),
    ServerPathApi: new FormControl('login'),
  });




  Type_Lookup: Base_Lookup[] = [
    { id: "0", name: "فروش اینترنتی" },
    { id: "1", name: "بازاریاب" },
    { id: "2", name: "جمع آوری و توضیع" },
    { id: "3", name: "سفارشگیر" },
    { id: "4", name: "جستجو کالا" },

  ]




  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.ActivationCode = id;
        this.getDetails();
      }
    });

  }

  getDetails() {


    this.repo.GetAppActivationByCode(this.ActivationCode)
      .subscribe((data: any) => {

        this.EditForm.patchValue({
          ActivationCode: data[0].ActivationCode,
          EnglishCompanyName: data[0].EnglishCompanyName,
          PersianCompanyName: data[0].PersianCompanyName,
          ServerURL: data[0].ServerURL,
          SQLiteURL: data[0].SQLiteURL,
          UsedDevice: data[0].UsedDevice,
          MaxDevice: data[0].MaxDevice,
          SecendServerURL: data[0].SecendServerURL,
          DbName: data[0].DbName,
          DbImageName: data[0].DbImageName,
          AppType: data[0].AppType,
          ServerIp: data[0].ServerIp,
          ServerPort: data[0].ServerPort,
          ServerPathApi: data[0].ServerPathApi,
        });
      });


  }



  onBtnCancelClick() {
    this.router.navigateByUrl('manager/list');
  }



  submit(action) {


    this.repo.CrudAppActivation(this.EditForm.value)
      .subscribe((data: any) => {

        if (data[0].ActivationCode.length > 0) {
          this.ActivationCode = data[0].ActivationCode;
          this.getDetails();

          this.notificationService.succeded()
        }

      });
  }


}


