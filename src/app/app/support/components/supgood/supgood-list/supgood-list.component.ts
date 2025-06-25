import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { KowsarWebApiService } from 'src/app/app/kowsar/services/KowsarWebApi.service';
import { CellActionSupGoodList } from './cell-action-supgood-ist';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';

@Component({
  selector: 'app-supgood-list',
  templateUrl: './supgood-list.component.html',
})
export class SupgoodListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: SupportFactorWebApiService,
    private readonly notificationService: NotificationService,

  ) {
    super();
  }


  records;
  title = 'لیست کالاها ';
  dateValue = new FormControl();

  Searchtarget: string = '';

  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = ""
    }
    this.GetGood()
  }


  override ngOnInit(): void {
    super.ngOnInit();

    this.getGridSchema()
    this.GetGood();
  }



  getGridSchema() {



    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionSupGoodList,
        cellRendererParams: {
          editUrl: '/support/supgood-edit',
        },
        width: 100,
      },
      {
        field: 'GoodCode',
        headerName: 'ک کالا',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        headerClass: 'text-center',
        minWidth: 200
      },
      {
        field: 'GoodName',
        headerName: 'نام کالا',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        headerClass: 'text-center',
        minWidth: 200
      },

    ];
  }


  GetGood() {
    this.repo.GetGoodListSupport(this.Searchtarget).subscribe((data: any) => {
      this.records = data.Goods;
    });
  }


  customNumberFormatter(params) {
    if (params.value === null || params.value === undefined) {
      return ''; // اگر مقدار خالی است، چیزی نمایش نده.
    }

    // اطمینان حاصل کن که مقدار یک عدد است
    let value = parseFloat(params.value);
    if (isNaN(value)) {
      return params.value; // اگر مقدار عددی نیست، همان مقدار اولیه را برگردان.
    }

    // فرمت اعداد با کاما برای جداسازی هر سه رقم و حذف صفرهای اضافی در اعشار
    let formattedValue = value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 20 // حداکثر تعداد رقم‌های اعشار را بزرگ بگیر تا هنگام حذف، دقیق باشد.
    });

    // حذف صفرهای اضافی اعشاری اگر لازم باشد
    if (formattedValue.indexOf('.') > -1) {
      formattedValue = formattedValue.replace(/\.?0+$/, '');
    }

    return formattedValue;
  }

}

