import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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
export class LeaverequestPolicyEditComponent implements OnInit {

    title = signal('ایجاد تنظیمات مرخصی کاربر');
    PolicyCode = signal('0');
    users = signal<any[]>([]);
    loading = signal(false);

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
        this.GetCentralUser();

        this.route.paramMap.subscribe((params: ParamMap) => {
            const id = params.get('id') ?? '0';
            this.PolicyCode.set(id);

            if (id !== '0') {
                this.title.set('اصلاح تنظیمات مرخصی کاربر');
                this.loadDetail(id);
                return;
            }

            this.title.set('ایجاد تنظیمات مرخصی کاربر');
            this.setDefaultForCreateMode();
        });
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
            this.EditForm_Policy.patchValue(
                { CentralRef: this.session.centralRef ?? '' },
                { emitEvent: false }
            );
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
                const rows = data?.LeaveRequestUserPolicies ?? [];
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
        this.EditForm_Policy.patchValue(
            {
                PolicyCode: this.text(row.PolicyCode, '0'),
                CentralRef: this.text(row.CentralRef),
                EmploymentType: this.text(row.EmploymentType, 'FULL_TIME'),

                WorkStartTime: this.text(row.WorkStartTime, '09:00'),
                WorkEndTime: this.text(row.WorkEndTime, '18:00'),

                BreakMinute: this.text(row.BreakMinute, '60'),
                DailyWorkMinute: this.text(row.DailyWorkMinute, '480'),

                AnnualLeaveLimitDay: this.text(row.AnnualLeaveLimitDay, '26'),
                MonthlyHourlyLeaveLimitMinute: this.text(row.MonthlyHourlyLeaveLimitMinute, '510'),
                PartTimeRatio: this.text(row.PartTimeRatio, '1'),

                RequestSubmitStartTime: this.text(row.RequestSubmitStartTime, '09:00'),
                RequestSubmitEndTime: this.text(row.RequestSubmitEndTime, '18:00'),

                AllowDailyLeave: this.bitText(row.AllowDailyLeave),
                AllowHourlyLeave: this.bitText(row.AllowHourlyLeave),
                AllowSickLeave: this.bitText(row.AllowSickLeave),

                IsActive: this.bitText(row.IsActive),

                EffectiveFromJDate: this.text(row.EffectiveFromJDate),
                EffectiveToJDate: this.text(row.EffectiveToJDate),

                Explain: this.text(row.Explain),
            },
            { emitEvent: false }
        );
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

        const form = this.EditForm_Policy.getRawValue();

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

    private text(value: any, defaultValue = ''): string {
        if (value === null || value === undefined) return defaultValue;
        return value.toString();
    }

    private bitText(value: any): string {
        const key = (value ?? '').toString().toLowerCase();
        return key === '1' || key === 'true' ? '1' : '0';
    }
}
