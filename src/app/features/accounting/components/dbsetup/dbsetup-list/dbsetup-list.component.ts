import { Component, inject, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { DbSetupWebApiService } from '../../../services/DbSetupWebApi.service';
import { Router, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CellActionDbSetupList } from './cell-action-dbsetup-list';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';

@Component({
  selector: 'app-dbsetup-list',
  templateUrl: './dbsetup-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    RouterModule
  ],
})
export class DbsetupListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly repo = inject(DbSetupWebApiService);
  private readonly renderer = inject(Renderer2);

  constructor() {
    super();
  }


  title = 'لیست خدمات';
  records: any[] = [];
  dateValue = new FormControl();

  Searchtarget: string = '';

  EditForm_Search = new FormGroup({
    SearchTarget: new FormControl(''),
  });





  EditForm_DbSetup = new FormGroup({
    KeyId: new FormControl(''),
    KeyValue: new FormControl(''),
    DataValue: new FormControl(''),
    Description: new FormControl(''),
    SubSystem: new FormControl(''),
  });

  onInputChange() {
    if (this.Searchtarget === '') {
      this.Searchtarget = '';
    }
    this.GetDbSetup();
  }

  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });

    this.getGridSchema();
    this.GetDbSetup();
  }

  getGridSchema() {
    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionDbSetupList,
        minWidth: 100,
      },

      {
        field: 'KeyId',
        headerName: 'KeyId',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'KeyValue',
        headerName: 'KeyValue',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'DataValue',
        headerName: 'DataValue',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'Description',
        headerName: 'Description',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'SubSystem',
        headerName: 'SubSystem',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
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


  showdbsetup(data: any) {
    this.EditForm_DbSetup.patchValue({
      KeyId: data.KeyId,
      KeyValue: data.KeyValue,
      DataValue: data.DataValue,
      Description: data.Description,
      SubSystem: data.SubSystem,
    });
    this.orderdbsetup_Modal_Response_show()

  }



  GetDbSetup() {
    this.repo.GetDbSetup(this.EditForm_Search.value)
      .subscribe((data: any) => {
        this.records = data.DbSetups;
        this.updateGridData(1, this.records);

      });
  }






  UpdateDbSetup() {
    this.repo.UpdateDbSetup(this.EditForm_DbSetup.value)
      .subscribe((data: any) => {
        this.orderdbsetup_Modal_Response_close()
        this.GetDbSetup()

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


  orderdbsetup_Modal_Response_show() {
    const modal = this.renderer.selectRootElement('#orderdbsetup', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  orderdbsetup_Modal_Response_close() {
    const modal = this.renderer.selectRootElement('#orderdbsetup', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


}
