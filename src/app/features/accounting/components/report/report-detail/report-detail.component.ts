import { CommonModule } from '@angular/common';
import { Component, ElementRef, inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { AutletterWebApiService } from 'src/app/features/support/services/AutletterWebApi.service';
import { ReportWebApiService } from '../../../services/ReportWebApi.service';

@Component({
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    NgPersianDatepickerModule,
  ],
})
export class ReportDetailComponent extends AgGridBaseComponent implements OnInit, OnDestroy {
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




  EditForm_SearchTarget = new FormGroup({
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
  modal_title = '';
  title = 'لیست تیکت‌های ارسالی';
  dateValue = new FormControl();
  StartTime = new FormControl();
  EndTime = new FormControl();
  ReportCode: string = '';
  CentralRef: string = '';
  JobPersonRef: string = '';

  items: any[] = [];
  TextData: string = '';
  selectedOption: string = '0';
  searchTerm: string = '';
  ToDayDate: string = '';

  /**   Context ارتباط با CellRenderer */
  override context: any;

  // ===============================================================
  // 🧠 Injected Services
  // ===============================================================
  private readonly repo = inject(ReportWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notify = inject(NotificationService);
  private readonly loadingservice = inject(LoadingService);

  constructor() {
    super();
  }

  // ===============================================================
  // 🚀 Lifecycle
  // ===============================================================
  ngOnInit(): void {

    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      this.ReportCode = id ?? '';

    });




    this.initColumns();
    this.loadList();
  }

  // ===============================================================
  // 🧱 تعریف ستون‌های جدول اصلی
  // ===============================================================
  private initColumns(): void {
    this.columnDefs1 = [
      // {
      //   field: 'عملیات',
      //   pinned: 'left',
      //   cellRenderer: CellActionAutletterList,
      //   cellRendererParams: { editUrl: '/support/letter-detail' },
      //   minWidth: 250,
      // },
      // {
      //   field: 'وضعیت',
      //   headerName: 'وضعیت',
      //   cellRenderer: CellStateAutletter,
      //   cellClass: 'text-center',
      //   minWidth: 100,
      // },
      {
        field: 'RowExecutorName',
        headerName: 'کاربر فعلی',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,
      },

    ];

    //   اتصال AgGrid به Component برای دسترسی CellRenderer به متدها
    this.context = { componentParent: this };
  }

  // ===============================================================
  // 📋 بارگذاری لیست نامه‌ها
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

  loadList(): void {
    this.records = []
    this.loadingservice.show();

    const CentralRef = sessionStorage.getItem('CentralRef') ?? '';
    const JobPersonRef = sessionStorage.getItem('JobPersonRef') ?? '';

    this.EditForm_SearchTarget.patchValue({
      SearchTarget: this.EditForm_SearchTarget.value.SearchTarget?.trim() || '',

    });

    this.repo.GetReportsByCode(this.ReportCode).subscribe({
      next: (data: any) => {
        this.title = data?.Reports[0].ReportTitle ?? "گزارشی یافت نشد"
        this.loadingservice.hide();

      },
      error: () => {
        this.loadingservice.hide();
        this.notify.error('❌ خطا در دریافت لیست نامه‌ها');
      },
    });

    // this.loadingservice.show();
    // this.repo.GetAutLetterList(this.EditForm_autletter.value).subscribe({
    //   next: (data: any) => {
    //     this.loadingservice.hide();
    //     this.records = data?.AutLetters ?? [];
    //     this.updateGridData(1, this.records);

    //   },
    //   error: () => {
    //     this.loadingservice.hide();
    //     this.notify.error('❌ خطا در دریافت لیست نامه‌ها');
    //   },
    // });







  }

  clearFilter(): void {
    this.EditForm_SearchTarget.patchValue({
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
    this.loadList()
  }




}
