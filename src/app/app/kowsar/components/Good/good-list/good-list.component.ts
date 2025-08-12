import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { KowsarWebApiService } from '../../../services/KowsarWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { FormControl } from '@angular/forms';
import { CellActionGoodList } from './cell-action-good-ist';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-good-list',
  templateUrl: './good-list.component.html',
})
export class GoodListComponent extends AgGridBaseComponent
  implements OnInit {

  constructor(
    private readonly router: Router,
    private repo: KowsarWebApiService,
    private readonly notificationService: NotificationService,

    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }
  ngOnDestroy() {

    this.themeSub.unsubscribe();

  }

  records;
  title = 'لیست کالاها ';
  dateValue = new FormControl();

  Searchtarget: string = '';

  onInputChange() {
    if (this.Searchtarget == "") {
      this.Searchtarget = ""
    }
    this.getList()
  }


  override ngOnInit(): void {
    super.ngOnInit();
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.getGridSchema()
  }

  getList() {

    this.repo.GetGoods(this.Searchtarget).subscribe((data: any) => {
      this.records = data.Goods;
    });

  }

  getGridSchema() {
    this.repo.GetGridSchema('TGood').subscribe((data: any) => {
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
          cellRenderer: CellActionGoodList,
          cellRendererParams: {
            editUrl: '/kowsar/good-edit',
          },
          width: 100,
          sortable: false,
          filter: false,
          // resizable: false
        });
      }
      this.getList()

    });
  }


  navigateToEdit(id) {
    this.router.navigate(['/kowsar/good-edit', id]);
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










































/*

implements OnInit {

constructor(
  private repo: KowsarWebApiService,
  private route: ActivatedRoute,

) { }

items: any[] = [];
TextData: string = '';
selectedOption: string = '0';
dateValue = new FormControl();
id: string = "0";

Searchtarget: string = '';
CentralRef: string = '';
GroupCode_str: string = '0';



ngOnInit() {

  if (this.route.snapshot.params['id']) {
    this.id = this.route.snapshot.params['id'];
  }

  if (parseInt(this.id) > 0) {
    this.GroupCode_str = this.id
    this.LoadList();
  } else {
    this.repo.kowsar_info("AppOrder_DefaultGroupCode").subscribe(e => {

      this.GroupCode_str = e[0].DataValue
      this.LoadList();
    });
  }



}


onInputChange() {

}


LoadList() {

  this.repo.GetOrderGoodList("30", this.Searchtarget, this.GroupCode_str).subscribe(e => {
    this.items = e;
     this.items);

  });

}






}
*/