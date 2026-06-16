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
import { Component, OnInit, OnDestroy, Renderer2, inject, signal } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { StateLabelCellLeaveReq } from './state-label-cell-leavereq';
import { CellActionLeaveReqList } from './cell-action-leavereq-list';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { LeaveRequestWebApiService } from '../../../../automation/services/LeaveRequestWebApi.service';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import moment from 'jalali-moment';
import Swal from 'sweetalert2';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';

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

    records = signal<any[]>([])
    records_leavedetails = signal<any[]>([])
    loading = signal(true)
    loading_leavedetail = signal(true)
    isManager = signal(false)
    ToDayDate = signal('')

    isDa = signal(false)
    isDAILY = signal(false)
    isHOURLY = signal(false)

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


        MonthlyTotalDays: new FormControl(''),
        MonthlyTotalMinutes: new FormControl(''),
        MonthlyTotalHours: new FormControl(''),
        RunningMinutes: new FormControl(''),
        IsOverLimit: new FormControl(''),

    });

    // ---------------------------------------------------------------
    //   عنوان مودال جزئیات
    // ---------------------------------------------------------------
    modal_title = signal('')

    // ---------------------------------------------------------------
    //   Context برای ارتباط CellRenderer با Component
    // ---------------------------------------------------------------
    override context: any;

    // ---------------------------------------------------------------
    //   Constructor
    // ---------------------------------------------------------------


    private readonly router = inject(Router);

    private readonly repo = inject(LeaveRequestWebApiService);
    private readonly base_repo = inject(KowsarBaseWebApi);
    protected readonly session = inject(SessionStorageService);
    private readonly notificationService = inject(NotificationService);
    private readonly renderer = inject(Renderer2);
    private readonly permissionService = inject(PermissionService);


    LeaveType_Lookup: Base_Lookup[] = [
        { id: 'DAILY', name: 'روزانه' },
        { id: 'HOURLY', name: 'ساعتي' },
    ];
    constructor() {
        super();
    }

    // ---------------------------------------------------------------
    // 🚀 Lifecycle: OnInit
    // ---------------------------------------------------------------
    ngOnInit(): void {
        const centralRef = this.session.centralRef;
        this.isManager.set(['1274', '1139', '1843'].includes(centralRef ?? ''))

        this.initColumns();

        // 📅 دریافت تاریخ امروز و لیست اولیه

        this.base_repo.GetTodeyFromServer().subscribe({
            next: (data: any) => {

                this.ToDayDate = data[0]?.TodeyFromServer ?? '';
                this.loadinitialLeaveList();
            },
            error: () => {

                this.notificationService.error('❌ خطا در دریافت تاریخ امروز')
            },

        });
    }

    // ---------------------------------------------------------------
    // 🔚 Lifecycle: OnDestroy
    // ---------------------------------------------------------------

    // ---------------------------------------------------------------
    // 🧱 تعریف ستون‌های جدول
    // ---------------------------------------------------------------
    private initColumns(): void {
        this.column_name_1 = [
            { field: 'عملیات', pinned: 'left', cellRenderer: CellActionLeaveReqList, minWidth: 200 },
            { field: 'CentralName', headerName: 'نام', minWidth: 140 },
            {
                field: 'LeaveRequestType',
                headerName: 'نوع مرخصی',
                minWidth: 70,
                valueFormatter: (params) => {
                    const item = this.LeaveType_Lookup.find(x => x.id === params.value);
                    return item ? item.name : params.value;
                }
            },
            { field: 'LeaveRequestExplain', headerName: 'توضیحات', minWidth: 160 },
            { field: 'LeaveStartDate', headerName: 'شروع مرخصی', minWidth: 120 },
            { field: 'TotalDay', headerName: 'کل روز', minWidth: 100 },
            { field: 'WorkDay', headerName: 'روز کاری', minWidth: 100 },
            { field: 'وضعیت', cellRenderer: StateLabelCellLeaveReq, minWidth: 110 },
            { field: 'WorkFlowExplain', headerName: 'توضیحات مدیر', minWidth: 150 },
        ];

        this.columnDefs2 = [
            {
                field: 'LeaveRequestType',
                headerName: 'نوع مرخصی',
                minWidth: 70,
                valueFormatter: (params) => {
                    const item = this.LeaveType_Lookup.find(x => x.id === params.value);
                    return item ? item.name : params.value;
                }
            },
            { field: 'LeaveRequestExplain', headerName: 'توضیحات', minWidth: 160 },
            { field: 'LeaveStartDate', headerName: 'شروع مرخصی', minWidth: 120 },
            { field: 'TotalDay', headerName: 'کل روز', minWidth: 100 },
            { field: 'WorkDay', headerName: 'روز کاری', minWidth: 100 },
            { field: 'MonthlyTotalDays', headerName: 'کل مرخصی', minWidth: 100 },
            { field: 'RunningMinutes', headerName: 'مرخصی به دقیقه', minWidth: 100 },
            { field: 'MonthlyTotalHours', headerName: 'مرخصی به ساعت', minWidth: 100 },
            { field: 'YearMonth', headerName: 'ماه', minWidth: 120 },

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
        this.EditForm_Search.patchValue({
            UserRef: this.permissionService.canManageRole ? '0' : this.session.centralRef ?? '0',
            ManagerRef: '0',
            WorkFlowStatus: '0',
        });

        this.loading.set(true)

        this.repo.GetLeaveRequest(this.EditForm_Search.value).subscribe({
            next: (data: any) => {

                this.records.set(data?.LeaveRequests ?? [])
                this.loading.set(false)
                this.updateGridData(1, this.records());

            },
            error: () => {
                this.records.set([])
                this.loading.set(false)
                this.notificationService.error('❌ خطا در دریافت لیست مرخصی‌ها');
            },
        });
    }

    loadinitialLeaveList(): void {
        this.EditForm_Search.patchValue({
            StartDate: '',
            EndDate: '',
            UserRef: this.permissionService.canManageRole ? '0' : this.session.centralRef ?? '0',
            ManagerRef: '0',
            WorkFlowStatus: '0',
        });

        this.loading.set(true)

        this.repo.GetLeaveRequest(this.EditForm_Search.value).subscribe({
            next: (data: any) => {

                this.records.set(data?.LeaveRequests ?? [])
                this.loading.set(false)
                this.updateGridData(1, this.records());

            },
            error: () => {
                this.records.set([])
                this.loading.set(false)
                this.notificationService.error('❌ خطا در دریافت لیست مرخصی‌ها');
            },
        });
    }


    // ---------------------------------------------------------------
    //   ویرایش درخواست
    // ---------------------------------------------------------------
    NavigateToEdit(data: any): void {
        if (data.WorkFlowStatus === '0' || data.WorkFlowStatus === '3') {
            this.router.navigate(['/automation/leaverequest-edit', data.LeaveRequestCode]);
        } else {
            this.notificationService.warning('⛔ این مرخصی قابل ویرایش نیست');
        }
    }

    // ---------------------------------------------------------------
    //   مشاهده جزئیات و گردش‌کار
    // ---------------------------------------------------------------
    WorkFlow(data: any): void {
        this.records_leavedetails.set([])
        this.modal_title.set(data.CentralName ?? '')

        this.EditForm_WorkFlow.patchValue({
            LeaveRequestCode: data.LeaveRequestCode,
            ManagerRef: data.ManagerRef,
            WorkFlowStatus: data.WorkFlowStatus,
            WorkFlowExplain: data.WorkFlowExplain,
            LeaveRequestDate: moment(data.LeaveRequestDate).format('jYYYY/jMM/jDD'),
            LeaveRequestType: data.LeaveRequestType,
            LeaveRequestExplain: data.LeaveRequestExplain,
            LeaveStartDate: data.LeaveStartDate,
            LeaveEndDate: data.LeaveEndDate,
            LeaveStartTime: data.LeaveStartTime,
            LeaveEndTime: data.LeaveEndTime,



            MonthlyTotalDays: data.MonthlyTotalDays,
            MonthlyTotalHours: data.MonthlyTotalHours,
            IsOverLimit: data.IsOverLimit,
        });

        if (data.LeaveRequestType === 'DAILY') {
            this.isDAILY.set(true)
            this.isHOURLY.set(false)
        } else {
            this.isDAILY.set(false)
            this.isHOURLY.set(true)
        }


        const filter = {
            StartDate: '',
            EndDate: '',
            UserRef: data.UserRef,
            ManagerRef: '0',
            WorkFlowStatus: '0',
        };


        this.repo.GetLeaveRequest(filter).subscribe({
            next: (data: any) => {
                this.records_leavedetails.set(data?.LeaveRequests ?? [])

                this.updateGridData(2, this.records_leavedetails());

                this.openModal();
            },
            error: () => {

                this.notificationService.error('❌ خطا در دریافت جزئیات مرخصی');
            },
        });
    }

    // ---------------------------------------------------------------
    //   حذف درخواست
    // ---------------------------------------------------------------
    async btnDeleteClicked(data: any): Promise<void> {
        if (data.WorkFlowStatus !== '0') {
            this.notificationService.error('⛔ این درخواست دارای نظر است و قابل حذف نیست');
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
                    this.notificationService.success('  مرخصی با موفقیت حذف شد');
                    this.loadLeaveList();
                },
                error: () => {

                    this.notificationService.error('❌ خطا در حذف رکورد')
                },
            });
        } else {
            this.notificationService.warning('عملیات حذف لغو شد');
        }
    }

    // ---------------------------------------------------------------
    // 💾 ثبت گردش‌کار مدیر
    // ---------------------------------------------------------------
    submitWorkflow(): void {
        if (this.EditForm_WorkFlow.invalid) {
            this.notificationService.warning('  لطفاً وضعیت و توضیحات را تکمیل کنید');
            return;
        }

        const payload = {
            ...this.EditForm_WorkFlow.value,
            ManagerRef: this.session.centralRef,
        };


        this.repo.LeaveRequest_WorkFlow(payload).subscribe({
            next: (data: any) => {

                // const message = data?.LeaveRequests?.[0]?.Message ?? '';

                // if (message.length > 0) {

                //     this.fireDeleteSwal1(message).then((result) => {
                //         if (result.isConfirmed) {

                //             //////////////////////////////////////////////

                //         } else if (result.dismiss === Swal.DismissReason.cancel) {
                //             this.notificationService.warning('اطلاعات تغییری نکرد');
                //         }
                //     });

                //     return;
                // }

                this.notificationService.success('نظر مدیر با موفقیت ثبت شد');
                this.closeModal();
                this.loadLeaveList();
            },

            error: () => {
                this.notificationService.error('❌ خطا در ثبت نظر مدیر');
            },
        });
    }



    fireDeleteSwal1(message: string) {
        return Swal.fire({
            title: 'توجه',
            text: message,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'ادامه عملیات',
            cancelButtonText: 'خیر',
            allowOutsideClick: false,
            allowEscapeKey: false,
            customClass: {
                confirmButton: 'btn btn-success mx-2',
                cancelButton: 'btn btn-danger',
            },
            buttonsStyling: false,
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
