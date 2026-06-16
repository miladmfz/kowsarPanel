import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2, signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { OrderWebApiService } from 'src/app/features/module/services/OrderWebApi.service';
import { CellActionOrderCustomer } from './cell-action-order-customer';
import { AgGridModule } from 'ag-grid-angular';

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

  private readonly renderer = inject(Renderer2);

  private readonly repo = inject(OrderWebApiService);


  constructor() {
    super();
  }



  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }



  items = signal<any[]>([])
  Printers = signal<any[]>([])
  BasketColumns = signal<any[]>([])


  id = signal('')

  records_Customer = signal<any[]>([])
  records_Customer_detail = signal<any[]>([])


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
        this.records_Customer.set(e)
      });

  }

  GetDetailCustomer(data) {


    this.repo.GetCustomerlastGood(data.CustomerCode)
      .subscribe(e => {
        this.records_Customer_detail.set(e)
        this.ordercustomer_Modal_Response_show()
      });

  }

  Config_Declare() {

    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionOrderCustomer,
        minWidth: 100,
      },
      {
        field: 'CustomerName',
        headerName: 'نام مشتری',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CustomerBedehkarMandeh',
        headerName: 'مانده حساب',

        cellClass: 'text-center',
        minWidth: 150
      },

    ];


    this.columnDefs2 = [


      {
        field: 'GoodName',
        headerName: 'نام کالا',

        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'Price',
        headerName: 'قیمت',

        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'FactorDate',
        headerName: 'تاریخ فاکتور',

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
