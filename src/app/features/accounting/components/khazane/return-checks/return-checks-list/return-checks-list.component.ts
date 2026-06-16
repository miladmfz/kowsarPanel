import { Component, inject, OnDestroy, OnInit, Renderer2, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { DbSetupWebApiService } from 'src/app/features/accounting/services/TanzimatWebApi/DbSetupWebApi.service';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { Subject } from 'rxjs';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';

import { ReturnChecksWebApiService } from 'src/app/features/accounting/services/KhazaneWebApi/ReturnChecksWebApi.service';
@Component({
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    RouterModule
  ],
  selector: 'app-return-checks-list',
  templateUrl: './return-checks-list.component.html',
})
export class ReturnChecksListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);

  private readonly repo = inject(ReturnChecksWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly renderer = inject(Renderer2);
  private readonly gridMemory_service = inject(AgGridMemoryService);

  constructor() {
    super();
  }


  title = signal('برگشت چک')
  ClassName = signal('ReturnChecks')
  records = signal<any[]>([])

  gridMemory1 = new Map<string, any>();
  gridKey = signal('');
  dateValue = new FormControl();
  private searchSubject = new Subject<string>();

  Searchtarget = signal('')



  EditForm_Search = new FormGroup({
    SearchTarget: new FormControl(''),
  });


  EditForm_FiscalPeriod = new FormGroup({
    PeriodId: new FormControl(''),
    comment: new FormControl(''),
    FromDate: new FormControl(''),
    ToDate: new FormControl(''),
    State: new FormControl(''),
  });


  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });

    this.getGridSchema();
  }


  onSearchChange() {
    const value = this.EditForm_Search.get('SearchTarget')?.value ?? '';
    this.searchSubject.next(value);
  }

  AddNew() {
    this.notificationService.develop()
  }

  getGridSchema() {


    this.base_repo.GetGridSchemaVisible("T" + this.ClassName())
      .subscribe((data: any) => {

        if (data && data.GridSchemas && data.GridSchemas.length > 0) {
          this.column_name_1 = data.GridSchemas.filter(schema => schema.Visible === "True").map(schema => ({
            field: schema.FieldName,
            headerName: schema.Caption,
            cellClass: 'text-center',
            sortable: true,
            resizable: true,
            minWidth: parseInt(schema.Width) + 100,
            valueFormatter: schema.Separator === '1' ? this.customNumberFormatter : undefined
          }));

          // this.column_name_1.unshift({
          //   field: 'عملیات',
          //   pinned: 'left',
          //   cellRenderer: CellActionPeriodList,

          //   minWidth: 100,
          //   sortable: false,
          //   filter: false,
          //   // resizable: false
          // });
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


  GetData() {


    this.repo.GetReturnChecks(this.EditForm_Search.value)
      .subscribe((data: any) => {

        this.records.set(data.ReturnChecks)
        this.updateGridData(1, this.records());

      });
  }









}
