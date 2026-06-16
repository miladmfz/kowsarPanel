import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { GoodsGrpWebApiService } from 'src/app/features/accounting/services/KharidWebApi/GoodsGrpWebApi.service';

import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { CentralGrpWebApiService } from 'src/app/features/accounting/services/TaarifPayeWebApi/CentralGrpWebApi.service';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
@Component({
  selector: 'app-centralgrp-list',
  templateUrl: './centralgrp-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    // RouterLink

  ]
})
export class CentralgrpListComponent extends AgGridBaseComponent
  implements OnInit {

  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly repo = inject(CentralGrpWebApiService);
  private readonly gridMemory_service = inject(AgGridMemoryService);

  constructor() {
    super();
  }


  title = signal('طبقه بندی اجزای پایه')
  records = signal<any[]>([])

  gridMemory1 = new Map<string, any>();
  gridKey = signal('');

  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(""),
    ObjectRef: new FormControl(""),
    ClassName: new FormControl(''),
  });

  getDataPath_CentralGrp = (task: any): string[] => {
    const pathgroup: string[] = [];
    let current = task;

    while (current) {
      pathgroup.unshift(current.Name);
      if (current.GroupRef === 0) break;
      current = this.records().find(t => t.GroupCode === current.GroupRef);
    }

    return pathgroup;
  };



  // Helper method to find a Report by its GroupCode
  findByCode(GroupRef: string): any | undefined {

    const foundReport = this.records().find((data) => data.GroupCode === GroupRef);

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
      // {
      //   headerName: 'عملیات',
      //   pinned: 'left',
      //   minWidth: 100,
      //   cellRenderer: CellActionCentralGrpList,
      //   cellRendererParams: {
      //     editUrl: '/accounting/report-detail'
      //   }
      // }

    ];
    this.GetData()
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



  GetData() {


    this.repo.GetCentralGrp(this.EditForm_SearchTarget.value)
      .subscribe((data: any) => {

        this.records.set(data?.CentralGrps ?? [])
        this.updateGridData(1, this.records());
      });
  }


  navigateToNew() {
    // this.router.navigate(['/accounting/goodsgrp-list']);
    this.notificationService.develop()
  }
  navigatetoedit() {
    // this.router.navigate(['/accounting/goodsgrp-list',data.goodsgrpCode]);
    this.notificationService.develop()
  }



}
