import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { EditDeleteCellRenderer } from 'src/app/app-shell/framework-components/ag-grid/edit-delete-cell-btn';
import { LocalStorageService } from 'src/app/app-shell/framework-services/local.storage.service';
import { SettingService } from 'src/app/app-shell/framework-services/setting.service';
import { AccidentTypeService } from '../../services/accident-type.service';
import { IncidentItemService } from '../../services/incident-item.service';
import { isDebuggerStatement } from 'typescript';

@Component({
  selector: 'app-incident-item-list',
  templateUrl: './incident-item-list.component.html',
})
export class IncidentItemListComponent
  extends AgGridBaseComponent
  implements OnInit {
  records;
  isLoading = false;
  title = 'لیست اطلاعات پایه اخبار';

  constructor(
    private readonly router: Router,
    private readonly IncidentItemService: IncidentItemService,
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
        field: 'incidentItemName',
        headerName: 'عنوان',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
      {
        field: 'incidentItemParentId',
        headerName: 'کد پدر',
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
    this.isLoading = true;
    this.IncidentItemService.getList().subscribe((data) => {
      //debugger
      this.records = data;
      this.isLoading = false;
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
    this.IncidentItemService.delete(id).subscribe(() => {
      this.getList();
      this.fireDeleteSucceddedSwal();
    });
  }

  // navigateToEdit(id) {
  //   this.router.navigate(['base-info/incident-item/edit', id]);
  // }
}
