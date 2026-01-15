import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { GoodsGrpWebApiService } from '../../../services/GoodsGrpWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { CellActionGoodsGrpList } from './cell-action-goodsgrp-list';

@Component({
  selector: 'app-goodsgrp-list',
  templateUrl: './goodsgrp-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    RouterLink

  ]
})
export class GoodsgrpListComponent extends AgGridBaseComponent
  implements OnInit {

  private readonly router = inject(Router);
  private readonly repo = inject(GoodsGrpWebApiService);

  constructor() {
    super();
  }


  title = 'لیست خدمات';
  records: any[] = [];

  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(""),
    ObjectRef: new FormControl(""),
    ClassName: new FormControl(''),
  });

  getDataPath_GoodsGrp = (task: any): string[] => {
    const pathgroup: string[] = [];
    let current = task;

    while (current) {
      pathgroup.unshift(current.Name);
      if (current.GroupRef === 0) break;
      current = this.records.find(t => t.GroupCode === current.GroupRef);
    }

    return pathgroup;
  };



  // Helper method to find a Report by its ReportCode
  findReportByCode(ReportCode: string): any | undefined {

    const foundReport = this.records.find((report) => report.ReportCode === ReportCode);

    return foundReport;
  }

  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });

    this.getGridSchema();
    this.GetReports();
  }

  getGridSchema() {
    this.columnDefs1 = [
      // {
      //   headerName: 'شرح وظیفه',
      //   field: 'Explain',
      //   minWidth: 250
      // },
      {
        headerName: 'عملیات',
        pinned: 'left',
        minWidth: 100,
        cellRenderer: CellActionGoodsGrpList,
        cellRendererParams: {
          editUrl: '/accounting/report-detail'
        }
      }
    ];
  }
  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    // ذخیره API درست
    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    // فیت کردن ستون‌ها با تأخیر کوتاه
    setTimeout(() => {
      try {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      } catch { }
    }, 50);
  }

  GetReports() {
    this.repo.GetGoodsGrp(this.EditForm_SearchTarget.value)
      .subscribe((data: any) => {
        this.records = data?.GoodsGrps ?? [];
        this.updateGridData(1, this.records);
      });
  }



  navigatetoedit(data: any): void {
    this.router.navigate(['/accounting/goodsgrp-edit', data.GroupCode]);
  }

  // delete(TaskCode: any) {
  //   Swal.fire({
  //     title: 'حذف تسک',
  //     text: 'آیا از حذف این تسک اطمینان دارید؟',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonText: 'بله',
  //     cancelButtonText: 'خیر',
  //   }).then((result) => {
  //     if (result.isConfirmed) {
  //       this.EditForm_task.patchValue({ TaskCode });

  //       this.loadingService.show();

  //       this.repo.DeleteTask(this.EditForm_task.value).subscribe((data: any) => {
  //         this.loadingService.hide();

  //         if (data.KowsarTasks[0].Success === '0') {
  //           this.notificationService.error(data.KowsarTasks[0].Message);
  //         } else {
  //           this.notificationService.succeded();
  //           this.EditForm_task.reset();
  //           this.GetTasks();
  //         }
  //       });
  //     }
  //   });
  // }


}
