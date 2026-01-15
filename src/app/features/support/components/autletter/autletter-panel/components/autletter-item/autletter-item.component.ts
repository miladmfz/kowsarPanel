import { Component, Input, OnInit, OnDestroy, Renderer2, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { DbSetup_lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { AutletterWebApiService } from 'src/app/features/support/services/AutletterWebApi.service';
import { CellActionAutletterRowList } from './cell-action-autletterrow-list';



@Component({
  selector: 'app-autletter-item',
  standalone: true,
  templateUrl: './autletter-item.component.html',

  imports: [
    CommonModule,
    ReactiveFormsModule,
    AgGridAngular,
  ]
})
export class AutletterItemComponent
  extends AgGridBaseComponent
  implements OnInit, OnDestroy {

  @Input() ObjectRef = '';

  // =============== UI States ===============
  ToDayDate = '';
  title = 'لیست تیکت های ارسالی ';

  // =============== Data ===============
  records: any[] = [];
  users: any[] = [];
  LetterState_lookup: DbSetup_lookup[] = [];
  LetterPriority_lookup: DbSetup_lookup[] = [];

  CentralRef = '';
  JobPersonRef = '';


  // =============== Forms ===============
  EditForm = new FormGroup({
    dateValue: new FormControl(''),
    descriptionFormControl: new FormControl('', [
      Validators.required,
      Validators.minLength(10)
    ]),
    LetterState: new FormControl(''),
    LetterPriority: new FormControl('', Validators.required),
    selectedUserId: new FormControl('', Validators.required),
  });

  EditForm_explain = new FormGroup({
    ObjectRef: new FormControl('0'),
    LetterRowDescription: new FormControl(''),
    LetterRowState: new FormControl('', Validators.required),
    AutLetterRow_PropDescription1: new FormControl('', [
      Validators.required,
      Validators.minLength(10)
    ])
  });



  EditForm_Item_Insert = new FormGroup({
    LetterRef: new FormControl(''),
    LetterDate: new FormControl(''),
    Description: new FormControl('', Validators.required),
    LetterState: new FormControl(''),
    LetterPriority: new FormControl('', Validators.required),
    CreatorCentral: new FormControl(''),
    ExecuterCentral: new FormControl('', Validators.required),
  });






  // =============== Constructor ===============
  private readonly router = inject(Router);
  private readonly repo = inject(AutletterWebApiService);
  private readonly notificationService = inject(NotificationService);
  private readonly loadingService = inject(LoadingService);
  private readonly renderer = inject(Renderer2);


  constructor() { super(); }

  // =============== Init ===============
  ngOnInit(): void {

    this.JobPersonRef = sessionStorage.getItem('JobPersonRef') ?? '';
    this.CentralRef = sessionStorage.getItem('CentralRef') ?? '';

    this.subscribeDarkMode();
    this.initColumns();
    this.patchDefaults();
    this.loadInitData();
    this.loadRows();
  }


  // ============================================================
  //                   INITIALIZERS
  // ============================================================

  private subscribeDarkMode() {
    this.themeSub = this.themeService.theme$
      .subscribe(mode => this.isDarkMode = mode === 'dark');
  }

  private initColumns() {
    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        minWidth: 150,
        cellRenderer: CellActionAutletterRowList,
        cellRendererParams: { editUrl: '/support/letter-detail' }
      },
      { field: 'RowExecutorName', headerName: 'کاربر', cellClass: 'text-center', minWidth: 100 },
      { field: 'RowCreatorName', headerName: 'ایجاد کننده', cellClass: 'text-center', minWidth: 100 },
      { field: 'RowLetterDate', headerName: 'تاریخ', cellClass: 'text-center', minWidth: 100 },
      { field: 'LetterRowState', headerName: 'وضعیت ارجاع', cellClass: 'text-center', minWidth: 50 },
      { field: 'AutLetterRow_PropDescription1', headerName: 'خلاصه عملکرد', cellClass: 'text-center', minWidth: 250 },
      { field: 'LetterRowDescription', headerName: 'شرح ارجاع', cellClass: 'text-center', minWidth: 250 },
    ];
  }

  private patchDefaults() {
    this.EditForm_explain.patchValue({ ObjectRef: '0' });
  }

  // ============================================================
  //                       LOAD DATA
  // ============================================================

  private loadInitData() {
    this.repo.GetTodeyFromServer().subscribe((data: any) => this.ToDayDate = data.Text);

    this.repo.GetObjectTypeFromDbSetup('AutomationLetterState')
      .subscribe((data: any) => this.LetterState_lookup = data.ObjectTypes);

    this.repo.GetObjectTypeFromDbSetup('AutomationLetterPriority')
      .subscribe((data: any) => this.LetterPriority_lookup = data.ObjectTypes);

    this.repo.GetCentralUser().subscribe((data: any) => this.users = data?.Centrals ?? []);
  }

  private loadRows() {
    this.loadingService.show();
    this.repo.GetLetterRowList(this.ObjectRef).subscribe((data: any) => {
      this.records = data?.AutLetters ?? [];
      console.log(this.records)
      this.updateGridData(1, this.records);
      this.loadingService.hide();
    });
  }

  // ============================================================
  //                       INPUT SANITIZE
  // ============================================================


  private cleanInput(text: string) {
    if (!text) return '';

    // حذف <script> و تگ‌های مشابه (خطرناک‌ترین بخش)
    text = text.replace(/<\s*script.*?>.*?<\s*\/\s*script\s*>/gi, '');

    // حذف onClick و eventهای مشابه
    text = text.replace(/on\w+=".*?"/gi, '');

    // حذف جاوااسکریپت داخل href یا src
    text = text.replace(/(javascript:|data:)/gi, '');

    return text;
  }



  // ============================================================
  //                       DELETE ROW
  // ============================================================

  async delete(code: any, summary: string) {
    if (summary.length > 0)
      return this.notificationService.error('برای این ارجاع عملکرد ثبت شده است');

    const r = await this.confirmDelete();
    if (!r.isConfirmed) return;

    this.loadingService.show();
    this.repo.DeleteAutLetterRows(code).subscribe(() => {
      this.notificationService.success("حذف انجام شد");
      this.loadRows();
      this.loadingService.hide();
    });
  }

  private async confirmDelete() {
    const Swal = (await import('sweetalert2')).default;
    return Swal.fire({
      title: 'آیا از حذف این ردیف اطمینان دارید؟',
      text: 'قابل بازگردانی نیست',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله',
      cancelButtonText: 'خیر',
    });
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

  // ============================================================
  //                        INSERT
  // ============================================================

  submit() {
    this.EditForm_Item_Insert.markAllAsTouched();

    if (!this.EditForm_Item_Insert.valid) return;

    this.loadingService.show();




    this.EditForm_Item_Insert.patchValue({
      LetterRef: this.ObjectRef,
      LetterDate: this.ToDayDate,
      Description: this.cleanInput(this.EditForm_Item_Insert.value.Description),
      CreatorCentral: this.CentralRef,
    });


    this.repo.AutLetterRowInsert(this.EditForm_Item_Insert.value).subscribe((data: any) => {
      this.loadingService.hide();

      const id = parseInt(data.AutLetterRows[0].LetterRef, 10);
      if (id > 0) {
        this.notificationService.success("عملیات با موفقیت انجام شد");
        this.router.navigate(['/support/letter-list']);
      }
    });
  }

  // ============================================================
  //                     UPDATE ROW MODAL
  // ============================================================

  Get_Autletterrow_Property(code: any, state: any, desc: any, summary: any) {
    this.EditForm_explain.patchValue({
      ObjectRef: code,
      LetterRowDescription: desc,
      LetterRowState: state,
      AutLetterRow_PropDescription1: summary
    });
    this.openModal();
  }

  Set_Autletterrow_Property() {
    this.EditForm_explain.markAllAsTouched();
    if (!this.EditForm_explain.valid) return;

    this.loadingService.show();
    this.repo.Update_AutletterRow(this.EditForm_explain.value).subscribe(() => {
      this.notificationService.success("با موفقیت ثبت شد");
      this.loadRows();
      this.closeModal();
      this.loadingService.hide();
    });
  }

  // ============================================================
  //                        MODAL
  // ============================================================

  public openModal() {
    const m = this.renderer.selectRootElement('#autletterrowmodal', true);
    this.renderer.addClass(m, 'show');
    this.renderer.setStyle(m, 'display', 'block');
  }

  public closeModal() {
    const m = this.renderer.selectRootElement('#autletterrowmodal', true);
    this.renderer.removeClass(m, 'show');
    this.renderer.setStyle(m, 'display', 'none');
  }
}
