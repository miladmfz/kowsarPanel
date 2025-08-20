import { Component, OnInit } from '@angular/core';
import { WebSiteWebApiService } from '../../../services/WebSiteWebApi.service';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Base_Lookup } from 'src/app/app/kowsar/lookup-type';

@Component({
  selector: 'app-website-edit',
  templateUrl: './website-edit.component.html',
})
export class WebsiteEditComponent implements OnInit {


  constructor(
    private repo: WebSiteWebApiService,
    private readonly route: ActivatedRoute,
    private readonly notificationService: NotificationService,
    private readonly router: Router,
  ) { }

  title = ' ایجاد و اصلاح اطلاعات وب سایت  ';
  WebSiteActivationCode: string = '';
  SingleItems: any[] = [];



  EditForm_WebSite = new FormGroup({

    WebSiteActivationCode: new FormControl(''),
    CustomerRef: new FormControl('0'),
    CompanyName: new FormControl('', Validators.required),
    WebEmploy: new FormControl('', Validators.required),
    Phone: new FormControl('', Validators.required),
    Explain: new FormControl('', Validators.required),
    Features: new FormControl('', Validators.required),
    WebState: new FormControl('', Validators.required),
    Domain1: new FormControl('', Validators.required),
    Domain2: new FormControl(''),
    Domain3: new FormControl(''),
    Domain4: new FormControl(''),
    KCServerVersion: new FormControl('', Validators.required),
    SiteType: new FormControl('', Validators.required),
    PaymentGateway: new FormControl(''),
    TorobApi: new FormControl('0'),
    EmallsApi: new FormControl('0'),
    BasalamApi: new FormControl('0'),
    SnapApi: new FormControl('0'),
    MobileTheme: new FormControl('0'),
    SearchTarget: new FormControl(''),

  });





  SiteType_Lookup: Base_Lookup[] = [
    { id: "0", name: "سایت کوثر" },
    { id: "1", name: "ورد پرس" },
    { id: "3", name: "وبینه" },

  ]


  KCServer_Lookup: Base_Lookup[] = [
    { id: "KCServer_3.04.05.23", name: "KCServer_3.04.05.23" },
    { id: "KCServer_3.01.08.15", name: "KCServer_3.01.08.15" },
    { id: "KCServer_3.04.04.20", name: "KCServer_3.04.04.20" },
    { id: "KCServer_قدیمی", name: "KCServer_قدیمی" },

  ]




  TrueFalse_Lookup: Base_Lookup[] = [
    { id: "0", name: "غیر فعال " },
    { id: "1", name: "فعال" },

  ]



  ngOnInit() {

    this.route.paramMap.subscribe((params: ParamMap) => {
      var id = params.get('id');
      if (id != null) {
        this.WebSiteActivationCode = id;
        this.getDetails();
      }
    });

  }

  getDetails() {


    this.repo.GetWebSiteActivationById(this.WebSiteActivationCode).subscribe((data: any) => {

      this.EditForm_WebSite.patchValue({
        WebSiteActivationCode: data[0].WebSiteActivationCode,
        CustomerRef: data[0].CustomerRef,
        CompanyName: data[0].CompanyName,
        WebEmploy: data[0].WebEmploy,
        Phone: data[0].Phone,
        Explain: data[0].Explain,
        Features: data[0].Features,

        WebState: data[0].WebState,
        Domain1: data[0].Domain1,
        Domain2: data[0].Domain2,
        Domain3: data[0].Domain3,
        Domain4: data[0].Domain4,
        KCServerVersion: data[0].KCServerVersion,
        SiteType: data[0].SiteType,
        PaymentGateway: data[0].PaymentGateway,
        TorobApi: data[0].TorobApi,
        EmallsApi: data[0].EmallsApi,
        BasalamApi: data[0].BasalamApi,
        SnapApi: data[0].SnapApi,
        MobileTheme: data[0].MobileTheme,
        SearchTarget: data[0].SearchTarget,
      });
    });


  }



  onBtnCancelClick() {
    this.router.navigateByUrl('manager/website-list');
  }



  submit(action) {

    this.EditForm_WebSite.markAllAsTouched();
    if (!this.EditForm_WebSite.valid) return;




    if (parseInt(this.WebSiteActivationCode, 0) > 0) {

      this.repo.WebSiteUpdate(this.EditForm_WebSite.value).subscribe((data) => {

        if (data[0].WebSiteActivationCode.length > 0) {

          this.router.navigate(['/manager/website-edit', data[0].WebSiteActivationCode]);
          this.notificationService.succeded()
        }



      });

    } else {


      this.repo.WebSiteInsert(this.EditForm_WebSite.value).subscribe((data) => {

        if (parseInt(data[0].WebSiteActivationCode, 0) > 0) {
          this.getDetails();
          this.notificationService.succeded()
        }


      });


    }



  }


}


