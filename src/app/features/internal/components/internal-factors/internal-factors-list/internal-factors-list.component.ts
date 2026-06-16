import { Component, OnInit, OnDestroy, Renderer2, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationStart, Router } from '@angular/router';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { catchError, of } from 'rxjs';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';

import { CellActionSupportFactorList } from './cell-action-support-factor-list';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';

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
export class InternalFactorsListComponent extends AgGridBaseComponent implements OnInit, OnDestroy {

  // ===============================================================
  // 🔹 Services & Injects
  // ===============================================================
  private readonly router = inject(Router);
  private readonly repo = inject(SupportFactorWebApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly renderer = inject(Renderer2);
  private readonly gridMemory_service = inject(AgGridMemoryService);
  protected readonly session = inject(SessionStorageService);
  protected readonly permissionService = inject(PermissionService);


  constructor() {
    super();
  }

  // ===============================================================
  // 🔹 UI / State
  // ===============================================================
  title = signal('فاکتور پشتیبانی');
  CentralRef = signal('');
  LoginType = signal('');
  Searchtarget = signal('');
  TextData = signal('');
  BrokerRef_temp = signal('');
  searchTerm = signal('');
  selectedOption = signal('0');

  gridMemory1 = new Map<string, any>();
  gridKey = signal('');

  // ===============================================================
  // 🔹 Forms
  // ===============================================================
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
    IsShopFactor: new FormControl('0'),
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

  // ===============================================================
  // 🔹 Data
  // ===============================================================
  items = signal<any[]>([]);
  start_dateValue = new FormControl();
  End_dateValue = new FormControl();
  loading = signal(true);
  loading_supportpanel = signal(true);
  records = signal<any[]>([]);
  reportData = signal<any[]>([]);

  // ===============================================================
  // 🔹 Lifecycle Hooks
  // ===============================================================
  ngOnInit(): void {


    this.gridKey.set(`${this.constructor.name}-grid`);

    // پاک کردن memory در صورت برگشت از صفحات خارجی
    this.router.events.subscribe(event => {

      if (event instanceof NavigationStart) {

        const comingFromExternal = !event.url.startsWith('/internal/internal-factors');
        if (comingFromExternal) this.gridMemory_service.remove(this.gridKey());
      }

    });

    this.getGridSchema();
    this.getdata_SupportPanel();
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

  // ===============================================================
  // 🔹 Load / Schema / API
  // ===============================================================
  loadGridData(data: any) {
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

      this.column_name_1.unshift({
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionSupportFactorList,
        cellRendererParams: { context: this.gridOptions.context },
        minWidth: 100,
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
  }

  getGridSchema() {
    this.base_repo.GetGridSchemaVisible('TFactor').subscribe((data: any) => this.loadGridData(data));
  }

  getdata_SupportPanel() {
    this.EditForm_SupportData.patchValue({
      DateTarget: '',
      BrokerCode: '1',
      Flag: '1'
    });

    this.repo.GetSupportPanel(this.EditForm_SupportData.value)
      .subscribe((data: any) => {
        if (this.permissionService.canManageRole) {
          this.reportData.set(data.SupportDatas);
        } else {
          // this.reportData.set((data.SupportDatas || []).filter(
          //   (panel: any) => panel.BrokerCode === this.BrokerRef
          // ));

          // this.reportData().forEach(row => {
          //   if (row.WithoutRows > 0 || row.OpenFactor > 0) {
          //     this.loading_supportpanel.set(false);
          //   }
          // });
        }
      });
  }

  GetData() {
    this.EditForm_supportfactor.patchValue({
      BrokerRef: "",
      IsShopFactor: '0'
    });

    this.loading.set(true);

    this.repo.GetAllInternalFactor(this.EditForm_supportfactor.value)
      .pipe(catchError(() => {
        this.notificationService.error('مشکل در برقراری ارتباط', 'خطا');
        return of(null);
      }))
      .subscribe((data: any) => {
        const rows = data?.Factors || [];
        this.records.set(rows);

        this.gridMemory_service.save(this.gridKey(), {
          rowData: rows,
          columnDefs: this.column_name_1
        });

        this.loading.set(false);
      });
  }

  // ===============================================================
  // 🔹 Factor Property (modal)
  // ===============================================================
  Edit_factor_Property(FactorCode: any) {
    this.property_dialog_show();

    (this.records() || []).forEach((factor: any) => {
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
    this.repo.EditFactorProperty(this.EditForm_supportfactor_property.value)
      .subscribe((_data: any) => {
        this.property_dialog_close();
        this.GetData();
        this.EditForm_supportfactor_property.reset();
      });
  }

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

  onInputChange() {
    if (this.Searchtarget() === '') this.Searchtarget = signal('');
    this.GetData();
  }

  navigateToEdit(id: any) {
    this.router.navigate(['/internal/internal-factors-edit', id]);
  }

  navigateToNew() {
    this.router.navigate(['/internal/internal-factors-edit']);
  }



}