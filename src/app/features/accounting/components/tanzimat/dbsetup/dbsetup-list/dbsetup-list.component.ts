import { Component, inject, OnDestroy, OnInit, Renderer2, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CellActionDbSetupList } from './cell-action-dbsetup-list';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { DbSetupWebApiService } from 'src/app/features/accounting/services/TanzimatWebApi/DbSetupWebApi.service';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';

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
  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly renderer = inject(Renderer2);
  private readonly gridMemory_service = inject(AgGridMemoryService);

  constructor() {
    super();
  }


  title = signal('لیست خدمات')
  records = signal<any[]>([])

  gridMemory1 = new Map<string, any>();
  gridKey = signal('');
  dateValue = new FormControl();

  Searchtarget = signal('')

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
    if (this.Searchtarget() === '') {
      this.Searchtarget.set("")
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
    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionDbSetupList,
        minWidth: 100,
      },

      {
        field: 'KeyId',
        headerName: 'KeyId',

        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'KeyValue',
        headerName: 'KeyValue',

        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'DataValue',
        headerName: 'DataValue',

        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'Description',
        headerName: 'Description',

        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'SubSystem',
        headerName: 'SubSystem',

        cellClass: 'text-center',
        minWidth: 150,
      },

    ];
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
      this.GetDbSetup();
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

        this.records.set(data.DbSetups)
        this.updateGridData(1, this.records());

      });
  }






  UpdateDbSetup() {



    this.repo.UpdateDbSetup(this.EditForm_DbSetup.value)
      .subscribe((data: any) => {

        this.orderdbsetup_Modal_Response_close()
        this.GetDbSetup()

      });
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
