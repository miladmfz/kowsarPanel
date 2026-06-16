import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { OrderWebApiService } from 'src/app/features/module/services/OrderWebApi.service';
import { OrderCellActionGoodList } from './order-cell-action-good-ist';
import { AgGridModule } from 'ag-grid-angular';

@Component({
  selector: 'app-order-app-good-list',
  templateUrl: './order-app-good-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    FormsModule
  ],
})
export class OrderAppGoodListComponent extends AgGridBaseComponent
  implements OnInit {

  private readonly repo = inject(OrderWebApiService);

  constructor() {
    super();
  }


  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }




  records = signal<any[]>([])
  title = signal('لیست کالاها ')
  StartDate = new FormControl();
  EndDate = new FormControl();

  Searchtarget = signal('')

  onInputChange() {
    if (this.Searchtarget() == "") {
      this.Searchtarget.set("")
    }
    this.getList()
  }


  ngOnInit(): void {
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });

    this.column_name_1 = [

      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: OrderCellActionGoodList,
        cellRendererParams: {
          editUrl: '/application/order-good-edit',
        },
        minWidth: 80,
      },


      {
        field: 'GoodName',
        headerName: 'نام کالا  ',

        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'MaxSellPrice',
        headerName: 'قیمت',

        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'GoodExplain1',
        headerName: 'گروه',

        cellClass: 'text-center',
        minWidth: 150,

      },

    ];

    this.getList();
  }




  getList() {



    this.repo.GetOrderGoodList("50", this.Searchtarget(), "0")
      .subscribe((data: any) => {
        this.records = data;

      });


  }


}

