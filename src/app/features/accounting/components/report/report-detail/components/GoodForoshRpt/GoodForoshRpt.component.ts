import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { catchError, of } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarChartAreaComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-area/kowsar-chart-area.component';
import { KowsarChartBarComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-bar/kowsar-chart-bar.component';
import { KowsarChartColumnComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-column/kowsar-chart-column.component';
import { KowsarChartDonutComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-donut/kowsar-chart-donut.component';
import { KowsarChartLineComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-line/kowsar-chart-line.component';
import { KowsarChartPieComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-chart-pie/kowsar-chart-pie.component';
import { KowsarNumberService } from 'src/app/app-shell/framework-services/kowsar-number.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/ReportWebApi.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    NgPersianDatepickerModule,
    KowsarChartColumnComponent,

    // KowsarChartLineComponent,
    // KowsarChartAreaComponent,
    // KowsarChartBarComponent,
    // KowsarChartDonutComponent,
    // KowsarChartPieComponent,
  ],
  selector: 'app-GoodForoshRpt',
  templateUrl: './GoodForoshRpt.component.html',
})
export class GoodForoshRptComponent extends AgGridBaseComponent implements OnInit, OnDestroy {

  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(ReportWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notificationService = inject(NotificationService);
  private readonly kowsarNumber = inject(KowsarNumberService);

  private readonly renderer = inject(Renderer2);

  constructor() {
    super();
  }

  @Input() ReportData: any;

  records: any[] = [];
  records_Stack: any[] = [];
  records_GridSchema: any[] = [];

  columnChartData: any
  columnChartCategories: any



  GroupBy_show: boolean = false;
  show_report_list: boolean = true;


  modal_title = '';
  lable_report_view = 'نمایش به صورت چارتی';
  title = 'Sample title';

  ReportCode: string = '';

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#0066cc',
    selectedText: '#ffffff',
  };


  // vwGood  , GoodPrivateCode
  // vwGoodBasicMainCode ,GoodMainCode

  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl(''),
    ObjectRef: new FormControl('0'),
    ReportCode: new FormControl(''),
    ReportTitle: new FormControl(''),
    StackName: new FormControl(''),

    FromDate: new FormControl(''),
    ToDate: new FormControl(''),

    FromTime: new FormControl('00:00'),
    ToTime: new FormControl('23:59'),
    StackRef: new FormControl('0'),
    GoodTableName: new FormControl('vwGood'),
    GoodFieldName: new FormControl('GoodPrivateCode'),
    DamagedGoodsStackCode: new FormControl('2'),
    GroupByField: new FormControl(''),
    GroupByField_Name: new FormControl(''),

    withGoodMain: new FormControl('0'),
    withGroupBy: new FormControl('0'),

    ClassName: new FormControl(''),
    Department: new FormControl(''),
    WhereCluase: new FormControl(''),
    OrderBy: new FormControl(''),
    Column: new FormControl(''),

  });




  selectedRows: any[] = [];

  onSelectionChanged(event: any) {
    this.selectedRows = event.api.getSelectedRows();
  }

  togget_report_view() {
    if (this.show_report_list) {
      this.show_report_list = false
      this.lable_report_view = 'نمایش به صورت لیستی'
      this.columnChartData = []
      this.columnChartCategories = []

      this.columnChartData = [
        {
          name: 'تعداد',
          data: this.records.map(item => parseInt(item.Amount, 10)).slice(0, 10)
        },
        {
          name: 'خالص',
          data: this.records.map(item => parseInt(item.Price, 10)).slice(0, 10)
        },
        {
          name: 'نا خالص',
          data: this.records.map(item => parseInt(item.nPrice, 10)).slice(0, 10)
        },
        {
          name: 'مبلغ تخفیف',
          data: this.records.map(item => parseInt(item.MablaghTakhfif, 10)).slice(0, 10)
        },

        {
          name: 'تعداد مرجوعی',
          data: this.records.map(item => parseInt(item.RAmount, 10)).slice(0, 10)
        },
        {
          name: 'خالص مرجوعی',
          data: this.records.map(item => parseInt(item.RPrice, 10)).slice(0, 10)
        },
        {
          name: 'موجودی انبار',
          data: this.records.map(item => parseInt(item.TotalAvailable, 10)).slice(0, 10)
        },



      ];


      if (this.EditForm_SearchTarget.value.withGroupBy == "0") {
        this.columnChartCategories = this.records.map(item => item.GoodName).slice(0, 10);;

      } else {
        const fieldName = this.EditForm_SearchTarget.value.GroupByField;

        this.columnChartCategories = this.records.map(item => item[fieldName]).slice(0, 10);

      }


    } else {
      this.show_report_list = true
      this.lable_report_view = 'نمایش به صورت چارتی'


    }

  }

  select_withGoodMain() {
    if (this.EditForm_SearchTarget.value.withGoodMain == "0") {
      this.EditForm_SearchTarget.patchValue({
        GoodTableName: "vwGood",
        GoodFieldName: "GoodPrivateCode",
      });
    } else {
      this.EditForm_SearchTarget.patchValue({
        GoodTableName: "vwGoodBasicMainCode",
        GoodFieldName: "GoodMainCode",
      });
    }

  }


  select_withGroupBy() {
    if (this.EditForm_SearchTarget.value.withGroupBy == "0") {

      this.GroupBy_show = false
      this.EditForm_SearchTarget.patchValue({
        GroupByField: "",
        GroupByField_Name: "",
      });

    } else {
      this.GroupBy_show = true

      this.EditForm_SearchTarget.patchValue({
        GroupByField: "",
        GroupByField_Name: "",
      });
    }

  }

  AddStack() {
    this.LoadData_GetStacks()

  }

  LoadData_GetStacks() {

    // Initial data fetch
    this.loadingService.show()
    this.repo.GetStacks().subscribe((data: any) => {
      this.loadingService.hide()

      this.records_Stack = data.Stacks
      this.updateGridData(5, this.records_Stack);

      this.stack_dialog_show()
    });

  }

  ngOnInit(): void {

    this.title = this.ReportData.ReportTitle

    this.EditForm_SearchTarget.patchValue({
      ReportCode: this.ReportData.ReportCode,
      ReportTitle: this.ReportData.ReportTitle,
      ClassName: this.ReportData.ReportForm,
    });



    this.initColumns();
    //this.loadList();
  }

  SetStack() {


    this.EditForm_SearchTarget.patchValue({
      StackName: this.selectedRows[0].Name,
      StackRef: this.selectedRows[0].StackCode,
    });

    this.stack_dialog_close()

  }

  // #region Func
  getDataPath_stack = (task: any): string[] => {
    const pathstack: string[] = [];
    let current = task;

    while (current) {
      pathstack.unshift(current.Name);
      if (current.StackRef === 0) break;
      current = this.records_Stack.find(t => t.StackCode === current.StackRef);
    }

    return pathstack;
  };

  customNumberFormatter1(params: any) {
    if (params.value === null || params.value === undefined) return '';

    // ۱) تبدیل به رشته
    const raw = String(params.value).trim();
    if (!raw) return '';

    // ۲) تبدیل ارقام فارسی/عربی به لاتین
    const normalizeDigits = (s: string) =>
      s
        // فارسی ۰-۹
        .replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)])
        // عربی ٠-٩
        .replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);

    const normalized = normalizeDigits(raw);

    // ۳) حذف هرچیزی غیر از عدد، نقطه، منفی ( / , فاصله و ... )
    // مثال: "550000/000" → "550000000"
    const cleaned = normalized.replace(/[^0-9.-]/g, '');

    if (!cleaned) return raw;

    const num = Number(cleaned);
    if (isNaN(num)) return raw;

    // ۴) جداکردن بخش صحیح و اعشار
    const parts = num.toString().split('.');
    const intPart = parts[0];
    let decPart = parts[1] || '';

    // ۵) جداکننده سه‌رقمی (فعلاً با کامای انگلیسی)
    const intWithSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // ۶) حذف صفرهای اضافی اعشار
    if (decPart) {
      decPart = decPart.replace(/0+$/, '');
    }

    // ۷) تبدیل رقم‌های لاتین به فارسی
    const toPersianDigits = (s: string) =>
      s.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

    let result: string;

    if (!decPart) {
      result = toPersianDigits(intWithSep); // فقط صحیح
    } else {
      // ممیز فارسی (٫)
      result = toPersianDigits(intWithSep) + '٫' + toPersianDigits(decPart);
    }


    return result;
  }

  onSortChanged(index: number) {
    const api = (this as any)[`gridApi${index}`];
    if (!api) return;

    const ordered: any[] = [];
    api.forEachNodeAfterFilterAndSort((node: any) => ordered.push(node.data));

    if (index === 1) {
      this.records = ordered;
    } else if (index === 5) {
      this.records_Stack = ordered;
    }

    this.updateGridData(index, ordered);
  }

  onSortChangedForMainGrid() {
    const api = (this as any).gridApi1;
    if (!api) return;

    const ordered: any[] = [];

    api.forEachNodeAfterFilterAndSort((node: any) => {
      ordered.push(node.data);
    });

    // آرایه‌ای که خودت استفاده می‌کنی
    this.records = ordered;

    // اگر لازم باشه خود گرید رو هم با همون داده آپدیت کنی:
    this.updateGridData(1, this.records);

  }




  private initColumns(): void {

    this.loadingService.show()

    this.loadingService.show()
    this.repo.GetGridSchema('T' + this.ReportData.ReportForm)
      .pipe(
        catchError((_error) => {
          this.loadingService.hide()
          return of(null);
        })
      )
      .subscribe((data: any) => {
        this.loadingService.hide()

        if (data?.GridSchemas?.length > 0) {

          this.columnDefs1 = data.GridSchemas
            .filter((schema: any) => schema.Visible === 'True')
            .map((schema: any) => {

              // ستون عددی؟ (بر اساس Separator)
              const isNumeric =
                schema.Separator === 'True' ||
                schema.Separator === 'true' ||
                schema.Separator === '1' ||
                schema.Separator === 1 ||
                schema.Separator === true;

              const col: any = {
                field: schema.FieldName,
                headerName: schema.Caption,
                cellClass: 'text-center',
                sortable: true,
                resizable: true,
                minWidth: parseInt(schema.Width, 10),
                filter: isNumeric ? 'agNumberColumnFilter' : 'agSetColumnFilter',
              };

              if (isNumeric) {
                // ۱) نمایش عددی (۳ رقمی + فارسی) — فقط اگر واقعاً عدد باشد
                col.valueFormatter = (p: any) =>
                  this.kowsarNumber.formatKowsarNumber(p.value);

                // ۲) سورت عددی واقعی، نه رشته‌ای
                col.comparator = (valueA: any, valueB: any) =>
                  this.kowsarNumber.compareKowsarValues(valueA, valueB);
              }

              return col;
            });

        }


        this.loadingService.hide()



        //this.loadList()

      });


    this.loadingService.show()
    this.repo.GetGridSchemaAll('TGood')
      .pipe(
        catchError((_error) => {
          this.loadingService.hide()
          return of(null);
        })
      )
      .subscribe((data: any) => {
        this.loadingService.hide()

        this.records_GridSchema = data?.GridSchemas ?? [];



      });


  }







  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch { }
    }, 50);
  }



  loadList(): void {

    this.loadingService.show()

    this.loadingService.show()
    this.repo.GoodForoshRpt(this.EditForm_SearchTarget.value)
      .subscribe((data: any) => {
        this.loadingService.hide()

        this.records = data?.Reports || [];

        this.updateGridData(1, this.records);
        this.loadingService.hide()



      });




  }

  clearFilter(): void {

    // this.EditForm_SearchTarget.patchValue({
    //   SearchTarget: "",
    //   CentralRef: "",
    //   CreationDate: "",
    //   OwnCentralRef: "",
    //   PersonInfoCode: "",
    //   OwnerPersonInfoRef: "",
    //   StartTime: "",
    //   EndTime: "",
    //   SelectedOption: "0",
    // });
    // this.loadList()
  }



  stack_dialog_show() {
    const modal = this.renderer.selectRootElement('#stacklist', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  stack_dialog_close() {
    const modal = this.renderer.selectRootElement('#stacklist', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

}
