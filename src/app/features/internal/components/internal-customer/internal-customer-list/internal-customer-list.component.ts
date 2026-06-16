import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Subject, debounceTime } from 'rxjs';
import { AgGridModule } from 'ag-grid-angular';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { CellActionCustomerList } from './../internal-customer-list/cell-action-customer-list';
import { CellActionCustomerFactor } from './../internal-customer-list/cell-action-customer-factor';
import { CustomerWebApiService } from '../../../services/CustomerWebApi.service';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';


@Component({
  selector: 'app-internal-customer-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, AgGridModule],
  templateUrl: './internal-customer-list.component.html',
})
export class InternalCustomerListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  title = signal('مشتریان داخلی کوثر')
  // دیتاها
  records = signal<any[]>([])
  records_factor = signal<any[]>([])
  records_support_factorrows = signal<any[]>([])
  private readonly renderer = inject(Renderer2);

  // لودینگ‌ها
  loading = signal(false)
  loading_factor = signal(false)

  // جستجو

  Searchtarget = signal('')
  private searchSubject = new Subject<string>();

  Active_Lookup: Base_Lookup[] = [

    { id: "4", name: "همه" },
    { id: "0", name: "فعال" },
    { id: "1", name: "نيمه فعال" },
    { id: "2", name: "غير فعال" },
  ]

  // فرم‌های صفحه
  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    Active: new FormControl('4'),
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
  private readonly repo = inject(CustomerWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);

  protected readonly permissionService = inject(PermissionService);
  protected readonly session = inject(SessionStorageService);

  constructor() {
    super();
  }

  // ---------------------------
  // Lifecycle
  // ---------------------------
  ngOnInit(): void {



    // --- ستون‌های گرید اصلی مشتریان ---
    this.column_name_1 = [
      {
        headerName: 'عملیات',
        pinned: 'left',
        minWidth: 300,
        cellRenderer: CellActionCustomerList
      },

      { field: 'CustomerCode', headerName: 'کد مشتری', cellClass: 'text-center', minWidth: 130 },
      { field: 'CustName_Small', headerName: 'نام مشتری', cellClass: 'text-center', minWidth: 180 },
      { field: 'Manager', headerName: 'مدیریت', cellClass: 'text-center', minWidth: 140 },
      { field: 'Explain', headerName: 'پشتیبانی', cellClass: 'text-center', minWidth: 160 },
      { field: 'AppNumber', headerName: 'نسخه نرم‌افزار', cellClass: 'text-center', minWidth: 130 },
      { field: 'DatabaseNumber', headerName: 'دیتابیس', cellClass: 'text-center', minWidth: 110 },
      { field: 'Delegacy', headerName: 'تعداد قفل', cellClass: 'text-center', minWidth: 110 },
      { field: 'Phone', headerName: 'شماره تماس', cellClass: 'text-center', minWidth: 130 },
      { field: 'Mobile', headerName: 'موبایل', cellClass: 'text-center', minWidth: 130 },
    ];



    // --- ستون‌های فهرست فاکتورها ---
    this.columnDefs2 = [
      {
        headerName: 'عملیات',
        pinned: 'left',
        minWidth: 150,
        cellRenderer: CellActionCustomerFactor
      },
      { field: 'FactorDate', headerName: 'تاریخ فاکتور', cellClass: 'text-center', minWidth: 130 },
      { field: 'BrokerNameWithoutType', headerName: 'نام پشتیبان', cellClass: 'text-center', minWidth: 140 },
      { field: 'Barbary', headerName: 'توضیحات', cellClass: 'text-center', minWidth: 160 },
      { field: 'starttime', headerName: 'شروع', cellClass: 'text-center', minWidth: 80 },
      { field: 'Endtime', headerName: 'پایان', cellClass: 'text-center', minWidth: 80 },
      { field: 'worktime', headerName: 'زمان کار', cellClass: 'text-center', minWidth: 90 },
    ];



    // --- ستون‌های ردیف‌های فاکتور ---
    this.columnDefs3 = [
      { field: 'GoodName', headerName: 'نام آیتم', cellClass: 'text-center', minWidth: 180 },
      { field: 'Qty', headerName: 'تعداد', cellClass: 'text-center', minWidth: 90 },
      { field: 'Price', headerName: 'فی', cellClass: 'text-center', minWidth: 120 },
      { field: 'SumPrice', headerName: 'مبلغ', cellClass: 'text-center', minWidth: 140 },
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

  onActiveChange() {
    this.getList()
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


    this.base_repo.GetKowsarCustomer(this.EditForm_SearchTarget.value).subscribe({
      next: (data: any) => {



        this.records.set(data?.Customers ?? [])
        this.updateGridData(1, this.records());
        this.gridApi1?.sizeColumnsToFit?.();

        if (this.gridApi1) {
          this.updateGridData(1, this.records());
          this.gridApi1.sizeColumnsToFit();
        }
      },
      error: () => (this.loading.set(false)),
    });
  }


  // ---------------------------
  // Property (Show / Edit)
  // ---------------------------

  NavigateToEdit(id: any) {
    this.router.navigate(['/internal/internal-customer-edit', id]);
  }



  Show_Customer_Property(CustomerCode: any) {
    const c = this.records().find(r => r.CustomerCode === CustomerCode);
    if (!c) return;
    this.ShowForm_property.patchValue(this.pickCustomerFields(c));
    this.property_dialog_show();
  }

  Edit_Customer_Property_Explain(CustomerCode: any) {

    const c = this.records().find(r => r.CustomerCode === CustomerCode);
    if (!c) return;

    this.EditForm_property.patchValue(this.pickCustomerFields(c));
    this.EditForm_property.patchValue({
      Explain: c.Explain ?? '',
      ObjectRef: c.CustomerCode ?? '0',
    });
    this.Edit_property_dialog_show();
  }


  Set_Customer_Property_Explain() {

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
    this.loading_factor.set(true)

    this.repo.GetCustomerFactor(CustomerCode).subscribe((data: any) => {

      this.records_factor.set(data?.Factors ?? [])
      this.loading_factor.set(false)
      this.CustomerFactor_dialog_show();
      this.updateGridData(2, this.records_factor());
      this.gridApi2?.sizeColumnsToFit?.();
    });
  }

  GetFactorrows(FactorCode: any) {

    this.repo.GetWebFactorRowsSupport(FactorCode).subscribe((data: any) => {

      this.records_support_factorrows.set(data?.Factors ?? [])
      this.CustomerFactorRow_dialog_show();
      this.updateGridData(3, this.records_support_factorrows());
      this.gridApi3?.sizeColumnsToFit?.();
    });
  }

  // ---------------------------
  // Modals (نمایش/بستن)
  // ---------------------------
  @ViewChild('customerproperty', { static: false }) customerproperty!: ElementRef<HTMLDivElement>;
  @ViewChild('editcustomerproperty', { static: false }) editcustomerproperty!: ElementRef<HTMLDivElement>;
  @ViewChild('customerfactor', { static: false }) customerfactor!: ElementRef<HTMLDivElement>;
  @ViewChild('customerfactorrow', { static: false }) customerfactorrow!: ElementRef<HTMLDivElement>;


  property_dialog_show(): void {
    const modal = this.customerproperty?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  property_dialog_close(): void {
    const modal = this.customerproperty?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }




  Edit_property_dialog_show(): void {
    const modal = this.editcustomerproperty?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  Edit_property_dialog_close(): void {
    const modal = this.editcustomerproperty?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }





  CustomerFactor_dialog_show(): void {
    const modal = this.customerfactor?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  CustomerFactor_dialog_close(): void {
    const modal = this.customerfactor?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  CustomerFactorRow_dialog_show(): void {
    const modal = this.customerfactorrow?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  CustomerFactorRow_dialog_close(): void {
    const modal = this.customerfactorrow?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }





}
