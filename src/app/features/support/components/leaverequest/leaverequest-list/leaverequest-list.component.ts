/* ===============================================================
  LeaverequestListComponent
کامپوننت اصلی لیست مرخصی‌ها
ویژگی‌ها:
- نمایش لیست مرخصی‌ها در جدول AG Grid
- جستجو بر اساس تاریخ‌ها
- امکان افزودن، ویرایش، حذف و مشاهده گردش‌کار
- ثبت نظر مدیر (Workflow)
- استفاده از مودال برای نمایش جزئیات
=============================================================== */

import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, Renderer2 } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { AgGridModule } from 'ag-grid-angular';

//   Base + Cell Renderers
import { StateLabelCellLeaveReq } from './state-label-cell-leavereq';
import { CellActionLeaveReqList } from './cell-action-leavereq-list';

//   Services
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';

//   Models
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';
import { LeaveRequestWebApiService } from '../../../services/LeaveRequestWebApi.service';

@Component({
    selector: 'app-leaverequest-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        AgGridModule,
        RouterModule,
        NgPersianDatepickerModule,
    ],
    templateUrl: './leaverequest-list.component.html',
})
export class LeaverequestListComponent extends AgGridBaseComponent implements OnInit, OnDestroy {
    // ---------------------------------------------------------------
    // 🌗 Theme
    // ---------------------------------------------------------------

    // ---------------------------------------------------------------
    //   Data
    // ---------------------------------------------------------------
    records: any[] = [];
    records_leavedetails: any[] = [];
    loading = true;
    loading_leavedetail = true;
    isManager = false;
    ToDayDate = '';

    // ---------------------------------------------------------------
    // 🧾 Lookup for workflow status
    // ---------------------------------------------------------------
    WorkFlowStatus_Lookup: Base_Lookup[] = [
        { id: '1', name: 'تأیید' },
        { id: '2', name: 'رد' },
        { id: '3', name: 'بررسی مجدد' },
    ];

    // ---------------------------------------------------------------
    // 📅 Datepicker Theme
    // ---------------------------------------------------------------
    customTheme: Partial<IDatepickerTheme> = {
        selectedBackground: '#D68E3A',
        selectedText: '#FFFFFF',
    };

    // ---------------------------------------------------------------
    //   Forms
    // ---------------------------------------------------------------
    EditForm_Search = new FormGroup({
        StartDate: new FormControl(''),
        EndDate: new FormControl(''),
        UserRef: new FormControl('0'),
        ManagerRef: new FormControl('0'),
        WorkFlowStatus: new FormControl('0'),
    });

    EditForm_WorkFlow = new FormGroup({
        LeaveRequestCode: new FormControl(''),
        ManagerRef: new FormControl(''),
        WorkFlowStatus: new FormControl('', Validators.required),
        WorkFlowExplain: new FormControl('', Validators.required),
        LeaveRequestDate: new FormControl(''),
        LeaveRequestType: new FormControl(''),
        LeaveRequestExplain: new FormControl(''),
        LeaveStartDate: new FormControl(''),
        LeaveEndDate: new FormControl(''),
        LeaveStartTime: new FormControl(''),
        LeaveEndTime: new FormControl(''),
    });

    // ---------------------------------------------------------------
    //   عنوان مودال جزئیات
    // ---------------------------------------------------------------
    modal_title = '';

    // ---------------------------------------------------------------
    //   Context برای ارتباط CellRenderer با Component
    // ---------------------------------------------------------------
    override context: any;

    // ---------------------------------------------------------------
    //   Constructor
    // ---------------------------------------------------------------
    constructor(
        private repo: LeaveRequestWebApiService,
        private router: Router,
        private notify: NotificationService,
        private renderer: Renderer2,
        private loadingservice: LoadingService

    ) {
        super();
    }

    // ---------------------------------------------------------------
    // 🚀 Lifecycle: OnInit
    // ---------------------------------------------------------------
    ngOnInit(): void {
        const centralRef = sessionStorage.getItem('CentralRef');
        this.isManager = ['1274', '1139', '1843'].includes(centralRef ?? '');

        this.initColumns();

        // 📅 دریافت تاریخ امروز و لیست اولیه
        this.repo.GetTodeyFromServer().subscribe({
            next: (data: any) => {
                this.ToDayDate = data[0]?.TodeyFromServer ?? '';
                this.loadinitialLeaveList();
            },
            error: () => this.notify.error('❌ خطا در دریافت تاریخ امروز'),
        });
    }

    // ---------------------------------------------------------------
    // 🔚 Lifecycle: OnDestroy
    // ---------------------------------------------------------------

    // ---------------------------------------------------------------
    // 🧱 تعریف ستون‌های جدول
    // ---------------------------------------------------------------
    private initColumns(): void {
        this.columnDefs1 = [
            { field: 'عملیات', pinned: 'left', cellRenderer: CellActionLeaveReqList, minWidth: 200 },
            { field: 'CentralName', headerName: 'نام', minWidth: 140 },
            { field: 'LeaveRequestType', headerName: 'نوع مرخصی', minWidth: 140 },
            { field: 'LeaveRequestExplain', headerName: 'توضیحات', minWidth: 160 },
            { field: 'LeaveStartDate', headerName: 'شروع مرخصی', minWidth: 120 },
            { field: 'TotalDay', headerName: 'کل روز', minWidth: 100 },
            { field: 'WorkDay', headerName: 'روز کاری', minWidth: 100 },
            { field: 'وضعیت', cellRenderer: StateLabelCellLeaveReq, minWidth: 110 },
            { field: 'WorkFlowExplain', headerName: 'توضیحات مدیر', minWidth: 150 },
        ];
        this.columnDefs2 = [
            { field: 'CentralName', headerName: 'نام', minWidth: 140 },
            { field: 'LeaveRequestType', headerName: 'نوع مرخصی', minWidth: 140 },
            { field: 'LeaveRequestExplain', headerName: 'توضیحات', minWidth: 160 },
            { field: 'LeaveStartDate', headerName: 'شروع مرخصی', minWidth: 120 },
            { field: 'TotalDay', headerName: 'کل روز', minWidth: 100 },
            { field: 'WorkDay', headerName: 'روز کاری', minWidth: 100 },
            { field: 'وضعیت', cellRenderer: StateLabelCellLeaveReq, minWidth: 110 },
            { field: 'WorkFlowExplain', headerName: 'توضیحات مدیر', minWidth: 150 },
        ];


    }

    // ---------------------------------------------------------------
    //   دریافت لیست مرخصی‌ها
    // ---------------------------------------------------------------
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

    loadLeaveList(): void {
        const isAdmin = !!sessionStorage.getItem('PhAddress3');
        this.EditForm_Search.patchValue({
            UserRef: isAdmin ? '0' : sessionStorage.getItem('CentralRef') ?? '0',
            ManagerRef: '0',
            WorkFlowStatus: '0',
        });

        this.loading = true;
        this.repo.GetLeaveRequest(this.EditForm_Search.value).subscribe({
            next: (data: any) => {
                this.records = data?.LeaveRequests ?? [];
                this.loading = false;
                this.updateGridData(1, this.records);

            },
            error: () => {
                this.records = [];
                this.loading = false;
                this.notify.error('❌ خطا در دریافت لیست مرخصی‌ها');
            },
        });
    }

    loadinitialLeaveList(): void {
        const isAdmin = !!sessionStorage.getItem('PhAddress3');
        this.EditForm_Search.patchValue({
            StartDate: '',
            EndDate: '',
            UserRef: isAdmin ? '0' : sessionStorage.getItem('CentralRef') ?? '0',
            ManagerRef: '0',
            WorkFlowStatus: '0',
        });

        this.loading = true;
        this.repo.GetLeaveRequest(this.EditForm_Search.value).subscribe({
            next: (data: any) => {
                this.records = data?.LeaveRequests ?? [];
                this.loading = false;
                this.updateGridData(1, this.records);

            },
            error: () => {
                this.records = [];
                this.loading = false;
                this.notify.error('❌ خطا در دریافت لیست مرخصی‌ها');
            },
        });
    }


    // ---------------------------------------------------------------
    //   ویرایش درخواست
    // ---------------------------------------------------------------
    NavigateToEdit(data: any): void {
        if (data.WorkFlowStatus === '0' || data.WorkFlowStatus === '3') {
            this.router.navigate(['/support/leaverequest-edit', data.LeaveRequestCode]);
        } else {
            this.notify.warning('⛔ این مرخصی قابل ویرایش نیست');
        }
    }

    // ---------------------------------------------------------------
    //   مشاهده جزئیات و گردش‌کار
    // ---------------------------------------------------------------
    WorkFlow(data: any): void {
        this.records_leavedetails = [];
        this.modal_title = data.CentralName ?? '';

        this.EditForm_WorkFlow.patchValue({
            LeaveRequestCode: data.LeaveRequestCode,
            ManagerRef: data.ManagerRef,
            WorkFlowStatus: data.WorkFlowStatus,
            WorkFlowExplain: data.WorkFlowExplain,
            LeaveRequestDate: data.LeaveRequestDate,
            LeaveRequestType: data.LeaveRequestType,
            LeaveRequestExplain: data.LeaveRequestExplain,
            LeaveStartDate: data.LeaveStartDate,
            LeaveEndDate: data.LeaveEndDate,
            LeaveStartTime: data.LeaveStartTime,
            LeaveEndTime: data.LeaveEndTime,
        });

        this.loadingservice.show()
        const filter = {
            StartDate: '',
            EndDate: '',
            UserRef: data.UserRef,
            ManagerRef: '0',
            WorkFlowStatus: '0',
        };

        this.repo.GetLeaveRequest(filter).subscribe({
            next: (res: any) => {
                this.records_leavedetails = res?.LeaveRequests ?? [];
                this.loadingservice.hide()
                this.updateGridData(2, this.records_leavedetails);

                this.openModal();
            },
            error: () => {
                this.loadingservice.hide()
                this.notify.error('❌ خطا در دریافت جزئیات مرخصی');
            },
        });
    }

    // ---------------------------------------------------------------
    //   حذف درخواست
    // ---------------------------------------------------------------
    async btnDeleteClicked(data: any): Promise<void> {
        if (data.WorkFlowStatus !== '0') {
            this.notify.warning('⛔ این درخواست دارای نظر است و قابل حذف نیست');
            return;
        }

        const Swal = (await import('sweetalert2')).default;
        const result = await Swal.fire({
            title: 'حذف مرخصی؟',
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
        });

        if (result.isConfirmed) {
            this.repo.DeleteLeaveRequest(data.LeaveRequestCode).subscribe({
                next: () => {
                    this.notify.success('  مرخصی با موفقیت حذف شد');
                    this.loadLeaveList();
                },
                error: () => this.notify.error('❌ خطا در حذف رکورد'),
            });
        } else {
            this.notify.warning('عملیات حذف لغو شد');
        }
    }

    // ---------------------------------------------------------------
    // 💾 ثبت گردش‌کار مدیر
    // ---------------------------------------------------------------
    submitWorkflow(): void {
        if (this.EditForm_WorkFlow.invalid) {
            this.notify.warning('  لطفاً وضعیت و توضیحات را تکمیل کنید');
            return;
        }

        const payload = {
            ...this.EditForm_WorkFlow.value,
            ManagerRef: sessionStorage.getItem('CentralRef'),
        };

        this.repo.LeaveRequest_WorkFlow(payload).subscribe({
            next: () => {
                this.notify.success('  نظر مدیر با موفقیت ثبت شد');
                this.closeModal();
                this.loadLeaveList();
            },
            error: () => this.notify.error('❌ خطا در ثبت نظر مدیر'),
        });
    }

    // ---------------------------------------------------------------
    //   کنترل مودال‌ها
    // ---------------------------------------------------------------
    openModal(): void {
        const modal = this.renderer.selectRootElement('#leavedetail', true);
        this.renderer.addClass(modal, 'show');
        this.renderer.setStyle(modal, 'display', 'block');
    }

    closeModal(): void {
        const modal = this.renderer.selectRootElement('#leavedetail', true);
        this.renderer.removeClass(modal, 'show');
        this.renderer.setStyle(modal, 'display', 'none');
    }
}
