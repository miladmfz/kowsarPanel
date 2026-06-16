import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild, signal } from '@angular/core';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { AutletterWebApiService } from '../../../../automation/services/AutletterWebApi.service';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { CellActionAutletterKowsarList } from './cell-action-autletter-kowsar-list';
import { CellStateAutletterKowsar } from './cell-state-autletter-kowsar';

@Component({
  selector: 'app-autletter-kowsar-list',
  templateUrl: './autletter-kowsar-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    NgPersianDatepickerModule,
  ],
})
export class AutletterKowsarListComponent extends AgGridBaseComponent implements OnInit, OnDestroy {

  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#0066cc',
    selectedText: '#ffffff',
  };


  records = signal<any[]>([])
  records_detail = signal<any[]>([])
  loading_detail = signal(true);

  WorkFlowStatus_Lookup: Base_Lookup[] = [
    { id: '1', name: 'تأیید' },
    { id: '2', name: 'رد' },
    { id: '3', name: 'بررسی مجدد' },
  ];
  IsPrivate_Lookup: Base_Lookup[] = [

    { id: "False", name: "عمومی" },
    { id: "True", name: "محرمانه" },
  ]
  // ===============================================================
  //   Reactive Forms
  // ===============================================================
  EditForm_Search = new FormGroup({
    StartDate: new FormControl(''),
    EndDate: new FormControl(''),
    UserRef: new FormControl('0'),
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
    OwnerPersonInfoRef: new FormControl(''),
    StartTime: new FormControl(''),
    EndTime: new FormControl(''),
    SelectedOption: new FormControl('0'),
  });

  // ===============================================================
  //   UI Properties
  // ===============================================================
  modal_title = signal('')
  title = signal('لیست تیکت‌های ارسالی')
  dateValue = new FormControl();
  StartTime = new FormControl();
  EndTime = new FormControl();

  CentralRef = signal('')
  LoginType = signal('')

  items = signal<any[]>([])
  TextData = signal('')
  selectedOption = signal('0');
  searchTerm = signal('')
  ToDayDate = signal('')
  gridMemory1 = new Map<string, any>();
  gridKey = signal('');
  /**   Context ارتباط با CellRenderer */
  override context: any;

  // ===============================================================
  // 🧠 Injected Services
  // ===============================================================

  private readonly repo = inject(AutletterWebApiService);
  private readonly router = inject(Router);
  private readonly notify = inject(NotificationService);
  private readonly gridMemory_service = inject(AgGridMemoryService);
  protected readonly session = inject(SessionStorageService);
  constructor() {
    super();
  }

  // ===============================================================
  // 🚀 Lifecycle
  // ===============================================================
  ngOnInit(): void {

    this.gridKey.set(`${this.constructor.name}-grid`);

    // پاک کردن memory در صورت برگشت از صفحات خارجی
    this.router.events.subscribe(event => {
      console.log(event)
      if (event instanceof NavigationStart) {
        const comingFromExternal = !event.url.startsWith('/automation/letter');
        if (comingFromExternal) this.gridMemory_service.remove(this.gridKey());
      }
    });
    console.log(this.session.personInfoRef)

    this.initColumns();
    const memory = this.gridMemory_service.get(this.gridKey());
    if (memory?.rowData) {
      this.records.set(memory.rowData);
    } else {
      this.getList();
    }

  }

  override onGridReady(params: any, index: number) {
    super.onGridReady(params, index);

    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    setTimeout(() => {
      if (params.api && !params.api.isDestroyed?.()) {
        params.api.sizeColumnsToFit();
      }
    }, 50);
  }

  override onFirstDataRendered(params: any) {
    const memory = this.gridMemory_service.get(this.gridKey());
    if (!params.api || params.api.isDestroyed?.()) return;

    if (memory?.columnState) {
      params.api.applyColumnState({ state: memory.columnState, applyOrder: true });
    }

    if (memory?.filterState) {
      params.api.setFilterModel(memory.filterState);
    }

    if (memory?.rowData) {
      this.records.set(memory.rowData);
    } else {
      this.getList();
    }
  }

  onGridStateChanged() {
    const api = this.gridApi1;
    if (!api) return;

    this.gridMemory_service.save(this.gridKey(), {
      columnState: api.getColumnState(),
      filterState: api.getFilterModel()
    });
  }

  // ===============================================================
  // 🧱 تعریف ستون‌های جدول اصلی
  // ===============================================================
  private initColumns(): void {
    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionAutletterKowsarList,
        cellRendererParams: { editUrl: '/automation/letter-detail' },
        minWidth: 150,
      },
      {
        field: 'وضعیت',
        headerName: 'وضعیت',
        cellRenderer: CellStateAutletterKowsar,
        cellClass: 'text-center',
        minWidth: 100,
      },


      {
        field: 'IsPrivate',
        headerName: 'محرمانگی',
        minWidth: 70,
        valueFormatter: (params) => {
          const item = this.IsPrivate_Lookup.find(x => x.id === params.value);
          return item ? item.name : params.value;
        }
      },




      {
        field: 'LetterState',
        headerName: 'وضعیت',

        cellClass: 'text-center',
        minWidth: 100,
      },

      {
        field: 'CreatorName',
        headerName: 'ایجادکننده',

        cellClass: 'text-center',
        minWidth: 150,
      }, {
        field: 'RowExecutorName',
        headerName: 'کاربر فعلی',

        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'RowLetterDate',
        headerName: 'تاریخ ارجاع',

        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'RowLetterState',
        headerName: 'وضعیت ارجاع',

        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'AutLetterRow_PropDescription1',
        headerName: 'خلاصه عملکرد',

        cellClass: 'text-center',
        minWidth: 250,
      },
      {
        field: 'OwnerName',
        headerName: 'مشتری',

        cellClass: 'text-center',
        minWidth: 200,
      },
      {
        field: 'LetterDescription',
        headerName: 'متن تیکت',

        cellClass: 'text-center',
        headerClass: 'text-center',
        minWidth: 200,
      },
      {
        field: 'LetterDate',
        headerName: 'تاریخ تیکت',

        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'RowsCount',
        headerName: 'تعداد ارجاع',

        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        field: 'ConversationCount',
        headerName: 'چت',

        cellClass: 'text-center',
        minWidth: 90,
      },
    ];

  }

  // ===============================================================
  // 📋 بارگذاری لیست نامه‌ها
  // ===============================================================

  getList(): void {


    const CentralRef = this.session.centralRef;
    const loginType = this.session.loginType;

    this.EditForm_autletter.patchValue({
      SearchTarget: this.EditForm_autletter.value.SearchTarget?.trim() || '',
      CentralRef: CentralRef,
      OwnCentralRef: CentralRef,
    });

    if (loginType === 'KOWSAR') {
      this.EditForm_autletter.patchValue({
        OwnerPersonInfoRef: "",
      });
    } else {

      this.EditForm_autletter.patchValue({
        OwnerPersonInfoRef: this.session.personInfoRef,
      });
    }






    //   تعیین CentralRef بر اساس وضعیت انتخاب
    this.CentralRef.set(loginType === 'KOWSAR' && this.EditForm_autletter.value.SelectedOption === '0' ? '' : CentralRef);

    this.EditForm_autletter.patchValue({ CentralRef: this.CentralRef() });

    // 🚀 دریافت داده از سرور

    this.repo.GetAutLetterListForUser(this.EditForm_autletter.value).subscribe({
      next: (data: any) => {



        this.records.set(data?.AutLetters || []);

        this.gridMemory_service.save(this.gridKey(), {
          rowData: data?.AutLetters || [],
          columnDefs: this.column_name_1
        });



      },
      error: () => {

        this.notify.error('❌ خطا در دریافت لیست نامه‌ها');
      },
    });
  }

  clearFilter(): void {
    this.EditForm_autletter.patchValue({
      SearchTarget: "",
      CentralRef: "",
      CreationDate: "",
      OwnCentralRef: "",
      PersonInfoCode: "",
      OwnerPersonInfoRef: "",
      StartTime: "",
      EndTime: "",
      SelectedOption: "0",
    });
    this.getList()
  }

  // ===============================================================
  //   عملیات‌ها
  // ===============================================================
  NavigateToEdit(data: any): void {
    this.router.navigate(['/automation/letter-panel', data.LetterCode]);
  }

  /**   مشاهده جزئیات نامه */
  ViewDetails(single: any): void {
    if (!single) return;

    this.EditForm_autletter_detail.patchValue(single);
    this.openModal();
  }

  /**   واکنش به تغییر عبارت جستجو */
  onInputChange(): void {
    if (!this.searchTerm()?.trim()) this.searchTerm.set('');
    this.getList();
  }

  /**   حذف تیکت */
  btnDeleteClicked(data: any): void {
    if (data.RowsCount > 0) {
      this.notify.error('⛔ این تیکت دارای ارجاع است و قابل حذف نیست');
      return;
    }


    import('sweetalert2').then(Swal => {
      Swal.default.fire({
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
      }).then(result => {
        if (result.isConfirmed) {

          this.repo.DeleteAutLetter(data.LetterCode).subscribe({
            next: () => {
              this.notify.success('  تیکت با موفقیت حذف شد');
              setTimeout(() => this.getList(), 400);
            },
            error: () => this.notify.error('❌ خطا در حذف رکورد'),
          });
        } else {
          this.notify.info('عملیات حذف لغو شد');
        }
      });
    });
  }

  // ===============================================================
  //   مدیریت مودال جزئیات
  // ===============================================================
  @ViewChild('autletterDetail') modalRef!: ElementRef;

  /** 🟢 نمایش مودال با انیمیشن fade-in */
  public openModal(): void {
    setTimeout(() => {
      const modal = this.modalRef?.nativeElement;
      if (!modal) return;
      modal.style.display = 'block';
      setTimeout(() => modal.classList.add('show'), 10);
    });
  }

  /** 🔴 بستن مودال با fade-out */
  public closeModal(): void {
    const modal = this.modalRef?.nativeElement;
    if (!modal) return;
    modal.classList.remove('show');
    setTimeout(() => (modal.style.display = 'none'), 200);
  }
}
