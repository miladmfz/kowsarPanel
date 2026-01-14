import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CellActionInternalGoodList } from 'src/app/features/internal/components/internal-good/internal-good-list/cell-action-internal-good-list';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { GoodWebApiService } from '../../../services/goodWebApi.service';
import { CellActionGoodList } from './cell-action-good-list';

@Component({
  selector: 'app-good-list',
  templateUrl: './good-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    RouterModule
  ],
})
export class GoodListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  constructor(
    private readonly router: Router,
    private repo: GoodWebApiService,
  ) {
    super();
  }


  title = 'لیست خدمات';
  records: any[] = [];
  dateValue = new FormControl();

  Searchtarget: string = '';

  EditForm_Search = new FormGroup({
    SearchTarget: new FormControl(''),
  });

  onInputChange() {
    if (this.Searchtarget === '') {
      this.Searchtarget = '';
    }
    this.GetGood();
  }

  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });

    this.getGridSchema();
    this.GetGood();
  }

  getGridSchema() {
    this.repo.GetGridSchema('TGood')
      .subscribe((data: any) => {
        if (data && data.GridSchemas && data.GridSchemas.length > 0) {
          this.columnDefs1 = data.GridSchemas.filter(schema => schema.Visible === "True").map(schema => ({
            field: schema.FieldName,
            headerName: schema.Caption,
            cellClass: 'text-center',
            filter: 'agSetColumnFilter',
            sortable: true,
            resizable: true,
            minWidth: parseInt(schema.Width) + 100,
            valueFormatter: schema.Separator === '1' ? this.customNumberFormatter : undefined
          }));

          this.columnDefs1.unshift({
            field: 'عملیات',
            pinned: 'left',
            cellRenderer: CellActionGoodList,

            minWidth: 100,
            sortable: false,
            filter: false,
            // resizable: false
          });
        }
        this.GetGood()

      });
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
    this.router.navigate(['/accounting/good-edit', id]);
  }

  navigateToNew() {
    this.router.navigate(['/accounting/good-edit']);
  }


  GetGood() {
    this.repo.GetGoodList()
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
