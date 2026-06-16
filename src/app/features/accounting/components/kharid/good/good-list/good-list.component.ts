import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { GoodWebApiService } from 'src/app/features/accounting/services/KharidWebApi/goodWebApi.service';
import { CellActionGoodList } from './cell-action-good-list';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';

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

  private readonly router = inject(Router);

  private readonly repo = inject(GoodWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);
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

  onInputChange() {
    if (this.Searchtarget() === '') {
      this.Searchtarget.set("")
    }
    this.getList();
  }

  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });

    this.getGridSchema();
    this.getList();
  }

  getGridSchema() {


    this.base_repo.GetGridSchemaVisible('TGood')
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

          this.column_name_1.unshift({
            field: 'عملیات',
            pinned: 'left',
            cellRenderer: CellActionGoodList,

            minWidth: 100,
            sortable: false,
            filter: false,
            // resizable: false
          });
        }
        const memory = this.gridMemory_service.get(this.gridKey());
        if (memory?.rowData) {
          this.records.set(memory.rowData);
        } else {
          this.getList();
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
      this.getList();
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


  navigateToEdit(id: any) {
    this.router.navigate(['/accounting/kharid/good-edit', id]);
  }

  navigateToNew() {
    this.router.navigate(['/accounting/kharid/good-edit']);
  }


  getList() {



    this.repo.GetGoodList()
      .subscribe((data: any) => {


        const rows = data?.Goods || [];
        this.records.set(rows);

        this.gridMemory_service.save(this.gridKey(), {
          rowData: rows,
          columnDefs: this.column_name_1
        });





      });
  }




}
