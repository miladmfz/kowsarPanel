import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { AgGridModule } from 'ag-grid-angular';
import { CellLableWebSite } from './cell-label-website';
import { CellActionWebSiteList } from './cell_action_website_list';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { WebSiteWebApiService } from '../../../services/WebSiteWebApi.service';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';

@Component({
  selector: 'app-internal-website-list',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    AgGridModule,
    RouterModule
  ],
  templateUrl: './internal-website-list.component.html'
})
export class InternalWebsiteListComponent
  extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  title = signal('لیست وب‌سایت‌های داخلی کوثر')
  records = signal<any[]>([])
  loading = signal(false)

  private searchSubject = new Subject<string>();

  EditForm = new FormGroup({
    SearchTarget: new FormControl('')
  });

  private readonly router = inject(Router);

  private readonly repo = inject(WebSiteWebApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly gridMemory_service = inject(AgGridMemoryService);
  gridMemory1 = new Map<string, any>();
  gridKey = signal('');

  constructor() {
    super();
  }

  ngOnInit(): void {


    this.gridKey.set(`${this.constructor.name}-grid`);

    // پاک کردن memory در صورت برگشت از صفحات خارجی
    this.router.events.subscribe(event => {

      if (event instanceof NavigationStart) {

        const comingFromExternal = !event.url.startsWith('/internal/internal-website');
        if (comingFromExternal) this.gridMemory_service.remove(this.gridKey());
      }

    });

    this.getGridSchema();

    this.EditForm.get("SearchTarget")?.valueChanges
      .pipe(debounceTime(400))
      .subscribe(x => this.GetData());

    const memory = this.gridMemory_service.get(this.gridKey());
    if (memory?.rowData) {
      this.records.set(memory.rowData);
    } else {

      this.GetData();
    }
  }


  getGridSchema() {



    this.column_name_1 = [
      {
        headerName: 'عملیات',
        pinned: 'left',
        minWidth: 150,
        cellRenderer: CellActionWebSiteList
      },

      { field: 'CompanyName', headerName: 'نام مشتری', cellClass: 'text-center', minWidth: 130 },
      { field: 'WebEmploy', headerName: 'مسئول', cellClass: 'text-center', minWidth: 130 },
      { field: 'Phone', headerName: 'شماره تماس', cellClass: 'text-center', minWidth: 130 },
      { field: 'Explain', headerName: 'توضیحات API', cellClass: 'text-center', minWidth: 130 },
      { field: 'Domain1', headerName: 'CustomerCode', cellClass: 'text-center', minWidth: 130 },
      { field: 'Features', headerName: 'امکانات', cellClass: 'text-center', minWidth: 130 },
      { field: 'KCServerVersion', headerName: 'نسخه KCServer', cellClass: 'text-center', minWidth: 130 },
      { field: 'SiteType', cellRenderer: CellLableWebSite, headerName: 'نوع سایت', cellClass: 'text-center', minWidth: 130 },
    ];



    const memory = this.gridMemory_service.get(this.gridKey());
    if (memory?.rowData) {
      this.records.set(memory.rowData);
    } else {
      this.GetData();
    }
  }

  GetData() {



    this.loading.set(true)


    this.repo.GetWebSiteActivation(this.EditForm.value)
      .subscribe((data: any) => {

        this.loading.set(false)

        const rows = data?.WebSites || [];
        this.records.set(rows);

        this.gridMemory_service.save(this.gridKey(), {
          rowData: rows,
          columnDefs: this.column_name_1
        });



      });


  }


  onSearchChange() {
    const value = this.EditForm.get('SearchTarget')?.value ?? '';
    this.searchSubject.next(value);
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
    this.router.navigate(['/internal/internal-website-edit', data.WebSiteActivationCode]);
  }

  btnDeleteClicked(data: any): void {
    if (data.Explain.length > 0) {
      this.notificationService.error('⛔ این آیتم دارای توضیحات می‌باشد.');
      return;
    }

    import('sweetalert2').then(Swal => {
      Swal.default.fire({
        title: 'حذف رکورد؟',
        text: 'در صورت حذف، قابل بازیابی نخواهد بود.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'بله، حذف شود',
        cancelButtonText: 'انصراف',
        customClass: {
          confirmButton: 'btn btn-success mx-2',
          cancelButton: 'btn btn-danger',
        },
        buttonsStyling: false,
      }).then(result => {
        if (result.isConfirmed) {



          this.repo.DeleteWebSiteActivation(data.WebSiteActivationCode).subscribe({
            next: () => {

              this.notificationService.success('  رکورد با موفقیت حذف شد');
              setTimeout(() => this.GetData(), 10);
            },
            error: () => {

              this.notificationService.error('❌ خطا در حذف رکورد')
            },
          });


        } else {
          this.notificationService.info('عملیات حذف لغو شد');
        }
      });
    });
  }
}
