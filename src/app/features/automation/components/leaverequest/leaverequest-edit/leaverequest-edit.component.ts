import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import moment from 'jalali-moment';
import * as jalaali from 'jalaali-js';

import { IActiveDate, IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';

import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { Base_Lookup } from 'src/app/app-shell/framework-services/model/lookup-type';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarAttachComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-attach/kowsar-attach.component';
import { LeaveRequestWebApiService } from '../../../../automation/services/LeaveRequestWebApi.service';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
@Component({
    selector: 'app-leaverequest-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        NgPersianDatepickerModule,
        KowsarAttachComponent,
    ],
    templateUrl: './leaverequest-edit.component.html',
    styles: [`
        .report-section-card {
            border: 0 !important;
            border-radius: 18px;
            box-shadow: 0 8px 22px rgba(15, 23, 42, 0.07) !important;
            overflow: hidden;
            background: rgba(255, 255, 255, 0.94);
        }

        .report-section-card .card-body,
        .report-section-card .card-header {
            background: transparent;
        }

        .report-section-head {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: .75rem;
            padding: .7rem .85rem;
            border: 1px solid rgba(226, 232, 240, .9);
            border-radius: 16px;
            background: linear-gradient(135deg, rgba(248, 250, 252, .98), rgba(255, 255, 255, .78));
        }

        .report-title-wrap {
            display: flex;
            align-items: center;
            gap: .65rem;
            min-width: 0;
        }

        .report-icon {
            width: 36px;
            height: 36px;
            min-width: 36px;
            border-radius: 13px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            font-size: .95rem;
        }

        .report-title {
            margin: 0;
            font-size: .94rem;
            line-height: 1.35;
            font-weight: 800;
            color: #172033;
        }

        .report-subtitle {
            margin-top: .12rem;
            font-size: .72rem;
            line-height: 1.7;
            color: #697386;
        }

        .report-actions {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: .45rem;
            flex-wrap: wrap;
        }

        .report-pill {
            border-radius: 999px;
            padding: .32rem .65rem;
            font-size: .72rem;
            font-weight: 800;
            white-space: nowrap;
        }

        .report-toggle-btn {
            border-radius: 999px !important;
            padding: .32rem .78rem;
            display: inline-flex;
            align-items: center;
            gap: .35rem;
            font-weight: 800;
            box-shadow: 0 2px 8px rgba(15, 23, 42, .06);
        }

        .report-toggle-btn i {
            font-size: .72rem;
        }

        .report-blue .report-icon {
            background: rgba(13, 110, 253, .10);
            color: #0d6efd;
        }

        .report-green .report-icon {
            background: rgba(25, 135, 84, .11);
            color: #198754;
        }

        .report-orange .report-icon {
            background: rgba(255, 193, 7, .18);
            color: #b58100;
        }

        .report-purple .report-icon {
            background: rgba(111, 66, 193, .12);
            color: #6f42c1;
        }

        .report-badge-success {
            background: rgba(25, 135, 84, .10);
            color: #198754;
            border: 1px solid rgba(25, 135, 84, .18);
        }

        .report-badge-primary {
            background: rgba(13, 110, 253, .10);
            color: #0d6efd;
            border: 1px solid rgba(13, 110, 253, .18);
        }

        .report-badge-dark {
            background: rgba(15, 23, 42, .06);
            color: #334155;
            border: 1px solid rgba(148, 163, 184, .22);
        }

        .report-badge-purple {
            background: rgba(111, 66, 193, .10);
            color: #6f42c1;
            border: 1px solid rgba(111, 66, 193, .18);
        }

        @media (max-width: 576px) {
            .report-section-head {
                align-items: flex-start;
                flex-direction: column;
            }

            .report-actions {
                width: 100%;
                justify-content: space-between;
            }
        }
    `],
})
export class LeaverequestEditComponent extends AgGridBaseComponent implements OnInit, OnDestroy {

    private readonly router = inject(Router);
    private readonly repo = inject(LeaveRequestWebApiService);
    private readonly base_repo = inject(KowsarBaseWebApi);
    private readonly route = inject(ActivatedRoute);
    private readonly notificationService = inject(NotificationService);
    private readonly client = inject(HttpClient);

    protected readonly session = inject(SessionStorageService);
    protected readonly permission = inject(PermissionService);

    private readonly subs = new Subscription();
    private themeSube!: Subscription;

    // ---------------------------------------------------------------
    // signals
    // ---------------------------------------------------------------

    records = signal<any[]>([]);
    users = signal<any[]>([]);

    loading = signal(true);
    show_attachField = signal(false);
    loading_attach = signal(true);
    showEndTimeFields = signal(false);
    showTimeFields = signal(false);

    title = signal('درخواست مرخصی');
    ToDayDate = signal('');

    LeaveRequestCode = signal('');
    LoginType = signal('');
    CentralRef = signal('');

    leaveStatus = signal<any | null>(null);
    leaveStatusLoading = signal(false);
    leaveStatusLoaded = signal(false);
    selectedUserRef = signal('');

    leavePolicy = signal<any | null>(null);
    leavePolicyLoading = signal(false);
    leavePolicyLoaded = signal(false);

    showLeaveStatusReport = signal(false);
    showLeaveTypeReport = signal(false);
    showMonthlyReport = signal(false);
    showPolicyReport = signal(false);

    minLeaveStartDateTimestamp = signal<number | null>(null);
    minLeaveEndDateTimestamp = signal<number | null>(null);
    minLeaveStartDateText = signal<string>('');

    holidaysList: string[] = [];
    timeOptions: string[] = [];

    // ---------------------------------------------------------------
    // theme datepicker
    // ---------------------------------------------------------------

    customTheme: Partial<IDatepickerTheme> = {
        selectedBackground: '#D68E3A',
        selectedText: '#FFFFFF',
    };

    // ---------------------------------------------------------------
    // lookup
    // ---------------------------------------------------------------

    LeaveType_Lookup: Base_Lookup[] = [
        { id: 'DAILY', name: 'مرخصی روزانه' },
        { id: 'HOURLY', name: 'مرخصی ساعتی' },
        { id: 'SICK', name: 'مرخصی اضطراری' },
    ];

    // ---------------------------------------------------------------
    // form
    // ---------------------------------------------------------------

    EditForm_LeaveRequest = new FormGroup({
        LeaveRequestCode: new FormControl(''),
        UserRef: new FormControl('', Validators.required),

        LeaveRequestDate: new FormControl(''),
        LeaveRequestType: new FormControl('', Validators.required),
        LeaveRequestExplain: new FormControl('', Validators.required),

        TotalDay: new FormControl('0'),
        WorkDay: new FormControl('0'),
        OffDay: new FormControl('0'),

        LeaveStartDate: new FormControl('', Validators.required),
        LeaveEndDate: new FormControl('', Validators.required),

        LeaveStartTime: new FormControl(''),
        LeaveEndTime: new FormControl(''),

        ManagerRef: new FormControl('0'),
        WorkFlowStatus: new FormControl('0'),
        WorkFlowExplain: new FormControl(''),
        IgnoreLeaveBalance: new FormControl('0'),
        LimitDay: new FormControl('0'),
        LimitMinute: new FormControl('0'),

    });

    constructor() {
        super();
    }

    // ---------------------------------------------------------------
    // init
    // ---------------------------------------------------------------
    private watchUserRefForLeaveStatus(): void {
        const sub = this.EditForm_LeaveRequest.controls['UserRef']
            .valueChanges
            .subscribe((userRef: any) => {
                const value = (userRef ?? '').toString();

                if (!value) {
                    this.clearSelectedUserInfo();
                    return;
                }

                this.loadSelectedUserInfo(value);
            });

        this.subs.add(sub);
    }
    ngOnInit(): void {
        console.log('canManageRole:', this.permission.canManageRole);
        console.log('canSelectUser:', this.canSelectUser());
        this.LoginType.set(this.session.loginType);
        this.CentralRef.set(this.session.centralRef);

        this.themeSube = this.themeService.theme$.subscribe((mode) => {
            this.isDarkMode = mode === 'dark';
        });

        this.generateTimeSlots(15);

        // Watchers
        this.watchLeaveType();
        this.watchLeaveStartDate();
        this.watchLeaveEndDate();
        this.watchTimeFields();

        // وقتی UserRef تغییر کرد، وضعیت مرخصی همان کاربر گرفته شود
        this.watchUserRefForLeaveStatus();

        // تعطیلات
        const currentJYear = moment().format('jYYYY');

        this.client.get<any>('assets/holidays.json').subscribe((res) => {
            const list = res[currentJYear] || [];

            this.holidaysList = list.map((x: string) =>
                this.normalizeJalaliDateText(x)
            );

            this.holidaysSet = new Set(this.holidaysList);
        });

        // تاریخ امروز از سرور
        this.base_repo.GetTodeyFromServer().subscribe((data: any) => {
            this.ToDayDate.set(data.Text);

            this.EditForm_LeaveRequest.patchValue(
                {
                    LeaveRequestDate: this.ToDayDate(),
                },
                {
                    emitEvent: false,
                }
            );

            this.setLeaveStartDateLimit();
        });

        // لیست کاربران
        this.GetCentralUser();

        // تشخیص ایجاد / ویرایش
        this.route.paramMap.subscribe((params: ParamMap) => {
            const id = params.get('id');

            if (id && id !== '0') {
                this.LeaveRequestCode.set(id);
                this.title.set('اصلاح مرخصی');

                this.getDetail();
                return;
            }

            this.LeaveRequestCode.set('');
            this.title.set('ایجاد مرخصی جدید');

            this.setDefaultUserForCreateMode();
        });
    }

    // ---------------------------------------------------------------
    // mode / show form
    // ---------------------------------------------------------------

    isEditMode(): boolean {
        const code = this.LeaveRequestCode();
        return !!code && code !== '0';
    }

    canShowLeaveForm(): boolean {
        return this.leaveStatusLoaded() && !!this.EditForm_LeaveRequest.controls['UserRef'].value;
    }

    toggleLeaveStatusReport(): void {
        this.showLeaveStatusReport.update((value) => !value);
    }

    toggleLeaveTypeReport(): void {
        this.showLeaveTypeReport.update((value) => !value);
    }

    toggleMonthlyReport(): void {
        this.showMonthlyReport.update((value) => !value);
    }

    togglePolicyReport(): void {
        this.showPolicyReport.update((value) => !value);
    }
    private setDefaultUserForCreateMode(): void {
        if (this.permission.canManageRole) {
            this.EditForm_LeaveRequest.patchValue(
                { IgnoreLeaveBalance: "1", }
            );
            return;
        }

        this.EditForm_LeaveRequest.patchValue(
            { IgnoreLeaveBalance: "0", }
        );
        const userRef = this.CentralRef();

        if (!userRef) {
            return;
        }

        this.EditForm_LeaveRequest.patchValue(
            {
                UserRef: userRef,
            },
            {
                emitEvent: false,
            }
        );

        this.loadSelectedUserInfo(userRef.toString());
    }
    // ---------------------------------------------------------------
    // user list and leave status
    // ---------------------------------------------------------------

    private watchUserRef(): void {
        const sub = this.EditForm_LeaveRequest.controls['UserRef']
            .valueChanges
            .subscribe((userRef: any) => {
                if (!userRef) {
                    this.leaveStatus.set(null);
                    this.leaveStatusLoaded.set(false);
                    return;
                }

                this.getLeaveStatusByUser(userRef.toString());
            });

        this.subs.add(sub);
    }
    private setDefaultUserForNormalUser(): void {
        if (this.permission.canManageRole) return;

        this.EditForm_LeaveRequest.patchValue(
            {
                UserRef: this.CentralRef(),
            },
            {
                emitEvent: false,
            }
        );

        this.getLeaveStatusByUser(this.CentralRef().toString());
    }
    private clearSelectedUserInfo(): void {
        this.leaveStatus.set(null);
        this.leaveStatusLoaded.set(false);
        this.leaveStatusLoading.set(false);

        this.leavePolicy.set(null);
        this.leavePolicyLoaded.set(false);
        this.leavePolicyLoading.set(false);

        this.EditForm_LeaveRequest.patchValue(
            {
                LimitDay: '0',
                LimitMinute: '0',
            },
            {
                emitEvent: false,
            }
        );
    }

    private loadSelectedUserInfo(userRef: string): void {
        if (!userRef) {
            this.clearSelectedUserInfo();
            return;
        }

        this.selectedUserRef.set(userRef);
        this.getLeaveStatusByUser(userRef);
        this.getLeavePolicyByUser(userRef);
    }

    private getLeavePolicyByUser(userRef: string): void {
        if (!userRef) return;

        this.leavePolicyLoading.set(true);
        this.leavePolicyLoaded.set(false);
        this.leavePolicy.set(null);

        this.EditForm_LeaveRequest.patchValue(
            {
                LimitDay: '0',
                LimitMinute: '0',
            },
            {
                emitEvent: false,
            }
        );

        this.repo.GetLeaveRequestUserPolicy({
            CentralRef: userRef,
            OnlyActive: '1',
        }).subscribe({
            next: (data: any) => {
                const policy =
                    data?.LeaveRequestUserPolicies?.[0] ??
                    data?.LeaveRequestUserPolicy?.[0] ??
                    data?.Policies?.[0] ??
                    data?.[0] ??
                    null;

                if (!policy || this.num(policy.ErrCode) !== 0) {
                    this.leavePolicy.set(null);
                    this.leavePolicyLoaded.set(false);
                    this.leavePolicyLoading.set(false);

                    this.EditForm_LeaveRequest.patchValue(
                        {
                            LimitDay: '0',
                            LimitMinute: '0',
                        },
                        {
                            emitEvent: false,
                        }
                    );

                    return;
                }

                this.leavePolicy.set(policy);
                this.leavePolicyLoaded.set(true);
                this.leavePolicyLoading.set(false);

                this.applyPolicyLimitsToForm(policy);
            },
            error: () => {
                this.leavePolicy.set(null);
                this.leavePolicyLoaded.set(false);
                this.leavePolicyLoading.set(false);

                this.EditForm_LeaveRequest.patchValue(
                    {
                        LimitDay: '0',
                        LimitMinute: '0',
                    },
                    {
                        emitEvent: false,
                    }
                );

                this.notificationService.error('خطا در دریافت تنظیمات کاری کاربر');
            },
        });
    }
    private getLeaveStatusByUser(userRef: string): void {
        if (!userRef) return;

        this.leaveStatusLoading.set(true);
        this.leaveStatusLoaded.set(false);
        this.leaveStatus.set(null);

        this.repo.GetLeaveRequestStatus(userRef).subscribe({
            next: (data: any) => {
                const status = data?.LeaveRequests?.[0] ?? null;

                if (!status || this.num(status.ErrCode) !== 0) {
                    this.leaveStatus.set(null);
                    this.leaveStatusLoaded.set(false);
                    this.leaveStatusLoading.set(false);

                    this.notificationService.warning(status?.ErrDesc ?? 'وضعیت مرخصی کاربر دریافت نشد');
                    return;
                }

                this.leaveStatus.set(status);
                this.leaveStatusLoaded.set(true);
                this.leaveStatusLoading.set(false);
            },
            error: () => {
                this.leaveStatus.set(null);
                this.leaveStatusLoaded.set(false);
                this.leaveStatusLoading.set(false);

                this.notificationService.error('خطا در دریافت وضعیت مرخصی کاربر');
            },
        });
    }

    GetCentralUser(): void {
        this.base_repo.GetCentralUser().subscribe((data: any) => {
            this.users.set(data?.Centrals ?? []);

            if (this.canSelectUser()) {
                if (!this.isEditMode()) {
                    this.EditForm_LeaveRequest.patchValue(
                        {
                            UserRef: '',
                        },
                        {
                            emitEvent: false,
                        }
                    );
                }

                return;
            }

            const userRef = this.CentralRef()?.toString();

            this.EditForm_LeaveRequest.patchValue(
                {
                    UserRef: userRef,
                },
                {
                    emitEvent: false,
                }
            );

            this.loadSelectedUserInfo(userRef);
        });
    }

    // ---------------------------------------------------------------
    // leave type/date limit
    // ---------------------------------------------------------------

    hasLeaveDateLimit(): boolean {
        const leaveType = this.EditForm_LeaveRequest.controls['LeaveRequestType'].value;

        if (this.permission.canManageRole) {

            return false;
        }

        if (leaveType === 'SICK') {

            return false;
        }

        return true;
    }

    private watchLeaveType(): void {
        const sub = this.EditForm_LeaveRequest.controls['LeaveRequestType']
            .valueChanges
            .subscribe(() => {
                this.applyLeaveTypeRules(true);
                this.setLeaveStartDateLimit();
                this.calculateDays();

                // فقط غیرمدیر محدودیت مانده داشته باشد
                if (!this.permission.canManageRole && !this.canRequestSelectedLeaveType()) {
                    this.notificationService.warning(
                        this.leaveBalanceWarningText() || 'مانده مرخصی برای این نوع درخواست کافی نیست'
                    );
                }
            });

        this.subs.add(sub);
    }
    private watchLeaveStartDate(): void {
        const sub = this.EditForm_LeaveRequest.controls['LeaveStartDate']
            .valueChanges
            .subscribe((startDate) => {

                if (this.rejectDisabledLeaveDate('LeaveStartDate', startDate)) {
                    return;
                }

                this.clearHolidayWarning();

                const type = this.EditForm_LeaveRequest.controls['LeaveRequestType'].value;

                if (type === 'HOURLY' && startDate) {
                    this.EditForm_LeaveRequest.patchValue(
                        {
                            LeaveEndDate: startDate,
                        },
                        {
                            emitEvent: false,
                        }
                    );
                }

                this.refreshLeaveEndDateLimit();
                this.calculateDays();
            });

        this.subs.add(sub);
    }

    private watchLeaveEndDate(): void {
        const sub = this.EditForm_LeaveRequest.controls['LeaveEndDate']
            .valueChanges
            .subscribe((endDate) => {

                if (this.rejectDisabledLeaveDate('LeaveEndDate', endDate)) {
                    return;
                }

                this.clearHolidayWarning();

                this.refreshLeaveEndDateLimit();
                this.calculateDays();
            });

        this.subs.add(sub);
    }

    private watchTimeFields(): void {
        const startSub = this.EditForm_LeaveRequest.controls['LeaveStartTime'].valueChanges.subscribe(() => {
            this.onTimeChange();
        });

        const endSub = this.EditForm_LeaveRequest.controls['LeaveEndTime'].valueChanges.subscribe(() => {
            this.onTimeChange();
        });

        this.subs.add(startSub);
        this.subs.add(endSub);
    }

    onLeaveTypeChange(): void {
        this.applyLeaveTypeRules(true);
        this.setLeaveStartDateLimit();
        this.calculateDays();
    }

    private applyLeaveTypeRules(resetTime: boolean): void {
        const type = this.EditForm_LeaveRequest.controls['LeaveRequestType'].value;
        const isHourly = type === 'HOURLY';

        this.showTimeFields.set(isHourly);
        this.showEndTimeFields.set(isHourly);

        const startTimeCtrl = this.EditForm_LeaveRequest.controls['LeaveStartTime'];
        const endTimeCtrl = this.EditForm_LeaveRequest.controls['LeaveEndTime'];

        if (isHourly) {
            startTimeCtrl.setValidators([Validators.required]);
            endTimeCtrl.setValidators([Validators.required]);

            const startDate = this.EditForm_LeaveRequest.controls['LeaveStartDate'].value;

            if (startDate) {
                this.EditForm_LeaveRequest.patchValue({
                    LeaveEndDate: startDate,
                }, { emitEvent: false });
            }

            if (resetTime) {
                this.EditForm_LeaveRequest.patchValue({
                    LeaveStartTime: '',
                    LeaveEndTime: '',
                }, { emitEvent: false });
            }
        } else {
            startTimeCtrl.clearValidators();
            endTimeCtrl.clearValidators();

            this.clearControlError('LeaveEndTime', 'invalidRange');

            this.EditForm_LeaveRequest.patchValue({
                LeaveStartTime: '00:00',
                LeaveEndTime: '23:59',
            }, { emitEvent: false });
        }

        startTimeCtrl.updateValueAndValidity({ emitEvent: false });
        endTimeCtrl.updateValueAndValidity({ emitEvent: false });
    }

    private setLeaveStartDateLimit(): void {
        if (!this.hasLeaveDateLimit()) {
            this.minLeaveStartDateTimestamp.set(null);
            this.minLeaveStartDateText.set('');
            this.refreshLeaveEndDateLimit();
            return;
        }

        const todayFa = this.ToDayDate();

        if (!todayFa) {
            this.minLeaveStartDateTimestamp.set(null);
            this.minLeaveStartDateText.set('');
            this.refreshLeaveEndDateLimit();
            return;
        }

        const minStartDate = this.addDaysToJalali(todayFa, 2);
        const minStartTimestamp = this.jalaliDateToTimestamp(minStartDate);

        this.minLeaveStartDateText.set(minStartDate);
        this.minLeaveStartDateTimestamp.set(minStartTimestamp);

        const startDate = this.EditForm_LeaveRequest.controls['LeaveStartDate'].value;

        if (!startDate) {
            this.minLeaveEndDateTimestamp.set(minStartTimestamp);
            return;
        }

        const startTimestamp = this.jalaliDateToTimestamp(startDate);

        if (startTimestamp < minStartTimestamp) {
            this.EditForm_LeaveRequest.patchValue({
                LeaveStartDate: minStartDate,
                LeaveEndDate: minStartDate,
            }, { emitEvent: false });

            this.minLeaveEndDateTimestamp.set(minStartTimestamp);
            this.calculateDays();
            return;
        }

        this.refreshLeaveEndDateLimit();
    }

    private refreshLeaveEndDateLimit(): void {
        const startDate = this.EditForm_LeaveRequest.controls['LeaveStartDate'].value;
        const endDate = this.EditForm_LeaveRequest.controls['LeaveEndDate'].value;

        if (!startDate) {
            this.minLeaveEndDateTimestamp.set(
                this.hasLeaveDateLimit() ? this.minLeaveStartDateTimestamp() : null
            );
            return;
        }

        const startTimestamp = this.jalaliDateToTimestamp(startDate);

        // تاریخ پایان همیشه از تاریخ شروع به بعد باشد.
        this.minLeaveEndDateTimestamp.set(startTimestamp);

        if (!endDate) {
            this.EditForm_LeaveRequest.patchValue({
                LeaveEndDate: startDate,
            }, { emitEvent: false });

            return;
        }

        const endTimestamp = this.jalaliDateToTimestamp(endDate);

        if (endTimestamp < startTimestamp) {
            this.EditForm_LeaveRequest.patchValue({
                LeaveEndDate: startDate,
            }, { emitEvent: false });
        }
    }

    // ---------------------------------------------------------------
    // date helpers
    // ---------------------------------------------------------------

    private addDaysToJalali(jalaliDate: string, days: number): string {
        const normalized = this.toEnglishNumber(jalaliDate);
        const [jy, jm, jd] = normalized.split('/').map(Number);

        const gregorian = jalaali.toGregorian(jy, jm, jd);

        const date = new Date(
            gregorian.gy,
            gregorian.gm - 1,
            gregorian.gd
        );

        date.setDate(date.getDate() + days);

        const newJalali = jalaali.toJalaali(date);

        return this.formatJalaliDate(
            newJalali.jy,
            newJalali.jm,
            newJalali.jd
        );
    }

    private jalaliDateToTimestamp(jalaliDate: string): number {
        const normalized = this.toEnglishNumber(jalaliDate);
        const [jy, jm, jd] = normalized.split('/').map(Number);

        const gregorian = jalaali.toGregorian(jy, jm, jd);

        return new Date(
            gregorian.gy,
            gregorian.gm - 1,
            gregorian.gd,
            0,
            0,
            0,
            0
        ).getTime();
    }

    private formatJalaliDate(year: number, month: number, day: number): string {
        return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
    }

    private toEnglishNumber(str: string): string {
        if (!str) return str;

        const persian = '۰۱۲۳۴۵۶۷۸۹';
        const arabic = '٠١٢٣٤٥٦٧٨٩';

        return str
            .replace(/[۰-۹]/g, (d) => persian.indexOf(d).toString())
            .replace(/[٠-٩]/g, (d) => arabic.indexOf(d).toString());
    }

    // ---------------------------------------------------------------
    // time
    // ---------------------------------------------------------------

    generateTimeSlots(step: number): void {
        this.timeOptions = [];

        const start = 9 * 60;
        const end = 18 * 60;

        for (let i = start; i <= end; i += step) {
            const hours = Math.floor(i / 60);
            const minutes = i % 60;

            const time = `${this.pad(hours)}:${this.pad(minutes)}`;
            this.timeOptions.push(time);
        }
    }

    pad(n: number): string {
        return n < 10 ? '0' + n : n.toString();
    }

    onTimeChange(): void {
        const type = this.EditForm_LeaveRequest.controls['LeaveRequestType'].value;

        if (type !== 'HOURLY') {
            this.clearControlError('LeaveEndTime', 'invalidRange');
            return;
        }

        const start = this.EditForm_LeaveRequest.controls['LeaveStartTime'].value;
        const end = this.EditForm_LeaveRequest.controls['LeaveEndTime'].value;

        if (!start || !end) {
            this.clearControlError('LeaveEndTime', 'invalidRange');
            return;
        }

        if (start >= end) {
            this.setControlError('LeaveEndTime', 'invalidRange');
        } else {
            this.clearControlError('LeaveEndTime', 'invalidRange');
        }
    }

    private setControlError(controlName: string, errorName: string): void {
        const control = this.EditForm_LeaveRequest.get(controlName);
        if (!control) return;

        const errors = control.errors ?? {};
        errors[errorName] = true;

        control.setErrors(errors);
    }

    private clearControlError(controlName: string, errorName: string): void {
        const control = this.EditForm_LeaveRequest.get(controlName);
        if (!control || !control.errors) return;

        const errors = { ...control.errors };
        delete errors[errorName];

        control.setErrors(Object.keys(errors).length ? errors : null);
    }

    private cleanTime(time: string | null | undefined): string {
        if (!time) return '';
        return time.trim().substring(0, 5);
    }

    private timeToMinute(time: string | null | undefined): number {
        if (!time) return 0;

        const parts = time.split(':');
        if (parts.length < 2) return 0;

        const hour = Number(parts[0]);
        const minute = Number(parts[1]);

        if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
            return 0;
        }

        return hour * 60 + minute;
    }

    // ---------------------------------------------------------------
    // calculate days
    // ---------------------------------------------------------------


    // ---------------------------------------------------------------
    // calculate days
    // ---------------------------------------------------------------

    private getLeaveDaySummary(
        startStr: string | null | undefined,
        endStr: string | null | undefined
    ): { total: number; work: number; off: number } {
        if (!startStr || !endStr) {
            return { total: 0, work: 0, off: 0 };
        }

        const normalizedStart = this.toEnglishNumber(startStr);
        const normalizedEnd = this.toEnglishNumber(endStr);

        const start = moment(normalizedStart, 'jYYYY/jM/jD');
        let end = moment(normalizedEnd, 'jYYYY/jM/jD');

        if (!start.isValid() || !end.isValid()) {
            return { total: 0, work: 0, off: 0 };
        }

        if (end.isBefore(start)) {
            end = start.clone();
        }

        let total = 0;
        let work = 0;
        let off = 0;

        const current = start.clone();

        while (current.isSameOrBefore(end, 'day')) {
            total++;

            const jalaliDate = current.format('jYYYY/jMM/jDD');
            const dayOfWeek = current.day();

            // جمعه و تعطیلات رسمی نباید جزو روز کاری محاسبه شوند
            const isFriday = dayOfWeek === 5;
            const isPublicHoliday = this.holidaysList.includes(jalaliDate);

            if (isFriday || isPublicHoliday) {
                off++;
            } else {
                work++;
            }

            current.add(1, 'day');
        }

        return { total, work, off };
    }

    calculateDays(): void {
        const type = this.EditForm_LeaveRequest.controls['LeaveRequestType'].value;

        if (type === 'HOURLY') {
            const startDate = this.EditForm_LeaveRequest.controls['LeaveStartDate'].value;

            this.EditForm_LeaveRequest.patchValue(
                {
                    LeaveEndDate: startDate || '',
                    TotalDay: '0',
                    WorkDay: '0',
                    OffDay: '0',
                },
                {
                    emitEvent: false,
                }
            );

            return;
        }

        const startStr = this.EditForm_LeaveRequest.controls['LeaveStartDate'].value;
        const endStr = this.EditForm_LeaveRequest.controls['LeaveEndDate'].value;

        if (!startStr || !endStr) {
            return;
        }

        const normalizedStart = this.normalizeJalaliDateText(startStr);
        const normalizedEnd = this.normalizeJalaliDateText(endStr);

        const start = moment(normalizedStart, 'jYYYY/jMM/jDD');
        const end = moment(normalizedEnd, 'jYYYY/jMM/jDD');

        if (!start.isValid() || !end.isValid()) {
            return;
        }

        let finalEndDate = normalizedEnd;

        if (end.isBefore(start)) {
            finalEndDate = normalizedStart;

            this.EditForm_LeaveRequest.patchValue(
                {
                    LeaveEndDate: normalizedStart,
                },
                {
                    emitEvent: false,
                }
            );
        }

        const summary = this.getLeaveDaySummary(normalizedStart, finalEndDate);

        this.EditForm_LeaveRequest.patchValue(
            {
                TotalDay: summary.total.toString(),
                WorkDay: summary.work.toString(),
                OffDay: summary.off.toString(),
            },
            {
                emitEvent: false,
            }
        );
    }

    // ---------------------------------------------------------------
    // detail
    // ---------------------------------------------------------------

    getDetail(): void {
        this.repo.GetLeaveRequestById(this.LeaveRequestCode()).subscribe({
            next: (data: any) => {
                const req = data?.LeaveRequests?.[0];
                if (!req) return;

                req.LeaveStartTime = this.cleanTime(req.LeaveStartTime);
                req.LeaveEndTime = this.cleanTime(req.LeaveEndTime);

                this.EditForm_LeaveRequest.patchValue(req, { emitEvent: false });

                const detailUserRef = (req?.UserRef ?? '').toString();
                if (detailUserRef) {
                    this.loadSelectedUserInfo(detailUserRef);
                }

                this.applyLeaveTypeRules(false);
                this.setLeaveStartDateLimit();
                this.refreshLeaveEndDateLimit();
                this.calculateDays();

                if (!req.LeaveRequestDate && this.ToDayDate()) {
                    this.EditForm_LeaveRequest.patchValue({
                        LeaveRequestDate: this.ToDayDate(),
                    });
                }
            },
            error: (err) => {
                console.error('❌ Error in getDetail:', err);
            },
        });
    }

    // ---------------------------------------------------------------
    // submit
    // ---------------------------------------------------------------
    private isNowInWorkingHours(): boolean {
        const now = new Date();
        const currentMinute = now.getHours() * 60 + now.getMinutes();

        const startMinute = this.submitStartMinute();
        const endMinute = this.submitEndMinute();

        return currentMinute >= startMinute && currentMinute <= endMinute;
    }

    private currentTimeText(): string {
        const now = new Date();

        const h = now.getHours().toString().padStart(2, '0');
        const m = now.getMinutes().toString().padStart(2, '0');

        return `${h}:${m}`;
    }

    private submitStartMinute(): number {
        const policy = this.leavePolicy();
        const minute = this.timeToMinute(policy?.RequestSubmitStartTime);
        return minute > 0 ? minute : 9 * 60;
    }

    private submitEndMinute(): number {
        const policy = this.leavePolicy();
        const minute = this.timeToMinute(policy?.RequestSubmitEndTime);
        return minute > 0 ? minute : 18 * 60;
    }

    submitTimeRangeText(): string {
        const policy = this.leavePolicy();
        const start = this.cleanTime(policy?.RequestSubmitStartTime) || '09:00';
        const end = this.cleanTime(policy?.RequestSubmitEndTime) || '18:00';
        return `${start} تا ${end}`;
    }
    submit(): void {

        if (!this.permission.canManageRole && !this.isNowInWorkingHours()) {
            this.notificationService.error(
                `لطفاً درخواست را در ساعات کاری ارسال کنید. ساعت مجاز: ${this.submitTimeRangeText()} - ساعت فعلی: ${this.currentTimeText()}`
            );
            return;
        }

        if (!this.permission.canManageRole) {
            const currentUserRef = this.EditForm_LeaveRequest.controls['UserRef'].value;
            const sessionUserRef = this.CentralRef();

            if (currentUserRef !== sessionUserRef) {
                this.EditForm_LeaveRequest.patchValue(
                    {
                        UserRef: sessionUserRef,
                    },
                    {
                        emitEvent: false,
                    }
                );
            }
        }

        const type = this.EditForm_LeaveRequest.controls['LeaveRequestType'].value;
        const startDate = this.EditForm_LeaveRequest.controls['LeaveStartDate'].value;

        if (type === 'HOURLY' && startDate) {
            this.EditForm_LeaveRequest.patchValue(
                {
                    LeaveEndDate: startDate,
                },
                {
                    emitEvent: false,
                }
            );
        }

        this.refreshLeaveEndDateLimit();
        this.onTimeChange();
        this.calculateDays();

        // فقط غیرمدیر با محدودیت مانده متوقف شود
        if (!this.permission.canManageRole && !this.canRequestSelectedLeaveType()) {
            this.notificationService.warning(
                this.leaveBalanceWarningText() || 'مانده مرخصی برای ثبت این درخواست کافی نیست'
            );
            return;
        }

        this.EditForm_LeaveRequest.markAllAsTouched();

        if (!this.EditForm_LeaveRequest.valid) {
            this.notificationService.warning('لطفاً اطلاعات فرم را کامل و صحیح وارد کنید');
            return;
        }

        const form = this.EditForm_LeaveRequest.getRawValue
            ? this.EditForm_LeaveRequest.getRawValue()
            : this.EditForm_LeaveRequest.value;

        const obs = this.isEditMode()
            ? this.repo.LeaveRequest_Update(form)
            : this.repo.LeaveRequest_Insert(form);

        obs.subscribe({
            next: (data: any) => {
                const result =
                    data?.LeaveRequests?.[0] ??
                    data?.LeaveRequest?.[0] ??
                    data?.[0] ??
                    data;

                const errCode = this.num(result?.ErrCode);

                if (errCode !== 0) {
                    this.notificationService.warning(
                        result?.ErrDesc ||
                        result?.ErrorMessage ||
                        result?.Errormessage ||
                        'خطا در ثبت اطلاعات'
                    );
                    return;
                }

                if (this.num(result?.HasWarning) === 1 && result?.WarningMessage) {
                    this.notificationService.warning(result.WarningMessage);
                }

                this.notificationService.success('اطلاعات با موفقیت ثبت شد');

                this.router.navigate(['/automation/leaverequest-list']);
            },
            error: () => {
                this.notificationService.error('❌ خطای ارتباط با سرور');
            },
        });
    }
    // ---------------------------------------------------------------
    // helpers - display
    // ---------------------------------------------------------------

    num(value: any): number {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    }

    day(value: any): string {
        const n = this.num(value);

        if (n === 0) return '۰';
        if (Number.isInteger(n)) return n.toString();

        return n.toFixed(2);
    }

    hour(value: any): string {
        const n = this.num(value);

        if (n === 0) return '۰';
        if (Number.isInteger(n)) return n.toString();

        return n.toFixed(2);
    }

    minute(value: any): string {
        return this.num(value).toString();
    }

    minuteToHourLabel(value: any): string {
        const totalMinute = Math.max(0, Math.round(this.num(value)));

        const h = Math.floor(totalMinute / 60);
        const m = totalMinute % 60;

        return `${h}:${m.toString().padStart(2, '0')}`;
    }

    statusPercent(part: any, total: any): number {
        const p = this.num(part);
        const t = this.num(total);

        if (t <= 0) return 0;

        return Math.round((p / t) * 100);
    }

    // ---------------------------------------------------------------
    // helpers - balance
    // ---------------------------------------------------------------


    remainingDailyLeaveDay(): number {
        const limit = this.annualLeaveLimitDay();
        const acceptedUsed = this.usedAcceptedDailyForBalance();

        if (limit > 0) {
            return Math.max(0, limit - acceptedUsed);
        }

        return Math.max(
            0,
            this.num(this.leaveStatus()?.RemainingDailyLeaveDay)
        );
    }


    annualLeaveLimitDay(): number {
        return Math.max(
            0,
            this.num(this.leaveStatus()?.AnnualLeaveLimitDay)
        );
    }

    usedDailyForBalance(): number {
        return Math.max(
            0,
            this.num(this.leaveStatus()?.UsedDailyForBalance)
        );
    }

    usedAcceptedDailyForBalance(): number {
        return Math.max(
            0,
            this.num(this.leaveStatus()?.UsedAcceptedDailyForBalance)
        );
    }

    usedPendingDailyForBalance(): number {
        return Math.max(
            0,
            this.num(this.leaveStatus()?.UsedPendingDailyForBalance)
        );
    }

    monthlyHourlyLimitMinute(): number {
        return Math.max(
            0,
            this.num(this.leaveStatus()?.MonthlyHourlyLeaveLimitMinute)
        );
    }

    usedMonthlyHourlyMinute(): number {
        return Math.max(
            0,
            this.num(this.leaveStatus()?.UsedMonthlyHourlyMinuteForBalance)
        );
    }

    usedAcceptedMonthlyHourlyMinute(): number {
        return Math.max(
            0,
            this.num(this.leaveStatus()?.UsedAcceptedMonthlyHourlyMinuteForBalance)
        );
    }

    usedPendingMonthlyHourlyMinute(): number {
        return Math.max(
            0,
            this.num(this.leaveStatus()?.UsedPendingMonthlyHourlyMinuteForBalance)
        );
    }


    remainingMonthlyHourlyMinute(): number {
        const limit = this.monthlyHourlyLimitMinute();
        const acceptedUsed = this.usedAcceptedMonthlyHourlyMinute();

        if (limit > 0) {
            return Math.max(0, limit - acceptedUsed);
        }

        return Math.max(
            0,
            this.num(this.leaveStatus()?.RemainingMonthlyHourlyMinute)
        );
    }


    canRequestDailyLeave(): boolean {
        return this.num(this.leaveStatus()?.CanRequestDailyLeave) === 1;
    }

    canRequestHourlyLeave(): boolean {
        return this.num(this.leaveStatus()?.CanRequestHourlyLeave) === 1;
    }

    isDailyLeaveBalanceFinished(): boolean {
        return this.num(this.leaveStatus()?.IsDailyLeaveBalanceFinished) === 1;
    }

    isDailyLeaveBalanceLessThanOneDay(): boolean {
        return this.num(this.leaveStatus()?.IsDailyLeaveBalanceLessThanOneDay) === 1;
    }

    isMonthlyHourlyBalanceFinished(): boolean {
        return this.num(this.leaveStatus()?.IsMonthlyHourlyBalanceFinished) === 1;
    }

    // ---------------------------------------------------------------
    // requested amount
    // ---------------------------------------------------------------

    requestedLeaveMinute(): number {
        const type = this.EditForm_LeaveRequest.controls['LeaveRequestType'].value;

        if (type !== 'HOURLY') return 0;

        const start = this.EditForm_LeaveRequest.controls['LeaveStartTime'].value;
        const end = this.EditForm_LeaveRequest.controls['LeaveEndTime'].value;

        const startMinute = this.timeToMinute(start);
        const endMinute = this.timeToMinute(end);

        if (endMinute <= startMinute) return 0;

        return endMinute - startMinute;
    }


    requestedLeaveDay(): number {
        const type = this.EditForm_LeaveRequest.controls['LeaveRequestType'].value;

        if (type !== 'DAILY') {
            return 0;
        }

        const startDate = this.EditForm_LeaveRequest.controls['LeaveStartDate'].value;
        const endDate = this.EditForm_LeaveRequest.controls['LeaveEndDate'].value;

        const summary = this.getLeaveDaySummary(startDate, endDate);

        // فقط روزهای کاری حساب می‌شوند؛ جمعه و تعطیلات رسمی حذف می‌شوند
        if (summary.work > 0) {
            return summary.work;
        }

        return this.num(this.EditForm_LeaveRequest.controls['WorkDay'].value);
    }


    // ---------------------------------------------------------------
    // permission to submit selected leave type
    // ---------------------------------------------------------------

    canRequestSelectedLeaveType(): boolean {
        // مدیر محدودیت مانده ندارد
        if (this.permission.canManageRole === true) {
            return true;
        }

        const type = this.EditForm_LeaveRequest.controls['LeaveRequestType'].value;

        if (!type) return true;

        if (type === 'SICK') {
            return true;
        }

        if (type === 'DAILY') {
            const remainingDay = this.remainingDailyLeaveDay();
            const requestedDay = this.requestedLeaveDay();

            if (!this.canRequestDailyLeave()) return false;
            if (remainingDay < 1) return false;

            if (requestedDay <= 0) return true;

            return requestedDay <= remainingDay;
        }

        if (type === 'HOURLY') {
            const remainingMinute = this.remainingMonthlyHourlyMinute();
            const requestedMinute = this.requestedLeaveMinute();

            if (!this.canRequestHourlyLeave()) return false;
            if (remainingMinute <= 0) return false;

            if (requestedMinute <= 0) return true;

            return requestedMinute <= remainingMinute;
        }

        return true;
    }


    leaveBalanceWarningText(): string {
        const type = this.EditForm_LeaveRequest.controls['LeaveRequestType'].value;

        if (type === 'DAILY') {
            const acceptedDay = this.num(this.leaveStatus()?.UsedAcceptedDailyForBalance);
            const requestedDay = this.requestedLeaveDay();
            const annualLimit = this.num(this.leaveStatus()?.AnnualLeaveLimitDay);
            const totalAfterRequest = acceptedDay + requestedDay;
            const overDay = totalAfterRequest - annualLimit;

            if (this.remainingDailyLeaveDay() < 1) {
                return 'مانده مرخصی روزانه سالانه کمتر از یک روز است و امکان ثبت مرخصی روزانه وجود ندارد.';
            }

            if (requestedDay > this.remainingDailyLeaveDay()) {
                return (
                    `قبلاً ${this.day(acceptedDay)} روز تایید شده دارید. ` +
                    `درخواست فعلی ${this.day(requestedDay)} روز کاری است. ` +
                    `جمع تاییدشده‌های قبلی و درخواست فعلی ${this.day(totalAfterRequest)} روز می‌شود. ` +
                    `سهمیه سالانه ${this.day(annualLimit)} روز است؛ بنابراین ${this.day(overDay)} روز بیشتر از سهمیه می‌شود. ` +
                    `جمعه‌ها و تعطیلات رسمی در تعداد روز کاری درخواست فعلی محاسبه نشده‌اند.`
                );
            }
        }

        if (type === 'HOURLY') {
            const acceptedMinute = this.num(this.leaveStatus()?.UsedAcceptedMonthlyHourlyMinuteForBalance);
            const requestedMinute = this.requestedLeaveMinute();
            const monthlyLimit = this.num(this.leaveStatus()?.MonthlyHourlyLeaveLimitMinute);
            const totalAfterRequest = acceptedMinute + requestedMinute;
            const overMinute = totalAfterRequest - monthlyLimit;

            if (this.remainingMonthlyHourlyMinute() <= 0) {
                return 'مانده مرخصی ساعتی تایید شده ماه جاری تمام شده است.';
            }

            if (requestedMinute > this.remainingMonthlyHourlyMinute()) {
                return (
                    `قبلاً ${this.minuteToHourLabel(acceptedMinute)} ساعت مرخصی ساعتی تایید شده در ماه جاری دارید. ` +
                    `درخواست فعلی ${this.minuteToHourLabel(requestedMinute)} ساعت است. ` +
                    `جمع تاییدشده‌های قبلی و درخواست فعلی ${this.minuteToHourLabel(totalAfterRequest)} ساعت می‌شود. ` +
                    `سقف ماهانه ${this.minuteToHourLabel(monthlyLimit)} ساعت است؛ بنابراین ${this.minuteToHourLabel(overMinute)} ساعت بیشتر از سقف ماهانه می‌شود.`
                );
            }
        }

        return '';
    }


    isLeaveTypeDisabled(type: string): boolean {
        if (!this.leaveStatusLoaded()) return false;

        // مدیر همه نوع مرخصی را بتواند انتخاب کند
        if (this.permission.canManageRole === true) {
            return false;
        }

        if (type === 'SICK') return false;

        if (type === 'DAILY') {
            return !this.canRequestDailyLeave() || this.remainingDailyLeaveDay() < 1;
        }

        if (type === 'HOURLY') {
            return !this.canRequestHourlyLeave() || this.remainingMonthlyHourlyMinute() <= 0;
        }

        return false;
    }
    private holidaysSet = new Set<string>();

    private lastValidLeaveStartDate = '';
    private lastValidLeaveEndDate = '';
    private normalizeJalaliDateText(value: string | null | undefined): string {
        if (!value) return '';

        const normalized = this.toEnglishNumber(value).trim();

        const parts = normalized.split('/').map(Number);

        if (parts.length !== 3) return normalized;

        const [jy, jm, jd] = parts;

        if (!jy || !jm || !jd) return normalized;

        return this.formatJalaliDate(jy, jm, jd);
    }

    private timestampToJalaliDate(timestamp: number): string {
        if (!timestamp) return '';

        return moment(timestamp).format('jYYYY/jMM/jDD');
    }

    private isFriday(jalaliDate: string): boolean {
        const normalized = this.normalizeJalaliDateText(jalaliDate);

        const m = moment(normalized, 'jYYYY/jMM/jDD');

        if (!m.isValid()) return false;

        return m.day() === 5;
    }

    private isPublicHoliday(jalaliDate: string): boolean {
        const normalized = this.normalizeJalaliDateText(jalaliDate);

        return this.holidaysSet.has(normalized);
    }

    private isDisabledLeaveDate(jalaliDate: string): boolean {
        const type = this.EditForm_LeaveRequest.controls['LeaveRequestType'].value;

        // اگر مرخصی استعلاجی/اضطراری را آزاد می‌خواهی، این خط بماند
        if (type === 'SICK') {
            return false;
        }

        return this.isFriday(jalaliDate) || this.isPublicHoliday(jalaliDate);
    }

    private getDisabledDateReason(jalaliDate: string): string {
        if (this.isFriday(jalaliDate)) {
            return 'جمعه';
        }

        if (this.isPublicHoliday(jalaliDate)) {
            return 'تعطیل رسمی';
        }

        return 'تعطیل';
    }


    onLeaveDateSelect(
        event: IActiveDate,
        controlName: 'LeaveStartDate' | 'LeaveEndDate'
    ): void {
        const selectedDate = this.timestampToJalaliDate(event.timestamp);

        if (!selectedDate) return;

        this.rejectDisabledLeaveDate(controlName, selectedDate);
    }


    private rejectDisabledLeaveDate(
        controlName: 'LeaveStartDate' | 'LeaveEndDate',
        value: string | null | undefined
    ): boolean {
        if (!value) return false;

        const selectedDate = this.normalizeJalaliDateText(value);

        if (!selectedDate) return false;

        if (!this.isDisabledLeaveDate(selectedDate)) {
            if (controlName === 'LeaveStartDate') {
                this.lastValidLeaveStartDate = selectedDate;
            }

            if (controlName === 'LeaveEndDate') {
                this.lastValidLeaveEndDate = selectedDate;
            }

            return false;
        }

        const reason = this.getDisabledDateReason(selectedDate);

        const fallback =
            controlName === 'LeaveStartDate'
                ? this.lastValidLeaveStartDate
                : this.lastValidLeaveEndDate;

        this.EditForm_LeaveRequest.patchValue(
            {
                [controlName]: fallback || '',
            },
            {
                emitEvent: false,
            }
        );

        if (controlName === 'LeaveStartDate') {
            this.EditForm_LeaveRequest.patchValue(
                {
                    LeaveEndDate: fallback || '',
                },
                {
                    emitEvent: false,
                }
            );
        }

        this.notificationService.warning(
            `تاریخ ${selectedDate} ${reason} است و قابل انتخاب برای مرخصی نیست`
        );

        this.refreshLeaveEndDateLimit();
        this.calculateDays();

        return true;
    }

    holidayDateWarning = signal('');
    holidayDateWarningControl = signal<'LeaveStartDate' | 'LeaveEndDate' | ''>('');
    isHolidayWarningFor(controlName: 'LeaveStartDate' | 'LeaveEndDate'): boolean {
        return this.holidayDateWarningControl() === controlName && this.holidayDateWarning().length > 0;
    }

    clearHolidayWarning(): void {
        this.holidayDateWarning.set('');
        this.holidayDateWarningControl.set('');
    }

    private rejectHolidayDate(
        controlName: 'LeaveStartDate' | 'LeaveEndDate',
        selectedDate: string
    ): boolean {
        const type = this.EditForm_LeaveRequest.controls['LeaveRequestType'].value;

        if (type === 'SICK') {
            this.clearHolidayWarning();
            return false;
        }

        const normalizedDate = this.normalizeJalaliDateText(selectedDate);

        const isFriday = this.isFriday(normalizedDate);
        const isHoliday = this.isPublicHoliday(normalizedDate);

        if (!isFriday && !isHoliday) {
            this.clearHolidayWarning();
            return false;
        }

        const reason = isFriday ? 'جمعه' : 'تعطیل رسمی';

        this.holidayDateWarningControl.set(controlName);
        this.holidayDateWarning.set(
            `تاریخ ${normalizedDate} ${reason} است و برای مرخصی روزانه/ساعتی قابل انتخاب نیست.`
        );

        this.EditForm_LeaveRequest.patchValue(
            {
                [controlName]: '',
            },
            {
                emitEvent: false,
            }
        );

        if (controlName === 'LeaveStartDate') {
            this.EditForm_LeaveRequest.patchValue(
                {
                    LeaveEndDate: '',
                },
                {
                    emitEvent: false,
                }
            );
        }

        this.notificationService.warning(this.holidayDateWarning());

        this.calculateDays();

        return true;
    }

    employmentTypeText(value: string | null | undefined): string {
        const type = (value ?? '').toString().trim().toUpperCase();

        if (type === 'FULL_TIME') return 'تمام وقت';
        if (type === 'PART_TIME') return 'پاره وقت';
        if (type === 'SHIFT') return 'شیفتی';
        if (type === 'CUSTOM') return 'اختصاصی';

        return type || '-';
    }

    boolText(value: any): string {
        return this.num(value) === 1 ? 'دارد' : 'ندارد';
    }

    boolBadgeClass(value: any): string {
        return this.num(value) === 1 ? 'bg-success' : 'bg-danger';
    }

    timeRangeText(start: any, end: any): string {
        const s = this.cleanTime(start) || '--:--';
        const e = this.cleanTime(end) || '--:--';
        return `${s} تا ${e}`;
    }

    minuteToHourText(value: any): string {
        const minute = this.num(value);
        return `${this.minuteToHourLabel(minute)} ساعت / ${minute} دقیقه`;
    }

    canSelectUser(): boolean {
        return (
            this.permission.canManageRole === true);
    }


    private applyPolicyLimitsToForm(policy: any): void {
        const limitDay = this.num(policy?.AnnualLeaveLimitDay);
        const limitMinute = this.num(policy?.MonthlyHourlyLeaveLimitMinute);

        this.EditForm_LeaveRequest.patchValue(
            {
                LimitDay: limitDay.toString(),
                LimitMinute: limitMinute.toString(),
            },
            {
                emitEvent: false,
            }
        );
    }



}
