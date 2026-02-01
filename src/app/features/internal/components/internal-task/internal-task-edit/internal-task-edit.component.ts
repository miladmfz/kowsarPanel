import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';

import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
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
  private loadingService = inject(LoadingService);
  private location = inject(Location);

  title = 'تعریف / ویرایش خدمت';
  Code: string = '';

  // لیست سطوح والد
  Parent_lvl1: any[] = [];
  Parent_lvl2: any[] = [];
  Parent_lvl3: any[] = [];
  Parent_lvl4: any[] = [];
  Parent_lvl5: any[] = [];
  Parent_lvl6: any[] = [];
  Parent_lvl7: any[] = [];
  Parent_lvl8: any[] = [];
  Parent_lvl9: any[] = [];

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
    this.Code = this.route.snapshot.queryParamMap.get('Code') ?? '';

    if (this.Code.length > 0) {
      this.title = 'ویرایش خدمت';
      this.LoadForEdit();
    } else {
      this.title = 'تعریف خدمت';
      this.GetParent_lvl1();
    }
  }

  // دریافت والدهای سطح 1 (در حالت ایجاد جدید)
  GetParent_lvl1() {

    this.EditForm_task.patchValue({
      TaskRef: "0",
      Flag: "1"
    });

    this.loadingService.show()
    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {
      this.loadingService.hide()
      this.Parent_lvl1 = data.KowsarTasks;
    });
  }

  // سلسله‌مراتب والدها
  GetParent_lvl2() {

    this.Parent_lvl3 = [];
    this.Parent_lvl4 = [];
    this.Parent_lvl5 = [];
    this.Parent_lvl6 = [];
    this.Parent_lvl7 = [];
    this.Parent_lvl8 = [];
    this.Parent_lvl9 = [];

    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode1,
    });

    this.loadingService.show()
    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {
      this.loadingService.hide()
      this.Parent_lvl2 = data.KowsarTasks;
    });
  }

  GetParent_lvl3() {

    this.Parent_lvl4 = [];
    this.Parent_lvl5 = [];
    this.Parent_lvl6 = [];
    this.Parent_lvl7 = [];
    this.Parent_lvl8 = [];
    this.Parent_lvl9 = [];

    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode2,

    });

    this.loadingService.show()
    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {
      this.loadingService.hide()

      this.Parent_lvl3 = data.KowsarTasks;
    });
  }

  GetParent_lvl4() {


    this.Parent_lvl5 = [];
    this.Parent_lvl6 = [];
    this.Parent_lvl7 = [];
    this.Parent_lvl8 = [];
    this.Parent_lvl9 = [];

    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode3

    });

    this.loadingService.show()
    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {
      this.loadingService.hide()

      this.Parent_lvl4 = data.KowsarTasks;
    });
  }

  GetParent_lvl5() {

    this.Parent_lvl6 = [];
    this.Parent_lvl7 = [];
    this.Parent_lvl8 = [];
    this.Parent_lvl9 = [];

    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode4,

    });
    this.loadingService.show()
    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {
      this.loadingService.hide()

      this.Parent_lvl5 = data.KowsarTasks;
    });
  }

  GetParent_lvl6() {

    this.Parent_lvl7 = [];
    this.Parent_lvl8 = [];
    this.Parent_lvl9 = [];

    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode5,

    });
    this.loadingService.show()
    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {
      this.loadingService.hide()

      this.Parent_lvl6 = data.KowsarTasks;
    });
  }

  GetParent_lvl7() {

    this.Parent_lvl8 = [];
    this.Parent_lvl9 = [];

    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode6,

    });
    this.loadingService.show()
    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {
      this.loadingService.hide()

      this.Parent_lvl7 = data.KowsarTasks;
    });
  }

  GetParent_lvl8() {

    this.Parent_lvl9 = [];
    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode7,

    });
    this.loadingService.show()
    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {
      this.loadingService.hide()

      this.Parent_lvl8 = data.KowsarTasks;
    });
  }

  GetParent_lvl9() {
    this.EditForm_task.patchValue({
      TaskRef: this.EditForm_task.value.ParentCode8,

    });
    this.loadingService.show()
    this.repo.GetTasks(this.EditForm_task.value).subscribe((data: any) => {
      this.loadingService.hide()

      this.Parent_lvl9 = data.KowsarTasks;
    });
  }

  // حالت ویرایش
  LoadForEdit() {
    this.loadingService.show()
    this.repo.GetTasks({
      TaskCode: this.Code,
      Flag: 'get_one'
    }).subscribe((data: any) => {
      this.loadingService.hide()
      const rec = data.Task[0];
      this.EditForm_task.patchValue(rec);

      this.Parent_lvl1 = data.Parent_lvl1;
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

    const isEdit = (this.Code?.length ?? 0) > 0; // اگر Code داری یعنی ویرایش

    this.isSubmitting = true;
    this.loadingService.show()

    if (isEdit) {
      // ------------------ UPDATE ------------------
      this.loadingService.show()
      this.repo.UpdateTask(this.EditForm_task.value).subscribe({
        next: (res: any) => this.handleApiResponse(res, action),
        error: (err) => this.handleApiError(err),
        complete: () => this.finalizeSubmit()
      });
    } else {
      // ------------------ INSERT ------------------
      this.loadingService.show()
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
          this.Code = '';
          this.title = 'تعریف خدمت';
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
    this.loadingService.hide()
    this.isSubmitting = false;
  }

}
