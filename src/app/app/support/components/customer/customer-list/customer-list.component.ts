import { Component, OnInit, Renderer2, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { CustomerWebApiService } from 'src/app/app/support/services/CustomerWebApi.service';
import { CellActionCustomerList } from './cell-action-customer-list';
import { forEachChild } from 'typescript';
import { FormControl, FormGroup } from '@angular/forms';
import { Subject, Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { CellActionCustomerFactor } from './cell-action-customer-factor';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
@Component({
    selector: 'app-customer-list',
    templateUrl: './customer-list.component.html',
    standalone: false
})
export class CustomerListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: CustomerWebApiService,
    private renderer: Renderer2,
    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }

  PhAddress3: string = '';

  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    BrokerRef: new FormControl(''),
  });
  records;
  records_factor;
  records_support_factorrows;

  title = 'لیست مشتریان کوثر  ';
  loading: boolean = true;
  loading_factor: boolean = true;

  selected_des: string = ''; // مقدار پیش‌فرض برای نمونه
  selected_value: string = ''; // مقدار پیش‌فرض برای نمونه

  Searchtarget: string = '';
  private searchSubject: Subject<string> = new Subject();



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






  ngOnDestroy(): void {
    this.searchSubject.unsubscribe();
    this.themeSub.unsubscribe();
  }



  onInputChange() {

    if (this.Searchtarget == " ") {
      this.Searchtarget = "%"
    }

    this.searchSubject.next(this.Searchtarget);


  }


  override ngOnInit(): void {
    super.ngOnInit();
    this.PhAddress3 = sessionStorage.getItem("PhAddress3")
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionCustomerList,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 250,
      },
      {
        field: 'CustomerCode',
        headerName: 'کد مشتری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CustName_Small',
        headerName: 'نام مشتری  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Manager',
        headerName: 'مدیریت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'پشتیبانی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'AppNumber',
        headerName: 'نسخه نرم افزار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'DatabaseNumber',
        headerName: 'دیتابیس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Delegacy',
        headerName: 'تعداد قفل',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Phone',
        headerName: 'شماره تماس',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Mobile',
        headerName: 'موبایل',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
    ];

    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionCustomerFactor,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 100,
      },
      {
        field: 'FactorDate',
        headerName: 'تاریخ فاکتور',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'BrokerNameWithoutType',
        headerName: 'نام پشتیبان',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Barbary',
        headerName: 'توضیحات',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'starttime',
        headerName: 'شروع',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },
      {
        field: 'Endtime',
        headerName: 'پایان',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },
      {
        field: 'worktime',
        headerName: 'زمان کار',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 70
      },

    ];

    this.columnDefs2 = [

      {
        field: 'GoodName',
        headerName: ' نام آیتم',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },

    ];

    this.searchSubject.pipe(
      debounceTime(1000)  // 1 second debounce time
    ).subscribe(searchText => {

      this.getList();
    });
    this.searchSubject.next(this.Searchtarget);


  }




  getList() {

    this.loading = true

    this.EditForm_SearchTarget.patchValue({
      SearchTarget: this.Searchtarget,
      BrokerRef: sessionStorage.getItem("BrokerCode"),
    });
    this.repo.GetKowsarCustomer(this.EditForm_SearchTarget.value).subscribe((data: any) => {
      this.records = data.Customers;
      this.loading = false

    });


  }




  Edit_Customer_Explain(CustomerCode) {
    this.explain_dialog_show()
    this.records.forEach((customer: any) => {

      if (customer.CustomerCode == CustomerCode) {
        this.EditForm_explain.patchValue({
          Explain: customer.Explain,
          ObjectRef: customer.CustomerCode,
        });
      }


    })
  }


  Factor_Customer_Property(CustomerCode) {

    this.repo.GetCustomerFactor(CustomerCode).subscribe((data: any) => {
      this.records_factor = data.Factors;
      this.loading_factor = false
      this.CustomerFactor_dialog_show()

    });
  }

  GetFactorrows(FactorCode) {
    this.repo.GetWebFactorRowsSupport(FactorCode).subscribe((data: any) => {

      this.records_support_factorrows = data.Factors
      this.CustomerFactorRow_dialog_show()

    });
  }




  Show_Customer_Property(CustomerCode) {

    this.property_dialog_show()
    this.records.forEach((customer: any) => {

      if (customer.CustomerCode == CustomerCode) {

        this.ShowForm_property.patchValue({
          CustName_Small: customer.CustName_Small,

          AppNumber: customer.AppNumber,
          DatabaseNumber: customer.DatabaseNumber,
          LockNumber: customer.LockNumber,
          ObjectRef: customer.CustomerCode,
          Address: customer.Address,
          CityName: customer.CityName,
          OstanName: customer.OstanName,
          Delegacy: customer.Delegacy,
          Manager: customer.Manager,
          Phone: customer.Phone,
          PostCode: customer.PostCode,
          Mobile: customer.Mobile,
          MobileName: customer.MobileName,
          ZipCode: customer.ZipCode,
          Email: customer.Email,
          Fax: customer.Fax,

        });

      }


    })
  }


  Edit_Customer_Property(CustomerCode) {

    this.Edit_property_dialog_show()
    this.records.forEach((customer: any) => {

      if (customer.CustomerCode == CustomerCode) {
        this.EditForm_property.patchValue({
          CustName_Small: customer.CustName_Small,

          AppNumber: customer.AppNumber,
          DatabaseNumber: customer.DatabaseNumber,
          LockNumber: customer.LockNumber,
          ObjectRef: customer.CustomerCode,
          Address: customer.Address,
          CityName: customer.CityName,
          OstanName: customer.OstanName,
          Delegacy: customer.Delegacy,
          Manager: customer.Manager,
          Phone: customer.Phone,
          PostCode: customer.PostCode,
          Mobile: customer.Mobile,
          MobileName: customer.MobileName,
          ZipCode: customer.ZipCode,
          Email: customer.Email,
          Fax: customer.Fax,

        });
      }


    })
  }




  Set_Customer_Explain() {
    this.repo.EditCustomerExplain(this.EditForm_explain.value).subscribe((data: any) => {
      this.explain_dialog_close()
      this.getList()
      this.EditForm_explain.reset()
    });
  }



  Set_Customer_Property() {
    this.repo.EditCustomerProperty(this.EditForm_property.value).subscribe((data: any) => {
      this.Edit_property_dialog_close()
      this.getList()
      this.EditForm_property.reset()
    });
  }




  explain_dialog_show() {
    const modal = this.renderer.selectRootElement('#customerexplain', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  explain_dialog_close() {
    const modal = this.renderer.selectRootElement('#customerexplain', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  property_dialog_show() {
    const modal = this.renderer.selectRootElement('#customerproperty', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  property_dialog_close() {
    const modal = this.renderer.selectRootElement('#customerproperty', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  Edit_property_dialog_show() {
    const modal = this.renderer.selectRootElement('#editcustomerproperty', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  Edit_property_dialog_close() {
    const modal = this.renderer.selectRootElement('#editcustomerproperty', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  CustomerFactor_dialog_show() {
    const modal = this.renderer.selectRootElement('#customerfactor', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  CustomerFactor_dialog_close() {
    const modal = this.renderer.selectRootElement('#customerfactor', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


  CustomerFactorRow_dialog_show() {
    const modal = this.renderer.selectRootElement('#customerfactorrow', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  CustomerFactorRow_dialog_close() {
    const modal = this.renderer.selectRootElement('#customerfactorrow', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }





}






