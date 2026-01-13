import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { CellActionInternalGoodList } from './cell-action-internal-good-list';

@Component({
  selector: 'app-internal-good-list',
  templateUrl: './internal-good-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular
  ]
})
export class InternalGoodListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: SupportFactorWebApiService,
  ) {
    super();
  }


  title = 'لیست خدمات';
  records: any[] = [];
  dateValue = new FormControl();

  Searchtarget: string = '';



  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });

    this.getGridSchema();
    this.GetGood();
  }

  getGridSchema() {
    this.columnDefs1 = [
      {
        headerName: 'عملیات',
        pinned: 'left',
        width: 80,
        cellRenderer: CellActionInternalGoodList,
        cellRendererParams: {
          editUrl: '/internal/internal-good-edit'
        }
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


  navigateToEdit(id: any) {
    this.router.navigate(['/internal/internal-good-edit', id]);
  }

  navigateToNew() {
    this.router.navigate(['/internal/internal-good-edit']);
  }


  GetGood() {
    this.repo.GetGoodListSupport(this.Searchtarget)
      .subscribe((data: any) => {
        this.records = data.Goods;
        this.updateGridData(1, this.records);

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
