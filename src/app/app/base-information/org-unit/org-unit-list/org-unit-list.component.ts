import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { EditDeleteCellRenderer } from 'src/app/app-shell/framework-components/ag-grid/edit-delete-cell-btn';
import { LocalStorageService } from 'src/app/app-shell/framework-services/local.storage.service';
import { SettingService } from 'src/app/app-shell/framework-services/setting.service';
import { OrgUnitService } from '../../services/org-unit.service';
import { ModalComponent } from 'src/app/app-shell/framework-components/modal/modal.component';
import { ModalConfig } from 'src/app/app-shell/framework-components/modal/modal.config';

@Component({
  selector: 'app-org-unit-list',
  templateUrl: './org-unit-list.component.html',
})
export class OrgUnitListComponent
  extends AgGridBaseComponent
  implements OnInit {
  records;
  title = 'لیست سازمان ها ';
  modalConfig: ModalConfig = {
    id: 'asd123',
    size: 'large',
    modalTitle: 'Modal title',
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  openDialog() {
    debugger;
    this.modalComponent.open();
  }
  constructor(
    private readonly router: Router,
    private readonly OrgUnitService: OrgUnitService,
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
          editUrl: '/base-info/org-unit/edit',
          canEdit: true,
        },
        width: 50,
      },
      {
        field: 'name',
        headerName: 'نام',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
      {
        field: 'parentName',
        headerName: 'والد',
        filter: 'agSetColumnFilter',
        headerClass: 'text-danger',
        cellClass: 'text-center',
      },
      {
        headerName: 'وضعیت',
        field: 'state',
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
      }

    ];

    this.getList();
  }
  getList() {
    this.OrgUnitService.getList().subscribe((data) => {
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
    this.OrgUnitService.delete(id).subscribe(() => {
      this.getList();
      this.fireDeleteSucceddedSwal();
    });
  }

  navigateToEdit(id) {
    this.router.navigate(['base-info/org-unit/edit', id]);
  }
}
