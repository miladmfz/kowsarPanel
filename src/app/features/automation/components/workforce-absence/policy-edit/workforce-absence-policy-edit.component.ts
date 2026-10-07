import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';

import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { WorkforceAbsenceWebApiService } from '../../../../automation/services/WorkforceAbsenceWebApi.service';

@Component({
    selector: 'app-workforce-absence-policy-edit',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        RouterModule,
        NgPersianDatepickerModule,
    ],
    templateUrl: './workforce-absence-policy-edit.component.html',
})
export class WorkforceAbsencePolicyEditComponent implements OnInit, OnDestroy {

    title = signal('ایجاد Policy');
    policyCode = signal('0');
    users = signal<any[]>([]);
    loading = signal(false);
    existingPolicyFound = signal(false);

    customTheme: Partial<IDatepickerTheme> = {
        selectedBackground: '#D68E3A',
        selectedText: '#FFFFFF',
    };

    EmploymentTypes = [
        { id: 'FULL_TIME', title: 'تمام وقت' },
        { id: 'PART_TIME', title: 'پاره وقت' },
        { id: 'SHIFT', title: 'شیفتی' },
        { id: 'CUSTOM', title: 'اختصاصی' },
    ];

    EditForm = new FormGroup({
        PolicyCode: new FormControl('0'),
        CentralRef: new FormControl('', Validators.required),

        EmploymentType: new FormControl('FULL_TIME', Validators.required),

        WorkStartTime: new FormControl('09:00', Validators.required),
        WorkEndTime: new FormControl('18:00', Validators.required),

        BreakMinute: new FormControl('60', Validators.required),
        DailyWorkMinute: new FormControl('480', Validators.required),

        AnnualDailyLimit: new FormControl('26', Validators.required),
        MonthlyHourlyLimitMinute: new FormControl('510', Validators.required),
        PartTimeRatio: new FormControl('1', Validators.required),

        RequestSubmitStartTime: new FormControl('09:00', Validators.required),
        RequestSubmitEndTime: new FormControl('18:00', Validators.required),

        MinimumDailyAdvanceWorkDay: new FormControl('2', Validators.required),
        MaximumHourlyMinutePerRequest: new FormControl('480', Validators.required),
        ConcurrentLeaveWarningCount: new FormControl('2', Validators.required),
        SickAttachmentRequiredAfterDay: new FormControl('1', Validators.required),

        AllowDaily: new FormControl('1'),
        AllowHourly: new FormControl('1'),
        AllowSick: new FormControl('1'),
        AllowEmergency: new FormControl('1'),
        AllowHolidayRequest: new FormControl('0'),

        EffectiveFromJDate: new FormControl(''),
        EffectiveToJDate: new FormControl(''),

        Explain: new FormControl(''),
        IsActive: new FormControl('1'),
    });

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly repo = inject(WorkforceAbsenceWebApiService);
    private readonly baseRepo = inject(KowsarBaseWebApi);
    private readonly notificationService = inject(NotificationService);
    private readonly subs = new Subscription();

    ngOnInit(): void {

        this.baseRepo.GetCentralUser().subscribe({
            next: (data: any) => {
                this.users.set(data?.Centrals ?? []);
            },
            error: () => {
                this.users.set([]);
            },
        });

        const centralRefSub = this.EditForm.controls.CentralRef.valueChanges.subscribe((value) => {
            const centralRef = String(value ?? '');

            if (!centralRef) {
                this.applyDefaults('');
                return;
            }

            this.loadByCentralRef(centralRef);
        });

        this.subs.add(centralRefSub);

        const routeSub = this.route.paramMap.subscribe((params: ParamMap) => {
            const id = params.get('id') || '0';

            this.policyCode.set(id);

            if (id !== '0') {
                this.title.set('اصلاح Policy');

                const navigationPolicy = history.state?.policy;

                if (
                    navigationPolicy &&
                    String(navigationPolicy.PolicyCode) === id
                ) {
                    this.patchPolicy(navigationPolicy);
                } else {
                    this.loadByCode(id);
                }

                return;
            }

            this.title.set('ایجاد Policy');
            this.applyDefaults('');
        });

        this.subs.add(routeSub);
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }

    private loadByCode(code: string): void {
        this.loading.set(true);

        this.repo.Policy_Get({
            CentralRef: '0',
            OnlyActive: null,
            TargetJDate: null,
        }).subscribe({
            next: (data: any) => {
                this.loading.set(false);

                const rows = data?.WorkforceAbsencePolicies ?? [];

                const row = rows.find(
                    (x: any) => String(x.PolicyCode) === code
                );

                if (!row) {
                    this.notificationService.error('Policy پیدا نشد');
                    this.cancel();
                    return;
                }

                this.patchPolicy(row);
            },
            error: () => {
                this.loading.set(false);
                this.notificationService.error('خطا در دریافت Policy');
            },
        });
    }

    private loadByCentralRef(centralRef: string): void {
        this.loading.set(true);

        this.repo.Policy_Get({
            CentralRef: centralRef,
            OnlyActive: '1',
            TargetJDate: null,
        }).subscribe({
            next: (data: any) => {
                this.loading.set(false);

                const rows = data?.WorkforceAbsencePolicies ?? [];

                const row = rows.find(
                    (x: any) =>
                        Number(x?.ErrCode ?? 0) === 0 &&
                        Number(x?.PolicyCode ?? 0) > 0
                );

                if (row) {
                    this.patchPolicy(row);
                    this.existingPolicyFound.set(true);
                    return;
                }

                this.applyDefaults(centralRef);
                this.existingPolicyFound.set(false);
            },
            error: () => {
                this.loading.set(false);
                this.applyDefaults(centralRef);
                this.notificationService.error('خطا در دریافت Policy کاربر');
            },
        });
    }

    private patchPolicy(row: any): void {
        const code = String(row?.PolicyCode ?? '0');

        this.policyCode.set(code);

        this.EditForm.patchValue(
            {
                PolicyCode: code,
                CentralRef: String(row?.CentralRef ?? ''),

                EmploymentType: String(row?.EmploymentType ?? 'FULL_TIME'),

                WorkStartTime: this.cleanTime(row?.WorkStartTime, '09:00'),
                WorkEndTime: this.cleanTime(row?.WorkEndTime, '18:00'),

                BreakMinute: String(row?.BreakMinute ?? '60'),
                DailyWorkMinute: String(row?.DailyWorkMinute ?? '480'),

                AnnualDailyLimit: String(row?.AnnualDailyLimit ?? '26'),
                MonthlyHourlyLimitMinute: String(row?.MonthlyHourlyLimitMinute ?? '510'),
                PartTimeRatio: String(row?.PartTimeRatio ?? '1'),

                RequestSubmitStartTime: this.cleanTime(
                    row?.RequestSubmitStartTime,
                    '09:00'
                ),
                RequestSubmitEndTime: this.cleanTime(
                    row?.RequestSubmitEndTime,
                    '18:00'
                ),

                MinimumDailyAdvanceWorkDay: String(
                    row?.MinimumDailyAdvanceWorkDay ?? '2'
                ),
                MaximumHourlyMinutePerRequest: String(
                    row?.MaximumHourlyMinutePerRequest ?? '480'
                ),
                ConcurrentLeaveWarningCount: String(
                    row?.ConcurrentLeaveWarningCount ?? '2'
                ),
                SickAttachmentRequiredAfterDay: String(
                    row?.SickAttachmentRequiredAfterDay ?? '1'
                ),

                AllowDaily: this.bitText(row?.AllowDaily),
                AllowHourly: this.bitText(row?.AllowHourly),
                AllowSick: this.bitText(row?.AllowSick),
                AllowEmergency: this.bitText(row?.AllowEmergency),
                AllowHolidayRequest: this.bitText(row?.AllowHolidayRequest),

                EffectiveFromJDate: String(row?.EffectiveFromJDate ?? ''),
                EffectiveToJDate: String(row?.EffectiveToJDate ?? ''),

                Explain: String(row?.Explain ?? ''),
                IsActive: this.bitText(row?.IsActive),
            },
            {
                emitEvent: false,
            }
        );

        this.existingPolicyFound.set(true);
    }

    private applyDefaults(centralRef: string): void {
        this.policyCode.set('0');

        this.EditForm.patchValue(
            {
                PolicyCode: '0',
                CentralRef: centralRef,

                EmploymentType: 'FULL_TIME',

                WorkStartTime: '09:00',
                WorkEndTime: '18:00',

                BreakMinute: '60',
                DailyWorkMinute: '480',

                AnnualDailyLimit: '26',
                MonthlyHourlyLimitMinute: '510',
                PartTimeRatio: '1',

                RequestSubmitStartTime: '09:00',
                RequestSubmitEndTime: '18:00',

                MinimumDailyAdvanceWorkDay: '2',
                MaximumHourlyMinutePerRequest: '480',
                ConcurrentLeaveWarningCount: '2',
                SickAttachmentRequiredAfterDay: '1',

                AllowDaily: '1',
                AllowHourly: '1',
                AllowSick: '1',
                AllowEmergency: '1',
                AllowHolidayRequest: '0',

                EffectiveFromJDate: '',
                EffectiveToJDate: '',

                Explain: '',
                IsActive: '1',
            },
            {
                emitEvent: false,
            }
        );

        this.existingPolicyFound.set(false);
    }

    applyFullTime(): void {
        this.EditForm.patchValue({
            EmploymentType: 'FULL_TIME',
            WorkStartTime: '09:00',
            WorkEndTime: '18:00',
            BreakMinute: '60',
            DailyWorkMinute: '480',
            AnnualDailyLimit: '26',
            MonthlyHourlyLimitMinute: '510',
            PartTimeRatio: '1',
        });
    }

    applyPartTime(): void {
        this.EditForm.patchValue({
            EmploymentType: 'PART_TIME',
            WorkStartTime: '09:00',
            WorkEndTime: '13:00',
            BreakMinute: '0',
            DailyWorkMinute: '240',
            AnnualDailyLimit: '13',
            MonthlyHourlyLimitMinute: '255',
            PartTimeRatio: '0.5',
        });
    }

    submit(): void {
        this.EditForm.markAllAsTouched();

        if (this.EditForm.invalid) {
            this.notificationService.warning('اطلاعات اجباری را کامل کنید');
            return;
        }

        const raw = this.EditForm.getRawValue();

        // مهم: DTO سمت .NET این ماژول string است.
        // input[type=number] در Angular ممکن است number واقعی تولید کند،
        // بنابراین قبل از ارسال همه مقادیر ساده را string می‌کنیم.
        const command = this.toStringPayload(raw);

        this.loading.set(true);

        this.repo.Policy_Save(command).subscribe({
            next: (data: any) => {
                this.loading.set(false);

                const result =
                    data?.WorkforceAbsencePolicies?.[0] ??
                    data?.Policies?.[0] ??
                    data?.[0] ??
                    data;

                const errCode = Number(result?.ErrCode ?? 0);

                if (errCode !== 0) {
                    this.notificationService.warning(
                        result?.ErrDesc ??
                        result?.Message ??
                        'خطا در ذخیره Policy'
                    );
                    return;
                }

                this.notificationService.success('Policy با موفقیت ذخیره شد');
                this.cancel();
            },
            error: (error: any) => {
                this.loading.set(false);

                const validationErrors = error?.error?.errors;

                if (validationErrors) {
                    const message = Object.values(validationErrors)
                        .flat()
                        .map((x: any) => String(x))
                        .join(' - ');

                    this.notificationService.error(
                        message || 'خطا در اعتبارسنجی اطلاعات Policy'
                    );
                    return;
                }

                this.notificationService.error('خطا در ارتباط با سرور');
            },
        });
    }

    cancel(): void {
        this.router.navigate([
            '/automation/workforce-absence/policy-list',
        ]);
    }

    isInvalid(name: string): boolean {
        const control = this.EditForm.get(name);
        return !!control && control.invalid && control.touched;
    }

    private toStringPayload(source: Record<string, any>): Record<string, any> {
        const result: Record<string, any> = {};

        Object.entries(source ?? {}).forEach(([key, value]) => {
            if (value === null || value === undefined) {
                result[key] = '';
                return;
            }

            if (
                typeof value === 'string' ||
                typeof value === 'number' ||
                typeof value === 'boolean'
            ) {
                result[key] = String(value);
                return;
            }

            result[key] = value;
        });

        return result;
    }

    private bitText(value: any): string {
        const text = String(value ?? '').toLowerCase();
        return text === '1' || text === 'true' ? '1' : '0';
    }

    private cleanTime(value: any, fallback: string): string {
        const text = String(value ?? '').trim();
        return text ? text.substring(0, 5) : fallback;
    }
}
