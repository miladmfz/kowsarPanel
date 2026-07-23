import { Component, OnInit, OnDestroy, inject, signal, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { AuthKowsarWebApiService } from 'src/app/auth-kowsar/services/AuthKowsarWebApi.service';
import { CellActionRoleList } from './cell_action_role_list';


@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    RouterModule,
  ],
})
export class RoleComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  records = signal<any[]>([])
  records_rolepermission = signal<any[]>([])
  title = signal('Role')
  loading = signal(false)

  private readonly router = inject(Router);
  private readonly renderer = inject(Renderer2);

  private readonly repo = inject(AuthKowsarWebApiService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    super();
  }


  ngOnInit(): void {



    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionRoleList,
        width: 100,
      },
      {
        field: 'RoleCode',
        headerName: 'کد نقش',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'RoleName',
        headerName: 'نام نقش',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'RoleTitle',
        headerName: 'عنوان نقض',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'Explain',
        headerName: 'توضیحات',
        cellClass: 'text-center',
        minWidth: 150
      }, {
        field: 'Active',
        headerName: 'فعال',
        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.columnDefs2 = [

      {
        field: 'PermissionCode',
        headerName: 'PermissionCode',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'PermissionKey',
        headerName: 'PermissionKey',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'PermissionTitle',
        headerName: 'PermissionTitle',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'Explain',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'PermissionCategory',
        headerName: 'PermissionCategory',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'PermissionModule',
        headerName: 'PermissionModule',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'PermissionAction',
        headerName: 'PermissionAction',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'SortOrder',
        headerName: 'SortOrder',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Active',
        headerName: 'Active',
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

    this.repo.GetRoles().subscribe((data: any) => {

      this.records.set(data?.Roles ?? [])
      this.updateGridData(1, this.records());
    });
  }

  // GetRoleّ(data: any): void {
  //   this.repo.GetRoleById(data.RoleCode).subscribe((data: any) => {
  //     console.log(data.Roles[0])
  //   });

  //   this.repo.GetRolePermissions(data.RoleCode).subscribe((data: any) => {
  //     console.log(data.RolePermissions[0])
  //   });


  // }

  GetRolePermissions(data: any): void {

    this.repo.GetRolePermissions(data.RoleCode).subscribe((data: any) => {


      this.records_rolepermission.set(data?.RolePermissions ?? [])
      this.updateGridData(2, this.records_rolepermission());
      this.rolepermission_dialog_show()
    });


  }


  btnDeleteClicked(data: any): void {


    this.notificationService.develop()
  }



  rolepermission_dialog_show() {
    const modal = this.renderer.selectRootElement('#rolepermission', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  rolepermission_dialog_close() {
    const modal = this.renderer.selectRootElement('#rolepermission', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

}