import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AgGridModule } from 'ag-grid-angular';
import { CellClickedEvent, ValueFormatterParams } from 'ag-grid-community';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { DataViewStateComponent } from 'src/app/app-shell/framework-components/data-view-state/data-view-state.component';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { CrudListState } from 'src/app/app-shell/framework-services/crud/crud-list-state';
import { WorkforceAbsenceTypeRecord } from '../../../models/workforce-absence-type.models';
import { WorkforceAbsenceTypeApiService } from '../../../services/workforce-absence-type-api.service';

@Component({
    selector: 'app-workforce-absence-type-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, AgGridModule, DataViewStateComponent],
    templateUrl: './workforce-absence-type-list.component.html',
    styleUrl: './workforce-absence-type-list.component.scss',
})
export class WorkforceAbsenceTypeListComponent extends AgGridBaseComponent implements OnInit {
    private readonly listState = new CrudListState<WorkforceAbsenceTypeRecord>();
    readonly records = this.listState.records;
    readonly loading = this.listState.loading;
    readonly status = this.listState.status;
    readonly errorMessage = this.listState.errorMessage;

    SearchForm = new FormGroup({ OnlyActive: new FormControl('') });

    private readonly router = inject(Router);
    private readonly repo = inject(WorkforceAbsenceTypeApiService);
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
            { field: 'AllowFriday', headerName: 'جمعه', minWidth: 80, valueFormatter: (p: ValueFormatterParams<WorkforceAbsenceTypeRecord, unknown>) => this.boolLabel(p.value) },
            { field: 'AllowHoliday', headerName: 'تعطیل', minWidth: 80, valueFormatter: (p: ValueFormatterParams<WorkforceAbsenceTypeRecord, unknown>) => this.boolLabel(p.value) },
            { field: 'RequireAttachment', headerName: 'پیوست', minWidth: 90, valueFormatter: (p: ValueFormatterParams<WorkforceAbsenceTypeRecord, unknown>) => this.boolLabel(p.value) },
            { field: 'DeductFromBalance', headerName: 'کسر سهمیه', minWidth: 105, valueFormatter: (p: ValueFormatterParams<WorkforceAbsenceTypeRecord, unknown>) => this.boolLabel(p.value) },
            { field: 'DisplayOrder', headerName: 'ترتیب', minWidth: 80 },
            { field: 'IsActive', headerName: 'فعال', minWidth: 80, valueFormatter: (p: ValueFormatterParams<WorkforceAbsenceTypeRecord, unknown>) => this.boolLabel(p.value) },
            { field: 'HelpText', headerName: 'راهنما', minWidth: 260 },
        ];
        this.loadList();
    }

    override onCellClicked(event: CellClickedEvent<WorkforceAbsenceTypeRecord>): void {
        if (event.colDef.field === 'Action' && event.data) {
            this.router.navigate(['/automation/workforce-absence/type-edit', event.data.AbsenceTypeCode], { state: { type: event.data } });
        }
    }

    loadList(): void {
        this.listState.beginLoad();
        this.repo.list({ AbsenceTypeCode: '0', OnlyActive: this.SearchForm.controls.OnlyActive.value || null }).subscribe({
            next: (data) => {
                this.listState.resolve(data.WorkforceAbsenceTypes ?? []);
                this.updateGridData(1, this.records());
            },
            error: () => {
                this.listState.reject('Failed to load workforce absence types.');
                this.notificationService.error('خطا در دریافت انواع درخواست');
            },
        });
    }

    create(): void { this.router.navigate(['/automation/workforce-absence/type-edit', '0']); }

    boolLabel(value: unknown): string {
        const text = String(value ?? '').toLowerCase();
        return text === '1' || text === 'true' ? 'بله' : 'خیر';
    }
}
