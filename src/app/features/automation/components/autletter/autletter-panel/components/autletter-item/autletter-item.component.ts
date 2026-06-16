import { Component, Input, OnInit, OnDestroy, Renderer2, inject, signal, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { AgGridAngular } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { DbSetup_lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

import { AutletterWebApiService } from 'src/app/features/automation/services/AutletterWebApi.service';
import { CellActionAutletterRowList } from './cell-action-autletterrow-list';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';



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

  @Input() ObjectRef = ""
  @Input() LetterState = ""
  @Output() RefreshState = new EventEmitter<any>();
  // =============== UI States ===============
  ToDayDate = signal('')
  State = signal('')
  title = signal('لیست ارجاعات');

  // =============== Data ===============
  records = signal<any[]>([])
  users = signal<any[]>([])
  LetterState_lookup: DbSetup_lookup[] = [];
  LetterPriority_lookup: DbSetup_lookup[] = [];

  CentralRef = signal('')

  LoginType = signal('')
  ShowInsertRow = signal(false)


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
  protected readonly session = inject(SessionStorageService);
  private readonly repo = inject(AutletterWebApiService);
  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);


  constructor() { super(); }

  // =============== Init ===============
  ngOnInit(): void {

    this.LoginType.set(this.session.loginType)
    this.CentralRef.set(this.session.centralRef)
    this.State.set(this.LetterState);


    const UserType = this.session.getString('UserType') || '';



    if (['1274', '1139', '1843'].includes(this.CentralRef()) || ['admin'].includes(UserType)) {
      this.ShowInsertRow.set(true)
    } else {
      this.ShowInsertRow.set(false)

    }





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
    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        minWidth: 150,
        cellRenderer: CellActionAutletterRowList,
        cellRendererParams: { editUrl: '/automation/letter-detail' }
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

    this.base_repo.GetTodeyFromServer().subscribe((data: any) => this.ToDayDate.set(data.Text));


    this.base_repo.GetObjectTypeFromDbSetup('AutomationLetterState')
      .subscribe((data: any) => {

        this.LetterState_lookup = data.ObjectTypes
          .filter((x: any) =>
            x.aType !== 'منتظراقدام' &&
            x.aType !== 'ابطالی'
          );

      });

    this.base_repo.GetObjectTypeFromDbSetup('AutomationLetterPriority')
      .subscribe((data: any) => this.LetterPriority_lookup = data.ObjectTypes);


    this.repo.GetCentralUser().subscribe((data: any) => this.users.set(data?.Centrals ?? []))
  }

  private loadRows() {


    this.repo.GetLetterRowList(this.ObjectRef).subscribe((data: any) => {

      const rows = data?.AutLetters ?? [];

      this.records.set(rows);
      this.updateGridData(1, rows);

      if (this.records().length > 0) {

        const allDone = rows.every((x: any) => x.LetterRowState === 'تمام شده');

        if (allDone) {


          if (this.State() != 'تمام شده') {
            this.State.set('تمام شده');
            this.Update_LetterState();
          } else {
            this.notificationService.info('وضعیت این تیکت تمام شده است');
          }

        } else {

          if (this.State() != 'درحال انجام') {
            this.State.set('درحال انجام');
            this.Update_LetterState();

          }

        }
      }


    });
  }


  Update_LetterState() {

    this.repo.AutLetterUpdate(this.ObjectRef, this.State()).subscribe(() => {
      this.RefreshState.emit(true);
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



    this.repo.DeleteAutLetterRows(code).subscribe(() => {
      this.notificationService.success("حذف انجام شد");
      this.loadRows();

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






    this.EditForm_Item_Insert.patchValue({
      LetterRef: this.ObjectRef,
      LetterDate: this.ToDayDate(),
      Description: this.cleanInput(this.EditForm_Item_Insert.value.Description),
      CreatorCentral: this.CentralRef(),
    });



    this.repo.AutLetterRowInsert(this.EditForm_Item_Insert.value).subscribe((data: any) => {


      const id = parseInt(data.AutLetterRows[0].LetterRef, 10);
      if (id > 0) {
        this.notificationService.success("عملیات با موفقیت انجام شد");
        this.router.navigate(['/automation/letter-user']);

      }
    });
  }



  // ============================================================
  //                     UPDATE ROW MODAL
  // ============================================================

  Get_Autletterrow_Property(data: any) {
    this.EditForm_explain.patchValue({
      ObjectRef: data.LetterRowCode,
      LetterRowDescription: data.LetterRowState,
      LetterRowState: data.LetterRowDescription,
      AutLetterRow_PropDescription1: data.AutLetterRow_PropDescription1
    });

    if (data.LetterRowState == "تمام شده") {
      this.notificationService.error("وضعیت این ارجاع تمام شده است و قابل تغییر نیست لطفا با مدیریت هماهنگ کنید.")

    } else {

      this.openModal();
    }


  }

  Set_Autletterrow_Property1() {
    this.EditForm_explain.markAllAsTouched();
    if (!this.EditForm_explain.valid) return;



    this.repo.Update_AutletterRow(this.EditForm_explain.value).subscribe(() => {
      this.notificationService.success("با موفقیت ثبت شد");
      this.loadRows();
      this.closeModal();

    });
  }
  Set_Autletterrow_Property() {


    this.EditForm_explain.patchValue(
      {
        AutLetterRow_PropDescription1: this.cleanText(this.EditForm_explain.value.AutLetterRow_PropDescription1),
      },
    );



    this.EditForm_explain.markAllAsTouched();

    if (!this.EditForm_explain.valid) return;


    this.repo.Update_AutletterRow(this.EditForm_explain.value).subscribe(() => {
      this.notificationService.success("با موفقیت ثبت شد");
      this.loadRows();
      this.closeModal();




    });
  }




  private cleanText(value: any): any {
    if (value === null || value === undefined) return value;

    return value
      .toString()
      .trim()
      .replace(/\s+/g, ' ');
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
