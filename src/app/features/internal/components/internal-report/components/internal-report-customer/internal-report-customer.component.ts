import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subject, Subscription } from 'rxjs';

import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { CellActionReportCustomer } from './cell-action-report-customer-list';
import { SupportFactorWebApiService } from 'src/app/features/internal/services/SupportFactorWebApi.service';




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

  constructor(
    private readonly router: Router,
    private repo: SupportFactorWebApiService,
    private renderer: Renderer2,
    private notificationService: NotificationService,
    private loadingService: LoadingService,
  ) {
    super();
  }


  // Search debounce
  private searchSubject = new Subject<string>();

  // Data models
  records_report_customer: any[] = [];
  records_report_customer_bydate: any[] = [];
  records_report_customer_byrow: any[] = [];

  Customer_temp = '';
  loading = false;

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
    this.loadingService.show();

    this.repo.GetCustomerReport(this.EditForm_reportCustomer.value)
      .subscribe((data: any) => {
        this.records_report_customer = data.KowsarReports ?? [];
        this.updateGridData(1, this.records_report_customer);
        this.loadingService.hide();
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
    this.loadingService.show();

    this.EditForm_reportCustomer_temp.patchValue({
      StartDateTarget: this.EditForm_reportCustomer.value.StartDateTarget,
      EndDateTarget: this.EditForm_reportCustomer.value.EndDateTarget,
      CustomerRef: item.CustomerRef,
      Flag: '2'
    });

    this.repo.GetCustomerReport(this.EditForm_reportCustomer_temp.value)
      .subscribe((data: any) => {
        this.Customer_temp = data.KowsarReports?.[0]?.CustomerName ?? '';
        this.records_report_customer_bydate = data.KowsarReports ?? [];
        this.updateGridData(2, this.records_report_customer_bydate);
        this.loadingService.hide();
        this.customerreportbydate_dialog_show();
      });
  }

  // -----------------------------------------
  // By Row Modal
  // -----------------------------------------

  getlist_report_customer_byrow(item: any) {
    this.loadingService.show();

    this.EditForm_reportCustomer_temp.patchValue({
      StartDateTarget: this.EditForm_reportCustomer.value.StartDateTarget,
      EndDateTarget: this.EditForm_reportCustomer.value.EndDateTarget,
      CustomerRef: item.CustomerRef,
      Flag: '3'
    });

    this.repo.GetCustomerReport(this.EditForm_reportCustomer_temp.value)
      .subscribe((data: any) => {
        this.records_report_customer_byrow = data.KowsarReports ?? [];
        this.updateGridData(3, this.records_report_customer_byrow);
        this.loadingService.hide();
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
    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        minWidth: 250,
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

  customerreportbydate_dialog_show() { this.toggleModal('#customerreportbydate', true); }
  customerreportbydate_dialog_close() { this.toggleModal('#customerreportbydate', false); }

  customerreportbyrow_dialog_show() { this.toggleModal('#customerreportbyrow', true); }
  customerreportbyrow_dialog_close() { this.toggleModal('#customerreportbyrow', false); }

  toggleModal(selector: string, show: boolean) {
    const modal: any = document.querySelector(selector);
    if (!modal) return;

    if (show) {
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade';
      backdrop.id = selector.replace('#', '') + '-backdrop';
      document.body.appendChild(backdrop);

      setTimeout(() => backdrop.classList.add('show'), 10);

      modal.classList.add('show', 'd-block');
      modal.removeAttribute('aria-hidden');
      modal.setAttribute('aria-modal', 'true');
      modal.style.display = 'block';

      backdrop.addEventListener('click', () => this.toggleModal(selector, false));
    } else {
      modal.classList.remove('show');
      setTimeout(() => {
        modal.classList.remove('d-block');
        modal.style.display = 'none';
      }, 150);

      modal.setAttribute('aria-hidden', 'true');
      modal.removeAttribute('aria-modal');

      const backdrop = document.getElementById(selector.replace('#', '') + '-backdrop');
      if (backdrop) {
        backdrop.classList.remove('show');
        setTimeout(() => backdrop.remove(), 150);
      }
    }
  }


}
