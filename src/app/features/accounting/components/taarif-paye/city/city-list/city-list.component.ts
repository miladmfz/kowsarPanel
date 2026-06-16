import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { GoodsGrpWebApiService } from 'src/app/features/accounting/services/KharidWebApi/GoodsGrpWebApi.service';
import { CityWebApiService } from 'src/app/features/accounting/services/TaarifPayeWebApi/CityWebApi.service';
import { CellActionCityList } from './cell-action-city-list';

@Component({
  selector: 'app-city-list',
  templateUrl: './city-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    // RouterLink

  ]
})
export class CityListComponent extends AgGridBaseComponent
  implements OnInit {

  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly repo = inject(CityWebApiService);
  private readonly renderer = inject(Renderer2);

  private readonly gridMemory_service = inject(AgGridMemoryService);

  constructor() {
    super();
  }


  title = signal('شهر')
  modal_title = signal('ایجاد شهر جدید')
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
    City: new FormArray([])
  });


  JsonForm = new FormGroup({
    JsonData: new FormControl(""),
  });


  originalValues: any = {};
  changedValues = signal<any[]>([])


  EditForm_City = new FormGroup({
    RowIndex: new FormControl("1"),
    CityCode: new FormControl(0),
    Name: new FormControl('', Validators.required),
    ParentCode: new FormControl(0),
    ParentName: new FormControl(""),
  });



  saveExpandedNodes() {

    if (!this.gridApi1) return;

    const expanded: number[] = [];

    this.gridApi1.forEachNode((node: any) => {

      if (node.expanded && node.data) {
        expanded.push(node.data.CityCode);
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
        expanded.includes(node.data.CityCode)
      ) {
        node.setExpanded(true);
      }

    });
  }
  getDataPath_CityCode = (task: any): string[] => {
    const pathgroup: string[] = [];
    let current = task;

    while (current) {
      pathgroup.unshift(current.Name);
      if (current.CityRef === 0) break;
      current = this.records().find(t => t.CityCode === current.CityRef);
    }

    return pathgroup;
  };



  // Helper method to find a Report by its CityCode
  findByCode(CityCode: string): any | undefined {

    const foundReport = this.records().find((data) => data.CityCode === CityCode);

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
      // {
      //   headerName: 'شرح وظیفه',
      //   field: 'Explain',
      //   minWidth: 250
      // },
      {
        headerName: 'عملیات',
        pinned: 'left',
        minWidth: 100,
        cellRenderer: CellActionCityList,
        cellRendererParams: {
          editUrl: '/accounting/report-detail'
        }
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
    this.repo.GetCity(this.EditForm_SearchTarget.value)
      .subscribe((data: any) => {

        this.records.set(data?.Citys ?? [])
        this.updateGridData(1, this.records());
        // بازگردانی وضعیت tree
        setTimeout(() => {
          this.restoreExpandedNodes();
        }, 100);
      });
  }




  Reset_form() {


    this.EditForm_City.patchValue({
      RowIndex: "1",
      CityCode: 0,
      Name: "",
      ParentCode: 0,
    });
  }

  createChild(data: any) {
    this.Reset_form()
    this.EditForm_City.patchValue({
      RowIndex: "1",
      CityCode: 0,
      Name: "",
      ParentCode: data.CityCode,
      ParentName: data.Name,
    });
    this.modal_title.set("ایجاد زیر شاخه جدید برای " + data.Name)
    this.city_dialog_show()
  }


  UpdateItem(data: any) {
    this.Reset_form()
    this.EditForm_City.patchValue({
      RowIndex: "1",
      CityCode: data.CityCode,
      Name: data.Name,
      ParentCode: data.CityRef,
      ParentName: data.ParentName,
    });
    this.modal_title.set("اصلاح شهر مورد نظر ")

    this.cityedit_dialog_show()
  }

  createParent() {
    this.Reset_form()
    this.EditForm_City.patchValue({
      RowIndex: "1",
      CityCode: 0,
      Name: "",
      ParentCode: 0,
    });

    this.modal_title.set("ایجاد شاخه جدید")
    this.city_dialog_show()
  }

  deleteItem(data: any) {
    this.notificationService.develop()

  }

  Setcity() {


    (this.KowsarTemplate.get('City') as FormArray).clear();
    (this.KowsarTemplate.get('City') as FormArray).push(this.EditForm_City);

    this.JsonForm.patchValue({
      JsonData: JSON.stringify(this.KowsarTemplate.value)
    });


    this.repo.CityCrudService(this.JsonForm.value).subscribe((data: any) => {



      const result = JSON.parse(data.Citys[0].Result);

      if (result.City && result.City[0].ErrMessage === "") {


        const parentCode = this.EditForm_City.value.ParentCode;

        if (parentCode && parentCode !== 0) {

          this.expandedNodes.update(nodes => {

            if (!nodes.includes(parentCode)) {
              return [...nodes, parentCode];
            }

            return nodes;
          });

        }



        this.Code.set(result.City[0].CityCode + "")
        this.notificationService.succeded();
        this.GetData(false)
        this.city_dialog_close()
        this.cityedit_dialog_close()
      } else {

        this.notificationService.error(result.City[0].ErrMessage);
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

  // navigateToNew(data: any) {
  //   // this.router.navigate(['/accounting/goodsgrp-list']);
  //   this.notificationService.develop()
  // }
  // navigatetoedit() {
  //   // this.router.navigate(['/accounting/goodsgrp-list',data.goodsgrpCode]);
  //   this.notificationService.develop()
  // }



  city_dialog_show() {
    const modal = this.renderer.selectRootElement('#citymodal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  city_dialog_close() {
    const modal = this.renderer.selectRootElement('#citymodal', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


  cityedit_dialog_show() {
    const modal = this.renderer.selectRootElement('#citymodaledit', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  cityedit_dialog_close() {
    const modal = this.renderer.selectRootElement('#citymodaledit', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


}

