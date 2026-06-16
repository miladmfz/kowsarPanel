import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

import Swal from 'sweetalert2';
import { CellActionReportList } from './cell-action-report-list';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,


  ]
})
export class ReportListComponent extends AgGridBaseComponent
  implements OnInit {

  private readonly router = inject(Router);
  private readonly gridMemory_service = inject(AgGridMemoryService);

  private readonly repo = inject(ReportWebApiService);

  constructor() {
    super();
  }


  title = signal('')
  records = signal<any[]>([])

  gridMemory1 = new Map<string, any>();
  gridKey = signal('');

  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(""),
    ObjectRef: new FormControl(""),
    ClassName: new FormControl(''),
  });

  getDataPath_report = (task: any): string[] => {
    const path: string[] = [];
    let current = task;

    while (current) {
      path.unshift(current.ReportTitle);
      if (current.ReportRef === 0) break;
      current = this.records().find(t => t.ReportCode === current.ReportRef);
    }

    return path;
  };

  getDataPath_report1 = (data: any) => {


    const path: string[] = [];

    // Construct the path based on L1, L2, L3, L4, and L5


    if (data.l1 !== '0') {
      const parentL1 = this.findReportByCode(data.l1);
      if (parentL1) {
        path.push(parentL1.ReportTitle); // Add the L1 parent Report ReportTitle
      }
    }

    if (data.l2 !== '0') {
      const parentL2 = this.findReportByCode(data.l2);
      if (parentL2) {
        path.push(parentL2.ReportTitle); // Add the L2 parent Report ReportTitle
      }
    }


    if (data.l3 !== '0') {
      const parentL3 = this.findReportByCode(data.l3);
      if (parentL3) {
        path.push(parentL3.ReportTitle); // Add the L3 parent Report ReportTitle
      }
    }

    if (data.l4 !== '0') {
      const parentL4 = this.findReportByCode(data.l4);
      if (parentL4) {
        path.push(parentL4.ReportTitle); // Add the L4 parent Report ReportTitle
      }
    }


    path.push(data.ReportTitle);


    return path;
  };

  // Helper method to find a Report by its ReportCode
  findReportByCode(ReportCode: string): any | undefined {

    const foundReport = this.records().find((report) => report.ReportCode === ReportCode);

    return foundReport;
  }

  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });

    this.getGridSchema();
    this.GetData();
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
        width: 70,
        cellRenderer: CellActionReportList,
        cellRendererParams: {
          editUrl: '/accounting/gozareshat/report-detail'
        }
      }
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

  GetData() {

    this.repo.GetReports(this.EditForm_SearchTarget.value)
      .subscribe((data: any) => {


        const reports = data?.Reports ?? []

        if (!reports.length) {
          this.title.set('گزارشی یافت نشد')
        } else {
          this.title.set('لیست گزارشات')

        }



        this.records.set(data?.Reports ?? [])
        this.updateGridData(1, this.records());
      });
  }



  navigatetodetail(data: any): void {
    this.router.navigate(['/accounting/gozareshat/report-detail', data.ReportCode]);
  }




}
