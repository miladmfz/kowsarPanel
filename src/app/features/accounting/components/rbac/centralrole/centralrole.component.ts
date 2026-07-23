import { Component, OnInit, OnDestroy, inject, signal, Renderer2 } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { AuthKowsarWebApiService } from 'src/app/auth-kowsar/services/AuthKowsarWebApi.service';
import { CellActionCentralRoleList } from './cell_action_centralrole_list';


@Component({
  selector: 'app-centralrole',
  templateUrl: './centralrole.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AgGridModule,
    RouterModule,
  ],
})
export class CentralroleComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  records = signal<any[]>([])
  records_CentralRole = signal<any[]>([])
  title = signal('Centralrole')
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
        cellRenderer: CellActionCentralRoleList,
        minWidth: 100,
      },
      {
        field: 'UserId',
        headerName: 'کد کاربری',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CentralRef',
        headerName: 'کد اجزای پایه',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'CentralName',
        headerName: 'نام',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'UserName',
        headerName: 'نام کاربری',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'UserNameInPrint',
        headerName: 'پرینت',
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
    this.columnDefs2 = [

      {
        field: 'RoleName',
        headerName: 'RoleName',
        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'RoleTitle',
        headerName: 'RoleTitle',
        cellClass: 'text-center',
        minWidth: 150
      },

      {
        field: 'RoleTitle',
        headerName: 'RoleTitle',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Explain',
        headerName: 'Explain',
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

    this.repo.GetCentralUsers().subscribe((data: any) => {

      this.records.set(data?.CentralUsers ?? [])
      this.updateGridData(1, this.records());
    });
  }

  GetCentralRoles(data: any): void {

    this.repo.GetCentralRoles(data.CentralRef).subscribe((data: any) => {
      console.log(data.CentralRoles[0])

      this.records_CentralRole.set(data?.CentralRoles ?? [])
      this.updateGridData(2, this.records_CentralRole());
      this.CentralRole_dialog_show()
    });

  }


  btnDeleteClicked(data: any): void {


    this.notificationService.develop()
  }

  CentralRole_dialog_show() {
    const modal = this.renderer.selectRootElement('#CentralRole', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  CentralRole_dialog_close() {
    const modal = this.renderer.selectRootElement('#CentralRole', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


}