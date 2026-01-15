import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { catchError, of } from 'rxjs';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { WebSiteWebApiService } from '../../../services/WebSiteWebApi.service';
import { KowsarAttachComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-attach/kowsar-attach.component';

@Component({
  selector: 'app-internal-website-edit',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    AgGridModule,
    RouterModule,
    KowsarAttachComponent
  ],
  templateUrl: './internal-website-edit.component.html'
})
export class InternalWebsiteEditComponent implements OnInit {

  title = 'فرم ویرایش وب‌سایت داخلی';
  WebsiteId = "";


  EditForm_WebSite = new FormGroup({

    WebSiteActivationCode: new FormControl(''),
    CustomerRef: new FormControl('0'),
    CompanyName: new FormControl('', Validators.required),
    WebEmploy: new FormControl('', Validators.required),
    Phone: new FormControl('', Validators.required),
    Explain: new FormControl(''),
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
    { id: "2", name: "الماتک" },
    { id: "3", name: "وبینه" },
    { id: "4", name: "رهپویان" },
    { id: "5", name: "متفرقه" },

  ]


  KCServer_Lookup: Base_Lookup[] = [
    { id: "KCServer_جدید", name: "KCServer_جدید" },

    { id: "KCServer_3.04.09.27", name: "KCServer_3.04.09.27" },
    { id: "KCServer_3.04.05.23", name: "KCServer_3.04.05.23" },
    { id: "KCServer_3.04.04.20", name: "KCServer_3.04.04.20" },
    { id: "KCServer_3.01.08.15", name: "KCServer_3.01.08.15" },

    { id: "KCServer_قدیمی", name: "KCServer_قدیمی" },
  ]




  TrueFalse_Lookup: Base_Lookup[] = [
    { id: "0", name: "غیر فعال " },
    { id: "1", name: "فعال" },

  ]

  private readonly router = inject(Router);
  private readonly repo = inject(WebSiteWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);


  constructor() { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((p: ParamMap) => {
      const id = p.get('id');
      if (id) {
        this.WebsiteId = id;
        this.loadDetails();
      }
    });
  }

  loadDetails() {
    this.repo.GetWebSiteActivationById(this.WebsiteId)
      .subscribe((data: any) => {
        this.EditForm_WebSite.patchValue(data.WebSites[0]);
      });
  }

  onCancel() {
    this.router.navigateByUrl('/internal/internal-website-list');
  }


  submit() {
    this.EditForm_WebSite.markAllAsTouched();
    if (!this.EditForm_WebSite.valid) return;

    const payload = this.EditForm_WebSite.value;
    const id = Number(this.WebsiteId); // تبدیل صحیح

    const request$ = id > 0
      ? this.repo.WebSiteUpdate(payload)
      : this.repo.WebSiteInsert(payload);

    request$.pipe(
      catchError(err => {
        this.notificationService.error('مشکل در برقراری ارتباط', 'خطا');
        return of(null);
      })
    ).subscribe((data: any) => {
      if (!data.WebSites || !data.WebSites[0]) return;

      const newId = Number(data.WebSites[0].WebSiteActivationCode);

      if (newId > 0) {
        this.notificationService.succeded();

        if (id === 0) {
          // درج → رفتن به صفحه ویرایش
          this.router.navigate(['/internal/internal-website-edit', newId]);
        } else {
          // ویرایش → رفرش دیتای فرم
          this.loadDetails();
        }
      }
    });
  }


}
