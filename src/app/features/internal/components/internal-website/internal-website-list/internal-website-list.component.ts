import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Subject, debounceTime } from 'rxjs';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { AgGridModule } from 'ag-grid-angular';
import { CellLableWebSite } from './cell-label-website';
import { CellActionWebSiteList } from './cell_action_website_list';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { WebSiteWebApiService } from '../../../services/WebSiteWebApi.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';

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

  title = 'لیست وب‌سایت‌های داخلی کوثر';
  records: any;
  loading = false;

  private searchSubject = new Subject<string>();

  EditForm = new FormGroup({
    SearchTarget: new FormControl('')
  });

  private readonly router = inject(Router);
  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(WebSiteWebApiService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    super();
  }

  ngOnInit(): void {

    this.columnDefs1 = [
      {
        field: 'عملیات',
        minWidth: 150,
        pinned: 'left',
        cellRenderer: CellActionWebSiteList,
        cellRendererParams: {
          editUrl: '/manager/internal-website-edit'
        }
      },
      { field: 'CompanyName', headerName: 'نام مشتری', minWidth: 150 },
      { field: 'WebEmploy', headerName: 'مسئول', minWidth: 150 },
      { field: 'Phone', headerName: 'شماره تماس', minWidth: 150 },
      { field: 'Explain', headerName: 'توضیحات API', minWidth: 150 },
      { field: 'Domain1', headerName: 'دامین', minWidth: 150 },
      { field: 'Features', headerName: 'امکانات', minWidth: 150 },
      { field: 'KCServerVersion', headerName: 'نسخه KCServer', minWidth: 150 },
      { field: 'SiteType', cellRenderer: CellLableWebSite, headerName: 'نوع سایت', minWidth: 150 }
    ];

    this.getList();

    this.EditForm.get("SearchTarget")?.valueChanges
      .pipe(debounceTime(400))
      .subscribe(x => this.getList());
  }

  onSearchChange() {
    const value = this.EditForm.get('SearchTarget')?.value ?? '';
    this.searchSubject.next(value);
  }

  getList(): void {
    this.loading = true;

    this.loadingService.show()
    this.repo.GetWebSiteActivation(this.EditForm.value)
      .subscribe((data: any) => {
        this.loadingService.hide()
        this.records = data?.WebSites ?? [];
        this.loading = false;
        this.updateGridData(1, this.records);
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
        title: 'حذف تیکت؟',
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


          this.loadingService.show()
          this.repo.DeleteWebSiteActivation(data.WebSiteActivationCode).subscribe({
            next: () => {
              this.notificationService.success('  تیکت با موفقیت حذف شد');
              setTimeout(() => this.getList(), 10);
            },
            error: () => this.notificationService.error('❌ خطا در حذف رکورد'),
          });


        } else {
          this.notificationService.info('عملیات حذف لغو شد');
        }
      });
    });
  }
}
