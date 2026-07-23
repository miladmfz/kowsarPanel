import { Component, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { TaskWebApiService } from '../../../services/TaskWebApi.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { AgGridModule } from 'ag-grid-angular';
import { CellActionTaskEdit } from './cell_action_task_edit';
import { from } from 'rxjs';
import { concatMap, toArray } from 'rxjs/operators';

@Component({
  selector: 'app-internal-task-edit',
  standalone: true,
  templateUrl: './internal-task-edit.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridModule,

  ]
})
export class InternalTaskEditComponent extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  // inject اسلوب مدرن
  private route = inject(ActivatedRoute);
  private repo = inject(TaskWebApiService);
  private notificationService = inject(NotificationService);
  private location = inject(Location);
  private readonly renderer = inject(Renderer2);

  title = signal('تعریف / ویرایش خدمت')
  TaskCode = signal('')

  isCreateMode = computed(() => {
    const code = this.TaskCode();
    return !code || code === '0';
  });

  isEditMode = computed(() => {
    return !this.isCreateMode();
  });
  // لیست سطوح والد
  records_dependency = signal<any[]>([])

  records_Task = signal<any[]>([])
  Parent_lvl1 = signal<any[]>([])
  Parent_lvl2 = signal<any[]>([])
  Parent_lvl3 = signal<any[]>([])
  Parent_lvl4 = signal<any[]>([])
  Parent_lvl5 = signal<any[]>([])
  Parent_lvl6 = signal<any[]>([])
  Parent_lvl7 = signal<any[]>([])
  Parent_lvl8 = signal<any[]>([])
  Parent_lvl9 = signal<any[]>([])

  EditForm_task_all = new FormGroup({
    TaskCode: new FormControl("0"),
    TaskRef: new FormControl("0"),
    Title: new FormControl('', Validators.required),
    Explain: new FormControl(''),
    ParentName: new FormControl(''),
    Flag: new FormControl('0'),
  });

  EditForm_task = new FormGroup({
    TaskCode: new FormControl("0"),
    TaskRef: new FormControl("0"),
    Title: new FormControl('', Validators.required),
    Explain: new FormControl(''),
    ParentCode1: new FormControl(''),
    ParentCode2: new FormControl(''),
    ParentCode3: new FormControl(''),
    ParentCode4: new FormControl(''),
    ParentCode5: new FormControl(''),
    ParentCode6: new FormControl(''),
    ParentCode7: new FormControl(''),
    ParentCode8: new FormControl(''),
    ParentCode9: new FormControl(''),

    ParentTitle: new FormControl(''),
    ParentName1: new FormControl(''),
    ParentName2: new FormControl(''),
    ParentName3: new FormControl(''),
    ParentName4: new FormControl(''),
    ParentName5: new FormControl(''),
    ParentName6: new FormControl(''),
    ParentName7: new FormControl(''),
    ParentName8: new FormControl(''),
    ParentName9: new FormControl(''),

    Flag: new FormControl('1'),

  });

  ngOnInit(): void {


    this.route.paramMap.subscribe((params: ParamMap) => {
      const idStr = params.get('id');       // رشته
      this.TaskCode.set(idStr)
      const idNum = Number(idStr);          // فقط برای مقایسه

      if (!idStr || idNum === 0) {
        // حالت ایجاد
        this.TaskCode.set("0")
        this.title.set('تعریف خدمت')
        this.GetParent_lvl1();

      } else {
        // حالت اصلاح
        this.TaskCode.set(idStr)
        this.title.set('ویرایش خدمت')
        this.LoadForEdit();
      }
    });


    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionTaskEdit,
        minWidth: 150,
      },
      {
        field: 'DependencyTaskTitle',
        headerName: 'وظیقه وابستگی',

        cellClass: 'text-center',
        minWidth: 150
      },

    ];

    this.GetDependency()

  }

  // دریافت والدهای سطح 1 (در حالت ایجاد جدید)
  GetParent_lvl1() {

    this.EditForm_task.patchValue({
      TaskRef: "0",
      Flag: "1"
    });
    console.log("GetParent_lvl1")

    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {

      this.Parent_lvl1.set(data.KowsarTasks)
      console.log(this.Parent_lvl1())

    });
  }

  // سلسله‌مراتب والدها
  GetParent_lvl2() {

    this.Parent_lvl3.set([])
    this.Parent_lvl4.set([])
    this.Parent_lvl5.set([])
    this.Parent_lvl6.set([])
    this.Parent_lvl7.set([])
    this.Parent_lvl8.set([])
    this.Parent_lvl9.set([])

    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode1,
    });


    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {

      this.Parent_lvl2.set(data.KowsarTasks)
    });
  }

  GetParent_lvl3() {

    this.Parent_lvl4.set([])
    this.Parent_lvl5.set([])
    this.Parent_lvl6.set([])
    this.Parent_lvl7.set([])
    this.Parent_lvl8.set([])
    this.Parent_lvl9.set([])

    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode2,

    });


    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {


      this.Parent_lvl3.set(data.KowsarTasks)
    });
  }

  GetParent_lvl4() {


    this.Parent_lvl5.set([])
    this.Parent_lvl6.set([])
    this.Parent_lvl7.set([])
    this.Parent_lvl8.set([])
    this.Parent_lvl9.set([])

    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode3

    });


    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {


      this.Parent_lvl4.set(data.KowsarTasks)
    });
  }

  GetParent_lvl5() {

    this.Parent_lvl6.set([])
    this.Parent_lvl7.set([])
    this.Parent_lvl8.set([])
    this.Parent_lvl9.set([])

    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode4,

    });

    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {


      this.Parent_lvl5.set(data.KowsarTasks)
    });
  }

  GetParent_lvl6() {

    this.Parent_lvl7.set([])
    this.Parent_lvl8.set([])
    this.Parent_lvl9.set([])

    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode5,

    });

    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {


      this.Parent_lvl6.set(data.KowsarTasks)
    });
  }

  GetParent_lvl7() {

    this.Parent_lvl8.set([])
    this.Parent_lvl9.set([])

    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode6,

    });

    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {


      this.Parent_lvl7.set(data.KowsarTasks)
    });
  }

  GetParent_lvl8() {

    this.Parent_lvl9.set([])
    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode7,

    });

    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {


      this.Parent_lvl8.set(data.KowsarTasks)
    });
  }

  GetParent_lvl9() {
    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode8,

    });

    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {


      this.Parent_lvl9.set(data.KowsarTasks)
    });
  }

  // حالت ویرایش
  LoadForEdit() {

    this.repo.GetTasks({
      TaskCode: this.TaskCode(),
      Flag: '4'
    }).subscribe((data: any) => {

      const rec = data.KowsarTasks[0];
      this.EditForm_task.patchValue(rec);

      this.Parent_lvl1.set(data.Parent_lvl1)
    });
  }
  // حالت ویرایش
  GetDependency() {

    this.repo.KowsarTaskDependency_Get(this.TaskCode()).subscribe((data: any) => {
      this.records_dependency.set(data?.KowsarTasks ?? [])
      this.updateGridData(1, this.records_dependency());

    });
  }

  reset() {
    this.EditForm_task.reset();
  }

  // برای جلوگیری از کلیک‌های تکراری در حین درخواست
  private isSubmitting = false;

  submit(action: 'insert_back' | 'insert_new' | 'edit_back' | 'edit_new' | ''): void {
    // نمایش پیام‌های خطا روی همه‌ی کنترل‌ها
    this.EditForm_task.markAllAsTouched();

    // فرم نامعتبر؟ جلوتر نرو
    if (!this.EditForm_task.valid || this.isSubmitting) return;

    const isEdit = (this.TaskCode()?.length ?? 0) > 0; // اگر Code داری یعنی ویرایش

    this.isSubmitting = true;


    if (isEdit) {
      // ------------------ UPDATE ------------------

      this.repo.UpdateTask(this.EditForm_task.value).subscribe({
        next: (res: any) => this.handleApiResponse(res, action),
        error: (err) => this.handleApiError(err),
        complete: () => this.finalizeSubmit()
      });
    } else {
      // ------------------ INSERT ------------------

      this.repo.InsertTask(this.EditForm_task.value).subscribe({
        next: (res: any) => this.handleApiResponse(res, action),
        error: (err) => this.handleApiError(err),
        complete: () => this.finalizeSubmit()
      });
    }
  }

  // ------------------ Helpers ------------------

  private handleApiResponse(res: any, action: 'insert_back' | 'insert_new' | 'edit_back' | 'edit_new' | ''): void {
    // بعضی APIها آرایه KowsarTasks دارند با Success/Message
    const first = res?.KowsarTasks?.[0];

    if (first && first.Success === '0') {
      this.notificationService.error(first.Message || 'عملیات ناموفق بود');
      return;
    }

    this.notificationService.succeded();

    // هدایت بعد از موفقیت بر اساس نوع اکشن
    switch (action) {
      case 'edit_back':
      case 'insert_back':
        this.location.back();
        break;

      case 'edit_new':
      case 'insert_new':
        this.reset();
        // اگر insert_new بود می‌خوای Code خالی بشه تا فرم در حالت ایجاد بمونه
        if (action === 'insert_new') {
          this.TaskCode.set("")
          this.title.set('تعریف خدمت')
        }
        break;

      default:
        // اگر action خالی بود، کار خاصی لازم نیست
        break;
    }
  }

  private handleApiError(err: any): void {
    console.error('Task submit error:', err);
    this.notificationService.error('اشکال در برقراری ارتباط با سرور');
  }

  private finalizeSubmit(): void {

    this.isSubmitting = false;
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


  btnDeleteClicked(data: any): void {

    this.repo.KowsarTaskDependency_Delete(data.DependencyCode
    ).subscribe((data: any) => {

      this.GetDependency()

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

  OpenDependency() {

    this.repo.GetTasks(this.EditForm_task_all.value)
      .subscribe((data: any) => {

        this.records_Task.set(data?.KowsarTasks ?? [])
        this.updateGridData(3, this.records_Task());
        this.tasklist_dialog_show()
      });


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
  selectedRows = signal<any[]>([])

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

          return this.repo.KowsarTaskDependency_Save(
            this.TaskCode(),
            row.TaskCode
          );
        }),

        toArray()
      )
      .subscribe({
        next: (results: any[]) => {
          console.log('همه انجام شدند:', results);
          this.notificationService.success('عملیات با موفقیت انجام شد');
          this.GetDependency()
          this.tasklist_dialog_close()
        },
        error: (err: any) => {
          console.error('خطا در انجام عملیات:', err);
          this.notificationService.error('خطا در انجام عملیات');
        }
      });
  }

  @ViewChild('tasklist', { static: false }) tasklist!: ElementRef<HTMLDivElement>;

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
