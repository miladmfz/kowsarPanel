import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, ParamMap, Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { WorkforceAbsenceWebApiService } from '../../../../automation/services/WorkforceAbsenceWebApi.service';

@Component({
    selector: 'app-workforce-absence-type-edit',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule],
    templateUrl: './workforce-absence-type-edit.component.html',
})
export class WorkforceAbsenceTypeEditComponent implements OnInit {
    title = signal('ایجاد نوع درخواست');
    loading = signal(false);

    CalculationModes = [
        { id: 'DAY', title: 'روزانه' },
        { id: 'MINUTE', title: 'ساعتی' },
        { id: 'FLEXIBLE', title: 'قابل انتخاب' },
        { id: 'NONE', title: 'بدون محاسبه' },
    ];

    BalanceModes = [
        { id: 'ANNUAL_DAILY', title: 'سهمیه روزانه سالانه' },
        { id: 'MONTHLY_HOURLY', title: 'سهمیه ساعتی ماهانه' },
        { id: 'DAILY_OR_HOURLY', title: 'بر اساس حالت درخواست' },
        { id: 'NONE', title: 'بدون کسر سهمیه' },
    ];

    EditForm = new FormGroup({
        AbsenceTypeCode: new FormControl('0'),
        TypeKey: new FormControl('', Validators.required),
        TypeTitle: new FormControl('', Validators.required),
        CalculationMode: new FormControl('DAY', Validators.required),
        BalanceMode: new FormControl('ANNUAL_DAILY', Validators.required),
        MinimumAdvanceWorkDay: new FormControl('0', Validators.required),
        AllowFriday: new FormControl('0'),
        AllowHoliday: new FormControl('0'),
        RequireAttachment: new FormControl('0'),
        AttachmentRequiredAfterDay: new FormControl('0'),
        RequireDescription: new FormControl('1'),
        DeductFromBalance: new FormControl('1'),
        AllowFullTime: new FormControl('1'),
        AllowPartTime: new FormControl('1'),
        AllowShift: new FormControl('1'),
        AllowCustom: new FormControl('1'),
        HelpText: new FormControl(''),
        DisplayOrder: new FormControl('0'),
        IsActive: new FormControl('1'),
    });

    private readonly router = inject(Router);
    private readonly route = inject(ActivatedRoute);
    private readonly repo = inject(WorkforceAbsenceWebApiService);
    private readonly notificationService = inject(NotificationService);

    ngOnInit(): void {
        this.route.paramMap.subscribe((params: ParamMap) => {
            const id = params.get('id') || '0';
            if (id === '0') return;
            this.title.set('اصلاح نوع درخواست');

            const navigationType = history.state?.type;
            if (navigationType && String(navigationType.AbsenceTypeCode) === id) {
                this.patch(navigationType);
            } else {
                this.load(id);
            }
        });
    }

    private load(id: string): void {
        this.loading.set(true);
        this.repo.Type_Get({ AbsenceTypeCode: id, OnlyActive: null }).subscribe({
            next: (data: any) => {
                this.loading.set(false);
                const row = data?.WorkforceAbsenceTypes?.[0];
                if (!row) { this.notificationService.error('نوع درخواست پیدا نشد'); this.cancel(); return; }
                this.patch(row);
            },
            error: () => { this.loading.set(false); this.notificationService.error('خطا در دریافت اطلاعات'); },
        });
    }

    private patch(row: any): void {
        const values: any = {};
        Object.keys(this.EditForm.controls).forEach((key) => {
            values[key] = row[key] === null || row[key] === undefined ? '' : String(row[key]);
        });
        this.EditForm.patchValue(values, { emitEvent: false });
    }

    submit(): void {
        this.EditForm.markAllAsTouched();
        if (this.EditForm.invalid) { this.notificationService.warning('اطلاعات اجباری را کامل کنید'); return; }

        this.loading.set(true);
        this.repo.Type_Save(this.EditForm.getRawValue()).subscribe({
            next: (data: any) => {
                this.loading.set(false);
                const result = data?.WorkforceAbsenceTypes?.[0] ?? data;
                if (Number(result?.ErrCode ?? 0) !== 0) { this.notificationService.warning(result?.ErrDesc ?? 'خطا در ذخیره'); return; }
                this.notificationService.success('نوع درخواست ذخیره شد');
                this.cancel();
            },
            error: () => { this.loading.set(false); this.notificationService.error('خطا در ارتباط با سرور'); },
        });
    }

    cancel(): void { this.router.navigate(['/automation/workforce-absence/type-list']); }
    isInvalid(name: string): boolean { const c = this.EditForm.get(name); return !!c && c.invalid && c.touched; }
}
