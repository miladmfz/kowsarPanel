import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

import { SalaryWebApiService } from 'src/app/features/support/services/SalaryWebApi.service';

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

  title = 'فرم اطلاعات اپلیکیشن';
  SingleItems: any[] = [];
  records_salary: any;
  MonthSummaryCode: string = '';

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
      this.MonthSummaryCode = idStr
      const idNum = Number(idStr);          // فقط برای مقایسه

      if (!idStr || idNum === 0) {
        // حالت ایجاد
        this.MonthSummaryCode = "0"
        this.title = "ایجاد ماه کاری جدید";
      } else {
        // حالت اصلاح
        this.MonthSummaryCode = idStr;        // رشته ذخیره می‌شود
        this.getDetails();
        this.title = "اصلاح ماه کاری";
      }
      this.EditForm_MonthSummary.patchValue({
        MonthSummaryCode: this.MonthSummaryCode,
      });
    });


  }





  getDetails() {

    this.repo.GetMonthSummaryByCode(this.MonthSummaryCode)
      .subscribe((data: any) => {

        this.EditForm_MonthSummary.patchValue(data?.MonthSummarys[0]);

      });
  }

  onBtnCancelClick() {
    this.router.navigate(['/support/monthsummary-list']);
  }

  private toStringForSave(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }


  submit(action: string) {


    this.EditForm_MonthSummary.markAllAsTouched();
    if (!this.EditForm_MonthSummary.valid) return;

    const raw = this.EditForm_MonthSummary.getRawValue();
    console.log(raw);

    const payload: any = {};

    Object.keys(raw).forEach(key => {
      payload[key] = this.toStringForSave(raw[key]);
    });



    this.repo.InUp_MonthSummary(payload)
      .subscribe((data: any) => {


        this.router.navigate(['/support/monthsummary-list']);
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


  salary_dialog_show() { this.toggleModal('#salarylist', true); }
  salary_dialog_close() { this.toggleModal('#salarylist', false); }



  toggleModal(selector: string, show: boolean) {
    const modal: any = document.querySelector(selector);
    if (!modal) return;

    if (show) {
      // BACKDROP بساز
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade';
      backdrop.id = selector.replace('#', '') + '-backdrop';
      document.body.appendChild(backdrop);

      // کمی تاخیر برای fade
      setTimeout(() => backdrop.classList.add('show'), 10);

      // مودال را باز کن
      modal.classList.add('show', 'd-block');
      modal.removeAttribute('aria-hidden');
      modal.setAttribute('aria-modal', 'true');
      modal.style.display = 'block';

      // بستن با کلیک روی بک‌دراپ
      backdrop.addEventListener('click', () => this.toggleModal(selector, false));
    }
    else {
      // مودال را ببند
      modal.classList.remove('show');
      setTimeout(() => {
        modal.classList.remove('d-block');
        modal.style.display = 'none';
      }, 150);

      modal.setAttribute('aria-hidden', 'true');
      modal.removeAttribute('aria-modal');

      // بک‌دراپ را حذف کن
      const backdrop = document.getElementById(selector.replace('#', '') + '-backdrop');
      if (backdrop) {
        backdrop.classList.remove('show');
        setTimeout(() => backdrop.remove(), 150);
      }
    }
  }
}
