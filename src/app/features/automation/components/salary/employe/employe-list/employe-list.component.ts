import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { debounceTime, Subject } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { SalaryWebApiService } from 'src/app/features/automation/services/SalaryWebApi.service';
import { CellActionEmployeList } from './cell-action-employe-list';
import { CellActionDetailSalaryList } from './cell-action-detailsalary-list';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';

@Component({
  selector: 'app-employe-list',
  templateUrl: './employe-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgPersianDatepickerModule,
    AgGridModule
  ],
})
export class EmployeListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  title = 'مشتریان داخلی کوثر';

  // دیتاها
  records = signal<any[]>([])
  records_salary = signal<any[]>([])


  // جستجو
  Searchtarget = signal('')
  private searchSubject = new Subject<string>();

  // فرم‌های صفحه
  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    BrokerRef: new FormControl(''),
  });
  EditForm_EmploySalary = new FormGroup({
    SearchTarget: new FormControl(''),
    Sal: new FormControl(''),
    Mah: new FormControl(''),
    EmployeCode: new FormControl(''),

  });
  // فرم‌های مودال‌ها
  EditForm_explain = new FormGroup({
    Explain: new FormControl(''),
    ObjectRef: new FormControl('0'),
  });


  ShowForm_Employee = new FormGroup({

    EmployeeCode: new FormControl(''),
    FirstName: new FormControl(''),
    LastName: new FormControl(''),
    CodeMeli: new FormControl(''),
    JobTitle: new FormControl(''),
    Rozkarkard: new FormControl(''),
    NerkhHoghogh: new FormControl(''),
    NerkhSanavat: new FormControl(''),
    NerkhMaskan: new FormControl(''),
    NerkhKharobar: new FormControl(''),
    NerkhEzafekar: new FormControl(''),
    NerkhPadash: new FormControl(''),
    TedadPadash: new FormControl(''),
    NerkhExtra1: new FormControl(''),
    TedadExtra1: new FormControl(''),
    NerkhExtra2: new FormControl(''),
    TedadExtra2: new FormControl(''),
    BimePaye: new FormControl(''),
    BimeTakmili: new FormControl(''),
    Extra3: new FormControl(''),
    Extra4: new FormControl(''),
    SaatNaharNamaz: new FormControl(''),
    VaziyatTaahol: new FormControl(''),
    TedadOlad: new FormControl(''),
    HaghOlad: new FormControl(''),
    HaghTaahol: new FormControl(''),
    Explain: new FormControl(''),
    WorkingHoursMinistry: new FormControl('220'),
    SearchTarget: new FormControl(''),
  });


  ShowForm_salary = new FormGroup({

    SalarySummaryCode: new FormControl(''),
    EmployeeCode: new FormControl(''),
    EmployeeRef: new FormControl(''),
    MonthSummaryCode: new FormControl(''),
    MonthSummaryRef: new FormControl(''),

    Sal: new FormControl(''),
    Mah: new FormControl(''),
    TotalDays: new FormControl(''),
    WorkingDays: new FormControl(''),
    HolidayDays: new FormControl(''),
    WorkingHoursInMonth: new FormControl(''),


    FirstName: new FormControl(''),
    LastName: new FormControl(''),
    CodeMeli: new FormControl(''),
    JobTitle: new FormControl(''),



    WorkingHours: new FormControl(''),
    Rozkarkard: new FormControl(''),

    NerkhHoghoghRozane: new FormControl(''),
    TotalHoghoghRozane: new FormControl(''),
    NerkhEzafekar: new FormControl(''),
    SaatEzafekarCal: new FormControl(''),
    TotalEzafekar: new FormControl(''),
    TotalSanavat: new FormControl(''),
    NerkhSanavat: new FormControl(''),
    TotalMaskan: new FormControl(''),
    NerkhMaskan: new FormControl(''),
    NerkhKharobar: new FormControl(''),
    TotalKharobar: new FormControl(''),
    SaatNaharNamaz: new FormControl(''),
    TedadOlad: new FormControl(''),
    TotalOlad: new FormControl(''),
    HaghTaahol: new FormControl(''),
    NerkhPadash: new FormControl(''),
    TedadPadash: new FormControl(''),
    TotalPadash: new FormControl(''),
    NerkhExtra1: new FormControl(''),
    TedadExtra1: new FormControl(''),
    TotalExtra1: new FormControl(''),
    NerkhExtra2: new FormControl(''),
    TedadExtra2: new FormControl(''),
    TotalExtra2: new FormControl(''),
    PayeHoghogh: new FormControl(''),
    TotalExtra: new FormControl(''),
    TotalHoghogh: new FormControl(''),
    HoghoghAndExtra: new FormControl(''),
    ZaribExtra4: new FormControl(''),
    AfterCalHoghogh: new FormControl(''),

    BimePaye: new FormControl(''),
    BimeTakmili: new FormControl(''),
    Extra3: new FormControl(''),
    Extra4: new FormControl(''),
    LeaveDays: new FormControl(''),
    Explain: new FormControl('')
  });

  private readonly router = inject(Router);
  protected readonly session = inject(SessionStorageService);
  private readonly repo = inject(SalaryWebApiService);

  constructor() {
    super();
  }




  ngOnInit(): void {

    // --- ستون‌های گرید اصلی مشتریان ---
    this.column_name_1 = [
      {
        headerName: 'عملیات',
        pinned: 'left',
        minWidth: 250,
        cellRenderer: CellActionEmployeList
      },

      { field: 'FirstName', headerName: 'نام', cellClass: 'text-center', minWidth: 100 },
      { field: 'LastName', headerName: 'نام خانوادگس', cellClass: 'text-center', minWidth: 100 },
      { field: 'CodeMeli', headerName: 'کد ملی', cellClass: 'text-center', minWidth: 100 },
      { field: 'JobTitle', headerName: 'شغل', cellClass: 'text-center', minWidth: 100 },
      { field: 'Rozkarkard', headerName: 'روز کارکرد', cellClass: 'text-center', minWidth: 100 },
      // { field: 'HoghoghRozane', headerName: 'HoghoghRozane' , cellClass: 'text-center', minWidth: 100 },
      // { field: 'SanavatRozane', headerName: 'SanavatRozane' , cellClass: 'text-center', minWidth: 100 },
      // { field: 'HaghMaskanRozane', headerName: 'HaghMaskanRozane' , cellClass: 'text-center', minWidth: 100 },
      // { field: 'HaghKharobarRozane', headerName: 'HaghKharobarRozane' , cellClass: 'text-center', minWidth: 100 },
      // { field: 'EzafekarSaati', headerName: 'EzafekarSaati' , cellClass: 'text-center', minWidth: 100 },
      // { field: 'SaatNaharNamaz', headerName: 'SaatNaharNamaz' , cellClass: 'text-center', minWidth: 100 },
      { field: 'VaziyatTaahol', headerName: 'وضعیت تاهل', cellClass: 'text-center', minWidth: 100 },
      { field: 'TedadOlad', headerName: 'تعداد بچه', cellClass: 'text-center', minWidth: 100 },
      // { field: 'HaghOlad', headerName: 'HaghOlad' , cellClass: 'text-center', minWidth: 100 },
      // { field: 'HaghTaahol', headerName: 'HaghTaahol' , cellClass: 'text-center', minWidth: 100 },
      // { field: 'WorkingHoursMinistry', headerName: 'WorkingHoursMinistry' , cellClass: 'text-center', minWidth: 100 },



    ];

    this.columnDefs2 = [
      {
        headerName: 'عملیات',
        pinned: 'left',
        minWidth: 80,
        cellRenderer: CellActionDetailSalaryList
      },

      { field: 'Sal', headerName: 'سال', cellClass: 'text-center', width: 100 },
      { field: 'Mah', headerName: 'ماه', cellClass: 'text-center', width: 100 },

      { field: 'WorkingHours', headerName: 'ساعت کاری', cellClass: 'text-center', minWidth: 100, valueFormatter: (p) => this.formatNumberForGrid(p.value) },
      { field: 'SaatEzafekarCal', headerName: 'اضافه کاری', cellClass: 'text-center', minWidth: 100, valueFormatter: (p) => this.formatNumberForGrid(p.value) },

      { field: 'BaseSalary', headerName: 'حقوق پایه', cellClass: 'text-center', minWidth: 100, valueFormatter: (p) => this.formatNumberForGrid(p.value) },
      { field: 'TotalEzafekar', headerName: 'حقوق اضافه کاری', cellClass: 'text-center', minWidth: 100, valueFormatter: (p) => this.formatNumberForGrid(p.value) },
      { field: 'NetSalary', headerName: 'کل حقوق', cellClass: 'text-center', minWidth: 100, valueFormatter: (p) => this.formatNumberForGrid(p.value) },



    ];




    // --- دریافت مقدار اولیه بروکر ---
    this.EditForm_SearchTarget.patchValue({
      BrokerRef: this.session.getString("BrokerCode"),
      SearchTarget: ''

    });


    this.getList();

    this.searchSubject
      .pipe(debounceTime(1000))
      .subscribe(() => this.getList());
  }

  onSearchChange() {
    const value = this.EditForm_SearchTarget.get('SearchTarget')?.value ?? '';
    this.searchSubject.next(value);
  }




  NavigateToEdit(EmployeCode: any): void {

    this.router.navigate(['/automation/employe-edit', EmployeCode]);

  }
  // ---------------------------
  // Grid Ready
  // ---------------------------
  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);
    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }
    if (index === 1) {
      this.gridApi1 = params.api;

      // اگر قبلاً داده آمده بود، همین‌جا بریز توی گرید
      if (this.records?.length > 0) {
        this.updateGridData(1, this.records());
        setTimeout(() => this.gridApi1.sizeColumnsToFit(), 50);
      }
    }
  }

  // ---------------------------
  // Load Data
  // ---------------------------
  getList() {


    this.repo.GetEmployee(this.EditForm_SearchTarget.value).subscribe({
      next: (data: any) => {



        this.records.set(data?.Employees ?? [])
        this.updateGridData(1, this.records());
        this.gridApi1?.sizeColumnsToFit?.();

        if (this.gridApi1) {
          this.updateGridData(1, this.records());
          this.gridApi1.sizeColumnsToFit();
        }
      },
      error: (err) => {
        console.error(err);
      },

    });
  }


  // ---------------------------
  // Property (Show / Edit)
  // ---------------------------
  ShowSalary(EmployeCode): void {

    this.EditForm_EmploySalary.patchValue({
      SearchTarget: '',
      Sal: '0',
      Mah: '0',
      EmployeCode: EmployeCode
    });



    this.repo.GetSalarySummary(this.EditForm_EmploySalary.value).subscribe({
      next: (data: any) => {



        this.records_salary.set(data?.SalarySummarys ?? [])
        this.updateGridData(2, this.records_salary())
        this.gridApi2?.sizeColumnsToFit?.();

        if (this.gridApi2) {
          this.updateGridData(2, this.records_salary())
          this.gridApi2.sizeColumnsToFit();
        }
        this.Employeesalary_dialog_show()
      },
      error: (err) => {
        console.error(err);
      },

    });
  }

  ShowDetailSalary(data: any): void {
    this.ShowForm_salary.patchValue(data);

    this.detailsalary_dialog_show()
  }




  onView(data: any): void {
    this.ShowForm_Employee.patchValue(this.normalizeFormData(data));
    this.Employee_dialog_show()
  }

  private excludeFormatFields: string[] = [
    'CodeMeli',
    'EmployeCode',
    'FirstName',
    'LastName',
    'JobTitle',
  ];


  private normalizeFormData(data: any): any {
    const result: any = {};

    Object.keys(this.ShowForm_Employee.controls).forEach(key => {
      const value = data?.[key]

      // این فیلدها را کلاً دست نزن
      if (this.excludeFormatFields.includes(key)) {
        result[key] = value ?? '';
        return;
      }

      if (value === null || value === undefined || value === '') {
        result[key] = ""
        return;
      }

      const n = Number(value);

      // اگر عدد نبود، همون مقدار خام
      if (isNaN(n)) {
        result[key] = value;
        return;
      }

      // صفر
      if (n === 0) {
        result[key] = '0';
        return;
      }

      // تمیز کردن اعشار بدون گرد کردن
      let clean = Number.isInteger(n)
        ? n.toString()
        : n.toFixed(6).replace(/\.?0+$/, '');

      // جداکننده سه‌تایی
      const parts = clean.split('.');
      parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

      result[key] = parts.join('.');
    });

    return result;
  }


  private formatNumberForGrid(value: any): string {
    if (value === null || value === undefined || value === '') return '';

    // بعضی فیلدها مثل CodeMeli را دست نزن
    // (اگر خواستی اینجا هم exclude بزنی)
    const n = Number(value);
    if (isNaN(n)) return String(value);

    if (n === 0) return '0';

    let clean = Number.isInteger(n)
      ? n.toString()
      : n.toFixed(6).replace(/\.?0+$/, '');

    const parts = clean.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return parts.join('.');
  }


  private readonly renderer = inject(Renderer2);


  @ViewChild('employeemodal', { static: false }) employeemodal!: ElementRef<HTMLDivElement>;
  @ViewChild('employeesalarymodal', { static: false }) employeesalarymodal!: ElementRef<HTMLDivElement>;
  @ViewChild('detailsalarymodal', { static: false }) detailsalarymodal!: ElementRef<HTMLDivElement>;



  Employee_dialog_show(): void {
    const modal = this.employeemodal?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  Employee_dialog_close(): void {
    const modal = this.employeemodal?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


  Employeesalary_dialog_show(): void {
    const modal = this.employeesalarymodal?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  Employeesalary_dialog_close(): void {
    const modal = this.employeesalarymodal?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  detailsalary_dialog_show(): void {
    const modal = this.detailsalarymodal?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  detailsalary_dialog_close(): void {
    const modal = this.detailsalarymodal?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



}
