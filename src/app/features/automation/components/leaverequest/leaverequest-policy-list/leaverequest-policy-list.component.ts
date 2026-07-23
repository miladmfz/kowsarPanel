import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { LeaveRequestWebApiService } from '../../../../automation/services/LeaveRequestWebApi.service';

@Component({
    selector: 'app-leaverequest-policy-list',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        AgGridModule,
    ],
    templateUrl: './leaverequest-policy-list.component.html',
})
export class LeaverequestPolicyListComponent extends AgGridBaseComponent implements OnInit {

    records = signal<any[]>([]);
    users = signal<any[]>([]);
    loading = signal(false);

    EditForm_Search = new FormGroup({
        CentralRef: new FormControl('0'),
        OnlyActive: new FormControl(''),
    });

    private readonly router = inject(Router);
    private readonly repo = inject(LeaveRequestWebApiService);
    private readonly base_repo = inject(KowsarBaseWebApi);
    private readonly notificationService = inject(NotificationService);
    protected readonly session = inject(SessionStorageService);
    protected readonly permission = inject(PermissionService);

    constructor() {
        super();
    }

    ngOnInit(): void {
        this.initColumns();
        this.GetCentralUser();
    }

    private initColumns(): void {
        this.column_name_1 = [
            {
                field: 'Action',
                headerName: 'عملیات',
                pinned: 'left',
                minWidth: 120,
                maxWidth: 140,
                cellRenderer: () => {
                    return '<button type="button" class="btn btn-sm btn-outline-primary">ویرایش</button>';
                },
            },
            { field: 'PolicyCode', headerName: 'کد', minWidth: 80, maxWidth: 90 },
            { field: 'CentralName', headerName: 'کاربر', minWidth: 180 },
            { field: 'CentralRef', headerName: 'CentralRef', minWidth: 110 },
            {
                field: 'EmploymentType',
                headerName: 'نوع همکاری',
                minWidth: 120,
                valueFormatter: (params: any) => this.employmentTypeLabel(params.value),
            },
            { field: 'WorkStartTime', headerName: 'شروع کار', minWidth: 100 },
            { field: 'WorkEndTime', headerName: 'پایان کار', minWidth: 100 },
            { field: 'BreakMinute', headerName: 'استراحت', minWidth: 100 },
            { field: 'DailyWorkMinute', headerName: 'دقیقه کاری روزانه', minWidth: 140 },
            { field: 'AnnualLeaveLimitDay', headerName: 'سهمیه سالانه', minWidth: 130 },
            { field: 'MonthlyHourlyLeaveLimitMinute', headerName: 'سقف ساعتی ماهانه', minWidth: 150 },
            { field: 'PartTimeRatio', headerName: 'ضریب', minWidth: 90 },
            { field: 'RequestSubmitStartTime', headerName: 'شروع ارسال', minWidth: 110 },
            { field: 'RequestSubmitEndTime', headerName: 'پایان ارسال', minWidth: 110 },
            {
                field: 'IsActive',
                headerName: 'فعال',
                minWidth: 90,
                valueFormatter: (params: any) => this.boolLabel(params.value),
            },
            { field: 'EffectiveFromJDate', headerName: 'از تاریخ', minWidth: 120 },
            { field: 'EffectiveToJDate', headerName: 'تا تاریخ', minWidth: 120 },
            { field: 'Explain', headerName: 'توضیحات', minWidth: 220 },
        ];
    }

    override onGridReady(params: any, index: number): void {
        super.onGridReady(params, index);

        if (index >= 1 && index <= 6) {
            (this as any)[`gridApi${index}`] = params.api;
        }

        setTimeout(() => {
            try {
                if (params.api && !params.api.isDestroyed?.()) {
                    params.api.sizeColumnsToFit();
                }
            } catch { }
        }, 50);
    }

    override onCellClicked(event: any): void {
        if (event?.colDef?.field === 'Action') {
            this.NavigateToEdit(event.data);
        }
    }

    GetCentralUser(): void {
        this.base_repo.GetCentralUser().subscribe({
            next: (data: any) => {
                this.users.set(data?.Centrals ?? []);

                if (!this.canSelectUser()) {
                    this.EditForm_Search.patchValue(
                        { CentralRef: this.session.centralRef ?? '0' },
                        { emitEvent: false }
                    );
                }

                this.loadPolicyList();
            },
            error: () => {
                this.users.set([]);
                this.loadPolicyList();
            },
        });
    }

    loadPolicyList(): void {
        const payload = {
            CentralRef: this.canSelectUser()
                ? (this.EditForm_Search.controls['CentralRef'].value || '0')
                : (this.session.centralRef ?? '0'),
            OnlyActive: this.EditForm_Search.controls['OnlyActive'].value || null,
        };

        this.loading.set(true);

        this.repo.GetLeaveRequestUserPolicy(payload).subscribe({
            next: (data: any) => {
                const rows = data?.LeaveRequestUserPolicies ?? [];
                this.records.set(this.attachCentralName(rows));
                this.loading.set(false);
                this.updateGridData(1, this.records());
            },
            error: () => {
                this.records.set([]);
                this.loading.set(false);
                this.notificationService.error('خطا در دریافت تنظیمات مرخصی کاربران');
            },
        });
    }

    NavigateToCreate(): void {
        this.router.navigate(['/automation/leaverequest-policy-edit', '0']);
    }

    NavigateToEdit(data: any): void {
        this.router.navigate(
            ['/automation/leaverequest-policy-edit', data.PolicyCode],
            { state: { policy: data } }
        );
    }

    canSelectUser(): boolean {
        return this.permission.canManageRole === true;
    }

    employmentTypeLabel(value: any): string {
        const key = (value ?? '').toString();

        if (key === 'FULL_TIME') return 'تمام وقت';
        if (key === 'PART_TIME') return 'پاره وقت';
        if (key === 'SHIFT') return 'شیفتی';
        if (key === 'CUSTOM') return 'سفارشی';

        return key;
    }

    boolLabel(value: any): string {
        const key = (value ?? '').toString().toLowerCase();
        return key === '1' || key === 'true' ? 'بله' : 'خیر';
    }

    private attachCentralName(rows: any[]): any[] {
        const userMap = new Map<string, string>();

        this.users().forEach((user: any) => {
            userMap.set((user.CentralCode ?? '').toString(), user.CentralName ?? '');
        });

        return rows.map((row: any) => ({
            ...row,
            CentralName: row.CentralName || userMap.get((row.CentralRef ?? '').toString()) || '',
        }));
    }
}
