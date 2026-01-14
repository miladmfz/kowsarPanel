import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { OrderWebApiService } from 'src/app/features/module/services/OrderWebApi.service';
import { CellActionOrderCustomer } from './cell-action-order-customer';
import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';

@Component({
  selector: 'app-order-app-customer',
  templateUrl: './order-app-customer.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
  ],
})
export class OrderAppCustomerComponent extends AgGridBaseComponent
  implements OnInit {



  constructor(
    private readonly router: Router,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private repo: OrderWebApiService,
    private sharedService: SharedService,
    private readonly notificationService: NotificationService,

  ) {
    super();
  }



  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }



  items: any = [];
  Printers: any = [];
  BasketColumns: any = [];


  id: string = "";

  records_Customer
  records_Customer_detail


  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.Config_Declare()

    this.GetCustomer();

  }

  GetCustomer() {

    this.repo.GetCustomerMandeh()
      .subscribe(e => {
        this.records_Customer = e;
      });

  }

  GetDetailCustomer(data) {

    this.repo.GetCustomerlastGood(data.CustomerCode)
      .subscribe(e => {
        this.records_Customer_detail = e;
        this.ordercustomer_Modal_Response_show()
      });

  }

  Config_Declare() {

    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionOrderCustomer,
        minWidth: 100,
      },
      {
        field: 'CustomerName',
        headerName: 'نام مشتری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CustomerBedehkarMandeh',
        headerName: 'مانده حساب',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];


    this.columnDefs2 = [


      {
        field: 'GoodName',
        headerName: 'نام کالا',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'Price',
        headerName: 'قیمت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'FactorDate',
        headerName: 'تاریخ فاکتور',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },
    ];



  }



  ordercustomer_Modal_Response_show() {
    const modal = this.renderer.selectRootElement('#ordercustomer', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  ordercustomer_Modal_Response_close() {
    const modal = this.renderer.selectRootElement('#ordercustomer', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



}
