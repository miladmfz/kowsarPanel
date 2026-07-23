import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  inject,
  signal,
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NavigationStart, Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import {
  IDatepickerTheme,
  NgPersianDatepickerModule,
} from 'ng-persian-datepicker';
import { Subscription } from 'rxjs';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

import { AutletterWebApiService } from '../../../../automation/services/AutletterWebApi.service';
import { CellActionAutletterKowsarList } from './cell-action-autletter-kowsar-list';
import { CellStateAutletterKowsar } from './cell-state-autletter-kowsar';

interface GridRouteMemory {
  rowData?: any[];
  columnDefs?: any[];
  filterState?: Record<string, any> | null;
}

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
export class AutletterKowsarListComponent
  extends AgGridBaseComponent
  implements OnInit, OnDestroy {
  customTheme: Partial<IDatepickerTheme> = {
    selectedBackground: '#0066cc',
    selectedText: '#ffffff',
  };

  records = signal<any[]>([]);
  records_detail = signal<any[]>([]);
  loading_detail = signal(true);

  WorkFlowStatus_Lookup: Base_Lookup[] = [
    { id: '1', name: 'تأیید' },
    { id: '2', name: 'رد' },
    { id: '3', name: 'بررسی مجدد' },
  ];

  IsPrivate_Lookup: Base_Lookup[] = [
    { id: 'False', name: 'عمومی' },
    { id: 'True', name: 'محرمانه' },
  ];

  // ===============================================================
  // Reactive Forms
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
  // UI Properties
  // ===============================================================

  modal_title = signal('');
  title = signal('لیست تیکت‌های ارسالی');
  dateValue = new FormControl();
  StartTime = new FormControl();
  EndTime = new FormControl();

  CentralRef = signal('');
  LoginType = signal('');

  items = signal<any[]>([]);
  TextData = signal('');
  selectedOption = signal('0');
  searchTerm = signal('');
  ToDayDate = signal('');
  gridMemory1 = new Map<string, any>();

  /**
   * این کلید فقط برای نگهداری موقت rowData و filterState بین Routeهاست.
   * همان مکانیزم قبلی حفظ شده است.
   */
  gridKey = signal('');

  /**
   * این کلید فقط برای تنظیمات دائمی ستون‌ها در localStorage است.
   * برای هر کاربر یک کلید مستقل ساخته می‌شود.
   */
  private columnLayoutStorageKey = '';

  /**
   * فقط وضعیت ستون‌ها از localStorage خوانده می‌شود و قبل از ساخته‌شدن Grid
   * از طریق initialState به AG Grid تحویل داده می‌شود.
   */
  initialGridState: any = undefined;

  private routerSubscription?: Subscription;

  /** Context ارتباط با CellRenderer */
  override context: any;

  // ===============================================================
  // Injected Services
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
  // Lifecycle
  // ===============================================================

  ngOnInit(): void {
    this.gridKey.set(`${this.constructor.name}-grid`);
    this.columnLayoutStorageKey = this.createColumnLayoutStorageKey();
    this.initialGridState = this.readColumnGridState();

    this.routerSubscription = this.router.events.subscribe(event => {
      if (!(event instanceof NavigationStart)) {
        return;
      }

      const comingFromExternal = !event.url.startsWith('/automation/letter');

      if (comingFromExternal) {
        // فقط حافظه موقت Route حذف می‌شود.
        // تنظیمات ستون‌های localStorage باقی می‌ماند.
        this.gridMemory_service.remove(this.gridKey());
      }
    });

    this.initColumns();

    const memory = this.getRouteMemory();

    if (memory.rowData) {
      this.records.set(memory.rowData);
    } else {
      this.getList();
    }
  }

  override ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  override onGridReady(params: any, index: number): void {
    super.onGridReady(params, index);

    if (index >= 1 && index <= 6) {
      (this as any)[`gridApi${index}`] = params.api;
    }

    // اگر کاربر هنوز چیدمان ذخیره‌شده ندارد، فقط بار اول ستون‌ها Fit می‌شوند.
    // وقتی initialGridState وجود دارد، هیچ Fit یا Apply مجددی انجام نمی‌دهیم
    // تا ترتیب و عرض ذخیره‌شده کاربر دست‌نخورده بماند.
    if (!this.initialGridState) {
      setTimeout(() => {
        if (params.api && !params.api.isDestroyed?.()) {
          params.api.sizeColumnsToFit();
        }
      }, 50);
    }
  }

  override onFirstDataRendered(params: any): void {
    const api = params.api;

    if (!api || api.isDestroyed?.()) {
      return;
    }

    const memory = this.getRouteMemory();

    if (memory.filterState) {
      api.setFilterModel(memory.filterState);
    }
  }

  // ===============================================================
  // Route Memory: rowData + filterState
  // ===============================================================

  private getRouteMemory(): GridRouteMemory {
    return (this.gridMemory_service.get(this.gridKey()) || {}) as GridRouteMemory;
  }

  private saveRouteMemory(patch: Partial<GridRouteMemory>): void {
    const currentMemory = this.getRouteMemory();

    this.gridMemory_service.save(this.gridKey(), {
      ...currentMemory,
      ...patch,
    });
  }

  onGridFilterChanged(): void {
    const api = this.gridApi1;

    if (!api || api.isDestroyed?.()) {
      return;
    }

    this.saveRouteMemory({
      filterState: api.getFilterModel(),
    });
  }

  // ===============================================================
  // Column Layout: localStorage + AG Grid initialState
  // ===============================================================

  private createColumnLayoutStorageKey(): string {
    /*
     * CentralRef برای این پروژه شناسه پایدار کاربر است.
     * PersonInfoRef را عمداً وارد کلید نکرده‌ایم؛ چون در بعضی Refreshها یا
     * LoginTypeها ممکن است ابتدا خالی باشد و باعث ساخته‌شدن کلید متفاوت شود.
     */
    const loginType = String(
      this.session.loginType ||
      sessionStorage.getItem('LoginType') ||
      'UNKNOWN',
    ).trim();

    const centralRef = String(
      this.session.centralRef ||
      sessionStorage.getItem('CentralRef') ||
      '0',
    ).trim();

    return [
      'kowsar',
      'ag-grid',
      'column-layout',
      'v3',
      this.constructor.name,
      loginType,
      centralRef,
    ].join(':');
  }

  private getLocalStorage(): Storage | null {
    try {
      if (typeof window === 'undefined') {
        return null;
      }

      return window.localStorage;
    } catch {
      return null;
    }
  }

  /**
   * وضعیت ستون‌ها قبل از ایجاد Grid خوانده می‌شود.
   * initialState فقط یک بار در زمان ساخت Grid خوانده می‌شود و به همین دلیل
   * از applyColumnState در gridReady قابل‌اعتمادتر است.
   */
  private readColumnGridState(): any | undefined {
    const storage = this.getLocalStorage();

    if (!storage) {
      return undefined;
    }

    try {
      const rawValue = storage.getItem(this.columnLayoutStorageKey);

      if (!rawValue) {
        return undefined;
      }

      const parsedValue = JSON.parse(rawValue);

      if (!parsedValue || typeof parsedValue !== 'object') {
        storage.removeItem(this.columnLayoutStorageKey);
        return undefined;
      }

      return parsedValue;
    } catch (error) {
      console.warn('Invalid AG Grid column layout:', error);
      storage.removeItem(this.columnLayoutStorageKey);
      return undefined;
    }
  }

  /**
   * فقط بخش‌های مربوط به ستون‌ها ذخیره می‌شوند.
   * rowData، pagination، selection و filter وارد localStorage نمی‌شوند.
   */
  onGridStateUpdated(event: any): void {
    const state = event?.state;
    const storage = this.getLocalStorage();

    if (!state || !storage || !this.columnLayoutStorageKey) {
      return;
    }

    const columnLayoutState = {
      version: state.version,
      partialColumnState: true,
      columnOrder: state.columnOrder,
      columnPinning: state.columnPinning,
      columnSizing: state.columnSizing,
      columnVisibility: state.columnVisibility,
      sort: state.sort,
    };

    try {
      storage.setItem(
        this.columnLayoutStorageKey,
        JSON.stringify(columnLayoutState),
      );
    } catch (error) {
      console.warn('AG Grid column layout could not be saved:', error);
    }
  }

  resetColumnLayout(): void {
    const storage = this.getLocalStorage();
    const api = this.gridApi1;

    storage?.removeItem(this.columnLayoutStorageKey);
    this.initialGridState = undefined;

    if (!api || api.isDestroyed?.()) {
      this.notify.success('تنظیمات ستون‌ها بازنشانی شد');
      return;
    }

    api.resetColumnState();

    setTimeout(() => {
      if (!api.isDestroyed?.()) {
        api.sizeColumnsToFit();
      }
    }, 50);

    this.notify.success('تنظیمات ستون‌ها بازنشانی شد');
  }

  // ===============================================================
  // Columns
  // ===============================================================

  private initColumns(): void {
    this.column_name_1 = [
      {
        colId: 'actions',
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionAutletterKowsarList,
        cellRendererParams: { editUrl: '/automation/letter-detail' },
        minWidth: 150,
      },
      {
        colId: 'ticketStatus',
        field: 'وضعیت',
        headerName: 'وضعیت',
        cellRenderer: CellStateAutletterKowsar,
        cellClass: 'text-center',
        minWidth: 100,
      },
      {
        colId: 'isPrivate',
        field: 'IsPrivate',
        headerName: 'محرمانگی',
        minWidth: 70,
        valueFormatter: params => {
          const item = this.IsPrivate_Lookup.find(x => x.id === params.value);
          return item ? item.name : params.value;
        },
      },
      {
        colId: 'letterState',
        field: 'LetterState',
        headerName: 'وضعیت',
        cellClass: 'text-center',
        minWidth: 100,
      },
      {
        colId: 'creatorName',
        field: 'CreatorName',
        headerName: 'ایجادکننده',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        colId: 'rowExecutorName',
        field: 'RowExecutorName',
        headerName: 'کاربر فعلی',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        colId: 'rowLetterDate',
        field: 'RowLetterDate',
        headerName: 'تاریخ ارجاع',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        colId: 'rowLetterState',
        field: 'RowLetterState',
        headerName: 'وضعیت ارجاع',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        colId: 'performanceSummary',
        field: 'AutLetterRow_PropDescription1',
        headerName: 'خلاصه عملکرد',
        cellClass: 'text-center',
        minWidth: 250,
      },
      {
        colId: 'ownerName',
        field: 'OwnerName',
        headerName: 'مشتری',
        cellClass: 'text-center',
        minWidth: 200,
      },
      {
        colId: 'letterDescription',
        field: 'LetterDescription',
        headerName: 'متن تیکت',
        cellClass: 'text-center',
        headerClass: 'text-center',
        minWidth: 200,
      },
      {
        colId: 'letterDate',
        field: 'LetterDate',
        headerName: 'تاریخ تیکت',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        colId: 'rowsCount',
        field: 'RowsCount',
        headerName: 'تعداد ارجاع',
        cellClass: 'text-center',
        minWidth: 150,
      },
      {
        colId: 'conversationCount',
        field: 'ConversationCount',
        headerName: 'چت',
        cellClass: 'text-center',
        minWidth: 90,
      },
    ];
  }

  // ===============================================================
  // Data Loading
  // ===============================================================

  getList(): void {
    const centralRef = this.session.centralRef;
    const loginType = this.session.loginType;

    this.EditForm_autletter.patchValue({
      SearchTarget:
        this.EditForm_autletter.value.SearchTarget?.trim() || '',
      CentralRef: centralRef,
      OwnCentralRef: centralRef,
    });

    if (loginType === 'KOWSAR') {
      this.EditForm_autletter.patchValue({
        OwnerPersonInfoRef: '',
      });
    } else {
      this.EditForm_autletter.patchValue({
        OwnerPersonInfoRef: this.session.personInfoRef,
      });
    }

    this.CentralRef.set(
      loginType === 'KOWSAR' &&
        this.EditForm_autletter.value.SelectedOption === '0'
        ? ''
        : centralRef,
    );

    this.EditForm_autletter.patchValue({
      CentralRef: this.CentralRef(),
    });

    this.repo
      .GetAutLetterListForUser(this.EditForm_autletter.value)
      .subscribe({
        next: (data: any) => {
          const rowData = data?.AutLetters || [];

          this.records.set(rowData);

          // فقط اطلاعات موقت Route ذخیره می‌شود.
          // تنظیمات ستون‌ها در localStorage مستقل هستند.
          this.saveRouteMemory({
            rowData,
            columnDefs: this.column_name_1,
          });
        },
        error: () => {
          this.notify.error('❌ خطا در دریافت لیست نامه‌ها');
        },
      });
  }

  clearFilter(): void {
    this.EditForm_autletter.patchValue({
      SearchTarget: '',
      CentralRef: '',
      CreationDate: '',
      OwnCentralRef: '',
      PersonInfoCode: '',
      OwnerPersonInfoRef: '',
      StartTime: '',
      EndTime: '',
      SelectedOption: '0',
    });

    this.getList();
  }

  // ===============================================================
  // Actions
  // ===============================================================

  NavigateToEdit(data: any): void {
    this.router.navigate(['/automation/letter-panel', data.LetterCode]);
  }

  ViewDetails(single: any): void {
    if (!single) {
      return;
    }

    this.EditForm_autletter_detail.patchValue(single);
    this.openModal();
  }

  onInputChange(): void {
    if (!this.searchTerm()?.trim()) {
      this.searchTerm.set('');
    }

    this.getList();
  }

  btnDeleteClicked(data: any): void {
    if (data.RowsCount > 0) {
      this.notify.error('⛔ این تیکت دارای ارجاع است و قابل حذف نیست');
      return;
    }

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
                this.notify.success('تیکت با موفقیت حذف شد');
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
  // Modal
  // ===============================================================

  @ViewChild('autletterDetail') modalRef!: ElementRef;

  public openModal(): void {
    setTimeout(() => {
      const modal = this.modalRef?.nativeElement;

      if (!modal) {
        return;
      }

      modal.style.display = 'block';
      setTimeout(() => modal.classList.add('show'), 10);
    });
  }

  public closeModal(): void {
    const modal = this.modalRef?.nativeElement;

    if (!modal) {
      return;
    }

    modal.classList.remove('show');
    setTimeout(() => (modal.style.display = 'none'), 200);
  }
}
