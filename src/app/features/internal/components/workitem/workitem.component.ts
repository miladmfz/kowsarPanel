import { CommonModule } from '@angular/common';
import { Component, Renderer2, OnInit, ElementRef, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgGridAngular } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { Subscription } from 'rxjs';



//   سرویس‌ها
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base/ag-grid-base.component';
import { DashboardWebApiService } from '../../services/DashboardWebApi.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { Base_Lookup, Base_Lookup_icon } from 'src/app/app-shell/framework-services/model/lookup-type';
import { CellActionWorkItemList } from './cell-action-task-list';
import { CellPriorityWorkItem } from './cell-priority-label-workitem';
import { CellStatusWorkItem } from './cell-status-label-workitem';
import { WorkItemWebApiService } from '../../services/WorkItemWebApi.service';
import { CellNameWorkItem } from './cell-personname-label-workitem';
import { NgPersianDatepickerModule } from 'ng-persian-datepicker';

@Component({
  selector: 'app-workitem',
  templateUrl: './workitem.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
    NgPersianDatepickerModule,
  ],
})
export class WorkitemComponent extends AgGridBaseComponent implements OnInit {
  // ===============================================================
  // 🧾 داده‌ها و وضعیت‌ها
  // ===============================================================
  records: any[] = [];
  records_Persons: any[] = [];
  show_person = false;
  show_grid = false;
  CanEdit = false;

  title_workitem_modal = '';



  // ===============================================================
  //   فرم‌ها برای سه نوع گزارش
  // ===============================================================
  EditForm_WorkItem = new FormGroup({

    WorkItemCode: new FormControl(''),
    Title: new FormControl('', Validators.required),
    Explain: new FormControl(''),
    Status: new FormControl('', Validators.required),
    Priority: new FormControl('', Validators.required),
    OriginalDate: new FormControl(''),
    TargetDate: new FormControl('', Validators.required),
    ChangeStateDate: new FormControl(''),
    ModuleName: new FormControl(''),
    ClassName: new FormControl(''),
    ObjectRef: new FormControl(''),
    OwnerRef: new FormControl('', Validators.required),
    OwnerName: new FormControl(''),
    CreatorRef: new FormControl(''),
  });

  EditForm_SearchTarget = new FormGroup({
    SearchTarget: new FormControl(''),
    Status: new FormControl('0'),
    CentralRef: new FormControl('0'),
  });

  // ===============================================================
  //   وضعیت‌های لوکاپ برای فیلتر گزارش
  // ===============================================================
  State_Lookup: Base_Lookup_icon[] = [
    { id: '1', name: 'در صف', icon: '⌛' },           // صف انتظار
    { id: '2', name: 'در حال انجام', icon: '🏃‍♂️' }, // در حال انجام
    { id: '3', name: 'انجام شده', icon: '✅' },       // انجام شده
    { id: '4', name: 'به تعویق افتاده', icon: '⏳' },  // به تعویق افتاده
  ];

  StateSearch_Lookup: Base_Lookup_icon[] = [
    { id: '0', name: 'همه کارها', icon: '📋' },
    { id: '1', name: 'در صف', icon: '⌛' },
    { id: '2', name: 'در حال انجام', icon: '🏃‍♂️' },
    { id: '3', name: 'انجام شده', icon: '✅' },
    { id: '4', name: 'به تعویق افتاده', icon: '⏳' },
  ];

  Priority_Lookup: Base_Lookup_icon[] = [
    { id: '1', name: 'کم', icon: '🟢' },       // کم اهمیت
    { id: '2', name: 'معمولی', icon: '🟡' },   // معمولی
    { id: '3', name: 'زیاد', icon: '🔴' },     // زیاد/فوری
  ];


  // ===============================================================
  //   سازنده
  // ===============================================================

  private readonly loadingService = inject(LoadingService);
  private readonly repo = inject(WorkItemWebApiService);
  private readonly notify = inject(NotificationService);


  constructor() {
    super();
  }

  // ===============================================================
  // 🚀 lifecycle
  // ===============================================================
  ngOnInit(): void {
    this.initColumns();
    this.getList();
  }

  // ===============================================================
  // 📋 تعریف ستون‌ها برای سه گزارش
  // ===============================================================

  private initColumns(): void {
    this.columnDefs1 = [
      { field: 'عملیات', pinned: 'left', cellRenderer: CellActionWorkItemList, minWidth: 100 },

      { field: 'CentralName', headerName: 'کاربر', width: 120 },

      { field: 'Title', headerName: 'عنوان', minWidth: 120 },
      { field: 'Explain', headerName: 'توضیحات', minWidth: 200 },
      { field: 'TargetDate', headerName: 'زمان کار', width: 120 },

      { field: 'Status', cellRenderer: CellStatusWorkItem, headerName: 'وضعیت', width: 80 },
      { field: 'Priority', cellRenderer: CellPriorityWorkItem, headerName: 'اولویت', width: 80 },
    ];

    this.columnDefs2 = [
      { field: 'کارشناس', cellRenderer: CellNameWorkItem, cellClass: 'text-center', minWidth: 120 },
    ];


    this.repo.AttendanceDashboard().subscribe({
      next: (data: any) => {
        this.loadingService.hide()
        this.records_Persons = data?.Attendances ?? [];
        this.updateGridData(1, this.records_Persons);
      },
      error: (err) => {

      },
    });

  }


  public getList(): void {


    const centralRef = sessionStorage.getItem('CentralRef') ?? '';
    if (['1274', '1139', '1843'].includes(centralRef)) {

      this.show_person = true
      this.EditForm_SearchTarget.patchValue({
        CentralRef: "0",

      });

    } else {
      this.show_person = false

      this.EditForm_WorkItem.patchValue({
        OwnerRef: sessionStorage.getItem('CentralRef') || '',
        OwnerName: sessionStorage.getItem('PhFullName') || ''

      });

      this.EditForm_SearchTarget.patchValue({
        CentralRef: sessionStorage.getItem('CentralRef') || '',

      });
    }




    this.loadingService.show();
    this.repo.WorkItem_Get(this.EditForm_SearchTarget.value).subscribe({
      next: (data: any) => {

        this.loadingService.hide();
        this.records = data?.WorkItems ?? [];
        this.show_grid = this.records.length > 0;
        this.updateGridData(1, this.records)
      },
      error: () => {
        this.loadingService.hide();
        this.notify.error('❌ خطا در دریافت گزارش کارشناسان');
        this.show_grid = false;
      },
    });
  }

  delete(data: any) {


    if (data.CreatorRef === sessionStorage.getItem('CentralRef')) {


      import('sweetalert2').then(Swal => {
        Swal.default.fire({
          title: 'حذف شرح کار',
          text: 'در صورت حذف، قابل بازیابی نخواهد بود.',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'بله، حذف شود',
          cancelButtonText: 'انصراف',
          customClass: {
            confirmButton: 'btn btn-success mx-2',
            cancelButton: 'btn btn-danger',
          },
          buttonsStyling: false,
        }).then(result => {
          if (result.isConfirmed) {
            this.loadingService.show()
            this.EditForm_WorkItem.patchValue({
              WorkItemCode: data.WorkItemCode,
            });

            this.repo.WorkItem_Delete(this.EditForm_WorkItem.value).subscribe({
              next: () => {
                this.loadingService.hide()
                this.notify.success('  شرح کار با موفقیت حذف شد');
                setTimeout(() => this.getList(), 400);
              },
              error: () => this.notify.error('❌ خطا در حذف رکورد'),
            });


          } else {
            this.notify.info('عملیات حذف لغو شد');
          }
        });
      });

    } else {
      this.notify.error('❌ شما ممجاز به حذف این رکورد نیستید');

    }


  }


  edit(data: any) {

    if (data.CreatorRef === sessionStorage.getItem('CentralRef')) {

      this.CanEdit = true
    } else {
      this.CanEdit = false

    }


    this.EditForm_WorkItem.patchValue({
      WorkItemCode: data.WorkItemCode,
      Title: data.Title,
      Explain: data.Explain,
      Status: data.Status,
      Priority: data.Priority,
      ModuleName: data.ModuleName,
      ClassName: data.ClassName,
      ObjectRef: data.ObjectRef,
      OwnerRef: data.OwnerRef,
      OwnerName: data.CentralName,
      OriginalDate: data.OriginalDate,
      TargetDate: data.TargetDate,
      ChangeStateDate: data.ChangeStateDate,
      CreatorRef: data.CreatorRef,
    });

    this.editworkitem_dialog_show()

  }


  Submit(): void {

    this.EditForm_WorkItem.markAllAsTouched();

    if (!this.EditForm_WorkItem.valid) return;


    if (this.EditForm_WorkItem.value.WorkItemCode.length > 0) {
      this.repo.WorkItem_Update(this.EditForm_WorkItem.value).subscribe({
        next: (data: any) => {
          this.loadingService.hide()
          this.editworkitem_dialog_close()

          this.getList()
        },
        error: () => (this.loadingService.hide()),
      });
    } else {
      this.repo.WorkItem_Insert(this.EditForm_WorkItem.value).subscribe({
        next: (data: any) => {
          this.loadingService.hide()
          this.workitem_dialog_close()

          this.getList()
        },
        error: () => (this.loadingService.hide()),
      });
    }

  }

  Create_New_Workitem() {

    this.title_workitem_modal = "شرح کار جدید"

    this.EditForm_WorkItem.patchValue({
      WorkItemCode: "",
      Title: "",
      Explain: "",
      Status: "",
      Priority: "",
      ModuleName: "",
      ClassName: "",
      ObjectRef: "0",
      OwnerRef: "",
      OwnerName: "",
      OriginalDate: sessionStorage.getItem('ActiveSession') || '',
      TargetDate: sessionStorage.getItem('ActiveSession') || '',
      ChangeStateDate: sessionStorage.getItem('ActiveSession') || '',

      CreatorRef: sessionStorage.getItem('CentralRef') || '',
    });


    const centralRef = sessionStorage.getItem('CentralRef') ?? '';
    if (['1274', '1139', '1843'].includes(centralRef)) {

      this.show_person = true
    } else {
      this.show_person = false

      this.EditForm_WorkItem.patchValue({
        OwnerRef: sessionStorage.getItem('CentralRef') || '',
        OwnerName: sessionStorage.getItem('PhFullName') || ''

      });
    }

    this.workitem_dialog_show()

  }


  workitem_dialog_show() { this.toggleModal('#workitemmodal', true); }
  workitem_dialog_close() { this.toggleModal('#workitemmodal', false); }


  editworkitem_dialog_show() { this.toggleModal('#editworkitemmodal', true); }
  editworkitem_dialog_close() { this.toggleModal('#editworkitemmodal', false); }




  toggleModal(selector: string, show: boolean) {
    const modal: any = document.querySelector(selector);
    if (!modal) return;

    if (show) {
      // BACKDROP بساز
      const backdrop = document.createElement('div');
      backdrop.className = 'modal-backdrop fade';
      backdrop.id = selector.replace('#', '') + '-backdrop';
      document.body.appendChild(backdrop);

      // کمی تاخیر برای fade
      setTimeout(() => backdrop.classList.add('show'), 10);

      // مودال را باز کن
      modal.classList.add('show', 'd-block');
      modal.removeAttribute('aria-hidden');
      modal.setAttribute('aria-modal', 'true');
      modal.style.display = 'block';

      // بستن با کلیک روی بک‌دراپ
      backdrop.addEventListener('click', () => this.toggleModal(selector, false));
    }
    else {
      // مودال را ببند
      modal.classList.remove('show');
      setTimeout(() => {
        modal.classList.remove('d-block');
        modal.style.display = 'none';
      }, 150);

      modal.setAttribute('aria-hidden', 'true');
      modal.removeAttribute('aria-modal');

      // بک‌دراپ را حذف کن
      const backdrop = document.getElementById(selector.replace('#', '') + '-backdrop');
      if (backdrop) {
        backdrop.classList.remove('show');
        setTimeout(() => backdrop.remove(), 150);
      }
    }
  }



}
