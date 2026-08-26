import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';

import { AttendancePanelComponent } from 'src/app/features/internal/components/attendance-panel/attendance-panel.component';
import { AttendanceCallReportComponent } from 'src/app/features/internal/components/attendance-panel/components/call-report/attendance-call-report.component';
import { KowsarReportComponent } from 'src/app/features/internal/components/kowsar-report/kowsar-report.component';
import { LeaveGridComponent } from 'src/app/features/internal/components/attendance-panel/components/leave-grid/leave-grid.component';
import { AutletterChartComponent } from 'src/app/features/internal/components/autletter-chart/autletter-chart.component';

import { KowsarCalendarComponent } from '../kowsar-calendar/kowsar-calendar.component';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';

@Component({
  selector: 'app-kowsar-dashboard',
  templateUrl: './kowsar-dashboard.component.html',
  standalone: true,
  imports: [
    CommonModule,
    AttendancePanelComponent,
    AttendanceCallReportComponent,
    KowsarReportComponent,
    KowsarCalendarComponent,
    LeaveGridComponent,
    AutletterChartComponent,
  ],
  styles: [`
    :host {
      display: block;
      min-width: 0;
    }

    .dashboard-section {
      min-width: 0;
      margin-bottom: 1rem;
    }

    .dashboard-attendance-column,
    .dashboard-call-summary-column,
    .dashboard-followup-column,
    .dashboard-calendar-column {
      min-width: 0;
    }

    .dashboard-call-summary-column app-attendance-call-report,
    .dashboard-followup-column app-attendance-call-report {
      display: block;
      height: 100%;
    }

    .dashboard-calendar-column app-kowsar-calendar {
      display: block;
      height: 100%;
    }

    @media (max-width: 991.98px) {
      .dashboard-call-summary-column {
        order: 2;
      }

      .dashboard-attendance-column {
        order: 1;
      }

      .dashboard-followup-column {
        order: 1;
      }

      .dashboard-calendar-column {
        order: 2;
      }
    }
  `],
})
export class KowsarDashboardComponent implements OnInit, OnDestroy {
  LoginType = signal('');
  ToDayDate = signal('');

  ownExtension = signal('');
  ownPersonName = signal('');

  attendanceInterval!: ReturnType<typeof setInterval>;

  private readonly base_repo = inject(KowsarBaseWebApi);
  private readonly notificationService = inject(NotificationService);
  protected readonly permissionService = inject(PermissionService);
  protected readonly session = inject(SessionStorageService);

  ngOnInit(): void {
    this.initDashboard();
  }

  ngOnDestroy(): void {
    if (this.attendanceInterval) {
      clearInterval(this.attendanceInterval);
    }
  }

  private initDashboard(): void {
    this.loadTodayDate();
    this.detectUserInfo();
    this.resolveOwnCallIdentity();
  }

  private loadTodayDate(): void {
    this.base_repo.GetTodeyFromServer().subscribe({
      next: (data: any) => {
        const today = data?.Text ?? '';
        this.ToDayDate.set(today);

        const activeDate = this.session.getString('ActiveDate');

        if (today !== activeDate) {
          this.session.setItem('ActiveDate', today);
          this.notificationService.info('📆 تاریخ جدید از سرور بروزرسانی شد.');
        }
      },
      error: () => {
        this.notificationService.error('❌ دریافت تاریخ از سرور ناموفق بود.');
      },
    });
  }

  private detectUserInfo(): void {
    this.LoginType.set(this.session.loginType);

    if (this.LoginType() !== 'KOWSAR' && this.LoginType() !== 'CUSTOMER') {
      this.notificationService.warning('شناسه کاربر یافت نشد.');
    }
  }

  private resolveOwnCallIdentity(): void {
    const sessionExtension = this.firstExtension([
      this.readSession('Manager'),
      this.readSession('manager'),
      this.readSession('Extension'),
      this.readSession('ExtensionNo'),
      this.readSession('InternalNo'),
      this.readSession('PhoneExtension'),
      this.readSession('SantralExtension'),
      this.readSession('PhAddress3'),
    ]);

    this.ownExtension.set(sessionExtension);
    this.ownPersonName.set(this.firstText([
      this.readSession('PhFullName'),
      this.readSession('DisplayName'),
      this.readSession('UserPrintName'),
      this.readSession('CentralName'),
      this.readSession('UserName'),
      'گزارش تماس من',
    ]));

    if (this.LoginType() !== 'KOWSAR') {
      return;
    }

    this.loadOwnExtensionFromAttendance();
  }

  /**
   * مقدار Manager در خروجی AttendanceDashboard همان داخلی سانترال کارشناس است.
   * ردیف کاربر جاری با CentralRef و در صورت نیاز UserId پیدا می‌شود.
   */
  private loadOwnExtensionFromAttendance(): void {
    const ownCentralRef = this.firstText([
      this.readSession('CentralRef'),
      String((this.session as any)?.centralRef ?? ''),
    ]);

    const ownUserId = this.firstText([
      this.readSession('UserId'),
      this.readSession('OldUserId'),
      String((this.session as any)?.userId ?? ''),
    ]);

    const ownName = this.firstText([
      this.readSession('PhFullName'),
      this.readSession('DisplayName'),
      this.readSession('UserPrintName'),
      this.readSession('CentralName'),
    ]);

    this.base_repo.AttendanceDashboard().subscribe({
      next: (data: any) => {
        const rows = Array.isArray(data?.Attendances) ? data.Attendances : [];

        const ownRow = rows.find((row: any) => {
          const rowCentralRef = String(row?.CentralRef ?? '').trim();
          const rowUserId = String(row?.UserId ?? '').trim();
          const rowName = String(row?.CentralName ?? '').trim();

          if (ownCentralRef && rowCentralRef === ownCentralRef) {
            return true;
          }

          if (ownUserId && rowUserId === ownUserId) {
            return true;
          }

          return !ownCentralRef && !ownUserId && ownName && rowName === ownName;
        });

        if (!ownRow) {
          return;
        }

        const managerExtension = this.firstExtension([
          ownRow?.Manager,
          ownRow?.manager,
          ownRow?.Extension,
          ownRow?.ExtensionNo,
          ownRow?.InternalNo,
          ownRow?.PhoneExtension,
          ownRow?.SantralExtension,
          ownRow?.PhAddress3,
        ]);

        if (managerExtension) {
          this.ownExtension.set(managerExtension);

          try {
            this.session.setItem('Manager', managerExtension);
          } catch { }
        }

        const attendanceName = String(ownRow?.CentralName ?? '').trim();
        if (attendanceName) {
          this.ownPersonName.set(attendanceName);
        }
      },
      error: (error: unknown) => {
        console.warn('AttendanceDashboard extension lookup failed:', error);
      },
    });
  }

  private readSession(key: string): string {
    try {
      const value = this.session.getString(key);
      if (value !== null && value !== undefined && String(value).trim() !== '') {
        return String(value).trim();
      }
    } catch { }

    try {
      return String(sessionStorage.getItem(key) ?? '').trim();
    } catch {
      return '';
    }
  }

  private firstExtension(values: any[]): string {
    for (const value of values) {
      const extension = String(value ?? '')
        .trim()
        .replace(/[۰-۹]/g, digit => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
        .replace(/\D+/g, '');

      if (extension.length >= 2 && extension.length <= 8) {
        return extension;
      }
    }

    return '';
  }

  private firstText(values: any[]): string {
    for (const value of values) {
      const text = String(value ?? '').trim();
      if (text) {
        return text;
      }
    }

    return '';
  }
}
