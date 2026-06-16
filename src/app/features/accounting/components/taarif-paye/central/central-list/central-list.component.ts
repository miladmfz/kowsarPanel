import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, Subject } from 'rxjs';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { CentralWebApiService } from 'src/app/features/accounting/services/TaarifPayeWebApi/CentralWebApi.service';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { CellActionCentralList } from './cell-action-central-list';
import { CommonModule } from '@angular/common';
import { AgGridModule } from 'ag-grid-angular';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';

@Component({
  selector: 'app-central-list',
  templateUrl: './central-list.component.html',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    AgGridModule,
    RouterModule
  ],
})
export class CentralListComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  title = signal('لیست اجزای پایه')
  records = signal<any[]>([])

  gridMemory1 = new Map<string, any>();
  gridKey = signal('');
  loading = signal(false)

  private searchSubject = new Subject<string>();

  EditForm = new FormGroup({
    SearchTarget: new FormControl('')
  });

  private readonly router = inject(Router);
  private readonly repo = inject(CentralWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly gridMemory_service = inject(AgGridMemoryService);

  private readonly notificationService = inject(NotificationService);

  constructor() {
    super();
  }

  ClassName = signal('Central')
  ngOnInit(): void {

    this.gridKey.set(`${this.constructor.name}-grid`);

    // پاک کردن memory در صورت برگشت از صفحات خارجی
    this.router.events.subscribe(event => {

      if (event instanceof NavigationStart) {

        const comingFromExternal = !event.url.startsWith('/accounting/taarif-paye/central');
        if (comingFromExternal) this.gridMemory_service.remove(this.gridKey());
      }

    });

    this.getGridSchema()



    this.EditForm.get("SearchTarget")?.valueChanges
      .pipe(debounceTime(400))
      .subscribe(x => this.GetData());
  }

  onSearchChange() {
    const value = this.EditForm.get('SearchTarget')?.value ?? '';
    this.searchSubject.next(value);
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

          this.column_name_1.unshift({
            field: 'عملیات',
            pinned: 'left',
            cellRenderer: CellActionCentralList,

            minWidth: 100,
            sortable: false,
            filter: false,
            // resizable: false
          });
        }
        //this.GetGood()


        const memory = this.gridMemory_service.get(this.gridKey());
        if (memory?.rowData) {
          this.records.set(memory.rowData);
        } else {
          this.GetData();
        }


      });
  }

  GetData(): void {
    this.loading.set(true)


    this.repo.GetCentral(this.EditForm.value)
      .subscribe((data: any) => {


        this.loading.set(false)

        const rows = data?.Centrals || [];
        this.records.set(rows);

        this.gridMemory_service.save(this.gridKey(), {
          rowData: rows,
          columnDefs: this.column_name_1
        });

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



  navigateToEdit(data: any) {
    this.router.navigate(['/accounting/taarif-paye/central-edit', data.CentralCode]);
  }

  navigateToNew() {
    this.router.navigate(['/accounting/taarif-paye/central-edit']);
  }

  // btnDeleteClicked(data: any): void {
  //   if (data.Explain.length > 0) {
  //     this.notificationService.error('⛔ این آیتم دارای توضیحات می‌باشد.');
  //     return;
  //   }

  //   import('sweetalert2').then(Swal => {
  //     Swal.default.fire({
  //       title: 'حذف رکورد؟',
  //       text: 'در صورت حذف، قابل بازیابی نخواهد بود.',
  //       icon: 'warning',
  //       showCancelButton: true,
  //       confirmButtonText: 'بله، حذف شود',
  //       cancelButtonText: 'انصراف',
  //       customClass: {
  //         confirmButton: 'btn btn-success mx-2',
  //         cancelButton: 'btn btn-danger',
  //       },
  //       buttonsStyling: false,
  //     }).then(result => {
  //       if (result.isConfirmed) {



  //         this.repo.DeleteWebSiteActivation(data.WebSiteActivationCode).subscribe({
  //           next: () => {

  //             this.notificationService.success('  رکورد با موفقیت حذف شد');
  //             setTimeout(() => this.getList(), 10);
  //           },
  //           error: () => {

  //             this.notificationService.error('❌ خطا در حذف رکورد')
  //           },
  //         });


  //       } else {
  //         this.notificationService.info('عملیات حذف لغو شد');
  //       }
  //     });
  //   });
  // }


}
