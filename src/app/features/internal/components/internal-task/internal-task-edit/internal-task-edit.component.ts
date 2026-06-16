import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { Location } from '@angular/common';

import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { TaskWebApiService } from '../../../services/TaskWebApi.service';

@Component({
  selector: 'app-internal-task-edit',
  standalone: true,
  templateUrl: './internal-task-edit.component.html',
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ]
})
export class InternalTaskEditComponent implements OnInit {

  // inject اسلوب مدرن
  private route = inject(ActivatedRoute);
  private repo = inject(TaskWebApiService);
  private notificationService = inject(NotificationService);
  private location = inject(Location);

  title = signal('تعریف / ویرایش خدمت')
  TaskCode = signal('')

  // لیست سطوح والد
  Parent_lvl1 = signal<any[]>([])
  Parent_lvl2 = signal<any[]>([])
  Parent_lvl3 = signal<any[]>([])
  Parent_lvl4 = signal<any[]>([])
  Parent_lvl5 = signal<any[]>([])
  Parent_lvl6 = signal<any[]>([])
  Parent_lvl7 = signal<any[]>([])
  Parent_lvl8 = signal<any[]>([])
  Parent_lvl9 = signal<any[]>([])

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





  }

  // دریافت والدهای سطح 1 (در حالت ایجاد جدید)
  GetParent_lvl1() {

    this.EditForm_task.patchValue({
      TaskRef: "0",
      Flag: "1"
    });


    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {

      this.Parent_lvl1.set(data.KowsarTasks)
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
      Flag: '1'
    }).subscribe((data: any) => {

      const rec = data.KowsarTasks[0];
      this.EditForm_task.patchValue(rec);

      this.Parent_lvl1.set(data.Parent_lvl1)
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

}
