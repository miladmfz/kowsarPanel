import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnInit, Renderer2, signal, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { SupportFactorWebApiService } from '../../../services/SupportFactorWebApi.service';
import { CellActionInternalGoodList } from './cell-action-internal-good-list';
import { TaskWebApiService } from '../../../services/TaskWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { CellActionGoodTaskList } from './cell-action-goodtask-list';
import { from } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';
@Component({
  selector: 'app-internal-good-list',
  templateUrl: './internal-good-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular
  ]
})
export class InternalGoodListComponent extends AgGridBaseComponent
  implements OnInit {

  private readonly router = inject(Router);
  private readonly renderer = inject(Renderer2);
  private readonly notificationService = inject(NotificationService);

  private readonly repo = inject(SupportFactorWebApiService);
  private readonly task_repo = inject(TaskWebApiService);


  constructor() {
    super();
  }


  title = signal('لیست کالاهای پشتیبانی کوثر')
  modal_GoodTask_title = signal('')
  records = signal<any[]>([])
  records_GoodTask = signal<any[]>([])
  records_Task = signal<any[]>([])
  dateValue = new FormControl();

  Searchtarget = signal('')
  GoodCode_selected = signal('0')
  selectedRows = signal<any[]>([])


  EditForm_task = new FormGroup({
    TaskCode: new FormControl("0"),
    TaskRef: new FormControl("0"),
    Title: new FormControl('', Validators.required),
    Explain: new FormControl(''),
    ParentName: new FormControl(''),
    Flag: new FormControl('0'),
  });


  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = mode === 'dark';
    });

    this.getGridSchema();
    this.GetGood();
  }

  getGridSchema() {
    this.column_name_1 = [
      {
        headerName: 'عملیات',
        pinned: 'left',
        width: 80,
        cellRenderer: CellActionInternalGoodList,
        cellRendererParams: {
          editUrl: '/internal/internal-good-edit'
        }
      },
      {
        field: 'GoodCode',
        headerName: 'ک کالا',

        cellClass: 'text-center',
        headerClass: 'text-center',
        minWidth: 200
      },
      {
        field: 'GoodName',
        headerName: 'نام کالا',

        cellClass: 'text-center',
        headerClass: 'text-center',
        minWidth: 200
      },

    ];


    this.columnDefs2 = [
      {
        headerName: 'عملیات',
        pinned: 'left',
        width: 80,
        cellRenderer: CellActionGoodTaskList,

      },
      {
        field: 'ParentTitle',
        headerName: 'دسته بندی وظیفه',
        cellClass: 'text-center',
        headerClass: 'text-center',
        minWidth: 200
      },
      {
        field: 'Title',
        headerName: 'عنوان وظبفه',

        cellClass: 'text-center',
        headerClass: 'text-center',
        minWidth: 200
      },

    ];


    this.columnDefs3 = [
      {
        headerName: 'شرح وظیفه',
        field: 'Explain',
        minWidth: 250
      },
      // {
      //   headerName: 'عملیات',
      //   pinned: 'left',
      //   minWidth: 250,
      //   cellRenderer: CellActionTaskList,
      //   cellRendererParams: {
      //     editUrl: '/internal/internal-task-edit'
      //   }
      // }
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


  navigateToEdit(data: any) {
    this.router.navigate(['/internal/internal-good-edit', data.GoodCode]);
  }


  navigateToNew() {
    this.router.navigate(['/internal/internal-good-edit']);
  }


  GetGood() {

    this.repo.GetGoodListSupport(this.Searchtarget())
      .subscribe((data: any) => {

        this.records.set(data.Goods)
        this.updateGridData(1, this.records());

      });
  }


  ShowGoodTask(data: any) {

    this.modal_GoodTask_title.set('شرح وظیفه آیتم ' + data.GoodName)
    this.GoodCode_selected.set(data.GoodCode)
    this.GetTaskFromGood()
  }

  GetTaskFromGood() {
    this.task_repo.GetTaskFromGood(this.GoodCode_selected())
      .subscribe((data: any) => {

        this.records_GoodTask.set(data.GoodTasks)
        this.updateGridData(2, this.records_GoodTask());
        this.goodtask_dialog_show()

      });

  }

  DeleteTaskFromGood(data: any) {
    console.log(data.GoodTaskCode)
    console.log(data)

    this.task_repo.GoodTask_Del(data.GoodTaskCode)
      .subscribe((data: any) => {
        this.GetTaskFromGood()
      });
  }

  ShowTask_Modal() {

    this.task_repo.GetTasks(this.EditForm_task.value)
      .subscribe((data: any) => {

        this.records_Task.set(data?.KowsarTasks ?? [])
        this.updateGridData(3, this.records_Task());
        this.tasklist_dialog_show()
      });


  }
  getDataPath_task = (task: any): string[] => {
    const path: string[] = [];
    let current = task;

    while (current) {
      path.unshift(current.Title);
      if (current.TaskRef === 0) break;
      current = this.records_Task().find(t => t.TaskCode === current.TaskRef);
    }

    return path;
  };

  onSelectionChanged_node(event: any) {

    this.selectedRows.set(event.api.getSelectedNodes())


  }

  onRowSelected(event: any) {

    const selectedNodes = event.api.getSelectedNodes();

    const result: any[] = [];

    selectedNodes.forEach((node: any) => {

      // child
      if (node.data) {

        result.push({
          type: 'child',
          ...node.data
        });

        // گرفتن parent ها
        let parent = node.parent;

        while (parent && parent.key) {
          const parentData = this.records_Task().find((g: any) =>
            g.Name === parent.key
          );

          result.push({
            type: 'parent',
            ...parentData
          });

          parent = parent.parent;
        }


      }

    });

    // حذف duplicate ها
    const unique = Array.from(
      new Map(result.map(r => [JSON.stringify(r), r])).values()
    );


    this.selectedRows.set(unique);



  }

  Set_goodtask() {
    const rows = this.selectedRows() ?? [];

    const childRows = rows.filter((row: any) =>
      row?.type === 'child' && row?.TaskCode
    );

    if (childRows.length === 0) {
      this.notificationService.warning('هیچ تسکی انتخاب نشده است');
      return;
    }

    this.notificationService.develop();

    from(childRows)
      .pipe(
        concatMap((row: any) => {
          console.log('در حال انجام TaskCode:', row.TaskCode);

          return this.task_repo.GoodTask_Add(
            this.GoodCode_selected(),
            row.TaskCode
          );
        }),

        toArray()
      )
      .subscribe({
        next: (results: any[]) => {
          console.log('همه انجام شدند:', results);
          this.notificationService.success('عملیات با موفقیت انجام شد');
          this.GetTaskFromGood()
          this.tasklist_dialog_close()
        },
        error: (err: any) => {
          console.error('خطا در انجام عملیات:', err);
          this.notificationService.error('خطا در انجام عملیات');
        }
      });
  }

  @ViewChild('goodtask', { static: false }) goodtask!: ElementRef<HTMLDivElement>;
  @ViewChild('tasklist', { static: false }) tasklist!: ElementRef<HTMLDivElement>;

  goodtask_dialog_show(): void {
    const modal = this.goodtask?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  goodtask_dialog_close(): void {
    const modal = this.goodtask?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


  tasklist_dialog_show(): void {
    const modal = this.tasklist?.nativeElement;
    if (!modal) return;
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }

  tasklist_dialog_close(): void {
    const modal = this.tasklist?.nativeElement;
    if (!modal) return;
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }





}
