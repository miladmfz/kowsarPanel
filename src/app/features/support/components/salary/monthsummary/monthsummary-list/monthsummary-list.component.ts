import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { debounceTime, Subject } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { SalaryWebApiService } from 'src/app/features/support/services/SalaryWebApi.service';
import { CellActionMonthSummaryList } from './cell-action-monthsummary-list';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';

@Component({
  selector: 'app-monthsummary-list',
  templateUrl: './monthsummary-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    NgPersianDatepickerModule,
    AgGridModule
  ]
})
export class MonthsummaryListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  title = 'مشتریان داخلی کوثر';

  // دیتاها
  records: any[] = [];



  // جستجو
  Searchtarget = '';
  private searchSubject = new Subject<string>();

  // فرم‌های صفحه
  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    Sal: new FormControl(''),
    Mah: new FormControl(''),
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


  private readonly router = inject(Router);
  private readonly repo = inject(SalaryWebApiService);
  private readonly loadingService = inject(LoadingService);

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
        minWidth: 80,
        cellRenderer: CellActionMonthSummaryList
      },

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

    this.router.navigate(['/support/monthsummary-edit', EmployeCode]);

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
        this.updateGridData(1, this.records);
        setTimeout(() => this.gridApi1.sizeColumnsToFit(), 50);
      }
    }
  }

  // ---------------------------
  // Load Data
  // ---------------------------
  getList() {


    if (this.EditForm_SearchTarget.value.Sal == '') {
      this.EditForm_SearchTarget.patchValue({
        Sal: '0',
      });
    }
    if (this.EditForm_SearchTarget.value.Mah == '') {
      this.EditForm_SearchTarget.patchValue({
        Mah: '0',
      });
    }

    this.loadingService.show()
    this.repo.GetMonthSummary(this.EditForm_SearchTarget.value).subscribe({
      next: (data: any) => {
        this.loadingService.hide()

        this.records = data?.MonthSummarys ?? [];
        this.updateGridData(1, this.records);
        this.gridApi1?.sizeColumnsToFit?.();

        if (this.gridApi1) {
          this.updateGridData(1, this.records);
          this.gridApi1.sizeColumnsToFit();
        }
      },
      error: () => (this.loadingService.hide()),
    });
  }




}
