import { Component, OnInit, Renderer2 } from '@angular/core';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { FactorWebApiService } from '../../../services/FactorWebApi.service';
import { Router } from '@angular/router';
import { IDatepickerTheme } from 'ng-persian-datepicker';
import { FormControl, FormGroup } from '@angular/forms';
import { CellActionFactorList } from './cell-action-factor-list';

@Component({
  selector: 'app-factor-list',
  templateUrl: './factor-list.component.html',
})
export class FactorListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: FactorWebApiService,
    private renderer: Renderer2

  ) {
    super();
  }

  title = 'فاکتور فروش';
  CentralRef: string = '';
  JobPersonRef: string = '';
  Searchtarget: string = '';
  TextData: string = '';
  BrokerRef: string = '';
  searchTerm: string = '';
  selectedOption: string = '0';



  items: any[] = [];

  start_dateValue = new FormControl();
  End_dateValue = new FormControl();
  loading: boolean = true;

  records;

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#D68E3A',
    selectedText: '#FFFFFF',

  };

  EditForm_factor = new FormGroup({
    StartDateTarget: new FormControl(''),
    EndDateTarget: new FormControl(''),
    SearchTarget: new FormControl(''),
    BrokerRef: new FormControl(''),
    isShopFactor: new FormControl('0'),
    ClassName: new FormControl('Factor'),
    ObjectRef: new FormControl('0'),
  });


  EditForm_factor_property = new FormGroup({
    starttime: new FormControl(''),
    Endtime: new FormControl(''),
    worktime: new FormControl(''),
    Barbary: new FormControl(''),
    ObjectRef: new FormControl('0'),

  });

  submit(action) {
  }

  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = ""
    }
    this.getList()

  }


  override ngOnInit(): void {
    super.ngOnInit();
    if (sessionStorage.getItem("PhAddress3") == '100') {
      this.BrokerRef = ''

    } else {
      this.BrokerRef = sessionStorage.getItem("BrokerCode")

    }

    // this.columnDefs = [
    //   {
    //     field: 'عملیات',
    //     pinned: 'left',
    //     cellRenderer: CellActionFactorList,
    //     cellRendererParams: {
    //       editUrl: '/support/letter-detail',
    //     },
    //     width: 150,
    //   },
    //   {
    //     field: 'FactorDate',
    //     headerName: 'تاریخ فاکتور',
    //     filter: 'agSetColumnFilter',
    //     cellClass: 'text-center',
    //     minWidth: 150,

    //   },
    //   {
    //     field: 'CustomerName',
    //     headerName: 'نام مشتری',
    //     filter: 'agSetColumnFilter',
    //     cellClass: 'text-center',
    //     minWidth: 150
    //   },


    //   {
    //     field: 'BrokerNameWithoutType',
    //     headerName: 'نام پشتیبان',
    //     filter: 'agSetColumnFilter',
    //     cellClass: 'text-center',
    //     minWidth: 150
    //   },
    //   // {
    //   //   field: 'OwnerName',
    //   //   headerName: 'ایجاد کننده',
    //   //   filter: 'agSetColumnFilter',
    //   //   cellClass: 'text-center',
    //   //   minWidth: 150
    //   // },

    //   {
    //     field: 'starttime',
    //     headerName: 'شروع',
    //     filter: 'agSetColumnFilter',
    //     cellClass: 'text-center',
    //     minWidth: 100
    //   }, {
    //     field: 'Endtime',
    //     headerName: 'پایان',
    //     filter: 'agSetColumnFilter',
    //     cellClass: 'text-center',
    //     minWidth: 100
    //   }, {
    //     field: 'worktime',
    //     headerName: 'مدت کار',
    //     filter: 'agSetColumnFilter',
    //     cellClass: 'text-center',
    //     minWidth: 80
    //   }, {
    //     field: 'Barbary',
    //     headerName: 'شرح',
    //     filter: 'agSetColumnFilter',
    //     cellClass: 'text-center',
    //     minWidth: 150
    //   },
    // ];

    this.getList();
    // setTimeout(() => {

    // }, 200);
  }

  getGridSchema() {
    this.repo.GetGridSchema('TFactor').subscribe((data: any) => {
      if (data && data.GridSchemas && data.GridSchemas.length > 0) {
        this.columnDefs = data.GridSchemas.filter(schema => schema.Visible === "True").map(schema => ({
          field: schema.FieldName,
          headerName: schema.Caption,
          cellClass: 'text-center',
          filter: 'agSetColumnFilter',
          sortable: true,
          resizable: true,
          minWidth: parseInt(schema.Width) + 100,
          valueFormatter: schema.Separator === '1' ? this.customNumberFormatter : undefined
        }));

        this.columnDefs.unshift({
          field: 'عملیات',
          pinned: 'left',
          cellRenderer: CellActionFactorList,

          width: 100,
          sortable: false,
          filter: false,
          // resizable: false
        });
      }
      this.EditForm_factor.patchValue({
        BrokerRef: this.BrokerRef,
        isShopFactor: "0",
      });
      this.loading = true

      this.repo.GetWebFactor(this.EditForm_factor.value).subscribe((data: any) => {
        this.records = data.Factors;
        this.loading = false

      });


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



  getList() {

    this.getGridSchema()

    /*


*/

  }





  Edit_factor_Property(FactorCode) {

    this.property_dialog_show()
    this.records.forEach((factor: any) => {

      if (factor.FactorCode == FactorCode) {
        this.EditForm_factor_property.patchValue({
          starttime: factor.starttime,
          Endtime: factor.Endtime,
          worktime: factor.worktime,
          Barbary: factor.Barbary,
          ObjectRef: factor.FactorCode,
        });
      }


    })
  }





  Set_factor_Property() {

    this.repo.EditFactorProperty(this.EditForm_factor_property.value).subscribe((data: any) => {
      this.property_dialog_close()
      this.getList()
      this.EditForm_factor_property.reset()
    });



  }


  property_dialog_show() {
    const modal = this.renderer.selectRootElement('#factorproperty', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  property_dialog_close() {
    const modal = this.renderer.selectRootElement('#factorproperty', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }
  navigateToEdit(id) {
    this.router.navigate(['/factor/factor-edit', id]);
  }
}



