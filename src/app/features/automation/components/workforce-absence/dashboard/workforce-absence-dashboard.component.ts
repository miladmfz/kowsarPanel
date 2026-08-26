import { CommonModule } from '@angular/common';
import { Component, OnInit, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IDatepickerTheme, NgPersianDatepickerModule } from 'ng-persian-datepicker';

import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { WorkforceAbsenceWebApiService } from '../../../../automation/services/WorkforceAbsenceWebApi.service';

@Component({
    selector: 'app-workforce-absence-dashboard',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, NgPersianDatepickerModule],
    templateUrl: './workforce-absence-dashboard.component.html',
    styles: [`
        .dash-card { border: 0; border-radius: 16px; box-shadow: 0 7px 20px rgba(15, 23, 42, .07); }
        .dash-value { font-size: 1.55rem; font-weight: 900; }
    `],
})
export class WorkforceAbsenceDashboardComponent implements OnInit {
    users = signal<any[]>([]);
    dashboard = signal<any | null>(null);
    loading = signal(false);

    customTheme: Partial<IDatepickerTheme> = {
        selectedBackground: '#D68E3A', selectedText: '#FFFFFF',
    };

    SearchForm = new FormGroup({
        TargetJDate: new FormControl(''),
        CentralRef: new FormControl('0'),
    });

    private readonly repo = inject(WorkforceAbsenceWebApiService);
    private readonly baseRepo = inject(KowsarBaseWebApi);
    private readonly notificationService = inject(NotificationService);

    ngOnInit(): void {
        this.baseRepo.GetCentralUser().subscribe({
            next: (data: any) => this.users.set(data?.Centrals ?? []),
            error: () => this.users.set([]),
        });

        this.baseRepo.GetTodeyFromServer().subscribe({
            next: (data: any) => {
                this.SearchForm.patchValue({ TargetJDate: this.extractToday(data) }, { emitEvent: false });
                this.loadDashboard();
            },
            error: () => this.loadDashboard(),
        });
    }

    loadDashboard(): void {
        const raw = this.SearchForm.getRawValue();
        if (!raw.TargetJDate) {
            this.notificationService.warning('تاریخ گزارش را انتخاب کنید');
            return;
        }

        this.loading.set(true);
        this.repo.Dashboard_Get(raw).subscribe({
            next: (data: any) => {
                this.loading.set(false);
                const row = data?.WorkforceAbsenceDashboard?.[0] ?? null;
                if (row && Number(row.ErrCode ?? 0) !== 0) {
                    this.notificationService.warning(row.ErrDesc ?? 'خطا در گزارش');
                    this.dashboard.set(null);
                    return;
                }
                this.dashboard.set(row);
            },
            error: () => {
                this.loading.set(false);
                this.dashboard.set(null);
                this.notificationService.error('خطا در دریافت داشبورد');
            },
        });
    }

    minuteToText(value: any): string {
        const total = Math.max(0, Number(value) || 0);
        const hour = Math.floor(total / 60);
        const minute = total % 60;
        return `${hour}:${minute.toString().padStart(2, '0')}`;
    }

    private extractToday(data: any): string {
        return (data?.Text ?? data?.[0]?.TodeyFromServer ?? data?.TodeyFromServer ?? '').toString();
    }
}
