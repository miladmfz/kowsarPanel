import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { GoodsGrpWebApiService } from 'src/app/features/accounting/services/KharidWebApi/GoodsGrpWebApi.service';

import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { UnitWebApiService } from 'src/app/features/accounting/services/KharidWebApi/UnitWebApi.service';

@Component({
  selector: 'app-unit-list',
  templateUrl: './unit-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    // RouterLink

  ]
})
export class UnitListComponent extends AgGridBaseComponent
  implements OnInit {

  private readonly router = inject(Router);
  private readonly notificationService = inject(NotificationService);
  private readonly repo = inject(UnitWebApiService);

  constructor() {
    super();
  }


  title = signal('واحد سنجش')
  records = signal<any[]>([])

  gridMemory1 = new Map<string, any>();
  gridKey = signal('');

  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(""),
    ObjectRef: new FormControl(""),
    ClassName: new FormControl(''),
  });

  getDataPath_Unit = (task: any): string[] => {
    const pathgroup: string[] = [];
    let current = task;

    while (current) {
      pathgroup.unshift(current.UnitName);
      if (current.UnitRef === 0) break;
      current = this.records().find(t => t.UnitCode === current.UnitRef);
    }

    return pathgroup;
  };



  // Helper method to find a Report by its UnitCode
  findByCode(UnitRef: string): any | undefined {

    const foundReport = this.records().find((data) => data.UnitCode === UnitRef);

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
      //   cellRenderer: CellActionUnitList,
      //   cellRendererParams: {
      //     editUrl: '/accounting/report-detail'
      //   }
      // }
    ];
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


    this.repo.GetUnits(this.EditForm_SearchTarget.value)
      .subscribe((data: any) => {

        this.records.set(data?.Units ?? [])
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
