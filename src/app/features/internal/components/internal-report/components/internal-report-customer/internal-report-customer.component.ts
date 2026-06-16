import { Component, OnInit, OnDestroy, inject, signal, Renderer2, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';

import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { CellActionReportCustomer } from './cell-action-report-customer-list';
import { SupportFactorWebApiService } from 'src/app/features/internal/services/SupportFactorWebApi.service';
import { CustomerWebApiService } from 'src/app/features/internal/services/CustomerWebApi.service';




@Component({
  selector: 'app-internal-report-customer',
  standalone: true,
  templateUrl: './internal-report-customer.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    NgPersianDatepickerModule
  ]
})
export class InternalReportCustomerComponent
  extends AgGridBaseComponent
  implements OnInit, OnDestroy {


  private readonly repo = inject(CustomerWebApiService);

  constructor() {
    super();
  }


  // Search debounce
  private searchSubject = new Subject<string>();

  // Data models
  records_report_customer = signal<any[]>([])
  records_report_customer_bydate = signal<any[]>([])
  records_report_customer_byrow = signal<any[]>([])

  Customer_temp = signal('')
  loading = signal(false)

  customTheme: any = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',
  };

  // Forms
  EditForm_reportCustomer = new FormGroup({
    StartDateTarget: new FormControl('1404/01/01'),
    EndDateTarget: new FormControl('1405/01/01'),
    SearchTarget: new FormControl(''),
    CustomerRef: new FormControl('0'),
    Flag: new FormControl('1'),
  });

  EditForm_reportCustomer_temp = new FormGroup({
    StartDateTarget: new FormControl(''),
    EndDateTarget: new FormControl(''),
    SearchTarget: new FormControl(''),
    CustomerRef: new FormControl('0'),
    Flag: new FormControl('1'),
  });

  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });

    this.config();
  }



  // -----------------------------------------
  // Search + Filtering
  // -----------------------------------------

  submitforsearch() {
    this.EditForm_reportCustomer_temp.patchValue({
      StartDateTarget: this.EditForm_reportCustomer.value.StartDateTarget,
      EndDateTarget: this.EditForm_reportCustomer.value.EndDateTarget,
      CustomerRef: '0',
    });

    this.getlist();
  }

  onInputChange() {
    this.EditForm_reportCustomer_temp.patchValue({
      StartDateTarget: this.EditForm_reportCustomer.value.StartDateTarget,
      EndDateTarget: this.EditForm_reportCustomer.value.EndDateTarget,
      CustomerRef: '0',
    });

    this.searchSubject.next(this.EditForm_reportCustomer.value.SearchTarget ?? '');
  }

  // -----------------------------------------
  // Main Grid (Customer Summary)
  // -----------------------------------------

  getlist() {



    this.repo.GetCustomerReport(this.EditForm_reportCustomer.value)
      .subscribe((data: any) => {

        this.records_report_customer.set(data.KowsarReports ?? [])
        this.updateGridData(1, this.records_report_customer());

      });
  }
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
  // -----------------------------------------
  // By Date Modal
  // -----------------------------------------

  getlist_report_customer_bydate(item: any) {


    this.EditForm_reportCustomer_temp.patchValue({
      StartDateTarget: this.EditForm_reportCustomer.value.StartDateTarget,
      EndDateTarget: this.EditForm_reportCustomer.value.EndDateTarget,
      CustomerRef: item.CustomerRef,
      Flag: '2'
    });


    this.repo.GetCustomerReport(this.EditForm_reportCustomer_temp.value)
      .subscribe((data: any) => {

        this.Customer_temp.set(data.KowsarReports?.[0]?.CustomerName ?? '')
        this.records_report_customer_bydate.set(data.KowsarReports ?? [])
        this.updateGridData(2, this.records_report_customer_bydate());

        this.customerreportbydate_dialog_show();
      });
  }

  // -----------------------------------------
  // By Row Modal
  // -----------------------------------------

  getlist_report_customer_byrow(item: any) {


    this.EditForm_reportCustomer_temp.patchValue({
      StartDateTarget: this.EditForm_reportCustomer.value.StartDateTarget,
      EndDateTarget: this.EditForm_reportCustomer.value.EndDateTarget,
      CustomerRef: item.CustomerRef,
      Flag: '3'
    });


    this.repo.GetCustomerReport(this.EditForm_reportCustomer_temp.value)
      .subscribe((data: any) => {

        this.records_report_customer_byrow.set(data.KowsarReports ?? [])
        this.updateGridData(3, this.records_report_customer_byrow());

        this.customerreportbyrow_dialog_show();
      });
  }

  // -----------------------------------------
  // Config + ColumnDefs
  // -----------------------------------------

  config() {
    this.EditForm_reportCustomer.patchValue({
      StartDateTarget: '1404/01/01',
      EndDateTarget: '1405/01/01',
      SearchTarget: '',
      CustomerRef: '0',
      Flag: '1'
    });

    // Live search
    this.EditForm_reportCustomer.get('SearchTarget')?.valueChanges.subscribe(() => {
      this.onInputChange();
    });

    // Debounce search
    this.searchSubject.pipe(debounceTime(500)).subscribe(() => {
      this.getlist();
    });

    // Column definitions
    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        width: 100,
        cellRenderer: CellActionReportCustomer
      },
      { field: 'CustomerName', headerName: 'نام مشتری', cellClass: 'text-center', minWidth: 150 },
      { field: 'FactorCount', headerName: 'تعداد فاکتور', width: 80, cellClass: 'text-center' },
      { field: 'TotalTime', headerName: 'مدت زمان', width: 80, cellClass: 'text-center' },
      { field: 'TotalPrice', headerName: 'مبلغ کل', width: 80, cellClass: 'text-center' },
    ];

    this.columnDefs2 = [
      { field: 'FactorCode', headerName: 'کد فاکتور', width: 80, cellClass: 'text-center' },
      { field: 'FactorDate', headerName: 'تاریخ', width: 80, cellClass: 'text-center' },
      { field: 'GoodName', headerName: 'نام خدمت', minWidth: 200 },
    ];

    this.columnDefs3 = [
      { field: 'GoodName', headerName: 'نام خدمت', minWidth: 200, cellClass: 'text-center' },
      { field: 'GoodCount', headerName: 'تعداد انجام', width: 80, cellClass: 'text-center' },
    ];

    this.getlist();
  }

  // -----------------------------------------
  // Modal Controls
  // -----------------------------------------


  private readonly renderer = inject(Renderer2);


  @ViewChild('customerreportbydate', { static: false }) customerreportbydate!: ElementRef<HTMLDivElement>;
  @ViewChild('customerreportbyrow', { static: false }) customerreportbyrow!: ElementRef<HTMLDivElement>;



  customerreportbydate_dialog_show(): void {
    const modal = this.customerreportbydate?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  customerreportbydate_dialog_close(): void {
    const modal = this.customerreportbydate?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }
  customerreportbyrow_dialog_show(): void {
    const modal = this.customerreportbyrow?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  customerreportbyrow_dialog_close(): void {
    const modal = this.customerreportbyrow?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }




}
