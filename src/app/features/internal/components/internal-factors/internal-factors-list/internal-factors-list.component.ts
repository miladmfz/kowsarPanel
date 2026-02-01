import { Component, OnInit, OnDestroy, Renderer2, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { Subscription, catchError, of } from 'rxjs';


// اگر از ng-persian-datepicker استفاده می‌کنی، این ماژول را هم ایمپورت کن:
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';

// کامپوننت سل‌رنـدر اکشن‌ها در گرید
import { CellActionSupportFactorList } from './cell-action-support-factor-list';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';

@Component({
  selector: 'app-internal-factors-list',
  standalone: true,
  templateUrl: './internal-factors-list.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    NgPersianDatepickerModule,
  ]
})
export class InternalFactorsListComponent
  extends AgGridBaseComponent
  implements OnInit, OnDestroy {


  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(SupportFactorWebApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);



  constructor() {
    super();
  }

  // ----- UI / State -----
  title = 'فاکتور پشتیبانی';
  CentralRef = '';
  JobPersonRef = '';
  Searchtarget = '';
  TextData = '';
  BrokerRef = '';
  BrokerRef_temp = '';

  searchTerm = '';
  selectedOption = '0';

  // ----- Forms -----
  EditForm_SupportData = new FormGroup({
    DateTarget: new FormControl(''),
    BrokerCode: new FormControl(''),
    Flag: new FormControl('1'),
  });

  EditForm_supportfactor = new FormGroup({
    StartDateTarget: new FormControl(''),
    EndDateTarget: new FormControl(''),
    SearchTarget: new FormControl(''),
    BrokerRef: new FormControl(''),
    isShopFactor: new FormControl('0'),
    ClassName: new FormControl(''),
    ObjectRef: new FormControl(''),
  });

  EditForm_supportfactor_property = new FormGroup({
    starttime: new FormControl(''),
    Endtime: new FormControl(''),
    worktime: new FormControl(''),
    Barbary: new FormControl(''),
    ObjectRef: new FormControl('0'),
  });

  // ----- Data -----
  items: any[] = [];
  start_dateValue = new FormControl();
  End_dateValue = new FormControl();
  loading = true;
  loading_supportpanel = true;

  records: any;
  reportData: any[] = [];

  // ---------------------------
  // Lifecycle
  // ---------------------------
  ngOnInit(): void {

    // تم
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });

    // تعیین BrokerRef از سشن
    if (sessionStorage.getItem('PhAddress3') === '100') {
      this.BrokerRef = '';
    } else {
      this.BrokerRef = sessionStorage.getItem('BrokerCode') || '';
    }

    this.getList();
    this.getpanel_data();
  }



  // ---------------------------
  // Events
  // ---------------------------
  submit(_action: string) {
    // در نسخه فعلی متدی برای فرم اصلی تعریف نشده؛ اگر لازم شد اینجا اضافه کن
  }

  onInputChange() {
    if (this.Searchtarget === '') {
      this.Searchtarget = '';
    }
    this.getList();
  }

  navigateToEdit(id: any) {
    this.router.navigate(['/internal/internal-factors-edit', id]);
  }
  navigateToNew() {
    this.router.navigate(['/internal/internal-factors-edit']);
  }

  // ---------------------------
  // Panel (summary) data
  // ---------------------------
  getpanel_data() {
    this.EditForm_SupportData.patchValue({
      DateTarget: '',
      BrokerCode: '1',
      Flag: '1'
    });

    this.loadingService.show()
    this.repo.GetSupportPanel(this.EditForm_SupportData.value)
      .subscribe((data: any) => {
        this.loadingService.hide()
        if (this.BrokerRef === '') {
          this.reportData = data.SupportDatas;
        } else {
          this.reportData = (data.SupportDatas || []).filter(
            (panel: any) => panel.BrokerCode === this.BrokerRef
          );

          this.reportData.forEach(row => {
            if (row.WithoutRows > 0 || row.OpenFactor > 0) {
              this.loading_supportpanel = false;
            }
          });
        }
      });
  }

  // ---------------------------
  // Grid Schema + Data
  // ---------------------------
  getGridSchema() {
    this.loadingService.show()
    this.repo.GetGridSchema('TFactor')
      .subscribe((data: any) => {
        this.loadingService.hide()
        if (data?.GridSchemas?.length > 0) {
          this.columnDefs1 = data.GridSchemas
            .filter((schema: any) => schema.Visible === 'True')
            .map((schema: any) => ({
              field: schema.FieldName,
              headerName: schema.Caption,
              cellClass: 'text-center',
              filter: 'agSetColumnFilter',
              sortable: true,
              resizable: true,
              minWidth: parseInt(schema.Width, 10),
              valueFormatter: schema.Separator === '1' ? this.customNumberFormatter : undefined
            }));

          // ستون عملیات
          this.columnDefs1.unshift({
            field: 'عملیات',
            pinned: 'left',
            cellRenderer: CellActionSupportFactorList,
            minWidth: 100,
            sortable: false,
            filter: false
          });
        }

        // پارامترهای جستجو
        this.EditForm_supportfactor.patchValue({
          BrokerRef: this.BrokerRef,
          isShopFactor: '0'
        });

        // لود داده‌ها
        this.loading = true;

        this.loadingService.show()
        this.repo.GetSupportFactors(this.EditForm_supportfactor.value)
          .pipe(
            catchError((_error) => {
              this.notificationService.error('مشکل در برقراری ارتباط', 'خطا');
              return of(null);
            })
          )
          .subscribe((data: any) => {
            this.loadingService.hide()
            this.records = data?.Factors || [];
            this.loading = false;
            this.updateGridData(1, this.records);

          });
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


  customNumberFormatter(params: any) {
    if (params.value === null || params.value === undefined) return '';
    const value = parseFloat(params.value);
    if (isNaN(value)) return params.value;

    let formatted = value.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 20
    });

    // حذف صفرهای اعشار اضافی
    if (formatted.includes('.')) {
      formatted = formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }
    return formatted;
  }

  getList() {
    this.getGridSchema();
  }

  // ---------------------------
  // Factor Property (modal)
  // ---------------------------
  Edit_factor_Property(FactorCode: any) {
    this.property_dialog_show();

    (this.records || []).forEach((factor: any) => {
      if (factor.FactorCode === FactorCode) {
        this.EditForm_supportfactor_property.patchValue({
          starttime: factor.starttime,
          Endtime: factor.Endtime,
          worktime: factor.worktime,
          Barbary: factor.Barbary,
          ObjectRef: factor.FactorCode
        });
      }
    });
  }

  Set_factor_Property() {
    this.loadingService.show()
    this.repo.EditFactorProperty(this.EditForm_supportfactor_property.value)
      .subscribe((_data: any) => {
        this.property_dialog_close();
        this.getList();
        this.EditForm_supportfactor_property.reset();
      });
  }

  // Modal toggling via Renderer2 (Bootstrap)
  property_dialog_show() {
    const modal = this.renderer.selectRootElement('#supportfactorproperty', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  property_dialog_close() {
    const modal = this.renderer.selectRootElement('#supportfactorproperty', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }
}
