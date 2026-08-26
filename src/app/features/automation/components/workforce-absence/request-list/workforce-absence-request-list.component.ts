import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule, IDatepickerTheme } from 'ng-persian-datepicker';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { WorkforceAbsenceWebApiService } from '../../../../automation/services/WorkforceAbsenceWebApi.service';

@Component({
    selector: 'app-workforce-absence-request-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        AgGridModule,
        NgPersianDatepickerModule,
    ],
    templateUrl: './workforce-absence-request-list.component.html',
})
export class WorkforceAbsenceRequestListComponent extends AgGridBaseComponent implements OnInit {
    records = signal<any[]>([]);
    users = signal<any[]>([]);
    types = signal<any[]>([]);
    loading = signal(false);
    selectedRequest = signal<any | null>(null);
    showWorkflowPanel = signal(false);
    todayJDate = signal('');

    customTheme: Partial<IDatepickerTheme> = {
        selectedBackground: '#D68E3A',
        selectedText: '#FFFFFF',
    };

    SearchForm = new FormGroup({
        StartJDate: new FormControl(''),
        EndJDate: new FormControl(''),
        CentralRef: new FormControl('0'),
        WorkflowStatus: new FormControl('-1'),
        AbsenceTypeKey: new FormControl(''),
    });

    WorkflowForm = new FormGroup({
        AbsenceRequestCode: new FormControl('', Validators.required),
        WorkflowStatus: new FormControl('', Validators.required),
        ManagerExplain: new FormControl(''),
        HasAttachment: new FormControl('0'),
    });

    private readonly router = inject(Router);
    private readonly repo = inject(WorkforceAbsenceWebApiService);
    private readonly baseRepo = inject(KowsarBaseWebApi);
    private readonly notificationService = inject(NotificationService);
    protected readonly session = inject(SessionStorageService);
    protected readonly permission = inject(PermissionService);

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.initColumns();
        this.loadTypes();
        this.loadUsersAndInitialData();
    }

    private initColumns(): void {
        this.column_name_1 = [
            {
                field: 'Action',
                headerName: 'عملیات',
                pinned: 'left',
                minWidth: 160,
                cellRenderer: () => `
                    <div class="d-flex gap-1 py-1">
                        <button class="btn btn-sm btn-outline-primary" data-action="edit">ویرایش</button>
                        <button class="btn btn-sm btn-outline-info" data-action="workflow">گردش‌کار</button>
                    </div>`,
            },
            { field: 'AbsenceRequestCode', headerName: 'کد', minWidth: 80, maxWidth: 90 },
            { field: 'CentralName', headerName: 'کاربر', minWidth: 180 },
            { field: 'TypeTitle', headerName: 'نوع درخواست', minWidth: 130 },
            {
                field: 'RequestMode',
                headerName: 'حالت',
                minWidth: 90,
                valueFormatter: (params: any) => params.value === 'MINUTE' ? 'ساعتی' : 'روزانه',
            },
            { field: 'StartJDate', headerName: 'شروع', minWidth: 115 },
            { field: 'EndJDate', headerName: 'پایان', minWidth: 115 },
            { field: 'StartTime', headerName: 'از ساعت', minWidth: 95 },
            { field: 'EndTime', headerName: 'تا ساعت', minWidth: 95 },
            { field: 'TotalWorkDay', headerName: 'روز کاری', minWidth: 100 },
            {
                field: 'TotalMinute',
                headerName: 'مدت ساعتی',
                minWidth: 110,
                valueFormatter: (params: any) => this.minuteToText(params.value),
            },
            { field: 'WorkflowStatusTitle', headerName: 'وضعیت', minWidth: 115 },
            { field: 'Description', headerName: 'توضیحات', minWidth: 220 },
        ];
    }

    override onGridReady(params: any, index: number): void {
        super.onGridReady(params, index);
        if (index >= 1 && index <= 6) {
            (this as any)[`gridApi${index}`] = params.api;
        }
    }

    override onCellClicked(event: any): void {
        if (event?.colDef?.field !== 'Action') return;

        const action = event?.event?.target?.getAttribute?.('data-action');
        if (action === 'workflow') {
            this.openWorkflow(event.data);
            return;
        }

        this.navigateToEdit(event.data);
    }

    loadTypes(): void {
        this.repo.Type_Get({ AbsenceTypeCode: '0', OnlyActive: '1' }).subscribe({
            next: (data: any) => this.types.set(data?.WorkforceAbsenceTypes ?? []),
            error: () => this.types.set([]),
        });
    }

    loadUsersAndInitialData(): void {
        this.baseRepo.GetCentralUser().subscribe({
            next: (data: any) => {
                this.users.set(data?.Centrals ?? []);

                if (!this.permission.canManageRole) {
                    this.SearchForm.patchValue(
                        { CentralRef: this.session.centralRef ?? '0' },
                        { emitEvent: false }
                    );
                }

                this.baseRepo.GetTodeyFromServer().subscribe({
                    next: (todayData: any) => {
                        const today = this.extractToday(todayData);
                        this.todayJDate.set(today);
                        this.SearchForm.patchValue(
                            { StartJDate: today, EndJDate: today },
                            { emitEvent: false }
                        );
                        this.loadList();
                    },
                    error: () => this.loadList(),
                });
            },
            error: () => {
                this.users.set([]);
                this.loadList();
            },
        });
    }

    loadList(): void {
        const raw = this.SearchForm.getRawValue();
        const command = {
            ...raw,
            CentralRef: this.permission.canManageRole
                ? (raw.CentralRef || '0')
                : (this.session.centralRef ?? '0'),
        };

        this.loading.set(true);

        this.repo.Request_Get(command).subscribe({
            next: (data: any) => {
                const rows = data?.WorkforceAbsenceRequests ?? [];
                this.records.set(this.attachCentralNames(rows));
                this.loading.set(false);
                this.updateGridData(1, this.records());
            },
            error: () => {
                this.records.set([]);
                this.loading.set(false);
                this.notificationService.error('خطا در دریافت لیست درخواست‌ها');
            },
        });
    }

    navigateToCreate(): void {
        this.router.navigate(['/automation/workforce-absence/request-edit', '0']);
    }

    navigateToEdit(row: any): void {
        this.router.navigate(['/automation/workforce-absence/request-edit', row.AbsenceRequestCode]);
    }

    openWorkflow(row: any): void {
        this.selectedRequest.set(row);
        this.WorkflowForm.patchValue({
            AbsenceRequestCode: row.AbsenceRequestCode?.toString() ?? '',
            WorkflowStatus: '',
            ManagerExplain: '',
            HasAttachment: this.bitText(row.HasAttachment),
        });
        this.showWorkflowPanel.set(true);
    }

    closeWorkflow(): void {
        this.showWorkflowPanel.set(false);
        this.selectedRequest.set(null);
        this.WorkflowForm.reset({
            AbsenceRequestCode: '',
            WorkflowStatus: '',
            ManagerExplain: '',
            HasAttachment: '0',
        });
    }

    submitWorkflow(): void {
        if (!this.permission.canManageRole) {
            this.notificationService.warning('فقط مدیر اجازه ثبت گردش‌کار را دارد');
            return;
        }

        this.WorkflowForm.markAllAsTouched();
        if (this.WorkflowForm.invalid) {
            this.notificationService.warning('وضعیت درخواست را مشخص کنید');
            return;
        }

        const raw = this.WorkflowForm.getRawValue();
        const command = {
            ...raw,
            ManagerRef: this.session.centralRef ?? '0',
        };

        this.repo.Request_Workflow(command).subscribe({
            next: (data: any) => {
                const result = data?.WorkforceAbsenceRequests?.[0] ?? data;
                if (Number(result?.ErrCode ?? 0) !== 0) {
                    this.notificationService.warning(result?.ErrDesc ?? 'خطا در ثبت گردش‌کار');
                    return;
                }

                this.notificationService.success('گردش‌کار ثبت شد');
                this.closeWorkflow();
                this.loadList();
            },
            error: () => this.notificationService.error('خطا در ارتباط با سرور'),
        });
    }

    canSelectUser(): boolean {
        return this.permission.canManageRole === true;
    }

    minuteToText(value: any): string {
        const total = Math.max(0, Number(value) || 0);
        const hour = Math.floor(total / 60);
        const minute = total % 60;
        return `${hour}:${minute.toString().padStart(2, '0')}`;
    }

    private attachCentralNames(rows: any[]): any[] {
        const map = new Map<string, string>();
        this.users().forEach((x: any) => map.set(String(x.CentralCode ?? ''), x.CentralName ?? ''));

        return rows.map((row: any) => ({
            ...row,
            CentralName: row.CentralName || map.get(String(row.CentralRef ?? '')) || '',
        }));
    }

    private extractToday(data: any): string {
        return (
            data?.Text ??
            data?.[0]?.TodeyFromServer ??
            data?.TodeyFromServer ??
            ''
        ).toString();
    }

    private bitText(value: any): string {
        const text = String(value ?? '').toLowerCase();
        return text === '1' || text === 'true' ? '1' : '0';
    }
}
