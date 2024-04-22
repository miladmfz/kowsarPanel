import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { EditDeleteCellRenderer } from 'src/app/app-shell/framework-components/ag-grid/edit-delete-cell-btn';
import { LocalStorageService } from 'src/app/app-shell/framework-services/local.storage.service';
import { SettingService } from 'src/app/app-shell/framework-services/setting.service';
import { AccidentTypeService } from '../../services/accident-type.service';
import { ModalComponent } from 'src/app/app-shell/framework-components/modal/modal.component';
import { ModalConfig } from 'src/app/app-shell/framework-components/modal/modal.config';
import { JsTreeComponent } from 'src/app/app-shell/framework-components/js-tree-component/js-tree.component';

@Component({
  selector: 'app-accident-type-list',
  templateUrl: './accident-type-list.component.html',
})
export class AccidentTypeListComponent
  extends AgGridBaseComponent
  implements OnInit
{
  records;
  title = 'لیست نوع حادثه';
  modalConfig: ModalConfig = {
    id: 'asd123',
    size: 'large',
    modalTitle: 'Modal title',
  };
  @ViewChild('modal') private modalComponent: ModalComponent;
  @ViewChild('tree') private treeComponent: JsTreeComponent;

  openDialog() {
    debugger;
    let treeData = [
      { id: 1, parentId: '#', title: 'test' },
      { id: 2, parentId: '1', title: 'test1' },
      { id: 3, parentId: '1', title: 'test2' },
    ];
    this.treeComponent.drawTree(treeData);

    // this.modalComponent.open();
  }
  constructor(
    private readonly router: Router,
    private readonly AccidentTypeService: AccidentTypeService,
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
          canEdit: true,
        },
        width: 50,
      },
      {
        field: 'itemTitle',
        headerName: 'نام',
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
        field: 'lastUpdateDate',
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
    this.AccidentTypeService.getList().subscribe((data) => {
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
    this.AccidentTypeService.delete(id).subscribe(() => {
      this.getList();
      this.fireDeleteSucceddedSwal();
    });
  }

  navigateToEdit(id) {
    this.router.navigate(['user-management/user/edit', id]);
  }
}
