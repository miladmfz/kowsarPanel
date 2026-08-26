import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { WorkforceAbsenceWebApiService } from '../../../../automation/services/WorkforceAbsenceWebApi.service';

@Component({
    selector: 'app-workforce-absence-type-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, AgGridModule],
    templateUrl: './workforce-absence-type-list.component.html',
})
export class WorkforceAbsenceTypeListComponent extends AgGridBaseComponent implements OnInit {
    records = signal<any[]>([]);
    loading = signal(false);

    SearchForm = new FormGroup({ OnlyActive: new FormControl('') });

    private readonly router = inject(Router);
    private readonly repo = inject(WorkforceAbsenceWebApiService);
    private readonly notificationService = inject(NotificationService);

    constructor() { super(); }

    ngOnInit(): void {
        this.column_name_1 = [
            { field: 'Action', headerName: 'عملیات', pinned: 'left', minWidth: 110, cellRenderer: () => '<button class="btn btn-sm btn-outline-primary">ویرایش</button>' },
            { field: 'AbsenceTypeCode', headerName: 'کد', minWidth: 80 },
            { field: 'TypeKey', headerName: 'کلید', minWidth: 120 },
            { field: 'TypeTitle', headerName: 'عنوان', minWidth: 150 },
            { field: 'CalculationMode', headerName: 'محاسبه', minWidth: 110 },
            { field: 'BalanceMode', headerName: 'سهمیه', minWidth: 150 },
            { field: 'MinimumAdvanceWorkDay', headerName: 'فاصله کاری', minWidth: 110 },
            { field: 'AllowFriday', headerName: 'جمعه', minWidth: 80, valueFormatter: (p: any) => this.boolLabel(p.value) },
            { field: 'AllowHoliday', headerName: 'تعطیل', minWidth: 80, valueFormatter: (p: any) => this.boolLabel(p.value) },
            { field: 'RequireAttachment', headerName: 'پیوست', minWidth: 90, valueFormatter: (p: any) => this.boolLabel(p.value) },
            { field: 'DeductFromBalance', headerName: 'کسر سهمیه', minWidth: 105, valueFormatter: (p: any) => this.boolLabel(p.value) },
            { field: 'DisplayOrder', headerName: 'ترتیب', minWidth: 80 },
            { field: 'IsActive', headerName: 'فعال', minWidth: 80, valueFormatter: (p: any) => this.boolLabel(p.value) },
            { field: 'HelpText', headerName: 'راهنما', minWidth: 260 },
        ];
        this.loadList();
    }

    override onGridReady(params: any, index: number): void {
        super.onGridReady(params, index);
        if (index >= 1 && index <= 6) (this as any)[`gridApi${index}`] = params.api;
    }

    override onCellClicked(event: any): void {
        if (event?.colDef?.field === 'Action') {
            this.router.navigate(['/automation/workforce-absence/type-edit', event.data.AbsenceTypeCode], { state: { type: event.data } });
        }
    }

    loadList(): void {
        this.loading.set(true);
        this.repo.Type_Get({ AbsenceTypeCode: '0', OnlyActive: this.SearchForm.controls.OnlyActive.value || null }).subscribe({
            next: (data: any) => {
                this.records.set(data?.WorkforceAbsenceTypes ?? []);
                this.loading.set(false);
                this.updateGridData(1, this.records());
            },
            error: () => {
                this.records.set([]);
                this.loading.set(false);
                this.notificationService.error('خطا در دریافت انواع درخواست');
            },
        });
    }

    create(): void { this.router.navigate(['/automation/workforce-absence/type-edit', '0']); }

    boolLabel(value: any): string {
        const text = String(value ?? '').toLowerCase();
        return text === '1' || text === 'true' ? 'بله' : 'خیر';
    }
}
