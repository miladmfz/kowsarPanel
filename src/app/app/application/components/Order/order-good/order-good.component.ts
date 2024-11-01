import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { OrderWebApiService } from '../../../services/OrderWebApi.service';
import { FormControl } from '@angular/forms';
import { OrderCellActionGoodList } from './order-cell-action-good-ist';
import { CellActionAutletterWork } from 'src/app/app/support/components/autletter/autletter-work/cell-action-autletter-work';

@Component({
  selector: 'app-order-good',
  templateUrl: './order-good.component.html',
})
export class OrderGoodComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: OrderWebApiService,
  ) {
    super();
  }



  records;
  title = 'لیست کالاها ';
  StartDate = new FormControl();
  EndDate = new FormControl();

  Searchtarget: string = '';

  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = ""
    }
    this.getList()
  }


  override ngOnInit(): void {
    super.ngOnInit();

    this.columnDefs = [

      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: OrderCellActionGoodList,
        cellRendererParams: {
          editUrl: '/application/order-good-edit',
        },
        width: 80,
      },


      {
        field: 'GoodName',
        headerName: 'نام کالا  ',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'MaxSellPrice',
        headerName: 'قیمت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'GoodExplain1',
        headerName: 'گروه',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },

    ];

    this.getList();
  }




  getList() {


    this.repo.GetOrderGoodList("50", this.Searchtarget, "0").subscribe((data) => {
      this.records = data;

    });


  }


}

