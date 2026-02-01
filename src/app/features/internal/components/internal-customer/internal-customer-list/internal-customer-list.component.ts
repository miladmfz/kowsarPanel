import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { AgGridModule } from 'ag-grid-angular';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { CellActionCustomerList } from './../internal-customer-list/cell-action-customer-list';
import { CellActionCustomerFactor } from './../internal-customer-list/cell-action-customer-factor';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { CustomerWebApiService } from '../../../services/CustomerWebApi.service';
// اگر rendererهای اختصاصی داری می‌تونی بعداً جایگزین کنی
// import { CellActionCustomerList } from './cell-action-customer-list';
// import { CellActionCustomerFactor } from './cell-action-customer-factor';

@Component({
  selector: 'app-internal-customer-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AgGridModule],
  templateUrl: './internal-customer-list.component.html',
})
export class InternalCustomerListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  title = 'مشتریان داخلی کوثر';

  // دیتاها
  records: any[] = [];
  records_factor: any[] = [];
  records_support_factorrows: any[] = [];

  // لودینگ‌ها
  loading = false;
  loading_factor = false;

  // جستجو
  Searchtarget = '';
  private searchSubject = new Subject<string>();

  // فرم‌های صفحه
  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    BrokerRef: new FormControl(''),
  });

  // فرم‌های مودال‌ها
  EditForm_explain = new FormGroup({
    Explain: new FormControl(''),
    ObjectRef: new FormControl('0'),
  });

  EditForm_property = new FormGroup({
    CustName_Small: new FormControl(''),
    AppNumber: new FormControl(''),
    DatabaseNumber: new FormControl(''),
    LockNumber: new FormControl(''),
    Address: new FormControl(''),
    Explain: new FormControl(''),
    CityName: new FormControl(''),
    OstanName: new FormControl(''),
    Delegacy: new FormControl(''),
    Manager: new FormControl(''),
    Phone: new FormControl(''),
    PostCode: new FormControl(''),
    Mobile: new FormControl(''),
    MobileName: new FormControl(''),
    ZipCode: new FormControl(''),
    Email: new FormControl(''),
    Fax: new FormControl(''),
    ObjectRef: new FormControl('0'),
  });

  ShowForm_property = new FormGroup({
    CustName_Small: new FormControl(''),
    AppNumber: new FormControl(''),
    DatabaseNumber: new FormControl(''),
    LockNumber: new FormControl(''),
    Address: new FormControl(''),
    CityName: new FormControl(''),
    OstanName: new FormControl(''),
    Delegacy: new FormControl(''),
    Manager: new FormControl(''),
    Phone: new FormControl(''),
    PostCode: new FormControl(''),
    Mobile: new FormControl(''),
    MobileName: new FormControl(''),
    ZipCode: new FormControl(''),
    Email: new FormControl(''),
    Fax: new FormControl(''),
    ObjectRef: new FormControl('0'),
  });

  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(CustomerWebApiService);

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
        minWidth: 300,
        cellRenderer: CellActionCustomerList
      },

      { field: 'CustomerCode', headerName: 'کد مشتری', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 130 },
      { field: 'CustName_Small', headerName: 'نام مشتری', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 180 },
      { field: 'Manager', headerName: 'مدیریت', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 140 },
      { field: 'Explain', headerName: 'پشتیبانی', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 160 },
      { field: 'AppNumber', headerName: 'نسخه نرم‌افزار', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 130 },
      { field: 'DatabaseNumber', headerName: 'دیتابیس', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 110 },
      { field: 'Delegacy', headerName: 'تعداد قفل', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 110 },
      { field: 'Phone', headerName: 'شماره تماس', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 130 },
      { field: 'Mobile', headerName: 'موبایل', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 130 },
    ];



    // --- ستون‌های فهرست فاکتورها ---
    this.columnDefs2 = [
      {
        headerName: 'عملیات',
        pinned: 'left',
        minWidth: 150,
        cellRenderer: CellActionCustomerFactor
      },
      { field: 'FactorDate', headerName: 'تاریخ فاکتور', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 130 },
      { field: 'BrokerNameWithoutType', headerName: 'نام پشتیبان', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 140 },
      { field: 'Barbary', headerName: 'توضیحات', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 160 },
      { field: 'starttime', headerName: 'شروع', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 80 },
      { field: 'Endtime', headerName: 'پایان', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 80 },
      { field: 'worktime', headerName: 'زمان کار', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 90 },
    ];



    // --- ستون‌های ردیف‌های فاکتور ---
    this.columnDefs3 = [
      { field: 'GoodName', headerName: 'نام آیتم', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 180 },
      { field: 'Qty', headerName: 'تعداد', cellClass: 'text-center', minWidth: 90 },
      { field: 'Price', headerName: 'فی', cellClass: 'text-center', minWidth: 120 },
      { field: 'SumPrice', headerName: 'مبلغ', cellClass: 'text-center', minWidth: 140 },
    ];



    // --- دریافت مقدار اولیه بروکر ---
    this.EditForm_SearchTarget.patchValue({
      BrokerRef: sessionStorage.getItem("BrokerCode"),
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
    this.loadingService.show()
    this.loadingService.show()
    this.repo.GetKowsarCustomer(this.EditForm_SearchTarget.value).subscribe({
      next: (data: any) => {
        this.loadingService.hide()


        this.records = data?.Customers ?? [];
        this.updateGridData(1, this.records);
        this.gridApi1?.sizeColumnsToFit?.();

        if (this.gridApi1) {
          this.updateGridData(1, this.records);
          this.gridApi1.sizeColumnsToFit();
        }
      },
      error: () => (this.loading = false),
    });
  }


  // ---------------------------
  // Property (Show / Edit)
  // ---------------------------

  NavigateToEdit(id: any) {
    this.router.navigate(['/internal/internal-customer-edit', id]);
  }



  Show_Customer_Property(CustomerCode: any) {
    const c = this.records.find(r => r.CustomerCode === CustomerCode);
    if (!c) return;
    this.ShowForm_property.patchValue(this.pickCustomerFields(c));
    this.property_dialog_show();
  }

  Edit_Customer_Property_Explain(CustomerCode: any) {

    console.log(CustomerCode)
    const c = this.records.find(r => r.CustomerCode === CustomerCode);
    if (!c) return;

    this.EditForm_property.patchValue(this.pickCustomerFields(c));
    this.EditForm_property.patchValue({
      Explain: c.Explain ?? '',
      ObjectRef: c.CustomerCode ?? '0',
    });
    this.Edit_property_dialog_show();
  }


  Set_Customer_Property_Explain() {
    this.loadingService.show()
    this.repo.EditCustomerProperty(this.EditForm_property.value).subscribe(() => {
      this.Edit_property_dialog_close();
      this.getList();
      this.EditForm_property.reset();
    });
  }

  private pickCustomerFields(c: any) {
    return {
      CustName_Small: c.CustName_Small ?? '',
      AppNumber: c.AppNumber ?? '',
      DatabaseNumber: c.DatabaseNumber ?? '',
      LockNumber: c.LockNumber ?? '',
      ObjectRef: c.CustomerCode ?? '0',
      Address: c.Address ?? '',
      CityName: c.CityName ?? '',
      OstanName: c.OstanName ?? '',
      Delegacy: c.Delegacy ?? '',
      Manager: c.Manager ?? '',
      Phone: c.Phone ?? '',
      PostCode: c.PostCode ?? '',
      Mobile: c.Mobile ?? '',
      MobileName: c.MobileName ?? '',
      ZipCode: c.ZipCode ?? '',
      Email: c.Email ?? '',
      Fax: c.Fax ?? '',
    };
  }

  // ---------------------------
  // Factors / Support
  // ---------------------------
  Factor_Customer_Property(CustomerCode: any) {
    this.loading_factor = true;
    this.loadingService.show()
    this.repo.GetCustomerFactor(CustomerCode).subscribe((data: any) => {
      this.loadingService.hide()
      this.records_factor = data?.Factors ?? [];
      this.loading_factor = false;
      this.CustomerFactor_dialog_show();
      this.updateGridData(2, this.records_factor);
      this.gridApi2?.sizeColumnsToFit?.();
    });
  }

  GetFactorrows(FactorCode: any) {
    this.loadingService.show()
    this.repo.GetWebFactorRowsSupport(FactorCode).subscribe((data: any) => {
      this.loadingService.hide()
      this.records_support_factorrows = data?.Factors ?? [];
      this.CustomerFactorRow_dialog_show();
      this.updateGridData(3, this.records_support_factorrows);
      this.gridApi3?.sizeColumnsToFit?.();
    });
  }

  // ---------------------------
  // Modals (نمایش/بستن)
  // ---------------------------

  property_dialog_show() { this.toggleModal('#customerproperty', true); }
  property_dialog_close() { this.toggleModal('#customerproperty', false); }

  Edit_property_dialog_show() { this.toggleModal('#editcustomerproperty', true); }
  Edit_property_dialog_close() { this.toggleModal('#editcustomerproperty', false); }

  CustomerFactor_dialog_show() { this.toggleModal('#customerfactor', true); }
  CustomerFactor_dialog_close() { this.toggleModal('#customerfactor', false); }

  CustomerFactorRow_dialog_show() { this.toggleModal('#customerfactorrow', true); }
  CustomerFactorRow_dialog_close() { this.toggleModal('#customerfactorrow', false); }


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
