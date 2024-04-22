import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { EditDeleteCellRenderer } from 'src/app/app-shell/framework-components/ag-grid/edit-delete-cell-btn';
import { LocalStorageService } from 'src/app/app-shell/framework-services/local.storage.service';
import { SettingService } from 'src/app/app-shell/framework-services/setting.service';
import { IncidentService } from '../../services/incident.service';

@Component({
  selector: 'app-incident-list',
  templateUrl: './incident-list.component.html',
})
export class IncidentListComponent
  extends AgGridBaseComponent
  implements OnInit {
  records;
  title = 'لیست اطلاعات پایه اخبار';

  constructor(
    private readonly router: Router,
    private readonly IncidentService: IncidentService,
    localStorageService: LocalStorageService,
    settingService: SettingService
  ) {
    super(localStorageService, settingService);
  }

  override ngOnInit(): void {
    super.ngOnInit();

    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: EditDeleteCellRenderer,
        cellRendererParams: {
          editUrl: '/base-info/incident-item/edit/',
        },
        width: 50,
      },
      {
        field: 'location',
        headerName: 'محل حادثه',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
      {
        field: 'hurtCount',
        headerName: 'مصدومین',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
      {
        field: 'id',
        headerName: 'کد',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
      {
        headerName: 'وضعیت',
        field: 'status',
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'حذف',
        field: 'isDeleted',
        filter: 'agSetColumnFilter',
      },
      {
        field: 'createUser',
        headerName: 'کاربر ایجاد کننده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },
      {
        field: 'createDate',
        headerName: 'تاریخ ایجاد',
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'آخرین ویرایش',
        field: 'lastModifyDate',
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'آخرین کاربر تغییر دهنده',
        field: 'lastUpdateUser',
        filter: 'agSetColumnFilter',
      },
    ];

    this.getList();
  }
  getList() {
    this.IncidentService.getList().subscribe((data) => {
      //debugger
      this.records = data;
    });
  }
  delete(id) {
    this.fireDeleteSwal().then((t) => {
      if (t.value === true) {
        this.deleteRecord(id);
      } else {
        this.dismissDeleteSwal(t);
      }
    });
  }

  deleteRecord(id) {
    this.IncidentService.delete(id).subscribe(() => {
      this.getList();
      this.fireDeleteSucceddedSwal();
    });
  }

  navigateToEdit(id) {
    this.router.navigate(['user-management/user/edit', id]);
  }
}
