import { Component, OnInit, OnDestroy, Renderer2, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { catchError, of } from 'rxjs';


// اگر از ng-persian-datepicker استفاده می‌کنی، این ماژول را هم ایمپورت کن:
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';

// کامپوننت سل‌رنـدر اکشن‌ها در گرید
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { FactorWebApiService } from 'src/app/features/accounting/services/ForoshWebApi/FactorWebApi.service';
import { CellActionFactorList } from './cell-action-factor-list';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';

@Component({
  selector: 'app-factor-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    NgPersianDatepickerModule,
    RouterModule
  ],
  templateUrl: './factor-list.component.html',
})
export class FactorListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  private readonly router = inject(Router);

  private readonly repo = inject(FactorWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly gridMemory_service = inject(AgGridMemoryService);
  protected readonly session = inject(SessionStorageService);

  private readonly notificationService = inject(NotificationService);
  private readonly permissionService = inject(PermissionService);
  private readonly renderer = inject(Renderer2);

  constructor() {
    super();
  }

  // ----- UI / State -----
  title = signal('فاکتور پشتیبانی')
  CentralRef = signal('')
  LoginType = signal('')
  Searchtarget = signal('')
  TextData = signal('')
  BrokerRef_temp = signal('')

  searchTerm = signal('')
  selectedOption = signal(0)

  // // ----- Forms -----
  // EditForm_SupportData = new FormGroup({
  //   DateTarget: new FormControl(''),
  //   BrokerCode: new FormControl(''),
  //   Flag: new FormControl('1'),
  // });

  // EditForm_supportfactor = new FormGroup({
  //   StartDateTarget: new FormControl(''),
  //   EndDateTarget: new FormControl(''),
  //   SearchTarget: new FormControl(''),
  //   BrokerRef: new FormControl(''),
  //   IsShopFactor: new FormControl('0'),
  //   ClassName: new FormControl(''),
  //   ObjectRef: new FormControl(''),
  // });

  // EditForm_supportfactor_property = new FormGroup({
  //   starttime: new FormControl(''),
  //   Endtime: new FormControl(''),
  //   worktime: new FormControl(''),
  //   Barbary: new FormControl(''),
  //   ObjectRef: new FormControl('0'),
  // });
  EditForm_factor = new FormGroup({
    StartDateTarget: new FormControl(''),
    EndDateTarget: new FormControl(''),
    SearchTarget: new FormControl(''),
    BrokerRef: new FormControl(''),
    IsShopFactor: new FormControl('0'),
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
  // ----- Data -----
  items = signal<any[]>([])
  start_dateValue = new FormControl();
  End_dateValue = new FormControl();
  loading = signal(true)
  loading_supportpanel = signal(true)

  records = signal<any[]>([])

  gridMemory1 = new Map<string, any>();
  gridKey = signal('');
  reportData = signal<any[]>([])

  // ---------------------------
  // Lifecycle
  // ---------------------------
  ngOnInit(): void {

    // تم
    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });



    this.gridKey.set(`${this.constructor.name}-grid`);

    // پاک کردن memory در صورت برگشت از صفحات خارجی
    this.router.events.subscribe(event => {

      if (event instanceof NavigationStart) {

        const comingFromExternal = !event.url.startsWith('/accounting/forosh/factor');
        if (comingFromExternal) this.gridMemory_service.remove(this.gridKey());
      }

    });

    this.getGridSchema();
    // this.getpanel_data();
  }

  ClearFilter() {
    this.gridMemory_service.remove(this.gridKey())
    this.GetData()
  }

  // ---------------------------
  // Events
  // ---------------------------
  submit(_action: string) {
    // در نسخه فعلی متدی برای فرم اصلی تعریف نشده؛ اگر لازم شد اینجا اضافه کن
  }

  onInputChange() {
    if (this.Searchtarget() === '') {
      this.Searchtarget.set("")
    }
    this.GetData();
  }

  navigateToEdit(id: any) {
    this.router.navigate(['/accounting/forosh/factor-edit', id]);
  }
  navigateToNew() {
    this.router.navigate(['/accounting/forosh/factor-edit']);
  }


  // ---------------------------
  // Grid Schema + Data
  // ---------------------------
  GetData() {
    // پارامترهای جستجو
    this.EditForm_factor.patchValue({
      BrokerRef: '',
      IsShopFactor: '0'
    });

    // لود داده‌ها
    this.loading.set(true)


    this.repo.GetWebFactor(this.EditForm_factor.value)
      .pipe(
        catchError((_error) => {
          this.notificationService.error('مشکل در برقراری ارتباط', 'خطا');
          return of(null);
        })
      )
      .subscribe((data: any) => {


        const rows = data?.Factors || [];
        this.records.set(rows);

        this.gridMemory_service.save(this.gridKey(), {
          rowData: rows,
          columnDefs: this.column_name_1
        });


      });

  }

  getGridSchema() {


    this.base_repo.GetGridSchemaVisible('TFactor')
      .subscribe((data: any) => {

        if (data?.GridSchemas?.length > 0) {
          this.column_name_1 = data.GridSchemas
            .filter((schema: any) => schema.Visible === 'True')
            .map((schema: any) => ({
              field: schema.FieldName,
              headerName: schema.Caption,
              cellClass: 'text-center',
              sortable: true,
              resizable: true,
              minWidth: parseInt(schema.Width, 10),
              valueFormatter: schema.Separator === '1' ? this.customNumberFormatter : undefined
            }));

          // ستون عملیات
          this.column_name_1.unshift({
            field: 'عملیات',
            pinned: 'left',
            cellRenderer: CellActionFactorList,
            minWidth: 150,
            sortable: false,
            filter: false
          });
        }

        const memory = this.gridMemory_service.get(this.gridKey());
        if (memory?.rowData) {
          this.records.set(memory.rowData);
        } else {
          this.GetData();
        }

      });
  }

  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    setTimeout(() => {
      if (params.api && !params.api.isDestroyed?.()) {
        params.api.sizeColumnsToFit();
      }
    }, 50);
  }

  override onFirstDataRendered(params: any) {
    const memory = this.gridMemory_service.get(this.gridKey());
    if (!params.api || params.api.isDestroyed?.()) return;

    if (memory?.columnState) {
      params.api.applyColumnState({ state: memory.columnState, applyOrder: true });
    }

    if (memory?.filterState) {
      params.api.setFilterModel(memory.filterState);
    }

    if (memory?.rowData) {
      this.records.set(memory.rowData);
    } else {
      this.GetData();
    }
  }

  onGridStateChanged() {
    const api = this.gridApi1;
    if (!api) return;

    this.gridMemory_service.save(this.gridKey(), {
      columnState: api.getColumnState(),
      filterState: api.getFilterModel()
    });
  }





  // ---------------------------
  // Factor Property (modal)
  // ---------------------------
  Edit_factor_Property(FactorCode: any) {
    this.property_dialog_show();

    (this.records() || []).forEach((factor: any) => {
      if (factor.FactorCode === FactorCode) {
        this.EditForm_factor_property.patchValue({
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
