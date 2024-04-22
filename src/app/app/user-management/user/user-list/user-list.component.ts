import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { UserService } from '../../services/user.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { EditDeleteCellRenderer } from 'src/app/app-shell/framework-components/ag-grid/edit-delete-cell-btn';
import { LocalStorageService } from 'src/app/app-shell/framework-services/local.storage.service';
import { SettingService } from 'src/app/app-shell/framework-services/setting.service';

@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
})
export class UserListComponent extends AgGridBaseComponent implements OnInit {
  records;

  constructor(
    private readonly router: Router,
    private readonly userService: UserService,
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
          editUrl: '/user-management/user/edit',
        },
        width: 50,
      },
      {
        field: 'name',
        headerName: 'نام و نام خانوادگی',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
        // headerCheckboxSelection: true,
        // headerCheckboxSelectionFilteredOnly: true,
        // checkboxSelection: true,
      },
      {
        headerName: 'نام لاتین',
        field: 'engFullname',
        filter: 'agSetColumnFilter',
      },
      {
        field: 'username',
        headerName: 'نام کاربری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
      },
      {
        field: 'userGroupName',
        headerName: 'گروه کاربری',
        filter: 'agSetColumnFilter',
      },
      {
        field: 'mobile',
        headerName: 'موبایل',
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'ایجاد کننده',
        field: 'createdBy',
        filter: 'agSetColumnFilter',
      },
      {
        headerName: 'تاریخ ایجاد',
        field: 'created',
        filter: 'agSetColumnFilter',
      },
    ];

    this.getList();
  }

  getList() {
    // this.userService.getList().subscribe((data) => {
    //   this.records = data;
    // });
    this.userService.fakeUser().subscribe((data) => {
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
    this.userService.delete(id).subscribe(() => {
      this.getList();
      this.fireDeleteSucceddedSwal();
    });
  }

  navigateToEdit(id) {
    this.router.navigate(['user-management/user/edit', id]);
  }
}
