import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { CommonModule } from '@angular/common';
import { InternalAppsWebApiService } from '../../../services/InternalAppsWebApi.service';

@Component({
  selector: 'app-application-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './internal-apps-edit.component.html',
})
export class InternalAppsEditComponent implements OnInit {

  constructor(
    private repo: InternalAppsWebApiService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
  ) { }

  title = 'فرم اطلاعات اپلیکیشن';
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
    IsActive: new FormControl('1'),
  });

  Type_Lookup: Base_Lookup[] = [
    { id: "0", name: "فروش اینترنتی" },
    { id: "1", name: "بازاریاب" },
    { id: "2", name: "جمع آوری و توضیع" },
    { id: "3", name: "سفارشگیر" },
    { id: "4", name: "جستجو کالا" },
  ];

  IsActive_Lookup: Base_Lookup[] = [
    { id: "0", name: "ابطالی" },
    { id: "1", name: "فعال" },
    { id: "2", name: "غیر فعال" },
  ];

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
          ActivationCode: data.AppActivations[0].ActivationCode,
          EnglishCompanyName: data.AppActivations[0].EnglishCompanyName,
          PersianCompanyName: data.AppActivations[0].PersianCompanyName,
          ServerURL: data.AppActivations[0].ServerURL,
          SQLiteURL: data.AppActivations[0].SQLiteURL,
          UsedDevice: data.AppActivations[0].UsedDevice,
          MaxDevice: data.AppActivations[0].MaxDevice,
          SecendServerURL: data.AppActivations[0].SecendServerURL,
          DbName: data.AppActivations[0].DbName,
          DbImageName: data.AppActivations[0].DbImageName,
          AppType: data.AppActivations[0].AppType,
          ServerIp: data.AppActivations[0].ServerIp,
          ServerPort: data.AppActivations[0].ServerPort,
          ServerPathApi: data.AppActivations[0].ServerPathApi,
          IsActive: data.AppActivations[0].IsActive,
        });
      });
  }

  onBtnCancelClick() {
    this.router.navigate(['/internal/internal-apps-list']);
  }

  submit(action: string) {
    this.repo.CrudAppActivation(this.EditForm.value)
      .subscribe((data: any) => {
        if (data.AppActivations[0].ActivationCode.length > 0) {
          this.ActivationCode = data.AppActivations[0].ActivationCode;
          this.getDetails();
          this.notificationService.success('اطلاعات با موفقیت ذخیره شد');
        }
      });
  }

}
