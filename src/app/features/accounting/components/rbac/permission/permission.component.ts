import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { AuthKowsarWebApiService } from 'src/app/auth-kowsar/services/AuthKowsarWebApi.service';

@Component({
  selector: 'app-permission',
  templateUrl: './permission.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    RouterModule,
  ],
})
export class PermissionComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  records = signal<any[]>([])
  title = signal('Permission')
  loading = signal(false)

  private readonly router = inject(Router);

  private readonly repo = inject(AuthKowsarWebApiService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    super();
  }


  ngOnInit(): void {



    this.column_name_1 = [
      // {
      //   field: 'عملیات',
      //   pinned: 'left',
      //   cellRenderer: CellActionApplicationList,
      //   cellRendererParams: {
      //     editUrl: '/manager/application-form',
      //   },
      //   minWidth: 150,
      // },
      {
        field: 'PermissionCode',
        headerName: 'کد دسترسی',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'PermissionKey',
        headerName: 'کلید دسترسی',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'PermissionTitle',
        headerName: 'عنوان دسترسی',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'Explain',
        headerName: 'توضیخات',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'Active',
        headerName: 'فعال',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'PermissionCategory',
        headerName: 'گروه دسترسی',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'PermissionModule',
        headerName: 'ماژول دسترسی',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'PermissionAction',
        headerName: 'عمملیات دسترسی',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'SortOrder',
        headerName: 'کد صورت',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.getList();
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
  getList(): void {

    this.repo.GetPermissions().subscribe((data: any) => {

      this.records.set(data?.Permissions ?? [])
      this.updateGridData(1, this.records());
    });
  }




  btnDeleteClicked(data: any): void {


    this.notificationService.develop()
  }


}