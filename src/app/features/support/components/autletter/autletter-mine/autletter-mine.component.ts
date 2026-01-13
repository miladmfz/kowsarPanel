/**
 *   AutLetterMineComponent (Angular 20 - Standalone)
 * ------------------------------------------------------------
 * نمایش لیست تیکت‌های ثبت‌شده توسط کاربر جاری
 * امکانات:
 *  - جستجو و فیلتر تاریخ
 *  - جدول AgGrid با CellRendererهای سفارشی
 *  - مشاهده جزئیات تیکت
 *  - حذف تیکت (در صورت مجاز بودن)
 *  - فرم‌های واکنشی (ReactiveForm)
 */

import { CommonModule } from '@angular/common';
import { Component, OnInit, Renderer2, inject, ElementRef, ViewChild } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';

//   Base + Renderers + Services
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { CellActionAutletterList } from '../autletter-list/cell-action-autletter-list';
import { CellStateAutletter } from '../autletter-list/cell-state-autletter';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';

//   Models
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { AutletterWebApiService } from '../../../services/AutletterWebApi.service';

@Component({
  selector: 'app-autletter-mine',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    NgPersianDatepickerModule,
  ],
  templateUrl: './autletter-mine.component.html',
})
export class AutLetterMineComponent extends AgGridBaseComponent implements OnInit {
  // ===============================================================
  // 🌗 Theme & Layout
  // ===============================================================
  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#0066cc',
    selectedText: '#ffffff',
  };

  // ===============================================================
  //   Data & Lookup
  // ===============================================================
  records: any[] = [];
  records_detail: any[] = [];
  loading_detail = true;

  WorkFlowStatus_Lookup: Base_Lookup[] = [
    { id: '1', name: 'تأیید' },
    { id: '2', name: 'رد' },
    { id: '3', name: 'بررسی مجدد' },
  ];

  // ===============================================================
  //   Reactive Forms
  // ===============================================================
  EditForm_Search = new FormGroup({
    StartDate: new FormControl(''),
    EndDate: new FormControl(''),
    WorkFlowStatus: new FormControl('0'),
  });

  EditForm_autletter_detail = new FormGroup({
    AutLetterRow_PropDescription1: new FormControl(''),
    CreatorCentralRef: new FormControl(''),
    CreatorName: new FormControl(''),
    ExecutorName: new FormControl(''),
    LetterCode: new FormControl(''),
    LetterDate: new FormControl(''),
    LetterDescription: new FormControl(''),
    LetterPriority: new FormControl(''),
    LetterReceiveType: new FormControl(''),
    LetterState: new FormControl(''),
    LetterTitle: new FormControl(''),
    OwnerCentralRef: new FormControl(''),
    OwnerPersonInfoRef: new FormControl(''),
    OwnerName: new FormControl(''),
    RowExecutorCentralRef: new FormControl(''),
    RowExecutorName: new FormControl(''),
    RowLetterDate: new FormControl(''),
    RowLetterState: new FormControl(''),
    RowsCount: new FormControl(''),
  });

  EditForm_autletter = new FormGroup({
    SearchTarget: new FormControl(''),
    CentralRef: new FormControl(''),
    CreationDate: new FormControl(''),
    OwnCentralRef: new FormControl(''),
    PersonInfoCode: new FormControl(''),
    StartTime: new FormControl(''),
    EndTime: new FormControl(''),
    Flag: new FormControl('0'),

  });


  // ===============================================================
  //   UI Properties
  // ===============================================================
  modal_title = '';
  title = 'تیکت‌های من';
  dateValue = new FormControl();
  StartTime = new FormControl();
  EndTime = new FormControl();

  CentralRef: string = '';
  PersonInfoRef: string = '';

  searchTerm: string = '';
  ToDayDate: string = '';

  /**   Context ارتباط با CellRenderer */
  override context: any;

  // ===============================================================
  // 🧠 Injected Services
  // ===============================================================
  private readonly repo = inject(AutletterWebApiService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly renderer = inject(Renderer2);
  private readonly loadingservice = inject(LoadingService);

  constructor() {
    super();
  }

  // ===============================================================
  // 🚀 Lifecycle
  // ===============================================================
  ngOnInit(): void {
    this.initColumns();
    this.loadMyTickets();
  }

  // ===============================================================
  // 🧱 تعریف ستون‌های جدول اصلی
  // ===============================================================
  private initColumns(): void {
    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionAutletterList,
        cellRendererParams: { editUrl: '/support/letter-detail' },
        minWidth: 250,
      },
      {
        field: 'وضعیت',
        headerName: 'وضعیت',
        cellRenderer: CellStateAutletter,
        cellClass: 'text-center',
        minWidth: 100,
      },
      {
        field: 'RowExecutorName',
        headerName: 'کاربر فعلی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'CreatorName',
        headerName: 'ایجاد کننده',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },

      {
        field: 'RowCreationDate',
        headerName: 'تاریخ ثبت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'LetterTitle',
        headerName: 'عنوان',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 200,
      },
      {
        field: 'LetterDescription',
        headerName: 'شرح تیکت',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        headerClass: 'text-center',
        minWidth: 250,
      },
      {
        field: 'OwnerName',
        headerName: 'مشتری',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 200,
      },
      {
        field: 'RowsCount',
        headerName: 'تعداد ارجاع',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },
    ];

    //   اتصال AgGrid به Component برای ارتباط CellRendererها
    this.context = { componentParent: this };
  }

  // ===============================================================
  // 📋 بارگذاری تیکت‌های کاربر جاری
  // ===============================================================


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




  loadMyTickets(): void {
    this.loadingservice.show();

    const PersonInfoCode = sessionStorage.getItem('PersonInfoRef') ?? '';
    const CentralRef = sessionStorage.getItem('CentralRef') ?? '';

    this.EditForm_autletter.patchValue({
      SearchTarget: this.EditForm_autletter.value.SearchTarget?.trim() || '',
      PersonInfoCode,
      CentralRef,
    });

    // 🚀 دریافت داده از سرور (API اختصاصی تیکت‌های من)
    this.repo.GetAutLetterListByPerson(this.EditForm_autletter.value).subscribe({
      next: (data: any) => {
        this.loadingservice.hide();
        this.records = data?.AutLetters ?? [];
        this.updateGridData(1, this.records);
      },
      error: () => {
        this.loadingservice.hide();
        this.notify.error('❌ خطا در دریافت لیست تیکت‌های من');
      },
    });
  }

  // ===============================================================
  //   عملیات‌ها
  // ===============================================================
  NavigateToEdit(data: any): void {
    this.router.navigate(['/support/letter-panel', data.LetterCode]);
  }

  clearFilter(): void {
    this.EditForm_autletter.patchValue({
      SearchTarget: "",
      CentralRef: "",
      CreationDate: "",
      OwnCentralRef: "",
      PersonInfoCode: "",
      StartTime: "",
      EndTime: "",
      Flag: "0",
    });
    this.loadMyTickets()
  }


  /**   مشاهده جزئیات نامه */
  ViewDetails(single: any): void {
    if (!single) return;

    this.EditForm_autletter_detail.patchValue(single);
    this.openModal();
  }

  /**   واکنش به تغییر عبارت جستجو */
  onInputChange(): void {
    if (!this.searchTerm?.trim()) this.searchTerm = '';
    this.loadMyTickets();
  }

  /**   حذف تیکت */
  btnDeleteClicked(data: any): void {
    if (data.RowsCount > 0) {
      this.notify.error('⛔ این تیکت دارای ارجاع است و قابل حذف نیست');
      return;
    }

    this.loadingservice.show();
    import('sweetalert2').then(Swal => {
      Swal.default
        .fire({
          title: 'حذف تیکت؟',
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
        })
        .then(result => {
          if (result.isConfirmed) {
            this.repo.DeleteAutLetter(data.LetterCode).subscribe({
              next: () => {
                this.notify.success('  تیکت با موفقیت حذف شد');
                setTimeout(() => this.loadMyTickets(), 400);
              },
              error: () => this.notify.error('❌ خطا در حذف رکورد'),
            });
          } else {
            this.notify.info('عملیات حذف لغو شد');
            this.loadingservice.hide();
          }
        });
    });
  }

  // ===============================================================
  //   مدیریت مودال جزئیات
  // ===============================================================
  @ViewChild('autletterDetail') modalRef!: ElementRef;

  /** 🟢 نمایش مودال */
  public openModal(): void {
    setTimeout(() => {
      const modal = this.modalRef?.nativeElement;
      if (!modal) return;
      modal.style.display = 'block';
      setTimeout(() => modal.classList.add('show'), 10);
    });
  }

  /** 🔴 بستن مودال */
  public closeModal(): void {
    const modal = this.modalRef?.nativeElement;
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => (modal.style.display = 'none'), 200);
  }
}
