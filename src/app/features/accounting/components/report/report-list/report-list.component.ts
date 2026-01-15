import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import Swal from 'sweetalert2';
import { CellActionReportList } from './cell-action-report-list';
import { ReportWebApiService } from '../../../services/ReportWebApi.service';

@Component({
  selector: 'app-report-list',
  templateUrl: './report-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    RouterLink

  ]
})
export class ReportListComponent extends AgGridBaseComponent
  implements OnInit {

  private readonly router = inject(Router);
  private readonly repo = inject(ReportWebApiService);

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

  getDataPath_report = (task: any): string[] => {
    const path: string[] = [];
    let current = task;

    while (current) {
      path.unshift(current.ReportTitle);
      if (current.ReportRef === 0) break;
      current = this.records.find(t => t.ReportCode === current.ReportRef);
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
        cellRenderer: CellActionReportList,
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
    this.repo.GetReports(this.EditForm_SearchTarget.value)
      .subscribe((data: any) => {
        this.records = data?.Reports ?? [];
        this.updateGridData(1, this.records);
      });
  }



  navigatetodetail(data: any): void {
    this.router.navigate(['/accounting/report-detail', data.ReportCode]);
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
