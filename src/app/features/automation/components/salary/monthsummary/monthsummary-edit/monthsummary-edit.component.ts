import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

import { SalaryWebApiService } from 'src/app/features/automation/services/SalaryWebApi.service';

@Component({
  selector: 'app-monthsummary-edit',
  templateUrl: './monthsummary-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    FormsModule
  ]
})
export class MonthsummaryEditComponent extends AgGridBaseComponent implements OnInit {


  private readonly router = inject(Router);

  private readonly repo = inject(SalaryWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);


  constructor() { super(); }

  title = signal('فرم اطلاعات اپلیکیشن')
  SingleItems = signal<any[]>([])
  records_salary = signal<any[]>([])
  MonthSummaryCode = signal('')

  Sal_Lookup: Base_Lookup[] = [
    { id: "1404", name: "1404" },
    { id: "1405", name: "1405" },
  ]

  Mah_Lookup: Base_Lookup[] = [
    { id: "1", name: "1 فروردین" },
    { id: "2", name: "2 اردیبهشت" },
    { id: "3", name: "3 خرداد" },
    { id: "4", name: "4 تیر" },
    { id: "5", name: "5 مرداد" },
    { id: "6", name: "6 شهریور" },
    { id: "7", name: "7 مهر" },
    { id: "8", name: "8 آبان" },
    { id: "9", name: "9 آذر" },
    { id: "10", name: "10 دی" },
    { id: "11", name: "11 بهمن" },
    { id: "12", name: "12 اسفند" },
  ]

  // فرم‌های صفحه
  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
  });
  private searchSubject = new Subject<string>();

  onSearchChange() {
    const value = this.EditForm_SearchTarget.get('SearchTarget')?.value ?? '';
    this.searchSubject.next(value);
  }

  EditForm_MonthSummary = new FormGroup({
    MonthSummaryCode: new FormControl(''),
    Sal: new FormControl('', Validators.required),
    Mah: new FormControl('', Validators.required),
    TotalDays: new FormControl('', Validators.required),
    HolidayDays: new FormControl('', Validators.required),
    Explain: new FormControl(''),

  });

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const idStr = params.get('id');       // رشته
      this.MonthSummaryCode.set(idStr)
      const idNum = Number(idStr);          // فقط برای مقایسه

      if (!idStr || idNum === 0) {
        // حالت ایجاد
        this.MonthSummaryCode.set("0")
        this.title.set("ایجاد ماه کاری جدید")
      } else {
        // حالت اصلاح
        this.MonthSummaryCode.set(idStr);       // رشته ذخیره می‌شود
        this.getDetails();
        this.title.set("اصلاح ماه کاری")
      }
      this.EditForm_MonthSummary.patchValue({
        MonthSummaryCode: this.MonthSummaryCode(),
      });
    });


  }





  getDetails() {

    this.repo.GetMonthSummaryByCode(this.MonthSummaryCode())
      .subscribe((data: any) => {

        this.EditForm_MonthSummary.patchValue(data?.MonthSummarys[0]);

      });
  }

  onBtnCancelClick() {
    this.router.navigate(['/automation/monthsummary-list']);
  }

  private toStringForSave(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }


  submit(action: string) {


    this.EditForm_MonthSummary.markAllAsTouched();
    if (!this.EditForm_MonthSummary.valid) return;

    const raw = this.EditForm_MonthSummary.getRawValue();

    const payload: any = {};

    Object.keys(raw).forEach(key => {
      payload[key] = this.toStringForSave(raw[key]);
    });



    this.repo.InUp_MonthSummary(payload)
      .subscribe((data: any) => {


        this.router.navigate(['/automation/monthsummary-list']);
        this.notificationService.success('اطلاعات با موفقیت ذخیره شد');
        // if (data.Customers[0].CustomerCode.length > 0) {
        //   // this.router.navigate(['/internal/internal-customer-edit', data.Customers[0].CustomerCode]);

        // }
      });

    // if (Number(this.MonthSummaryCode) > 0) {
    //   this.notificationService.warning('اصلاح مشتری غیر فعال می باشد');




    //   //      
    // this.repo.CustomerUpdate(this.EditForm_Customer.value)
    //   //   .subscribe((data: any) => {
    //  
    //   //     if (data.Customers[0].CustomerCode.length > 0) {
    //   //       // this.router.navigate(['/internal/internal-customer-edit', data.Customers[0].CustomerCode]);
    //   //       this.router.navigate(['/internal/internal-customer-list']);
    //   //       this.notificationService.success('اطلاعات با موفقیت ذخیره شد');
    //   //     }
    //   //   });


    // } else {




    // }
  }



  private readonly renderer = inject(Renderer2);


  @ViewChild('salarylist', { static: false }) salarylist!: ElementRef<HTMLDivElement>;



  salary_dialog_show(): void {
    const modal = this.salarylist?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  salary_dialog_close(): void {
    const modal = this.salarylist?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


}
