import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';

import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';

import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { LeaveRequestWebApiService } from '../../../../automation/services/LeaveRequestWebApi.service';

@Component({
    selector: 'app-leaverequest-policy-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        NgPersianDatepickerModule,
    ],
    templateUrl: './leaverequest-policy-edit.component.html',
})
export class LeaverequestPolicyEditComponent implements OnInit, OnDestroy {

    title = signal('ایجاد تنظیمات مرخصی کاربر');
    PolicyCode = signal('0');
    users = signal<any[]>([]);
    loading = signal(false);

    policyLookupStatus = signal<'none' | 'loading' | 'found' | 'new' | 'error'>('none');
    policyLookupMessage = signal('');

    private readonly subs = new Subscription();

    customTheme: Partial<IDatepickerTheme> = {
        selectedBackground: '#D68E3A',
        selectedText: '#FFFFFF',
    };

    EmploymentType_Lookup = [
        { id: 'FULL_TIME', name: 'تمام وقت' },
        { id: 'PART_TIME', name: 'پاره وقت' },
        { id: 'SHIFT', name: 'شیفتی' },
        { id: 'CUSTOM', name: 'سفارشی' },
    ];

    EditForm_Policy = new FormGroup({
        PolicyCode: new FormControl('0'),
        CentralRef: new FormControl('', Validators.required),

        EmploymentType: new FormControl('FULL_TIME', Validators.required),

        WorkStartTime: new FormControl('09:00', Validators.required),
        WorkEndTime: new FormControl('18:00', Validators.required),

        BreakMinute: new FormControl('60', Validators.required),
        DailyWorkMinute: new FormControl('480', Validators.required),

        AnnualLeaveLimitDay: new FormControl('26', Validators.required),
        MonthlyHourlyLeaveLimitMinute: new FormControl('510', Validators.required),
        PartTimeRatio: new FormControl('1', Validators.required),

        RequestSubmitStartTime: new FormControl('09:00', Validators.required),
        RequestSubmitEndTime: new FormControl('18:00', Validators.required),

        AllowDailyLeave: new FormControl('1'),
        AllowHourlyLeave: new FormControl('1'),
        AllowSickLeave: new FormControl('1'),

        IsActive: new FormControl('1'),

        EffectiveFromJDate: new FormControl(''),
        EffectiveToJDate: new FormControl(''),

        Explain: new FormControl(''),
    });

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly repo = inject(LeaveRequestWebApiService);
    private readonly base_repo = inject(KowsarBaseWebApi);
    private readonly notificationService = inject(NotificationService);
    protected readonly session = inject(SessionStorageService);
    protected readonly permission = inject(PermissionService);

    ngOnInit(): void {
        this.watchCentralRefForPolicy();

        this.route.paramMap.subscribe((params: ParamMap) => {
            const id = params.get('id');

            if (id && id !== '0') {
                this.PolicyCode.set(id);
                this.title.set('اصلاح تنظیمات مرخصی');
                this.loadDetail(id);
                return;
            }

            this.PolicyCode.set('0');
            this.title.set('ایجاد تنظیمات مرخصی جدید');
            this.applyDefaultPolicy('');
        });

        this.GetCentralUser();
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    private watchCentralRefForPolicy(): void {
        const sub = this.EditForm_Policy.controls['CentralRef']
            .valueChanges
            .subscribe((centralRef: any) => {
                const value = (centralRef ?? '').toString();

                if (!value) {
                    this.applyDefaultPolicy('');
                    return;
                }

                this.loadPolicyByCentralRef(value);
            });

        this.subs.add(sub);
    }

    private loadPolicyByCentralRef(centralRef: string): void {
        if (!centralRef) {
            this.applyDefaultPolicy('');
            return;
        }

        this.policyLookupStatus.set('loading');
        this.policyLookupMessage.set('در حال بررسی تنظیمات ثبت‌شده برای کاربر انتخاب‌شده...');

        this.repo.GetLeaveRequestUserPolicy({
            CentralRef: centralRef,
            OnlyActive: '1',
        }).subscribe({
            next: (data: any) => {
                const rows = this.extractRows(data);
                const policy = this.pickBestPolicy(rows);

                if (policy) {
                    this.patchPolicyToForm(policy);

                    this.policyLookupStatus.set('found');
                    this.policyLookupMessage.set(
                        `برای این کاربر تنظیمات قبلی پیدا شد. ذخیره روی همان رکورد با کد ${this.text(policy?.PolicyCode, '0')} انجام می‌شود.`
                    );
                    return;
                }

                this.applyDefaultPolicy(centralRef);
            },
            error: () => {
                this.applyDefaultPolicy(centralRef);
                this.policyLookupStatus.set('error');
                this.policyLookupMessage.set('خطا در دریافت تنظیمات مرخصی کاربر. فرم با مقادیر پیش‌فرض پر شد.');
                this.notificationService.error('خطا در دریافت تنظیمات مرخصی کاربر');
            },
        });
    }

    private extractRows(data: any): any[] {
        const rows =
            data?.LeaveRequestUserPolicies ??
            data?.LeaveRequestUserPolicy ??
            data?.Policies ??
            data ??
            [];

        return Array.isArray(rows) ? rows : [];
    }

    private pickBestPolicy(rows: any[]): any | null {
        const validRows = rows
            .filter((x: any) => this.num(x?.ErrCode) === 0)
            .filter((x: any) => this.num(x?.PolicyCode) > 0)
            .sort((a: any, b: any) => {
                const activeDiff = this.num(b?.IsActive) - this.num(a?.IsActive);
                if (activeDiff !== 0) return activeDiff;

                const dateA = this.text(a?.EffectiveFromJDate);
                const dateB = this.text(b?.EffectiveFromJDate);
                const dateDiff = dateB.localeCompare(dateA);
                if (dateDiff !== 0) return dateDiff;

                return this.num(b?.PolicyCode) - this.num(a?.PolicyCode);
            });

        return validRows.length > 0 ? validRows[0] : null;
    }

    private patchPolicyToForm(policy: any): void {
        const policyCode = this.text(policy?.PolicyCode, '0');

        this.PolicyCode.set(policyCode);
        this.title.set('اصلاح تنظیمات مرخصی');

        this.EditForm_Policy.patchValue(
            {
                PolicyCode: policyCode,
                CentralRef: this.text(policy?.CentralRef),

                EmploymentType: this.text(policy?.EmploymentType, 'FULL_TIME'),

                WorkStartTime: this.cleanTime(policy?.WorkStartTime) || '09:00',
                WorkEndTime: this.cleanTime(policy?.WorkEndTime) || '18:00',

                BreakMinute: this.text(policy?.BreakMinute, '60'),
                DailyWorkMinute: this.text(policy?.DailyWorkMinute, '480'),

                AnnualLeaveLimitDay: this.text(policy?.AnnualLeaveLimitDay, '26'),
                MonthlyHourlyLeaveLimitMinute: this.text(policy?.MonthlyHourlyLeaveLimitMinute, '510'),
                PartTimeRatio: this.text(policy?.PartTimeRatio, '1'),

                RequestSubmitStartTime: this.cleanTime(policy?.RequestSubmitStartTime) || '09:00',
                RequestSubmitEndTime: this.cleanTime(policy?.RequestSubmitEndTime) || '18:00',

                AllowDailyLeave: this.bitText(policy?.AllowDailyLeave),
                AllowHourlyLeave: this.bitText(policy?.AllowHourlyLeave),
                AllowSickLeave: this.bitText(policy?.AllowSickLeave),

                IsActive: this.bitText(policy?.IsActive),

                EffectiveFromJDate: this.text(policy?.EffectiveFromJDate),
                EffectiveToJDate: this.text(policy?.EffectiveToJDate),

                Explain: this.text(policy?.Explain),
            },
            {
                emitEvent: false,
            }
        );
    }

    private applyDefaultPolicy(centralRef: string): void {
        this.PolicyCode.set('0');
        this.title.set('ایجاد تنظیمات مرخصی جدید');

        this.EditForm_Policy.patchValue(
            {
                PolicyCode: '0',
                CentralRef: centralRef,

                EmploymentType: 'FULL_TIME',

                WorkStartTime: '09:00',
                WorkEndTime: '18:00',

                BreakMinute: '60',
                DailyWorkMinute: '480',

                AnnualLeaveLimitDay: '26',
                MonthlyHourlyLeaveLimitMinute: '510',
                PartTimeRatio: '1',

                RequestSubmitStartTime: '09:00',
                RequestSubmitEndTime: '18:00',

                AllowDailyLeave: '1',
                AllowHourlyLeave: '1',
                AllowSickLeave: '1',

                IsActive: '1',

                EffectiveFromJDate: '',
                EffectiveToJDate: '',

                Explain: '',
            },
            {
                emitEvent: false,
            }
        );

        if (centralRef) {
            this.policyLookupStatus.set('new');
            this.policyLookupMessage.set('برای این کاربر تنظیمات فعالی پیدا نشد. با ذخیره، رکورد جدید ایجاد می‌شود.');
        } else {
            this.policyLookupStatus.set('none');
            this.policyLookupMessage.set('');
        }
    }

    GetCentralUser(): void {
        this.base_repo.GetCentralUser().subscribe({
            next: (data: any) => {
                this.users.set(data?.Centrals ?? []);
                this.setDefaultForCreateMode();
            },
            error: () => {
                this.users.set([]);
            },
        });
    }

    private setDefaultForCreateMode(): void {
        if (this.PolicyCode() !== '0') return;

        if (!this.canSelectUser()) {
            const userRef = (this.session.centralRef ?? '').toString();

            this.EditForm_Policy.patchValue(
                { CentralRef: userRef },
                { emitEvent: false }
            );

            if (userRef) {
                this.loadPolicyByCentralRef(userRef);
            }
        }
    }

    private loadDetail(policyCode: string): void {
        const navigationPolicy = history.state?.policy;

        if (navigationPolicy && navigationPolicy.PolicyCode?.toString() === policyCode.toString()) {
            this.patchPolicy(navigationPolicy);
            return;
        }

        this.loading.set(true);

        this.repo.GetLeaveRequestUserPolicy({ CentralRef: '0', OnlyActive: null }).subscribe({
            next: (data: any) => {
                const rows = this.extractRows(data);
                const row = rows.find((x: any) => x.PolicyCode?.toString() === policyCode.toString());

                this.loading.set(false);

                if (!row) {
                    this.notificationService.error('رکورد تنظیمات پیدا نشد');
                    this.router.navigate(['/automation/leaverequest-policy-list']);
                    return;
                }

                this.patchPolicy(row);
            },
            error: () => {
                this.loading.set(false);
                this.notificationService.error('خطا در دریافت اطلاعات تنظیمات');
            },
        });
    }

    private patchPolicy(row: any): void {
        const policyCode = this.text(row?.PolicyCode, '0');

        this.PolicyCode.set(policyCode);
        this.title.set('اصلاح تنظیمات مرخصی');

        this.EditForm_Policy.patchValue(
            {
                PolicyCode: policyCode,
                CentralRef: this.text(row?.CentralRef),
                EmploymentType: this.text(row?.EmploymentType, 'FULL_TIME'),

                WorkStartTime: this.cleanTime(row?.WorkStartTime) || '09:00',
                WorkEndTime: this.cleanTime(row?.WorkEndTime) || '18:00',

                BreakMinute: this.text(row?.BreakMinute, '60'),
                DailyWorkMinute: this.text(row?.DailyWorkMinute, '480'),

                AnnualLeaveLimitDay: this.text(row?.AnnualLeaveLimitDay, '26'),
                MonthlyHourlyLeaveLimitMinute: this.text(row?.MonthlyHourlyLeaveLimitMinute, '510'),
                PartTimeRatio: this.text(row?.PartTimeRatio, '1'),

                RequestSubmitStartTime: this.cleanTime(row?.RequestSubmitStartTime) || '09:00',
                RequestSubmitEndTime: this.cleanTime(row?.RequestSubmitEndTime) || '18:00',

                AllowDailyLeave: this.bitText(row?.AllowDailyLeave),
                AllowHourlyLeave: this.bitText(row?.AllowHourlyLeave),
                AllowSickLeave: this.bitText(row?.AllowSickLeave),

                IsActive: this.bitText(row?.IsActive),

                EffectiveFromJDate: this.text(row?.EffectiveFromJDate),
                EffectiveToJDate: this.text(row?.EffectiveToJDate),

                Explain: this.text(row?.Explain),
            },
            { emitEvent: false }
        );

        this.policyLookupStatus.set('found');
        this.policyLookupMessage.set(`در حال اصلاح رکورد تنظیمات با کد ${policyCode}`);
    }

    applyFullTimeDefault(): void {
        this.EditForm_Policy.patchValue({
            EmploymentType: 'FULL_TIME',
            WorkStartTime: '09:00',
            WorkEndTime: '18:00',
            BreakMinute: '60',
            DailyWorkMinute: '480',
            AnnualLeaveLimitDay: '26',
            MonthlyHourlyLeaveLimitMinute: '510',
            PartTimeRatio: '1',
            RequestSubmitStartTime: '09:00',
            RequestSubmitEndTime: '18:00',
        });
    }

    applyPartTimeDefault(): void {
        this.EditForm_Policy.patchValue({
            EmploymentType: 'PART_TIME',
            WorkStartTime: '09:00',
            WorkEndTime: '13:00',
            BreakMinute: '0',
            DailyWorkMinute: '240',
            AnnualLeaveLimitDay: '13',
            MonthlyHourlyLeaveLimitMinute: '255',
            PartTimeRatio: '0.5',
            RequestSubmitStartTime: '09:00',
            RequestSubmitEndTime: '18:00',
        });
    }

    submit(): void {
        this.EditForm_Policy.markAllAsTouched();

        if (this.EditForm_Policy.invalid) {
            this.notificationService.warning('لطفاً اطلاعات اجباری را کامل کنید');
            return;
        }

        const rawForm = this.EditForm_Policy.getRawValue();

        const form = Object.fromEntries(
            Object.entries(rawForm).map(([key, value]) => [
                key,
                value === null || value === undefined ? '' : String(value)
            ])
        );

        this.repo.SaveLeaveRequestUserPolicy(form).subscribe({
            next: (data: any) => {
                const result = data?.LeaveRequestUserPolicies?.[0] ?? data?.[0] ?? data;
                const errCode = Number(result?.ErrCode ?? 0);

                if (errCode !== 0) {
                    this.notificationService.warning(
                        result?.ErrDesc || result?.Message || 'خطا در ذخیره تنظیمات'
                    );
                    return;
                }

                this.notificationService.success('تنظیمات مرخصی با موفقیت ذخیره شد');
                this.router.navigate(['/automation/leaverequest-policy-list']);
            },
            error: () => {
                this.notificationService.error('خطا در ارتباط با سرور');
            },
        });
    }

    cancel(): void {
        this.router.navigate(['/automation/leaverequest-policy-list']);
    }

    canSelectUser(): boolean {
        return this.permission.canManageRole === true;
    }

    isInvalid(controlName: string): boolean {
        const control = this.EditForm_Policy.get(controlName);
        return !!control && control.invalid && control.touched;
    }

    policyLookupAlertClass(): string {
        const status = this.policyLookupStatus();

        if (status === 'found') return 'alert alert-success py-2 mb-0';
        if (status === 'new') return 'alert alert-warning py-2 mb-0';
        if (status === 'loading') return 'alert alert-info py-2 mb-0';
        if (status === 'error') return 'alert alert-danger py-2 mb-0';

        return 'd-none';
    }

    policyLookupIconClass(): string {
        const status = this.policyLookupStatus();

        if (status === 'found') return 'fas fa-check-circle me-1';
        if (status === 'new') return 'fas fa-plus-circle me-1';
        if (status === 'loading') return 'fas fa-spinner fa-spin me-1';
        if (status === 'error') return 'fas fa-exclamation-triangle me-1';

        return '';
    }

    private text(value: any, defaultValue: string = ''): string {
        if (value === null || value === undefined) return defaultValue;

        const text = value.toString();
        return text.trim() === '' ? defaultValue : text;
    }

    private bitText(value: any): string {
        return this.num(value) === 1 ? '1' : '0';
    }

    private cleanTime(value: any): string {
        if (value === null || value === undefined) return '';

        const text = value.toString().trim();

        if (!text) return '';

        return text.substring(0, 5);
    }

    num(value: any): number {
        const n = Number(value);
        return Number.isFinite(n) ? n : 0;
    }
}
