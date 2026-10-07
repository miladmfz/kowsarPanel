import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import moment from 'jalali-moment';
import * as jalaali from 'jalaali-js';
import {
    IActiveDate,
    IDatepickerTheme,
    NgPersianDatepickerModule,
} from 'ng-persian-datepicker';

import { KowsarAttachComponent } from 'src/app/app-shell/framework-components/kowsar/kowsar-attach/kowsar-attach.component';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { WorkforceAbsenceWebApiService } from '../../../services/WorkforceAbsenceWebApi.service';

@Component({
    selector: 'app-workforce-absence-request-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        NgPersianDatepickerModule,
        KowsarAttachComponent,
    ],
    templateUrl: './workforce-absence-request-edit.component.html',
    styles: [`
        .summary-box {
            height: 100%;
            padding: .8rem;
            border: 1px solid #e8edf4;
            border-radius: 14px;
        }

        .summary-value {
            font-size: 1.1rem;
            font-weight: 800;
        }

        .condition-card {
            border: 1px solid #dfe7f3;
            border-radius: 14px;
            background: #f8fbff;
        }

        .rule-pill {
            display: inline-flex;
            align-items: center;
            gap: .35rem;
            padding: .3rem .65rem;
            border: 1px solid #e2e8f0;
            border-radius: 999px;
            background: #fff;
            font-size: .76rem;
            font-weight: 700;
        }

        :host-context(html[data-bs-theme='dark']) .summary-box,
        :host-context(html[data-bs-theme='dark']) .condition-card,
        :host-context(html[data-bs-theme='dark']) .rule-pill {
            color: var(--kws-dark-text, #f1f5f9);
            background: var(--kws-dark-surface-raised, #303b51);
            border-color: var(--kws-dark-border, rgba(226, 232, 240, .18));
        }
    `],
})
export class WorkforceAbsenceRequestEditComponent implements OnInit, OnDestroy {

    title = signal('ایجاد درخواست جدید');
    requestCode = signal('0');
    loading = signal(false);

    users = signal<any[]>([]);
    types = signal<any[]>([]);
    policy = signal<any | null>(null);
    status = signal<any | null>(null);

    policyLoading = signal(false);
    statusLoading = signal(false);

    todayJDate = signal('');
    timeOptions = signal<string[]>([]);

    holidaysLoaded = signal(false);
    holidaysLoadFailed = signal(false);

    minimumStartJDate = signal('');
    minimumStartTimestamp = signal<number | null>(null);
    minimumEndTimestamp = signal<number | null>(null);

    dateWarning = signal('');
    submitWarning = signal('');

    private holidaysSet = new Set<string>();
    private lastValidStartDate = '';
    private lastValidEndDate = '';

    customTheme: Partial<IDatepickerTheme> = {
        selectedBackground: '#D68E3A',
        selectedText: '#FFFFFF',
    };

    EditForm = new FormGroup({
        AbsenceRequestCode: new FormControl('0'),
        CentralRef: new FormControl('', Validators.required),
        AbsenceTypeKey: new FormControl('', Validators.required),
        RequestMode: new FormControl('DAY', Validators.required),

        RequestJDate: new FormControl('', Validators.required),
        StartJDate: new FormControl('', Validators.required),
        EndJDate: new FormControl('', Validators.required),

        StartTime: new FormControl(''),
        EndTime: new FormControl(''),

        Description: new FormControl('', Validators.required),
        ManagerOverrideReason: new FormControl(''),
        HasAttachment: new FormControl('0'),

        TotalCalendarDay: new FormControl('0'),
        TotalWorkDay: new FormControl('0'),
        TotalOffDay: new FormControl('0'),
        TotalMinute: new FormControl('0'),
    });

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly repo = inject(WorkforceAbsenceWebApiService);
    private readonly baseRepo = inject(KowsarBaseWebApi);
    private readonly client = inject(HttpClient);
    private readonly notificationService = inject(NotificationService);

    protected readonly session = inject(SessionStorageService);
    protected readonly permission = inject(PermissionService);

    private readonly subs = new Subscription();

    ngOnInit(): void {
        this.watchForm();

        this.subs.add(
            this.route.paramMap.subscribe((params: ParamMap) => {
                const id = params.get('id') || '0';

                this.requestCode.set(id);
                this.EditForm.patchValue(
                    { AbsenceRequestCode: id },
                    { emitEvent: false }
                );

                if (id !== '0') {
                    this.title.set('اصلاح درخواست');
                    this.loadDetail(id);
                } else {
                    this.title.set('ایجاد درخواست جدید');
                    this.applyDefaultUser();
                }
            })
        );

        this.loadHolidays();
        this.loadToday();
        this.loadTypes();
        this.loadUsers();
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    // =============================================================
    // Basic state
    // =============================================================

    isEditMode(): boolean {
        return this.requestCode() !== '0';
    }

    canSelectUser(): boolean {
        return this.permission.canManageRole === true;
    }

    selectedType(): any | null {
        const key = this.EditForm.controls.AbsenceTypeKey.value;

        return this.types().find(
            (item: any) => String(item?.TypeKey ?? '') === String(key ?? '')
        ) ?? null;
    }

    showModeSelector(): boolean {
        const typeKey = String(this.EditForm.controls.AbsenceTypeKey.value ?? '').toUpperCase();

        // اضطراری همیشه ساعتی است و انتخاب حالت ندارد.
        if (typeKey === 'EMERGENCY') return false;

        return String(this.selectedType()?.CalculationMode ?? '') === 'FLEXIBLE';
    }

    isMinuteMode(): boolean {
        return this.EditForm.controls.RequestMode.value === 'MINUTE';
    }

    typeHelpText(): string {
        return this.selectedType()?.HelpText
            || 'بعد از انتخاب نوع درخواست، قوانین آن نمایش داده می‌شود.';
    }

    allowsFridayForUser(): boolean {
        return this.permission.canManageRole === true;
    }

    allowsHolidayForUser(): boolean {
        return this.permission.canManageRole === true;
    }

    requiredAdvanceWorkDay(): number {
        if (this.permission.canManageRole) return 0;

        const typeKey = String(
            this.EditForm.controls.AbsenceTypeKey.value ?? ''
        ).toUpperCase();

        if (typeKey === 'SICK' || typeKey === 'EMERGENCY') {
            return 0;
        }

        const typeLimit = this.num(this.selectedType()?.MinimumAdvanceWorkDay);
        const policyLimit = this.num(this.policy()?.MinimumDailyAdvanceWorkDay);

        return Math.max(typeLimit, policyLimit, 2);
    }

    // =============================================================
    // Watchers
    // =============================================================

    private watchForm(): void {
        this.subs.add(
            this.EditForm.controls.CentralRef.valueChanges.subscribe((value) => {
                const centralRef = String(value ?? '');

                if (!centralRef) {
                    this.policy.set(null);
                    this.status.set(null);
                    this.refreshDateRules();
                    return;
                }

                this.loadPolicyAndStatus(centralRef);
            })
        );

        this.subs.add(
            this.EditForm.controls.AbsenceTypeKey.valueChanges.subscribe(() => {
                this.applyTypeRules();
                this.refreshDateRules();
                this.calculateSummary();
            })
        );

        this.subs.add(
            this.EditForm.controls.RequestMode.valueChanges.subscribe(() => {
                this.applyModeValidators();
                this.refreshDateRules();
                this.calculateSummary();
            })
        );

        this.subs.add(
            this.EditForm.controls.StartJDate.valueChanges.subscribe((value) => {
                const startDate = this.normalizeJalaliDate(value);

                if (!startDate) {
                    this.minimumEndTimestamp.set(this.minimumStartTimestamp());
                    this.calculateSummary();
                    return;
                }

                if (this.isMinuteMode()) {
                    this.EditForm.patchValue(
                        { EndJDate: startDate },
                        { emitEvent: false }
                    );
                }

                this.refreshEndDateLimit(startDate);
                this.calculateSummary();
            })
        );

        this.subs.add(
            this.EditForm.controls.EndJDate.valueChanges.subscribe(() => {
                this.calculateSummary();
            })
        );

        this.subs.add(
            this.EditForm.controls.StartTime.valueChanges.subscribe(() => {
                this.calculateSummary();
            })
        );

        this.subs.add(
            this.EditForm.controls.EndTime.valueChanges.subscribe(() => {
                this.calculateSummary();
            })
        );
    }

    // =============================================================
    // Load data
    // =============================================================

    private loadHolidays(): void {
        this.client.get<any>('assets/holidays.json').subscribe({
            next: (data: any) => {
                const values = Array.isArray(data)
                    ? data
                    : Object.values(data ?? {}).flatMap((value: any) =>
                        Array.isArray(value) ? value : []
                    );

                const dates = values
                    .map((value: any) => this.normalizeJalaliDate(value))
                    .filter((value: string) => !!value);

                this.holidaysSet = new Set(dates);
                this.holidaysLoaded.set(true);
                this.holidaysLoadFailed.set(false);

                this.refreshDateRules();
                this.calculateSummary();
            },
            error: () => {
                this.holidaysSet.clear();
                this.holidaysLoaded.set(false);
                this.holidaysLoadFailed.set(true);

                this.notificationService.error(
                    'فایل assets/holidays.json دریافت نشد'
                );
            },
        });
    }

    private loadToday(): void {
        this.baseRepo.GetTodeyFromServer().subscribe({
            next: (data: any) => {
                const today = this.normalizeJalaliDate(
                    this.extractToday(data)
                );

                this.todayJDate.set(today);

                if (!this.isEditMode()) {
                    this.EditForm.patchValue(
                        { RequestJDate: today },
                        { emitEvent: false }
                    );
                }

                this.refreshDateRules();
            },
            error: () => {
                this.notificationService.error('خطا در دریافت تاریخ سرور');
            },
        });
    }

    private loadTypes(): void {
        this.repo.Type_Get({
            AbsenceTypeCode: '0',
            OnlyActive: '1',
        }).subscribe({
            next: (data: any) => {
                const rows = data?.WorkforceAbsenceTypes ?? [];
                this.types.set(rows);

                if (!this.EditForm.controls.AbsenceTypeKey.value && rows.length > 0) {
                    const defaultType = rows.find(
                        (item: any) => String(item?.TypeKey ?? '') === 'DAILY'
                    ) ?? rows[0];

                    this.EditForm.patchValue({
                        AbsenceTypeKey: String(defaultType?.TypeKey ?? ''),
                    });
                } else {
                    this.applyTypeRules();
                    this.refreshDateRules();
                }
            },
            error: () => {
                this.notificationService.error('خطا در دریافت انواع درخواست');
            },
        });
    }

    private loadUsers(): void {
        this.baseRepo.GetCentralUser().subscribe({
            next: (data: any) => {
                this.users.set(data?.Centrals ?? []);
                this.applyDefaultUser();
            },
            error: () => {
                this.users.set([]);
            },
        });
    }

    private applyDefaultUser(): void {
        if (this.isEditMode() || this.canSelectUser()) return;

        const centralRef = String(this.session.centralRef ?? '');
        if (!centralRef) return;

        this.EditForm.patchValue(
            { CentralRef: centralRef },
            { emitEvent: false }
        );

        this.loadPolicyAndStatus(centralRef);
    }

    private loadPolicyAndStatus(centralRef: string): void {
        const targetDate = this.normalizeJalaliDate(
            this.EditForm.controls.StartJDate.value || this.todayJDate()
        );

        this.policyLoading.set(true);

        this.repo.Policy_Get({
            CentralRef: centralRef,
            OnlyActive: '1',
            TargetJDate: targetDate,
        }).subscribe({
            next: (data: any) => {
                const row = data?.WorkforceAbsencePolicies?.[0] ?? null;
                const valid = row && Number(row?.ErrCode ?? 0) === 0;

                this.policy.set(valid ? row : null);
                this.policyLoading.set(false);

                this.generateTimeOptions();
                this.refreshDateRules();
            },
            error: () => {
                this.policy.set(null);
                this.policyLoading.set(false);
                this.refreshDateRules();
            },
        });

        this.statusLoading.set(true);

        this.repo.Request_Status({
            CentralRef: centralRef,
            TargetJDate: targetDate,
        }).subscribe({
            next: (data: any) => {
                const row = data?.WorkforceAbsenceStatus?.[0] ?? null;
                const valid = row && Number(row?.ErrCode ?? 0) === 0;

                this.status.set(valid ? row : null);
                this.statusLoading.set(false);
            },
            error: () => {
                this.status.set(null);
                this.statusLoading.set(false);
            },
        });
    }

    private loadDetail(code: string): void {
        this.loading.set(true);

        this.repo.Request_GetById(code).subscribe({
            next: (data: any) => {
                const row = data?.WorkforceAbsenceRequests?.[0] ?? null;
                this.loading.set(false);

                if (!row || Number(row?.ErrCode ?? 0) !== 0) {
                    this.notificationService.error(
                        row?.ErrDesc ?? 'درخواست پیدا نشد'
                    );
                    this.cancel();
                    return;
                }

                const startDate = this.normalizeJalaliDate(row?.StartJDate);
                const endDate = this.normalizeJalaliDate(row?.EndJDate);

                this.EditForm.patchValue({
                    AbsenceRequestCode: String(row?.AbsenceRequestCode ?? code),
                    CentralRef: String(row?.CentralRef ?? ''),
                    AbsenceTypeKey: String(row?.TypeKey ?? ''),
                    RequestMode: String(row?.RequestMode ?? 'DAY'),
                    RequestJDate: this.normalizeJalaliDate(row?.RequestJDate),
                    StartJDate: startDate,
                    EndJDate: endDate || startDate,
                    StartTime: this.cleanTime(row?.StartTimeText ?? row?.StartTime),
                    EndTime: this.cleanTime(row?.EndTimeText ?? row?.EndTime),
                    Description: String(row?.Description ?? ''),
                    ManagerOverrideReason: '',
                    HasAttachment: this.bit(row?.HasAttachment) ? '1' : '0',
                    TotalCalendarDay: String(row?.TotalCalendarDay ?? '0'),
                    TotalWorkDay: String(row?.TotalWorkDay ?? '0'),
                    TotalOffDay: String(row?.TotalOffDay ?? '0'),
                    TotalMinute: String(row?.TotalMinute ?? '0'),
                }, { emitEvent: false });

                this.lastValidStartDate = startDate;
                this.lastValidEndDate = endDate || startDate;

                const centralRef = String(row?.CentralRef ?? '');
                if (centralRef) {
                    this.loadPolicyAndStatus(centralRef);
                }

                this.applyTypeRules();
                this.refreshDateRules(false);
                this.calculateSummary();
            },
            error: () => {
                this.loading.set(false);
                this.notificationService.error('خطا در دریافت درخواست');
            },
        });
    }

    // =============================================================
    // Type and mode rules
    // =============================================================

    private applyTypeRules(): void {
        const type = this.selectedType();
        if (!type) return;

        const typeKey = String(type?.TypeKey ?? '').toUpperCase();
        const calculationMode = String(type?.CalculationMode ?? '');

        // V3: اضطراری تحت هر شرایطی فقط ساعتی است؛ حتی اگر دیتابیس قدیمی باشد.
        if (typeKey === 'EMERGENCY') {
            this.EditForm.patchValue(
                { RequestMode: 'MINUTE' },
                { emitEvent: false }
            );
        } else if (calculationMode === 'MINUTE') {
            this.EditForm.patchValue(
                { RequestMode: 'MINUTE' },
                { emitEvent: false }
            );
        } else if (calculationMode === 'DAY' || calculationMode === 'NONE') {
            this.EditForm.patchValue(
                { RequestMode: 'DAY' },
                { emitEvent: false }
            );
        }

        const description = this.EditForm.controls.Description;

        if (this.bit(type?.RequireDescription)) {
            description.setValidators([Validators.required]);
        } else {
            description.clearValidators();
        }

        description.updateValueAndValidity({ emitEvent: false });
        this.applyModeValidators();
    }

    private applyModeValidators(): void {
        const startTime = this.EditForm.controls.StartTime;
        const endTime = this.EditForm.controls.EndTime;

        if (this.isMinuteMode()) {
            startTime.setValidators([Validators.required]);
            endTime.setValidators([Validators.required]);

            const startDate = this.normalizeJalaliDate(
                this.EditForm.controls.StartJDate.value
            );

            if (startDate) {
                this.EditForm.patchValue(
                    { EndJDate: startDate },
                    { emitEvent: false }
                );
            }
        } else {
            startTime.clearValidators();
            endTime.clearValidators();

            this.EditForm.patchValue(
                { StartTime: '', EndTime: '' },
                { emitEvent: false }
            );
        }

        startTime.updateValueAndValidity({ emitEvent: false });
        endTime.updateValueAndValidity({ emitEvent: false });
    }

    private generateTimeOptions(): void {
        const startMinute = this.timeToMinute(
            this.policy()?.WorkStartTime || '09:00'
        );
        const endMinute = this.timeToMinute(
            this.policy()?.WorkEndTime || '18:00'
        );

        const result: string[] = [];

        for (let value = startMinute; value <= endMinute; value += 15) {
            const hour = Math.floor(value / 60)
                .toString()
                .padStart(2, '0');

            const minute = (value % 60)
                .toString()
                .padStart(2, '0');

            result.push(`${hour}:${minute}`);
        }

        this.timeOptions.set(result);
    }

    // =============================================================
    // Date rules
    // =============================================================

    private refreshDateRules(applyDefaultDate: boolean = true): void {
        const today = this.normalizeJalaliDate(this.todayJDate());

        if (!today) {
            this.minimumStartJDate.set('');
            this.minimumStartTimestamp.set(null);
            return;
        }

        let minimumDate = '';

        if (!this.permission.canManageRole && this.requiredAdvanceWorkDay() > 0) {
            minimumDate = this.addWorkingDays(
                today,
                this.requiredAdvanceWorkDay()
            );

            minimumDate = this.findNextAllowedDate(minimumDate);
        }

        this.minimumStartJDate.set(minimumDate);
        this.minimumStartTimestamp.set(
            minimumDate ? this.jalaliDateToTimestamp(minimumDate) : null
        );

        const currentStartDate = this.normalizeJalaliDate(
            this.EditForm.controls.StartJDate.value
        );

        if (!this.isEditMode() && applyDefaultDate) {
            let defaultDate = currentStartDate;

            if (!defaultDate) {
                defaultDate = minimumDate || today;
            }

            if (!this.permission.canManageRole) {
                if (minimumDate && this.compareJalaliDate(defaultDate, minimumDate) < 0) {
                    defaultDate = minimumDate;
                }

                if (!this.isDateAllowedForCurrentType(defaultDate)) {
                    defaultDate = this.findNextAllowedDate(defaultDate);
                }
            }

            this.EditForm.patchValue({
                StartJDate: defaultDate,
                EndJDate: defaultDate,
            }, { emitEvent: false });

            this.lastValidStartDate = defaultDate;
            this.lastValidEndDate = defaultDate;
        }

        this.refreshEndDateLimit(
            this.normalizeJalaliDate(this.EditForm.controls.StartJDate.value)
        );

        this.calculateSummary();
    }

    private refreshEndDateLimit(startDate: string): void {
        if (!startDate) {
            this.minimumEndTimestamp.set(this.minimumStartTimestamp());
            return;
        }

        this.minimumEndTimestamp.set(
            this.jalaliDateToTimestamp(startDate)
        );

        const endDate = this.normalizeJalaliDate(
            this.EditForm.controls.EndJDate.value
        );

        if (!endDate || this.compareJalaliDate(endDate, startDate) < 0) {
            this.EditForm.patchValue(
                { EndJDate: startDate },
                { emitEvent: false }
            );
        }
    }

    onDateSelect(
        event: IActiveDate,
        controlName: 'StartJDate' | 'EndJDate'
    ): void {
        const selectedDate = this.timestampToJalaliDate(event?.timestamp);
        if (!selectedDate) return;

        this.dateWarning.set('');

        if (!this.permission.canManageRole) {
            const minimumDate = this.minimumStartJDate();

            if (
                controlName === 'StartJDate'
                && minimumDate
                && this.compareJalaliDate(selectedDate, minimumDate) < 0
            ) {
                this.restoreDateControl(controlName);

                const message =
                    `اولین تاریخ مجاز شروع ${minimumDate} است. `
                    + `تاریخ شروع باید حداقل ${this.requiredAdvanceWorkDay()} روز کاری بعد باشد.`;

                this.dateWarning.set(message);
                this.notificationService.warning(message);
                return;
            }

            if (!this.isDateAllowedForCurrentType(selectedDate)) {
                this.restoreDateControl(controlName);

                const reason = this.getDisabledDateReason(selectedDate);
                const message = `تاریخ ${selectedDate} ${reason} است و برای این نوع درخواست مجاز نیست`;

                this.dateWarning.set(message);
                this.notificationService.warning(message);
                return;
            }
        }

        if (controlName === 'StartJDate') {
            this.lastValidStartDate = selectedDate;

            if (this.isMinuteMode()) {
                this.EditForm.patchValue(
                    { EndJDate: selectedDate },
                    { emitEvent: false }
                );
                this.lastValidEndDate = selectedDate;
            }

            this.refreshEndDateLimit(selectedDate);
        } else {
            const startDate = this.normalizeJalaliDate(
                this.EditForm.controls.StartJDate.value
            );

            if (startDate && this.compareJalaliDate(selectedDate, startDate) < 0) {
                this.restoreDateControl(controlName);

                const message = 'تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد';
                this.dateWarning.set(message);
                this.notificationService.warning(message);
                return;
            }

            this.lastValidEndDate = selectedDate;
        }

        this.calculateSummary();
    }

    private restoreDateControl(
        controlName: 'StartJDate' | 'EndJDate'
    ): void {
        const fallback = controlName === 'StartJDate'
            ? this.lastValidStartDate
            : this.lastValidEndDate;

        this.EditForm.patchValue(
            { [controlName]: fallback || '' },
            { emitEvent: false }
        );

        if (controlName === 'StartJDate' && this.isMinuteMode()) {
            this.EditForm.patchValue(
                { EndJDate: fallback || '' },
                { emitEvent: false }
            );
        }

        this.calculateSummary();
    }

    private isDateAllowedForCurrentType(jDate: string): boolean {
        // مدیر محدودیت جمعه و تعطیل رسمی ندارد.
        if (this.permission.canManageRole) return true;

        // کاربر عادی برای هیچ نوع مرخصی اجازه انتخاب جمعه/تعطیل رسمی ندارد.
        if (this.isFriday(jDate)) return false;
        if (this.isOfficialHoliday(jDate)) return false;

        return true;
    }

    private findNextAllowedDate(jDate: string): string {
        let current = this.normalizeJalaliDate(jDate);
        let guard = 0;

        while (
            current
            && !this.permission.canManageRole
            && !this.isDateAllowedForCurrentType(current)
            && guard < 370
        ) {
            current = this.addCalendarDays(current, 1);
            guard++;
        }

        return current;
    }

    private addWorkingDays(jDate: string, count: number): string {
        let current = this.normalizeJalaliDate(jDate);
        let added = 0;
        let guard = 0;

        while (added < count && guard < 800) {
            current = this.addCalendarDays(current, 1);

            if (!this.isNonWorkingDay(current)) {
                added++;
            }

            guard++;
        }

        return current;
    }

    private isNonWorkingDay(jDate: string): boolean {
        return this.isFriday(jDate) || this.isOfficialHoliday(jDate);
    }

    private isFriday(jDate: string): boolean {
        const normalized = this.normalizeJalaliDate(jDate);
        const date = moment(normalized, 'jYYYY/jMM/jDD');

        return date.isValid() && date.day() === 5;
    }

    private isOfficialHoliday(jDate: string): boolean {
        return this.holidaysSet.has(
            this.normalizeJalaliDate(jDate)
        );
    }

    private getDisabledDateReason(jDate: string): string {
        if (this.isFriday(jDate)) return 'جمعه';
        if (this.isOfficialHoliday(jDate)) return 'تعطیل رسمی';

        return 'غیرکاری';
    }

    // =============================================================
    // Calculation
    // =============================================================

    calculateSummary(): void {
        if (this.isMinuteMode()) {
            const startMinute = this.timeToMinute(
                this.EditForm.controls.StartTime.value
            );
            const endMinute = this.timeToMinute(
                this.EditForm.controls.EndTime.value
            );

            const totalMinute = endMinute > startMinute
                ? endMinute - startMinute
                : 0;

            const startDate = this.normalizeJalaliDate(
                this.EditForm.controls.StartJDate.value
            );

            this.EditForm.patchValue({
                EndJDate: startDate,
                TotalCalendarDay: '0',
                TotalWorkDay: '0',
                TotalOffDay: '0',
                TotalMinute: totalMinute.toString(),
            }, { emitEvent: false });

            return;
        }

        const summary = this.getDaySummary(
            this.EditForm.controls.StartJDate.value,
            this.EditForm.controls.EndJDate.value
        );

        this.EditForm.patchValue({
            TotalCalendarDay: summary.total.toString(),
            TotalWorkDay: summary.work.toString(),
            TotalOffDay: summary.off.toString(),
            TotalMinute: '0',
        }, { emitEvent: false });
    }

    private getDaySummary(
        startValue: string | null | undefined,
        endValue: string | null | undefined
    ): { total: number; work: number; off: number } {
        const startDate = this.normalizeJalaliDate(startValue);
        const endDate = this.normalizeJalaliDate(endValue);

        if (!startDate || !endDate) {
            return { total: 0, work: 0, off: 0 };
        }

        const start = moment(startDate, 'jYYYY/jMM/jDD');
        const end = moment(endDate, 'jYYYY/jMM/jDD');

        if (
            !start.isValid()
            || !end.isValid()
            || end.isBefore(start, 'day')
        ) {
            return { total: 0, work: 0, off: 0 };
        }

        let total = 0;
        let work = 0;
        let off = 0;

        const current = start.clone();

        while (current.isSameOrBefore(end, 'day')) {
            const currentJDate = current.format('jYYYY/jMM/jDD');

            total++;

            if (this.isNonWorkingDay(currentJDate)) {
                off++;
            } else {
                work++;
            }

            current.add(1, 'day');
        }

        return { total, work, off };
    }

    // =============================================================
    // Submit
    // =============================================================

    submit(): void {
        this.submitWarning.set('');
        this.dateWarning.set('');

        if (!this.permission.canManageRole) {
            const sessionCentralRef = String(this.session.centralRef ?? '');

            this.EditForm.patchValue(
                { CentralRef: sessionCentralRef },
                { emitEvent: false }
            );
        }

        this.calculateSummary();
        this.EditForm.markAllAsTouched();

        if (!this.policy()) {
            this.notificationService.warning(
                'برای کاربر انتخاب‌شده Policy فعال تعریف نشده است'
            );
            return;
        }

        if (!this.validateSelectedDates()) {
            return;
        }

        if (this.EditForm.invalid) {
            this.notificationService.warning(
                'اطلاعات اجباری را کامل کنید'
            );
            return;
        }

        const raw = this.EditForm.getRawValue();

        if (
            this.isMinuteMode()
            && this.timeToMinute(raw.EndTime) <= this.timeToMinute(raw.StartTime)
        ) {
            this.notificationService.warning(
                'ساعت پایان باید بعد از ساعت شروع باشد'
            );
            return;
        }

        const command = {
            AbsenceRequestCode: raw.AbsenceRequestCode || '0',
            CentralRef: raw.CentralRef || '0',
            AbsenceTypeKey: raw.AbsenceTypeKey || '',
            RequestMode: raw.RequestMode || 'DAY',

            RequestJDate: raw.RequestJDate || this.todayJDate(),
            StartJDate: this.normalizeJalaliDate(raw.StartJDate),
            EndJDate: this.normalizeJalaliDate(
                raw.EndJDate || raw.StartJDate
            ),

            StartTime: raw.StartTime || '',
            EndTime: raw.EndTime || '',

            TotalCalendarDay: raw.TotalCalendarDay || '0',
            TotalWorkDay: raw.TotalWorkDay || '0',
            TotalOffDay: raw.TotalOffDay || '0',
            TotalMinute: raw.TotalMinute || '0',

            Description: raw.Description || '',
            CurrentUserRef: this.session.centralRef ?? '0',
            IsManager: this.permission.canManageRole ? '1' : '0',
            ManagerOverrideReason: raw.ManagerOverrideReason || '',
            HasAttachment: raw.HasAttachment || '0',
        };

        this.loading.set(true);

        this.repo.Request_Save(command).subscribe({
            next: (data: any) => {
                const result = data?.WorkforceAbsenceRequests?.[0] ?? data;
                this.loading.set(false);

                if (Number(result?.ErrCode ?? 0) !== 0) {
                    this.notificationService.warning(
                        result?.ErrDesc ?? 'خطا در ذخیره درخواست'
                    );
                    return;
                }

                if (this.bit(result?.HasWarning) && result?.WarningMessage) {
                    this.notificationService.warning(result.WarningMessage);
                }

                this.notificationService.success(
                    'درخواست با موفقیت ذخیره شد'
                );

                this.router.navigate([
                    '/automation/workforce-absence/request-list',
                ]);
            },
            error: () => {
                this.loading.set(false);
                this.notificationService.error('خطا در ارتباط با سرور');
            },
        });
    }

    private validateSelectedDates(): boolean {
        const startDate = this.normalizeJalaliDate(
            this.EditForm.controls.StartJDate.value
        );
        const endDate = this.normalizeJalaliDate(
            this.EditForm.controls.EndJDate.value || startDate
        );

        if (!startDate || !endDate) {
            this.notificationService.warning(
                'تاریخ شروع و پایان را وارد کنید'
            );
            return false;
        }

        if (this.compareJalaliDate(endDate, startDate) < 0) {
            this.notificationService.warning(
                'تاریخ پایان نمی‌تواند قبل از تاریخ شروع باشد'
            );
            return false;
        }

        if (this.permission.canManageRole) {
            return true;
        }

        if (!this.holidaysLoaded()) {
            this.notificationService.warning(
                'فایل تعطیلات رسمی هنوز بارگذاری نشده است'
            );
            return false;
        }

        const minimumDate = this.minimumStartJDate();

        if (
            minimumDate
            && this.compareJalaliDate(startDate, minimumDate) < 0
        ) {
            this.notificationService.warning(
                `اولین تاریخ مجاز شروع ${minimumDate} است`
            );
            return false;
        }

        if (!this.isDateAllowedForCurrentType(startDate)) {
            this.notificationService.warning(
                `تاریخ شروع ${startDate} ${this.getDisabledDateReason(startDate)} است و مجاز نیست`
            );
            return false;
        }

        if (!this.isDateAllowedForCurrentType(endDate)) {
            this.notificationService.warning(
                `تاریخ پایان ${endDate} ${this.getDisabledDateReason(endDate)} است و مجاز نیست`
            );
            return false;
        }

        return true;
    }

    cancel(): void {
        this.router.navigate([
            '/automation/workforce-absence/request-list',
        ]);
    }

    // =============================================================
    // Template helpers
    // =============================================================

    isInvalid(name: string): boolean {
        const control = this.EditForm.get(name);
        return !!control && control.invalid && control.touched;
    }

    minuteToText(value: any): string {
        const total = Math.max(0, this.num(value));
        const hour = Math.floor(total / 60);
        const minute = total % 60;

        return `${hour}:${minute.toString().padStart(2, '0')}`;
    }

    // =============================================================
    // Generic helpers
    // =============================================================

    private num(value: any): number {
        const numberValue = Number(value);
        return Number.isFinite(numberValue) ? numberValue : 0;
    }

    private bit(value: any): boolean {
        const text = String(value ?? '').toLowerCase();
        return text === '1' || text === 'true';
    }

    private cleanTime(value: any): string {
        return String(value ?? '').trim().substring(0, 5);
    }

    private timeToMinute(value: any): number {
        const text = String(value ?? '');
        const [hour, minute] = text.split(':').map(Number);

        if (!Number.isFinite(hour) || !Number.isFinite(minute)) {
            return 0;
        }

        return hour * 60 + minute;
    }

    private extractToday(data: any): string {
        return (
            data?.Text
            ?? data?.[0]?.TodeyFromServer
            ?? data?.TodeyFromServer
            ?? ''
        ).toString();
    }

    private normalizeJalaliDate(
        value: string | null | undefined
    ): string {
        if (!value) return '';

        const normalized = this.toEnglishNumber(String(value)).trim();
        const parts = normalized.split('/').map(Number);

        if (parts.length !== 3) return '';

        const [year, month, day] = parts;

        if (!year || !month || !day) return '';

        try {
            if (!jalaali.isValidJalaaliDate(year, month, day)) {
                return '';
            }
        } catch {
            return '';
        }

        return this.formatJalaliDate(year, month, day);
    }

    private toEnglishNumber(value: string): string {
        const persian = '۰۱۲۳۴۵۶۷۸۹';
        const arabic = '٠١٢٣٤٥٦٧٨٩';

        return value
            .replace(/[۰-۹]/g, (digit) =>
                persian.indexOf(digit).toString()
            )
            .replace(/[٠-٩]/g, (digit) =>
                arabic.indexOf(digit).toString()
            );
    }

    private formatJalaliDate(
        year: number,
        month: number,
        day: number
    ): string {
        return `${year}/${month.toString().padStart(2, '0')}/${day.toString().padStart(2, '0')}`;
    }

    private addCalendarDays(jDate: string, days: number): string {
        const normalized = this.normalizeJalaliDate(jDate);
        const [jy, jm, jd] = normalized.split('/').map(Number);
        const gregorian = jalaali.toGregorian(jy, jm, jd);

        const date = new Date(
            gregorian.gy,
            gregorian.gm - 1,
            gregorian.gd
        );

        date.setDate(date.getDate() + days);

        const jalali = jalaali.toJalaali(date);

        return this.formatJalaliDate(
            jalali.jy,
            jalali.jm,
            jalali.jd
        );
    }

    private jalaliDateToTimestamp(jDate: string): number {
        const normalized = this.normalizeJalaliDate(jDate);
        if (!normalized) return 0;

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

    private timestampToJalaliDate(timestamp: number | null | undefined): string {
        if (!timestamp) return '';
        return moment(timestamp).format('jYYYY/jMM/jDD');
    }

    private compareJalaliDate(first: string, second: string): number {
        const firstTimestamp = this.jalaliDateToTimestamp(first);
        const secondTimestamp = this.jalaliDateToTimestamp(second);

        if (firstTimestamp === secondTimestamp) return 0;
        return firstTimestamp > secondTimestamp ? 1 : -1;
    }
}
