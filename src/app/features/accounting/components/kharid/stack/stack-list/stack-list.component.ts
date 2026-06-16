import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { GoodsGrpWebApiService } from 'src/app/features/accounting/services/KharidWebApi/GoodsGrpWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { StackWebApiService } from 'src/app/features/accounting/services/KharidWebApi/StackWebApi.service';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { CellActionStackList } from './cell-action-stack-list';


@Component({
  selector: 'app-stack-list',
  templateUrl: './stack-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    // RouterLink

  ]
})
export class StackListComponent extends AgGridBaseComponent
  implements OnInit {


  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly repo = inject(StackWebApiService);
  private readonly renderer = inject(Renderer2);

  private readonly gridMemory_service = inject(AgGridMemoryService);

  constructor() {
    super();
  }


  title = signal('انبار')
  modal_title = signal('ایجاد انبار جدید')
  records = signal<any[]>([])

  Code = signal('')
  Code_int = signal(0)
  expandedNodes = signal<number[]>([]);

  gridMemory1 = new Map<string, any>();
  gridKey = signal('');


  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(""),
    ObjectRef: new FormControl(""),
    ClassName: new FormControl(''),
  });



  KowsarTemplate = new FormGroup({
    Stacks: new FormArray([])
  });


  JsonForm = new FormGroup({
    JsonData: new FormControl(""),
  });


  originalValues: any = {};
  changedValues = signal<any[]>([])


  EditForm_Stacks = new FormGroup({
    RowIndex: new FormControl("1"),
    StackCode: new FormControl(0),
    Name: new FormControl('', Validators.required),
    ParentCode: new FormControl(0),
    ParentName: new FormControl(""),
  });






  getDataPath_Sta = (task: any): string[] => {
    const pathgroup: string[] = [];
    let current = task;

    while (current) {
      pathgroup.unshift(current.Name);
      if (current.GroupRef === 0) break;
      current = this.records().find(t => t.GroupCode === current.GroupRef);
    }

    return pathgroup;
  };



  saveExpandedNodes() {

    if (!this.gridApi1) return;

    const expanded: number[] = [];

    this.gridApi1.forEachNode((node: any) => {

      if (node.expanded && node.data) {
        expanded.push(node.data.StackCode);
      }

    });

    this.expandedNodes.set(expanded);
  }

  restoreExpandedNodes() {

    if (!this.gridApi1) return;

    const expanded = this.expandedNodes();

    this.gridApi1.forEachNode((node: any) => {

      if (
        node.data &&
        expanded.includes(node.data.StackCode)
      ) {
        node.setExpanded(true);
      }

    });
  }
  getDataPath_StackCode = (task: any): string[] => {
    const pathgroup: string[] = [];
    let current = task;

    while (current) {
      pathgroup.unshift(current.Name);
      if (current.StackRef === 0) break;
      current = this.records().find(t => t.StackCode === current.StackRef);
    }

    return pathgroup;
  };



  // Helper method to find a Report by its StackCode
  findByCode(StackCode: string): any | undefined {

    const foundReport = this.records().find((data) => data.StackCode === StackCode);

    return foundReport;
  }

  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });

    this.getGridSchema();
  }

  getGridSchema() {
    this.column_name_1 = [

      {
        headerName: 'عملیات',
        pinned: 'left',
        minWidth: 100,
        cellRenderer: CellActionStackList,

      }
    ];
    this.GetData();

  }
  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    setTimeout(() => {
      if (params.api && !params.api.isDestroyed?.()) {
        params.api.sizeColumnsToFit();
      }
    }, 50);
  }


  GetData(saveState: boolean = true) {
    // فقط وقتی لازم بود state ذخیره کن
    if (saveState) {
      this.saveExpandedNodes();
    }
    this.repo.GetStacks(this.EditForm_SearchTarget.value)
      .subscribe((data: any) => {

        this.records.set(data?.Stacks ?? [])
        this.updateGridData(1, this.records());
        // بازگردانی وضعیت tree
        setTimeout(() => {
          this.restoreExpandedNodes();
        }, 100);
      });
  }




  Reset_form() {


    this.EditForm_Stacks.patchValue({
      RowIndex: "1",
      StackCode: 0,
      Name: "",
      ParentCode: 0,
    });
  }

  createChild(data: any) {
    this.Reset_form()
    this.EditForm_Stacks.patchValue({
      RowIndex: "1",
      StackCode: 0,
      Name: "",
      ParentCode: data.StackCode,
      ParentName: data.Name,
    });
    this.modal_title.set("ایجاد زیر انبار جدید برای " + data.Name)
    this.stack_dialog_show()
  }


  UpdateItem(data: any) {
    this.Reset_form()
    this.EditForm_Stacks.patchValue({
      RowIndex: "1",
      StackCode: data.StackCode,
      Name: data.Name,
      ParentCode: data.StackRef,
      ParentName: data.ParentName,
    });
    this.modal_title.set("اصلاح انبار مورد نظر ")
    this.stackedit_dialog_show()
  }

  createParent() {
    this.Reset_form()
    this.EditForm_Stacks.patchValue({
      RowIndex: "1",
      StackCode: 0,
      Name: "",
      ParentCode: 0,
    });

    this.modal_title.set("ایجاد انبار جدید")
  }



  deleteItem(data: any) {
    this.notificationService.develop()

  }

  Setstack() {


    (this.KowsarTemplate.get('Stacks') as FormArray).clear();
    (this.KowsarTemplate.get('Stacks') as FormArray).push(this.EditForm_Stacks);

    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate.value)
    });


    this.repo.StacksCrudService(this.JsonForm.value).subscribe((data: any) => {



      const result = JSON.parse(data.Stacks[0].Result);
      console.log(result)
      if (result.Stacks && result.Stacks[0].ErrMessage === "") {


        const parentCode = this.EditForm_Stacks.value.ParentCode;

        if (parentCode && parentCode !== 0) {

          this.expandedNodes.update(nodes => {

            if (!nodes.includes(parentCode)) {
              return [...nodes, parentCode];
            }

            return nodes;
          });

        }



        this.Code.set(result.Stacks[0].StackCode + "")
        this.notificationService.succeded();
        this.GetData(false)
        this.stack_dialog_close()
        this.stackedit_dialog_close()
      } else {

        this.notificationService.error(result.Stacks[0].ErrMessage);
      }

    });

  }


  override onFirstDataRendered(params: any) {
    const memory = this.gridMemory_service.get(this.gridKey());
    if (!params.api || params.api.isDestroyed?.()) return;

    if (memory?.columnState) {
      params.api.applyColumnState({ state: memory.columnState, applyOrder: true });
    }

    if (memory?.filterState) {
      params.api.setFilterModel(memory.filterState);
    }

    if (memory?.rowData) {
      this.records.set(memory.rowData);
    } else {
      this.GetData();
    }
  }

  onGridStateChanged() {
    const api = this.gridApi1;
    if (!api) return;

    this.gridMemory_service.save(this.gridKey(), {
      columnState: api.getColumnState(),
      filterState: api.getFilterModel()
    });
  }



  stack_dialog_show() {
    const modal = this.renderer.selectRootElement('#stackmodal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  stack_dialog_close() {
    const modal = this.renderer.selectRootElement('#stackmodal', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

  stackedit_dialog_show() {
    const modal = this.renderer.selectRootElement('#stackmodaledit', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  stackedit_dialog_close() {
    const modal = this.renderer.selectRootElement('#stackmodaledit', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }

}
