import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';

import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';

import { WorkforceAbsenceWebApiService }
    from 'src/app/features/automation/services/WorkforceAbsenceWebApi.service';

@Component({
    selector: 'app-leave-grid',
    standalone: true,
    imports: [
        CommonModule,
        AgGridModule
    ],
    templateUrl: './leave-grid.component.html',
})
export class LeaveGridComponent
    extends AgGridBaseComponent
    implements OnInit {

    // ===============================================================
    // Inputs
    // ===============================================================

    @Input() externalData: any[] | null = null;

    @Input() darkMode = false;

    // ===============================================================
    // State
    // ===============================================================

    records = signal<any[]>([]);

    loading = signal(true);

    ToDayDate = signal('');

    // ===============================================================
    // Services
    // ===============================================================

    private readonly base_repo = inject(KowsarBaseWebApi);

    private readonly absence_repo =
        inject(WorkforceAbsenceWebApiService);

    constructor() {
        super();
    }

    // ===============================================================
    // Init
    // ===============================================================

    ngOnInit(): void {

        this.initColumns();

        this.loadFromServer();
    }

    // ===============================================================
    // Columns
    // ===============================================================

    private initColumns(): void {

        this.column_name_1 = [

            {
                field: 'CentralName',
                headerName: 'کارشناس',
                cellClass: 'text-center',
                minWidth: 140,
            },

            {
                field: 'TypeTitle',
                headerName: 'نوع مرخصی',
                cellClass: 'text-center',
                minWidth: 130,
            },

            {
                field: 'StartJDate',
                headerName: 'تاریخ شروع',
                cellClass: 'text-center',
                minWidth: 110,
            },

            {
                field: 'EndJDate',
                headerName: 'تاریخ پایان',
                cellClass: 'text-center',
                minWidth: 110,
            },

            {
                field: 'StartTime',
                headerName: 'ساعت شروع',
                cellClass: 'text-center',
                minWidth: 90,

                valueFormatter: (params: any) => {
                    return this.cleanTime(params.value);
                },
            },

            {
                field: 'EndTime',
                headerName: 'ساعت پایان',
                cellClass: 'text-center',
                minWidth: 90,

                valueFormatter: (params: any) => {
                    return this.cleanTime(params.value);
                },
            },

            {
                field: 'DurationText',
                headerName: 'مدت',
                cellClass: 'text-center',
                minWidth: 100,
            },

        ];
    }

    // ===============================================================
    // Load approved leaves for today
    // ===============================================================

    private loadFromServer(): void {

        this.loading.set(true);

        this.base_repo
            .GetTodeyFromServer()
            .subscribe({

                next: (todayData: any) => {

                    const today =
                        this.extractToday(todayData);

                    this.ToDayDate.set(today);

                    if (!today) {

                        this.records.set([]);

                        this.loading.set(false);

                        return;
                    }

                    const command = {

                        StartJDate: today,

                        EndJDate: today,

                        CentralRef: '0',

                        // فقط تایید شده
                        WorkflowStatus: '1',

                        // همه انواع
                        AbsenceTypeKey: '',
                    };

                    this.absence_repo
                        .Request_Get(command)
                        .subscribe({

                            next: (data: any) => {

                                const rows =
                                    data?.WorkforceAbsenceRequests ??
                                    [];

                                const filtered =
                                    rows
                                        .filter((row: any) =>
                                            this.isApproved(row)
                                        )
                                        .filter((row: any) =>
                                            this.isActiveOnDate(
                                                row,
                                                today
                                            )
                                        )
                                        .map((row: any) => ({
                                            ...row,

                                            DurationText:
                                                this.getDurationText(row),
                                        }));

                                this.records.set(filtered);

                                this.loading.set(false);

                                this.updateGridData(
                                    1,
                                    this.records()
                                );
                            },

                            error: (err: any) => {

                                console.error(
                                    'خطا در دریافت مرخصی‌های تایید شده:',
                                    err
                                );

                                this.records.set([]);

                                this.loading.set(false);

                                this.updateGridData(
                                    1,
                                    []
                                );
                            },

                        });
                },

                error: (err: any) => {

                    console.error(
                        'خطا در دریافت تاریخ سرور:',
                        err
                    );

                    this.records.set([]);

                    this.loading.set(false);
                },

            });
    }

    // ===============================================================
    // Approved
    // ===============================================================

    private isApproved(row: any): boolean {

        return Number(
            row?.WorkflowStatus ?? 0
        ) === 1;
    }

    // ===============================================================
    // Today is inside leave range
    // ===============================================================

    private isActiveOnDate(
        row: any,
        targetDate: string
    ): boolean {

        const target =
            this.normalizeDate(targetDate);

        const start =
            this.normalizeDate(
                row?.StartJDate
            );

        const end =
            this.normalizeDate(
                row?.EndJDate ||
                row?.StartJDate
            );

        if (
            !target ||
            !start
        ) {
            return false;
        }

        const finalEnd =
            end || start;

        return (
            target >= start &&
            target <= finalEnd
        );
    }

    // ===============================================================
    // Duration
    // ===============================================================

    private getDurationText(row: any): string {

        const mode =
            String(
                row?.RequestMode ?? ''
            ).toUpperCase();

        if (mode === 'MINUTE') {

            const minute =
                Number(
                    row?.TotalMinute ?? 0
                );

            if (minute > 0) {
                return this.minuteToText(minute);
            }

            const calculated =
                this.calculateMinute(
                    row?.StartTime,
                    row?.EndTime
                );

            return this.minuteToText(
                calculated
            );
        }

        const day =
            Number(
                row?.TotalWorkDay ?? 0
            );

        return `${day} روز کاری`;
    }

    // ===============================================================
    // Minute helpers
    // ===============================================================

    private calculateMinute(
        startTime: any,
        endTime: any
    ): number {

        const start =
            this.timeToMinute(startTime);

        const end =
            this.timeToMinute(endTime);

        if (
            start < 0 ||
            end < 0 ||
            end <= start
        ) {
            return 0;
        }

        return end - start;
    }

    private timeToMinute(
        value: any
    ): number {

        const text =
            this.cleanTime(value);

        if (!text) {
            return -1;
        }

        const parts =
            text.split(':');

        if (parts.length < 2) {
            return -1;
        }

        const hour =
            Number(parts[0]);

        const minute =
            Number(parts[1]);

        if (
            !Number.isFinite(hour) ||
            !Number.isFinite(minute)
        ) {
            return -1;
        }

        return (
            hour * 60 +
            minute
        );
    }

    private minuteToText(
        value: number
    ): string {

        const total =
            Math.max(
                0,
                Number(value) || 0
            );

        const hour =
            Math.floor(total / 60);

        const minute =
            total % 60;

        if (
            hour > 0 &&
            minute > 0
        ) {
            return `${hour} ساعت و ${minute} دقیقه`;
        }

        if (hour > 0) {
            return `${hour} ساعت`;
        }

        return `${minute} دقیقه`;
    }

    // ===============================================================
    // Format helpers
    // ===============================================================

    private cleanTime(
        value: any
    ): string {

        if (
            value === null ||
            value === undefined
        ) {
            return '';
        }

        const text =
            String(value).trim();

        if (
            !text ||
            text === '00:00' ||
            text === '00:00:00'
        ) {
            return '-';
        }

        return text.substring(0, 5);
    }

    private normalizeDate(
        value: any
    ): string {

        if (!value) {
            return '';
        }

        let text =
            String(value).trim();

        text = this.toEnglishNumber(text);

        const parts =
            text.split('/');

        if (parts.length !== 3) {
            return text;
        }

        return (
            parts[0] +
            '/' +
            parts[1].padStart(2, '0') +
            '/' +
            parts[2].padStart(2, '0')
        );
    }

    private toEnglishNumber(
        value: string
    ): string {

        if (!value) {
            return value;
        }

        const persian =
            '۰۱۲۳۴۵۶۷۸۹';

        const arabic =
            '٠١٢٣٤٥٦٧٨٩';

        return value
            .replace(
                /[۰-۹]/g,
                (d) =>
                    persian
                        .indexOf(d)
                        .toString()
            )
            .replace(
                /[٠-٩]/g,
                (d) =>
                    arabic
                        .indexOf(d)
                        .toString()
            );
    }

    private extractToday(
        data: any
    ): string {

        return this.normalizeDate(
            data?.Text ??
            data?.TodeyFromServer ??
            data?.TodayFromServer ??
            data?.[0]?.TodeyFromServer ??
            data?.[0]?.TodayFromServer ??
            ''
        );
    }

    // ===============================================================
    // Grid Ready
    // ===============================================================

    override onGridReady(
        params: any,
        index: number
    ): void {

        super.onGridReady(
            params,
            index
        );

        if (
            index >= 1 &&
            index <= 6
        ) {

            (this as any)[
                `gridApi${index}`
            ] = params.api;
        }

        setTimeout(() => {

            try {

                if (
                    params.api &&
                    !params.api.isDestroyed?.()
                ) {
                    params.api.sizeColumnsToFit();
                }

            } catch {
            }

        }, 50);
    }

    // ===============================================================
    // Refresh from parent
    // ===============================================================

    public refresh(): void {

        this.loadFromServer();
    }
}