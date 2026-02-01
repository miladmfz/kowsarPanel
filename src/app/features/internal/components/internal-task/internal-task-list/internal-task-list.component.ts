import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import Swal from 'sweetalert2';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CellActionTaskList } from './cell-action-task-list';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';

@Component({
  selector: 'app-internal-task-list',
  templateUrl: './internal-task-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    RouterLink

  ]
})
export class InternalTaskListComponent
  extends AgGridBaseComponent
  implements OnInit {


  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(SupportFactorWebApiService);
  private readonly notificationService = inject(NotificationService);

  constructor() {
    super();
  }


  title = 'لیست خدمات';
  records: any[] = [];

  EditForm_task = new FormGroup({
    TaskCode: new FormControl("0"),
    TaskRef: new FormControl("0"),
    Title: new FormControl('', Validators.required),
    Explain: new FormControl(''),
    ParentName: new FormControl(''),
    Flag: new FormControl('0'),
  });

  // مسیر درختی AG Grid
  getDataPath_group = (task: any): string[] => {
    const path: string[] = [];
    let current = task;

    while (current) {
      path.unshift(current.Title);
      if (current.TaskRef === 0) break;
      current = this.records.find(t => t.TaskCode === current.TaskRef);
    }

    return path;
  };

  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });

    this.getGridSchema();
    this.GetTasks();
  }

  getGridSchema() {
    this.columnDefs1 = [
      {
        headerName: 'شرح وظیفه',
        field: 'Explain',
        minWidth: 250
      },
      {
        headerName: 'عملیات',
        pinned: 'left',
        minWidth: 250,
        cellRenderer: CellActionTaskList,
        cellRendererParams: {
          editUrl: '/internal/internal-task-edit'
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

  GetTasks() {
    this.loadingService.show()
    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {
        this.loadingService.hide()
        this.records = data?.KowsarTasks ?? [];
        this.updateGridData(1, this.records);
      });
  }

  delete(TaskCode: any) {
    Swal.fire({
      title: 'حذف تسک',
      text: 'آیا از حذف این تسک اطمینان دارید؟',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله',
      cancelButtonText: 'خیر',
    }).then((result) => {
      if (result.isConfirmed) {
        this.EditForm_task.patchValue({ TaskCode });

        this.loadingService.show()

        this.loadingService.show()
        this.repo.DeleteTask(this.EditForm_task.value).subscribe((data: any) => {
          this.loadingService.hide()
          this.loadingService.hide()

          if (data.KowsarTasks[0].Success === '0') {
            this.notificationService.error(data.KowsarTasks[0].Message);
          } else {
            this.notificationService.succeded();
            this.EditForm_task.reset();
            this.GetTasks();
          }
        });
      }
    });
  }


}
