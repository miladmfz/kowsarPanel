import { Component, OnInit, Renderer2 } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { OrderWebApiService } from '../../../services/OrderWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { FormBuilder } from '@angular/forms';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { CellActionOrderCustomer } from './cell-action-order-customer';

@Component({
  selector: 'app-order-customer',
  templateUrl: './order-customer.component.html',
})
export class OrderCustomerComponent extends AgGridBaseComponent
  implements OnInit {



  constructor(
    private readonly router: Router,
    private renderer: Renderer2,
    private route: ActivatedRoute,

    private fb: FormBuilder,
    private repo: OrderWebApiService,
    private sharedService: SharedService,
    private readonly notificationService: NotificationService,

  ) { super(); }


  items: any = [];
  Printers: any = [];
  BasketColumns: any = [];


  id: string = "";

  records_Customer
  records_Customer_detail


  override ngOnInit(): void {
    super.ngOnInit();
    this.Config_Declare()

    this.GetCustomer();

  }

  GetCustomer() {

    this.repo.GetCustomerMandeh().subscribe(e => {
      this.records_Customer = e;
    });

  }

  GetDetailCustomer(data) {

    this.repo.GetCustomerlastGood(data.CustomerCode).subscribe(e => {
      this.records_Customer_detail = e;
      this.ordercustomer_Modal_Response_show()
    });

  }

  Config_Declare() {

    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionOrderCustomer,

        width: 100,
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


    this.columnDefs1 = [


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
