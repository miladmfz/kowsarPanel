import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { NgPersianDatepickerModule, IDatepickerTheme } from 'ng-persian-datepicker';
import { catchError, forkJoin, of } from 'rxjs';

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
    styles: [`
        .wfa-workflow-backdrop {
            background: rgba(15, 23, 42, .52);
            backdrop-filter: blur(2px);
            z-index: 1060;
        }

        .wfa-workflow-dialog {
            max-width: 1180px;
        }

        .wfa-workflow-content {
            border-radius: 22px;
            overflow: hidden;
        }

        .wfa-workflow-header {
            background: linear-gradient(135deg, #0d6efd, #1d4ed8);
            color: #fff;
            border: 0;
            padding: 1rem 1.25rem;
        }

        .wfa-close-btn {
            width: 42px;
            height: 42px;
            border-radius: 12px;
            border: 1px solid rgba(255,255,255,.24);
            background: rgba(255,255,255,.12);
            color: #fff;
            display: inline-flex;
            align-items: center;
            justify-content: center;
        }

        .wfa-section {
            border: 1px solid rgba(148, 163, 184, .22);
            border-radius: 16px;
            background: #fff;
            overflow: hidden;
        }

        .wfa-section-title {
            font-weight: 800;
            color: #1e293b;
        }

        .wfa-stat-card {
            border: 1px solid rgba(148, 163, 184, .22);
            border-radius: 14px;
            background: #f8fafc;
            padding: .75rem .85rem;
            height: 100%;
        }

        .wfa-stat-label {
            color: #64748b;
            font-size: .76rem;
            margin-bottom: .2rem;
        }

        .wfa-stat-value {
            color: #0f172a;
            font-weight: 800;
            font-size: .96rem;
            line-height: 1.6;
            word-break: break-word;
        }



        .wfa-compact-grid {
            display: grid;
            grid-template-columns: repeat(3, minmax(0, 1fr));
            gap: .55rem;
        }

        .wfa-compact-item,
        .wfa-compact-note {
            border: 1px solid rgba(148, 163, 184, .22);
            border-radius: 11px;
            background: #f8fafc;
            padding: .55rem .7rem;
            min-width: 0;
        }

        .wfa-compact-item {
            display: flex;
            flex-direction: column;
            gap: .12rem;
        }

        .wfa-compact-label {
            color: #64748b;
            font-size: .72rem;
            font-weight: 600;
        }

        .wfa-compact-item strong,
        .wfa-compact-note strong {
            color: #0f172a;
            font-size: .84rem;
            line-height: 1.45;
            word-break: break-word;
        }

        .wfa-history-wrap {
            max-height: 280px;
            overflow: auto;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }

        .wfa-history-wrap table {
            margin-bottom: 0;
            white-space: nowrap;
        }

        .wfa-history-wrap thead th {
            position: sticky;
            top: 0;
            z-index: 2;
            background: #eef4ff;
            color: #334155;
            font-size: .76rem;
            font-weight: 800;
        }

        .wfa-history-wrap tbody td {
            vertical-align: middle;
            font-size: .78rem;
        }

        .wfa-current-history-row td {
            background: rgba(13, 110, 253, .08) !important;
        }

        .wfa-decision-box {
            border: 1px solid rgba(13, 110, 253, .20);
            border-radius: 16px;
            background: linear-gradient(180deg, #f8fbff, #fff);
        }

        .wfa-workflow-body {
            background: #f8fafc;
        }

        .wfa-workflow-footer {
            border-top: 1px solid #e2e8f0;
            background: #fff;
        }

        :host-context(html[data-bs-theme='dark']) .wfa-workflow-content,
        :host-context(html[data-bs-theme='dark']) .wfa-section,
        :host-context(html[data-bs-theme='dark']) .wfa-workflow-footer {
            color: var(--kws-dark-text, #f1f5f9);
            background: var(--kws-dark-surface, #252e40);
            border-color: var(--kws-dark-border, rgba(226, 232, 240, .18));
        }

        :host-context(html[data-bs-theme='dark']) .wfa-stat-card,
        :host-context(html[data-bs-theme='dark']) .wfa-compact-item,
        :host-context(html[data-bs-theme='dark']) .wfa-compact-note,
        :host-context(html[data-bs-theme='dark']) .wfa-decision-box,
        :host-context(html[data-bs-theme='dark']) .wfa-workflow-body {
            color: var(--kws-dark-text, #f1f5f9);
            background: var(--kws-dark-surface-raised, #303b51);
            border-color: var(--kws-dark-border, rgba(226, 232, 240, .18));
        }

        :host-context(html[data-bs-theme='dark']) .wfa-section-title,
        :host-context(html[data-bs-theme='dark']) .wfa-stat-value,
        :host-context(html[data-bs-theme='dark']) .wfa-compact-item strong,
        :host-context(html[data-bs-theme='dark']) .wfa-compact-note strong {
            color: var(--kws-dark-text, #f1f5f9);
        }

        :host-context(html[data-bs-theme='dark']) .wfa-stat-label,
        :host-context(html[data-bs-theme='dark']) .wfa-compact-label {
            color: var(--kws-dark-muted, #c2ccda);
        }

        :host-context(html[data-bs-theme='dark']) .wfa-history-wrap,
        :host-context(html[data-bs-theme='dark']) .wfa-history-wrap thead th {
            color: var(--kws-dark-text, #f1f5f9);
            background: var(--kws-dark-surface-raised, #303b51);
            border-color: var(--kws-dark-border, rgba(226, 232, 240, .18));
        }

        @media (max-width: 992px) {
            .wfa-compact-grid {
                grid-template-columns: repeat(2, minmax(0, 1fr));
            }
        }

        @media (max-width: 768px) {
            .wfa-compact-grid {
                grid-template-columns: 1fr;
            }
            .wfa-workflow-dialog {
                margin: .5rem;
            }

            .wfa-workflow-content {
                border-radius: 16px;
            }
        }
    `],
})
export class WorkforceAbsenceRequestListComponent extends AgGridBaseComponent implements OnInit {

    records = signal<any[]>([]);
    users = signal<any[]>([]);
    types = signal<any[]>([]);
    loading = signal(false);

    selectedRequest = signal<any | null>(null);
    showWorkflowPanel = signal(false);

    workflowLoading = signal(false);
    workflowDetail = signal<any | null>(null);
    workflowHistory = signal<any[]>([]);

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

    // =============================================================
    // Main grid
    // =============================================================

    private initColumns(): void {
        this.column_name_1 = [
            {
                field: 'Action',
                headerName: 'عملیات',
                pinned: 'left',
                minWidth: 160,
                cellRenderer: () => `
                    <div class="d-flex gap-1 py-1">
                        <button type="button" class="btn btn-sm btn-outline-primary" data-action="edit">ویرایش</button>
                        <button type="button" class="btn btn-sm btn-outline-info" data-action="workflow">گردش‌کار</button>
                    </div>`,
            },
            { field: 'AbsenceRequestCode', headerName: 'کد', minWidth: 80, maxWidth: 90 },
            { field: 'CentralName', headerName: 'کاربر', minWidth: 180 },
            { field: 'TypeTitle', headerName: 'نوع درخواست', minWidth: 130 },
            {
                field: 'RequestMode',
                headerName: 'حالت',
                minWidth: 90,
                valueFormatter: (params: any) => this.requestModeText(params.value),
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

        const target = event?.event?.target as HTMLElement | null;
        const actionButton = target?.closest?.('button[data-action]') as HTMLButtonElement | null;
        const action = actionButton?.dataset?.['action'] ?? '';

        if (!action) return;

        event?.event?.preventDefault?.();
        event?.event?.stopPropagation?.();

        if (action === 'workflow') {
            this.openWorkflow(event.data);
            return;
        }

        if (action === 'edit') {
            this.navigateToEdit(event.data);
        }
    }

    // =============================================================
    // Search data
    // =============================================================

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
        this.router.navigate([
            '/automation/workforce-absence/request-edit',
            row.AbsenceRequestCode,
        ]);
    }

    // =============================================================
    // Workflow modal - full manager view
    // =============================================================

    openWorkflow(row: any): void {
        if (!row?.AbsenceRequestCode) {
            this.notificationService.warning('اطلاعات درخواست برای گردش‌کار معتبر نیست');
            return;
        }

        this.selectedRequest.set(row);
        this.workflowDetail.set(null);
        this.workflowHistory.set([]);

        this.WorkflowForm.reset(
            {
                AbsenceRequestCode: row.AbsenceRequestCode?.toString() ?? '',
                WorkflowStatus: '',
                ManagerExplain: '',
                HasAttachment: this.bitText(row.HasAttachment),
            },
            { emitEvent: false }
        );

        this.showWorkflowPanel.set(true);
        this.loadWorkflowContext(row);
    }

    private loadWorkflowContext(row: any): void {
        const requestCode = String(row?.AbsenceRequestCode ?? '');
        const centralRef = String(row?.CentralRef ?? '0');

        if (!requestCode || centralRef === '0') {
            this.workflowLoading.set(false);
            return;
        }

        this.workflowLoading.set(true);

        forkJoin({
            detail: this.repo.Request_GetById(requestCode).pipe(
                catchError(() => of(null))
            ),

            history: this.repo.Request_Get({
                StartJDate: '',
                EndJDate: '',
                CentralRef: centralRef,
                WorkflowStatus: '-1',
                AbsenceTypeKey: '',
            }).pipe(
                catchError(() => of(null))
            ),
        }).subscribe({
            next: (result: any) => {
                const detail =
                    result?.detail?.WorkforceAbsenceRequests?.[0] ??
                    row;

                this.workflowDetail.set({
                    ...detail,
                    CentralName:
                        row?.CentralName ||
                        this.centralNameByRef(centralRef),
                });

                const history =
                    result?.history?.WorkforceAbsenceRequests ?? [];

                this.workflowHistory.set(
                    this.attachCentralNames(history)
                );

                this.workflowLoading.set(false);
            },
            error: () => {
                this.workflowLoading.set(false);
            },
        });
    }

    closeWorkflow(): void {
        this.showWorkflowPanel.set(false);
        this.selectedRequest.set(null);
        this.workflowDetail.set(null);
        this.workflowHistory.set([]);
        this.workflowLoading.set(false);

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
        const status = this.num(raw.WorkflowStatus);
        const managerExplain = String(raw.ManagerExplain ?? '').trim();

        if ((status === 2 || status === 3) && !managerExplain) {
            this.notificationService.warning(
                'برای رد یا بررسی مجدد، توضیحات مدیر اجباری است'
            );
            return;
        }

        const command = {
            AbsenceRequestCode: String(raw.AbsenceRequestCode ?? ''),
            WorkflowStatus: String(raw.WorkflowStatus ?? ''),
            ManagerExplain: managerExplain,
            HasAttachment: String(raw.HasAttachment ?? '0'),
            ManagerRef: String(this.session.centralRef ?? '0'),
        };

        this.repo.Request_Workflow(command).subscribe({
            next: (data: any) => {
                const result =
                    data?.WorkforceAbsenceRequests?.[0] ??
                    data;

                if (this.num(result?.ErrCode) !== 0) {
                    this.notificationService.warning(
                        result?.ErrDesc ?? 'خطا در ثبت گردش‌کار'
                    );
                    return;
                }

                this.notificationService.success('گردش‌کار ثبت شد');
                this.closeWorkflow();
                this.loadList();
            },
            error: () => {
                this.notificationService.error('خطا در ارتباط با سرور');
            },
        });
    }

    // =============================================================
    // Display helpers
    // =============================================================

    canSelectUser(): boolean {
        return this.permission.canManageRole === true;
    }

    num(value: any): number {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    }

    minuteToText(value: any): string {
        const total = Math.max(0, Math.round(this.num(value)));
        const hour = Math.floor(total / 60);
        const minute = total % 60;

        return `${hour}:${minute.toString().padStart(2, '0')}`;
    }

    requestModeText(value: any): string {
        const mode = String(value ?? '').toUpperCase();

        if (mode === 'MINUTE') return 'ساعتی';
        if (mode === 'DAY') return 'روزانه';

        return mode || '-';
    }

    requestDurationText(row: any): string {
        if (!row) return '-';

        if (String(row?.RequestMode ?? '').toUpperCase() === 'MINUTE') {
            return `${this.minuteToText(row?.TotalMinute)} ساعت`;
        }

        return `${this.num(row?.TotalWorkDay)} روز کاری`;
    }

    workflowStatusText(value: any): string {
        switch (this.num(value)) {
            case 0: return 'در انتظار';
            case 1: return 'تایید شده';
            case 2: return 'رد شده';
            case 3: return 'بررسی مجدد';
            case 4: return 'لغو شده';
            default: return 'نامشخص';
        }
    }

    workflowStatusBadgeClass(value: any): string {
        switch (this.num(value)) {
            case 0: return 'bg-warning text-dark';
            case 1: return 'bg-success';
            case 2: return 'bg-danger';
            case 3: return 'bg-info text-dark';
            case 4: return 'bg-secondary';
            default: return 'bg-light text-dark border';
        }
    }


    yesNoText(value: any): string {
        return this.bitText(value) === '1' ? 'بله' : 'خیر';
    }

    display(value: any): string {
        if (value === null || value === undefined) return '-';

        const text = String(value).trim();
        return text || '-';
    }

    isCurrentHistoryRow(row: any): boolean {
        return String(row?.AbsenceRequestCode ?? '') ===
            String(this.workflowDetail()?.AbsenceRequestCode ?? '');
    }

    // =============================================================
    // Internal helpers
    // =============================================================

    private attachCentralNames(rows: any[]): any[] {
        const map = new Map<string, string>();

        this.users().forEach((x: any) => {
            map.set(
                String(x.CentralCode ?? ''),
                x.CentralName ?? ''
            );
        });

        return (rows ?? []).map((row: any) => ({
            ...row,
            CentralName:
                row.CentralName ||
                map.get(String(row.CentralRef ?? '')) ||
                '',
        }));
    }

    private centralNameByRef(centralRef: string): string {
        const row = this.users().find(
            (x: any) => String(x?.CentralCode ?? '') === centralRef
        );

        return row?.CentralName ?? '';
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
