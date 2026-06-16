import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import Swal from 'sweetalert2';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CellActionTaskList } from './cell-action-task-list';
import { CommonModule } from '@angular/common';
import { AgGridAngular } from 'ag-grid-angular';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { TaskWebApiService } from '../../../services/TaskWebApi.service';

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



  private readonly repo = inject(TaskWebApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly router = inject(Router);

  constructor() {
    super();
  }


  title = signal('لیست خدمات')
  records = signal<any[]>([])

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
      current = this.records().find(t => t.TaskCode === current.TaskRef);
    }

    return path;
  };

  ngOnInit(): void {



    this.getGridSchema();
    this.GetTasks();
  }
  navigatetoedit(data: any) {
    this.router.navigate(['/internal/internal-task-edit', data.TaskCode]);
  }
  getGridSchema() {
    this.column_name_1 = [
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

    this.repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {

        this.records.set(data?.KowsarTasks ?? [])
        this.updateGridData(1, this.records());
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




        this.repo.DeleteTask(this.EditForm_task.value).subscribe((data: any) => {



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
