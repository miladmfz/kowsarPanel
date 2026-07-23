import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { AuthKowsarWebApiService } from 'src/app/auth-kowsar/services/AuthKowsarWebApi.service';

@Component({
  selector: 'app-role-permission',
  templateUrl: './role-permission.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    RouterModule,
  ],
})
export class RolePermissionComponent
  extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  records = signal<any[]>([])
  title = signal('RolePermission')
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
        field: 'ActivationCode',
        headerName: 'ActivationCod',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'PersianCompanyName',
        headerName: 'نام فارسی',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ServerIp',
        headerName: 'آدرس',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ServerPort',
        headerName: 'پورت',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'ServerPathApi',
        headerName: 'نام پوشه',
        cellClass: 'text-center',
        minWidth: 150
      }
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

    // this.repo.GetRolePermissions().subscribe((data: any) => {

    //   this.records.set(data?.Roles ?? [])
    //   this.updateGridData(1, this.records());
    // });
  }

  navigateToEdit(data: any): void {
    this.repo.GetRoleById(data.RoleCode).subscribe((data: any) => {
      console.log(data.Roles[0])
    });

  }


  btnDeleteClicked(data: any): void {


    this.notificationService.develop()
  }



}