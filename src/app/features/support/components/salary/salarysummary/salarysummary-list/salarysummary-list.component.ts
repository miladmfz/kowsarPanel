import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { debounceTime, Subject } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { SalaryWebApiService } from 'src/app/features/support/services/SalaryWebApi.service';
import { CellActionSalarySummaryList } from './cell-action-salarysummary-list';

@Component({
  selector: 'app-salarysummary-list',
  templateUrl: './salarysummary-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgPersianDatepickerModule,
    AgGridModule
  ]
})
export class SalarysummaryListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  title = 'مشتریان داخلی کوثر';

  // دیتاها
  records: any[] = [];
  records_MonthSummarys: any[] = [];
  selectedRows: any[] = [];


  // جستجو
  Searchtarget = '';
  private searchSubject = new Subject<string>();

  // فرم‌های صفحه
  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    Sal: new FormControl('0'),
    Mah: new FormControl('0'),
    EmployeCode: new FormControl(''),

  });

  EditForm_AddSalary = new FormGroup({
    MonthSummaryCode: new FormControl(''),
  });

  // فرم‌های مودال‌ها
  EditForm_explain = new FormGroup({
    Explain: new FormControl(''),
    ObjectRef: new FormControl('0'),
  });

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


  EditForm_WorkingEmploye = new FormGroup({

    SalarySummaryCode: new FormControl(''),
    WorkingHours: new FormControl(''),
    LeaveDays: new FormControl('0'),

    Sal: new FormControl(''),
    Mah: new FormControl(''),

    EmployeeCode: new FormControl(''),
    FirstName: new FormControl(''),
    LastName: new FormControl(''),
    CodeMeli: new FormControl(''),
    JobTitle: new FormControl(''),
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
    VaziyatTaahol: new FormControl(''),
    TedadOlad: new FormControl('0'),
    HaghOlad: new FormControl('0'),
    HaghTaahol: new FormControl('0'),
    Explain: new FormControl(''),
    WorkingHoursMinistry: new FormControl('220'),
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
    HoursInDay: new FormControl(''),
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
    TotalLeaveDays: new FormControl(''),
    Explain: new FormControl('')
  });


  private readonly repo = inject(SalaryWebApiService);


  constructor() {
    super();
  }

  // ---------------------------
  // Lifecycle
  // ---------------------------
  ngOnInit(): void {

    // --- ستون‌های گرید اصلی مشتریان ---
    this.columnDefs1 = [
      {
        headerName: 'عملیات',
        pinned: 'left',
        minWidth: 150,
        cellRenderer: CellActionSalarySummaryList
      },

      {
        headerName: 'نام و نام خانوادگی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 180,
        valueGetter: (params) =>
          `${params.data?.FirstName ?? ''} ${params.data?.LastName ?? ''}`.trim()
      },

      { field: 'WorkingHours', headerName: 'ساعت کاری', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 100, valueFormatter: (p) => this.formatNumberForGrid(p.value) },
      { field: 'SaatEzafekarCal', headerName: 'اضافه کاری', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 100, valueFormatter: (p) => this.formatNumberForGrid(p.value) },

      { field: 'BaseSalary', headerName: 'حقوق پایه', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 100, valueFormatter: (p) => this.formatNumberForGrid(p.value) },
      { field: 'TotalEzafekar', headerName: 'حقوق اضافه کاری', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 100, valueFormatter: (p) => this.formatNumberForGrid(p.value) },
      { field: 'NetSalary', headerName: 'کل حقوق', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 100, valueFormatter: (p) => this.formatNumberForGrid(p.value) },

      { field: 'Sal', headerName: 'سال', filter: 'agSetColumnFilter', cellClass: 'text-center', width: 100 },
      { field: 'Mah', headerName: 'ماه', filter: 'agSetColumnFilter', cellClass: 'text-center', width: 100 },

    ];


    this.columnDefs2 = [

      { field: 'Sal', headerName: 'سال', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 100 },
      { field: 'Mah', headerName: 'ماه', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 100 },
      { field: 'TotalDays', headerName: 'تعداد روز', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 100 },
      { field: 'WorkingDays', headerName: 'روز کاری', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 100 },
      { field: 'HolidayDays', headerName: 'روز تعطیل', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 100 },
      { field: 'WorkingHoursInMonth', headerName: 'ساعت موظفی', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 100 },

    ];

    // --- دریافت مقدار اولیه بروکر ---
    this.EditForm_SearchTarget.patchValue({
      SearchTarget: '',
      Sal: '0',
      Mah: '0',
      EmployeCode: '0'
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



  // ---------------------------
  // Grid Ready
  // ---------------------------
  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    // ذخیره API درست
    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    // فیت کردن ستون‌ها با تأخیر کوتاه
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch { }
    }, 50);
  }


  // ---------------------------
  // Load Data
  // ---------------------------
  getList() {


    if (this.EditForm_SearchTarget.value.Sal == '') {
      this.EditForm_SearchTarget.patchValue({
        Sal: '0',
        EmployeCode: '0'

      });
    }
    if (this.EditForm_SearchTarget.value.Mah == '') {
      this.EditForm_SearchTarget.patchValue({
        Mah: '0',
        EmployeCode: '0'

      });
    }



    this.repo.GetSalarySummary(this.EditForm_SearchTarget.value).subscribe({
      next: (data: any) => {



        this.records = data?.SalarySummarys ?? [];
        this.updateGridData(1, this.records);
        this.gridApi1?.sizeColumnsToFit?.();

        if (this.gridApi1) {
          this.updateGridData(1, this.records);
          this.gridApi1.sizeColumnsToFit();
        }
      },
      error: (err) => {
        console.error(err);
      },

    });
  }




  updateWorkingEmploye(input_data: any): void {


    this.repo.GetEmployeeByCode(input_data?.EmployeeCode)
      .subscribe((data: any) => {

        this.EditForm_WorkingEmploye.patchValue(data?.Employees[0]);

        this.EditForm_WorkingEmploye.patchValue({
          SalarySummaryCode: input_data?.SalarySummaryCode ?? '',
          WorkingHours: input_data?.WorkingHours ?? '',
          FirstName: input_data?.FirstName ?? '',
          LastName: input_data?.LastName ?? '',
          Sal: input_data?.Sal ?? '',
          Mah: input_data?.Mah ?? '',

        });

        this.WorkingEmploye_dialog_show();
      });



  }

  private toStringForSave(value: any): string {
    if (value === null || value === undefined) return '';
    return String(value).trim();
  }


  Submit_updateWorkingEmploye() {

    this.EditForm_WorkingEmploye.markAllAsTouched();
    if (!this.EditForm_WorkingEmploye.valid) return;

    const raw = this.EditForm_WorkingEmploye.getRawValue();
    console.log(raw);

    const payload: any = {};

    Object.keys(raw).forEach(key => {
      payload[key] = this.toStringForSave(raw[key]);
    });
    console.log(this.EditForm_WorkingEmploye.value)




    this.repo.UpdateWorkingEmployee(this.EditForm_WorkingEmploye.value).subscribe({
      next: (data: any) => {


        this.getList()
        this.WorkingEmploye_dialog_close();
      },
      error: (err) => {
        console.error(err);
      },

    });



  }

  ShowModalAddSalary(): void {




    this.repo.GetMonthSummary(this.EditForm_SearchTarget.value).subscribe({
      next: (data: any) => {



        this.records_MonthSummarys = data?.MonthSummarys ?? [];
        this.updateGridData(2, this.records_MonthSummarys);
        this.gridApi2?.sizeColumnsToFit?.();

        if (this.gridApi2) {
          this.updateGridData(2, this.records);
          this.gridApi2.sizeColumnsToFit();
        }

        this.addsalary_dialog_show()
      },
      error: (err) => {
        console.error(err);
      },

    });


  }


  onSelectionChanged(event: any): void {
    this.selectedRows = event.api.getSelectedRows();
  }


  CreateNewsalary(): void {

    this.EditForm_AddSalary.patchValue({
      MonthSummaryCode: this.selectedRows[0].MonthSummaryCode,
    });



    this.repo.AddSalaryForAllEmployees(this.EditForm_AddSalary.value).subscribe({
      next: (data: any) => {


        this.getList()
        this.addsalary_dialog_close();
      },
      error: (err) => {
        console.error(err);
      },

    });

  }




  ShowModal(data: any): void {


    const cleanData = this.normalizeFormData(data);
    this.ShowForm_salary.patchValue(cleanData);

    this.salary_dialog_show()
  }

  private excludeFormatFields: string[] = [
    'CodeMeli',
    'EmployeCode',
    'FirstName',
    'LastName',
    'JobTitle',
    'Sal'
  ];


  private normalizeFormData(data: any): any {
    const result: any = {};

    Object.keys(this.ShowForm_salary.controls).forEach(key => {
      const value = data?.[key];

      // این فیلدها را کلاً دست نزن
      if (this.excludeFormatFields.includes(key)) {
        result[key] = value ?? '';
        return;
      }

      if (value === null || value === undefined || value === '') {
        result[key] = '';
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

  salary_dialog_show() { this.toggleModal('#salarymodal', true); }
  salary_dialog_close() { this.toggleModal('#salarymodal', false); }

  WorkingEmploye_dialog_show() { this.toggleModal('#editWorkingEmployeemodal', true); }
  WorkingEmploye_dialog_close() { this.toggleModal('#editWorkingEmployeemodal', false); }


  addsalary_dialog_show() { this.toggleModal('#addsalarymodal', true); }
  addsalary_dialog_close() { this.toggleModal('#addsalarymodal', false); }




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
