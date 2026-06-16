import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { Subject } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

import { SalaryWebApiService } from 'src/app/features/automation/services/SalaryWebApi.service';

@Component({
  selector: 'app-employe-edit',
  templateUrl: './employe-edit.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgPersianDatepickerModule,
    AgGridModule,
    FormsModule
  ]
})
export class EmployeEditComponent extends AgGridBaseComponent implements OnInit {


  private readonly router = inject(Router);

  private readonly repo = inject(SalaryWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);


  constructor(
  ) { super(); }

  title = signal('فرم اطلاعات کارمندان')
  SingleItems = signal<any[]>([])
  records_salary = signal<any[]>([])
  EmployeeCode = signal('')

  VaziyatTaahol_Lookup: Base_Lookup[] = [
    { id: "متاهل", name: "متاهل" },
    { id: "مجرد", name: "مجرد" },
  ]

  EditForm_EmploySalary = new FormGroup({
    SearchTarget: new FormControl(''),
    Sal: new FormControl(''),
    Mah: new FormControl(''),
    EmployeeCode: new FormControl(''),

  });

  // فرم‌های صفحه
  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
  });
  private searchSubject = new Subject<string>();

  onSearchChange() {
    const value = this.EditForm_SearchTarget.get('SearchTarget')?.value ?? '';
    this.searchSubject.next(value);
  }




  EditForm_Employee = new FormGroup({

    EmployeeCode: new FormControl(''),
    FirstName: new FormControl('', Validators.required),
    LastName: new FormControl('', Validators.required),
    CodeMeli: new FormControl('', Validators.required),
    JobTitle: new FormControl('', Validators.required),
    Rozkarkard: new FormControl('0'),
    NerkhHoghogh: new FormControl('0'),
    NerkhSanavat: new FormControl('0'),
    NerkhMaskan: new FormControl('0'),
    NerkhKharobar: new FormControl('0'),
    NerkhEzafekar: new FormControl('0'),
    NerkhPadash: new FormControl('0'),
    TedadPadash: new FormControl('0'),
    NerkhExtra1: new FormControl('0'),
    TedadExtra1: new FormControl('0'),
    NerkhExtra2: new FormControl('0'),
    TedadExtra2: new FormControl('0'),
    BimePaye: new FormControl('0'),
    BimeTakmili: new FormControl('0'),

    Extra3: new FormControl('0'),
    Extra4: new FormControl('0'),
    SaatNaharNamaz: new FormControl('0'),
    VaziyatTaahol: new FormControl('', Validators.required),
    TedadOlad: new FormControl('0'),
    HaghOlad: new FormControl('0'),
    HaghTaahol: new FormControl('0'),
    Explain: new FormControl(''),
    WorkingHoursMinistry: new FormControl('220'),
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params: ParamMap) => {
      const idStr = params.get('id');       // رشته
      this.EmployeeCode.set(idStr)
      const idNum = Number(idStr);          // فقط برای مقایسه

      if (!idStr || idNum === 0) {
        // حالت ایجاد
        this.EmployeeCode.set("0")
        this.title.set("ایجاد کارمند جدید")
      } else {
        // حالت اصلاح
        this.EmployeeCode.set(idStr);        // رشته ذخیره می‌شود
        this.getDetails();
        this.title.set("اصلاح کارمند")
      }
      this.EditForm_Employee.patchValue({
        EmployeeCode: this.EmployeeCode(),
      });
    });



    this.initialdata()

  }

  initialdata() {

    this.column_name_1 = [

      {
        field: 'CityCode',
        headerName: 'نام مشتری  ',

        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'Name',
        headerName: 'مدیریت',

        cellClass: 'text-center',
        minWidth: 150
      },

    ];
  }



  Searchtarget_city = signal('')
  selectedRows = signal<any[]>([])


  onInputChange_City() {
    this.searchSubject.next(this.Searchtarget_city());
  }

  onSelectionChanged(event: any) {
    this.selectedRows = event.api.getSelectedRows();
  }



  GetSalary() {
    //  



  }

  getDetails() {

    this.repo.GetEmployeeByCode(this.EmployeeCode())
      .subscribe((data: any) => {

        this.EditForm_Employee.patchValue(data?.Employees[0]);

      });
  }

  onBtnCancelClick() {
    this.router.navigate(['/automation/employe-list']);
  }

  private toStringForSave(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }


  submit(action: string) {


    this.EditForm_Employee.markAllAsTouched();
    if (!this.EditForm_Employee.valid) return;

    const raw = this.EditForm_Employee.getRawValue();

    const payload: any = {};

    Object.keys(raw).forEach(key => {
      payload[key] = this.toStringForSave(raw[key]);
    });



    this.repo.InUp_Employee(payload)
      .subscribe((data: any) => {


        this.router.navigate(['/automation/employe-list']);
        this.notificationService.success('اطلاعات با موفقیت ذخیره شد');
        // if (data.Customers[0].CustomerCode.length > 0) {
        //   // this.router.navigate(['/internal/internal-customer-edit', data.Customers[0].CustomerCode]);

        // }
      });

    // if (Number(this.EmployeCode) > 0) {
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
