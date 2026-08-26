import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { WorkforceAbsenceWebApiService } from '../../../../automation/services/WorkforceAbsenceWebApi.service';

@Component({
    selector: 'app-workforce-absence-policy-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, AgGridModule],
    templateUrl: './workforce-absence-policy-list.component.html',
})
export class WorkforceAbsencePolicyListComponent extends AgGridBaseComponent implements OnInit {
    records = signal<any[]>([]);
    users = signal<any[]>([]);
    loading = signal(false);

    SearchForm = new FormGroup({
        CentralRef: new FormControl('0'),
        OnlyActive: new FormControl(''),
    });

    private readonly router = inject(Router);
    private readonly repo = inject(WorkforceAbsenceWebApiService);
    private readonly baseRepo = inject(KowsarBaseWebApi);
    private readonly notificationService = inject(NotificationService);

    constructor() { super(); }

    ngOnInit(): void {
        this.initColumns();
        this.baseRepo.GetCentralUser().subscribe({
            next: (data: any) => {
                this.users.set(data?.Centrals ?? []);
                this.loadList();
            },
            error: () => this.loadList(),
        });
    }

    private initColumns(): void {
        this.column_name_1 = [
            {
                field: 'Action', headerName: 'عملیات', pinned: 'left', minWidth: 110,
                cellRenderer: () => '<button class="btn btn-sm btn-outline-primary">ویرایش</button>',
            },
            { field: 'PolicyCode', headerName: 'کد', minWidth: 75 },
            { field: 'CentralName', headerName: 'کاربر', minWidth: 180 },
            { field: 'CentralRef', headerName: 'CentralRef', minWidth: 110 },
            { field: 'EmploymentType', headerName: 'نوع همکاری', minWidth: 120, valueFormatter: (p: any) => this.employmentLabel(p.value) },
            { field: 'WorkStartTime', headerName: 'شروع کار', minWidth: 100 },
            { field: 'WorkEndTime', headerName: 'پایان کار', minWidth: 100 },
            { field: 'DailyWorkMinute', headerName: 'کار روزانه', minWidth: 110 },
            { field: 'AnnualDailyLimit', headerName: 'سهمیه سالانه', minWidth: 120 },
            { field: 'MonthlyHourlyLimitMinute', headerName: 'سقف ساعتی ماه', minWidth: 135 },
            { field: 'MinimumDailyAdvanceWorkDay', headerName: 'فاصله ثبت روزانه', minWidth: 135 },
            { field: 'MaximumHourlyMinutePerRequest', headerName: 'حد هر درخواست ساعتی', minWidth: 150 },
            { field: 'RequestSubmitStartTime', headerName: 'شروع ارسال', minWidth: 110 },
            { field: 'RequestSubmitEndTime', headerName: 'پایان ارسال', minWidth: 110 },
            { field: 'IsActive', headerName: 'فعال', minWidth: 80, valueFormatter: (p: any) => this.boolLabel(p.value) },
            { field: 'Explain', headerName: 'توضیحات', minWidth: 220 },
        ];
    }

    override onGridReady(params: any, index: number): void {
        super.onGridReady(params, index);
        if (index >= 1 && index <= 6) (this as any)[`gridApi${index}`] = params.api;
    }

    override onCellClicked(event: any): void {
        if (event?.colDef?.field === 'Action') {
            this.router.navigate(
                ['/automation/workforce-absence/policy-edit', event.data.PolicyCode],
                { state: { policy: event.data } }
            );
        }
    }

    loadList(): void {
        const raw = this.SearchForm.getRawValue();
        this.loading.set(true);

        this.repo.Policy_Get({
            CentralRef: raw.CentralRef || '0',
            OnlyActive: raw.OnlyActive || null,
            TargetJDate: null,
        }).subscribe({
            next: (data: any) => {
                const rows = data?.WorkforceAbsencePolicies ?? [];
                this.records.set(this.attachNames(rows));
                this.loading.set(false);
                this.updateGridData(1, this.records());
            },
            error: () => {
                this.records.set([]);
                this.loading.set(false);
                this.notificationService.error('خطا در دریافت Policyها');
            },
        });
    }

    create(): void {
        this.router.navigate(['/automation/workforce-absence/policy-edit', '0']);
    }

    private attachNames(rows: any[]): any[] {
        const map = new Map<string, string>();
        this.users().forEach((x: any) => map.set(String(x.CentralCode ?? ''), x.CentralName ?? ''));
        return rows.map((x: any) => ({ ...x, CentralName: x.CentralName || map.get(String(x.CentralRef ?? '')) || '' }));
    }

    employmentLabel(value: any): string {
        const map: Record<string, string> = {
            FULL_TIME: 'تمام وقت', PART_TIME: 'پاره وقت', SHIFT: 'شیفتی', CUSTOM: 'اختصاصی',
        };
        return map[String(value ?? '')] || String(value ?? '');
    }

    boolLabel(value: any): string {
        const text = String(value ?? '').toLowerCase();
        return text === '1' || text === 'true' ? 'بله' : 'خیر';
    }
}
