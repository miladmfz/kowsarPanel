import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserGroupService } from '../../services/user-group.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { EditDeleteCellRenderer } from 'src/app/app-shell/framework-components/ag-grid/edit-delete-cell-btn';
import { LocalStorageService } from 'src/app/app-shell/framework-services/local.storage.service';
import { SettingService } from 'src/app/app-shell/framework-services/setting.service';

@Component({
  selector: 'app-user-group-list',
  templateUrl: './user-group-list.component.html',
})
export class UserGroupListComponent
  extends AgGridBaseComponent
  implements OnInit
{
  userGroups;

  constructor(
    private readonly router: Router,
    private readonly userGroupService: UserGroupService,
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
          editUrl: '/user-management/user-group/edit',
        },
        width: 50,
      },
      {
        field: 'name',
        headerName: 'نام',
      },
      {
        field: 'userCount',
        headerName: 'تعداد کاربران',
      },
      {
        headerName: 'ایجاد کننده',
        field: 'createdBy',
      },
      {
        headerName: 'تاریخ ایجاد',
        field: 'created',
      },
    ];

    this.getList();
  }

  getList() {
    // this.userGroupService
    //   .getList()
    //   .subscribe(data => this.userGroups = data)
    this.userGroupService
      .fakeUser()
      .subscribe((data) => (this.userGroups = data));
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
    this.userGroupService.delete(id).subscribe(() => {
      this.getList();
      this.fireDeleteSucceddedSwal();
    });
  }

  navigateToEdit(id) {
    this.router.navigate(['user-management/user-group/edit', id]);
  }
}
