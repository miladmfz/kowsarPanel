import { Component, OnInit, Renderer2 } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { CustomerWebApiService } from 'src/app/app/support/services/CustomerWebApi.service';
import { CellActionCustomerList } from './cell-action-customer-list';
import { forEachChild } from 'typescript';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: CustomerWebApiService,
    private renderer: Renderer2
  ) {
    super();
  }

  PhAddress3: string = '';

  records;
  title = 'لیست مشتریان کوثر  ';
  Searchtarget: string = '';
  loading: boolean = true;

  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = ""
    }
    this.getList()
  }


  override ngOnInit(): void {
    super.ngOnInit();
    this.PhAddress3 = sessionStorage.getItem("PhAddress3")
    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionCustomerList,
        cellRendererParams: {
          editUrl: '/support/letter-detail',
        },
        width: 150,
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
        field: 'LockNumber',
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

    this.getList();
  }




  getList() {

    this.loading = true
    this.repo.GetKowsarCustomer(this.Searchtarget).subscribe((data: any) => {
      this.records = data.Customers;
      this.loading = false

    });


  }



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




  selected_des: string = ''; // مقدار پیش‌فرض برای نمونه
  selected_value: string = ''; // مقدار پیش‌فرض برای نمونه
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


  Edit_Customer_Property(CustomerCode) {

    this.property_dialog_show()
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

    //// send explian to server

    this.repo.EditCustomerExplain(this.EditForm_explain.value).subscribe((data: any) => {
      this.explain_dialog_close()
      this.getList()
      this.EditForm_explain.reset()
    });



  }



  Set_Customer_Property() {
    //// send Property to server
    this.repo.EditCustomerProperty(this.EditForm_property.value).subscribe((data: any) => {
      this.property_dialog_close()
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




}






