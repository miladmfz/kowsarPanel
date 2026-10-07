import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { forkJoin, of, switchMap } from 'rxjs';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { BiWebApiService } from '../../../services/BiWebApi/BiWebApi.service';
import {
  BiAlertEvent, BiAsyncJob, BiCatalog, BiGrain, BiOperationsHealth, BiPilotParticipantConfiguration,
  BiPilotParticipantOption, BiPilotParticipantWriteRequest, BiPilotReadiness, BiPilotReviewWriteRequest, BiQueryRequest,
  BiSchedule, BiScheduleWriteRequest, BiSnapshot,
} from '../../../services/BiWebApi/bi.models';

type PilotSetupStatus = 'Passed' | 'Pending' | 'Blocked';
interface PilotSetupStep {
  key: string;
  title: string;
  detail: string;
  status: PilotSetupStatus;
  actionLabel?: string;
  route?: string;
}

@Component({
  selector: 'app-bi-operations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bi-operations.component.html',
  styleUrl: './bi-operations.component.scss',
})
export class BiOperationsComponent implements OnInit, OnDestroy {
  protected readonly permissions = inject(PermissionService);
  private readonly api = inject(BiWebApiService);
  private readonly session = inject(SessionStorageService);

  protected readonly catalog = signal<BiCatalog | null>(null);
  protected readonly health = signal<BiOperationsHealth | null>(null);
  protected readonly pilot = signal<BiPilotReadiness | null>(null);
  protected readonly pilotParticipants = signal<BiPilotParticipantConfiguration | null>(null);
  protected readonly jobs = signal<BiAsyncJob[]>([]);
  protected readonly schedules = signal<BiSchedule[]>([]);
  protected readonly snapshots = signal<BiSnapshot[]>([]);
  protected readonly alerts = signal<BiAlertEvent[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal('');
  protected readonly error = signal('');
  protected readonly notice = signal('');
  protected readonly windowDays = signal(7);

  protected datasetKey = 'sales.summary';
  protected fromDate = '';
  protected toDate = '';
  protected grain: BiGrain = 'month';
  protected jobType: 'query' | 'export' = 'query';
  protected scheduleTitle = '';
  protected scheduleType: 'Snapshot' | 'Alert' = 'Snapshot';
  protected cadence: 'Hourly' | 'Daily' | 'Weekly' | 'Monthly' = 'Daily';
  protected metricKey = '';
  protected thresholdOperator: '>' | '>=' | '<' | '<=' | '=' | '!=' = '>=';
  protected thresholdValue: number | null = null;
  protected retentionDays = 30;
  protected pilotRoleStatus: 'Pending' | 'Approved' | 'Rejected' = 'Pending';
  protected pilotRoleNote = '';
  protected pilotBusinessStatus: 'Pending' | 'Approved' | 'Rejected' = 'Pending';
  protected pilotBusinessNote = '';
  protected pilotDecision: 'Pending' | 'Approve' | 'ApproveWithActions' | 'Reject' = 'Pending';
  protected pilotManagerKey = '';
  protected pilotReportViewerKey = '';

  protected readonly selectedDataset = computed(() => this.catalog()?.datasets.find(item => item.datasetKey === this.datasetKey));
  protected readonly metrics = computed(() => this.selectedDataset()?.metrics.filter(item => item.metricKey !== 'data.freshness') ?? []);
  protected readonly pilotSetupSteps = computed<PilotSetupStep[]>(() => {
    const item = this.pilot();
    if (!item) return [];
    const topologyReady = item.availablePilotUsers >= 2 && item.availablePilotDepartments >= 2;
    const participantsReady = item.selectedPilotUsers >= 2 && item.selectedPilotDepartments >= 2 &&
      item.hasManagerParticipant && item.hasReportViewerParticipant;
    const freshnessReady = item.eligibleQueries > 0 && item.staleCount === 0;
    return [
      {
        key: 'topology', title: 'آماده‌سازی کاربران و واحدها', status: topologyReady ? 'Passed' : 'Blocked',
        detail: item.availablePilotUsers.toLocaleString('fa-IR') + ' کاربر فعال در ' +
          item.availablePilotDepartments.toLocaleString('fa-IR') + ' Department؛ حداقل ۲ کاربر در ۲ Department لازم است.',
      },
      {
        key: 'participants', title: 'انتخاب دو persona', status: participantsReady ? 'Passed' : topologyReady ? 'Pending' : 'Blocked',
        detail: participantsReady ? 'Manager و ReportViewer از دو کاربر و Department مجزا انتخاب شده‌اند.' : 'پس از تکمیل topology، Manager و ReportViewer را از فهرست همین صفحه انتخاب کنید.',
      },
      {
        key: 'role', title: 'فعال‌سازی Role پایه', status: item.hasReportViewerRole ? 'Passed' : 'Blocked',
        detail: item.hasReportViewerRole ? 'REPORT_VIEWER برای Central جاری فعال است.' : 'انتخاب persona مجوز امنیتی ایجاد نمی‌کند؛ REPORT_VIEWER باید از RBAC اعطا شود.',
        actionLabel: !item.hasReportViewerRole && this.permissions.isAdmin ? 'مدیریت نقش‌های Central' : undefined,
        route: !item.hasReportViewerRole && this.permissions.isAdmin ? '/rbac/centralrole' : undefined,
      },
      {
        key: 'freshness', title: 'تازگی منبع Sales', status: freshnessReady ? 'Passed' : 'Blocked',
        detail: freshnessReady ? 'Queryهای واجد شرایط بدون NoData یا BehindSelectedRange هستند.' :
          item.eligibleQueries === 0
            ? 'هنوز Query تعاملی واجد شرایط برای ارزیابی تازگی ثبت نشده است.'
            : item.staleCount.toLocaleString('fa-IR') + ' Query stale یا بدون داده ثبت شده است؛ منبع عملیاتی باید reconcile شود.',
        actionLabel: 'بررسی داشبورد Sales', route: '/accounting/gozareshat/bi/workspace',
      },
      {
        key: 'usage', title: 'مصرف واقعی Pilot', status: item.eligibleQueries >= item.targetQueries ? 'Passed' : 'Pending',
        detail: item.pilotEvidenceFrom
          ? item.eligibleQueries.toLocaleString('fa-IR') + ' از ' + item.targetQueries.toLocaleString('fa-IR') +
            ' Query نسخه جاری، پس از شروع Pilot ثبت شده است.'
          : 'شمارش کنترل‌شده بعد از ذخیره کامل دو persona برای نسخه جاری آغاز می‌شود.',
        actionLabel: 'اجرای سناریوهای Pilot', route: '/accounting/gozareshat/bi/workspace',
      },
      {
        key: 'signoff', title: 'Sign-off نسخه جاری',
        status: item.roleCoverageStatus === 'Approved' && item.businessSignOffStatus === 'Approved' ? 'Passed' : 'Pending',
        detail: 'پوشش نقش: ' + this.reviewStatusLabel(item.roleCoverageStatus) +
          '؛ مالک کسب‌وکار: ' + this.reviewStatusLabel(item.businessSignOffStatus) + '.',
      },
    ];
  });
  private pollTimer?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    const activeDate = /^\d{4}\/\d{2}\/\d{2}$/.test(this.session.activeDate) ? this.session.activeDate : '1405/01/01';
    this.toDate = activeDate;
    this.fromDate = `${activeDate.slice(0, 4)}/01/01`;
    this.load();
    this.pollTimer = setInterval(() => {
      if (this.jobs().some(item => item.status === 'Pending' || item.status === 'Running')) this.refreshJobs(false);
    }, 5000);
  }

  ngOnDestroy(): void { if (this.pollTimer) clearInterval(this.pollTimer); }

  protected refresh(): void { this.load(); }

  protected changeWindow(days: number): void {
    this.windowDays.set(days);
    this.api.getOperationsHealth(days).subscribe({ next: value => this.health.set(value), error: error => this.fail(error, 'دریافت شاخص‌های سلامت انجام نشد.') });
  }

  protected datasetChanged(): void {
    this.metricKey = this.metrics()[0]?.metricKey ?? '';
  }

  protected createJob(): void {
    if (!this.validQuery()) return;
    if (this.jobType === 'export' && !this.permissions.canExportBi) {
      this.error.set('مجوز BI_EXPORT برای خروجی لازم است.'); return;
    }
    this.busy.set('job'); this.clearMessages();
    this.api.createAsyncJob(this.jobType, this.query()).subscribe({
      next: job => { this.jobs.update(items => [job, ...items]); this.notice.set('Job در صف امن پردازش قرار گرفت.'); this.busy.set(''); },
      error: error => this.fail(error, 'ایجاد Job انجام نشد.'),
    });
  }

  protected removeJob(job: BiAsyncJob): void {
    this.busy.set(`job-${job.jobCode}`); this.clearMessages();
    this.api.cancelAsyncJob(job.jobCode).subscribe({
      next: () => { this.jobs.update(items => items.filter(item => item.jobCode !== job.jobCode)); this.notice.set(job.status === 'Pending' ? 'Job لغو شد.' : 'نتیجه Job حذف شد.'); this.busy.set(''); },
      error: error => this.fail(error, 'لغو یا حذف Job انجام نشد.'),
    });
  }

  protected download(job: BiAsyncJob): void {
    this.busy.set(`download-${job.jobCode}`); this.clearMessages();
    this.api.getAsyncJobResult(job.jobCode).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob); const anchor = document.createElement('a');
        anchor.href = url; anchor.download = job.fileName || `bi-job-${job.jobCode}`; anchor.click(); URL.revokeObjectURL(url);
        this.busy.set('');
      },
      error: error => this.fail(error, 'دریافت نتیجه Job انجام نشد.'),
    });
  }

  protected createSchedule(): void {
    if (!this.permissions.canManageBiSchedules || !this.validQuery()) return;
    if (!this.scheduleTitle.trim()) { this.error.set('عنوان زمان‌بندی الزامی است.'); return; }
    if (this.scheduleType === 'Alert' && (!this.metricKey || this.thresholdValue === null)) {
      this.error.set('Metric و مقدار آستانه برای Alert الزامی است.'); return;
    }
    const request: BiScheduleWriteRequest = {
      title: this.scheduleTitle.trim(), scheduleType: this.scheduleType, cadence: this.cadence,
      query: this.query(), isEnabled: true, retentionDays: this.retentionDays,
      metricKey: this.scheduleType === 'Alert' ? this.metricKey : null,
      thresholdOperator: this.scheduleType === 'Alert' ? this.thresholdOperator : null,
      thresholdValue: this.scheduleType === 'Alert' ? this.thresholdValue : null,
    };
    this.busy.set('schedule'); this.clearMessages();
    this.api.createSchedule(request).subscribe({
      next: schedule => { this.schedules.update(items => [schedule, ...items]); this.scheduleTitle = ''; this.notice.set('زمان‌بندی با scope فعلی ثبت شد.'); this.busy.set(''); },
      error: error => this.fail(error, 'ثبت زمان‌بندی انجام نشد.'),
    });
  }

  protected runSchedule(schedule: BiSchedule): void {
    this.busy.set(`run-${schedule.scheduleCode}`); this.clearMessages();
    this.api.runSchedule(schedule.scheduleCode).subscribe({
      next: () => { this.notice.set('اجرای زمان‌بندی پذیرفته شد.'); this.busy.set(''); this.loadArtifacts(); },
      error: error => this.fail(error, 'اجرای زمان‌بندی انجام نشد.'),
    });
  }

  protected deleteSchedule(schedule: BiSchedule): void {
    this.busy.set(`schedule-${schedule.scheduleCode}`); this.clearMessages();
    this.api.deleteSchedule(schedule.scheduleCode).subscribe({
      next: () => { this.schedules.update(items => items.filter(item => item.scheduleCode !== schedule.scheduleCode)); this.snapshots.update(items => items.filter(item => item.scheduleCode !== schedule.scheduleCode)); this.alerts.update(items => items.filter(item => item.scheduleCode !== schedule.scheduleCode)); this.notice.set('زمان‌بندی و artifactهای وابسته حذف شدند.'); this.busy.set(''); },
      error: error => this.fail(error, 'حذف زمان‌بندی انجام نشد.'),
    });
  }

  protected cleanup(): void {
    if (!this.permissions.isAdmin) return;
    this.busy.set('cleanup'); this.clearMessages();
    this.api.cleanupBiRetention().subscribe({
      next: result => {
        this.notice.set(`Cleanup کامل شد: ${result.expiredJobs} job، ${result.expiredSnapshots} snapshot، ${result.expiredAlerts} alert و ${result.expiredQueryAudits} audit حذف شد.`);
        this.busy.set(''); this.load();
      },
      error: error => this.fail(error, 'اجرای retention cleanup انجام نشد.'),
    });
  }

  protected savePilotReview(): void {
    const pilot = this.pilot();
    if (!pilot || !this.permissions.canReviewBiPilot) return;
    const request: BiPilotReviewWriteRequest = {
      datasetKey: pilot.datasetKey,
      definitionVersion: pilot.definitionVersion,
      roleCoverageStatus: this.pilotRoleStatus,
      roleCoverageNote: this.pilotRoleNote.trim() || null,
      businessSignOffStatus: this.pilotBusinessStatus,
      businessSignOffNote: this.pilotBusinessNote.trim() || null,
      decision: this.pilotDecision,
      rowVersion: pilot.review?.rowVersion ?? null,
    };
    this.busy.set('pilot-review'); this.clearMessages();
    this.api.savePilotReview(request).pipe(
      switchMap(() => this.api.getPilotReadiness(pilot.datasetKey, pilot.windowDays, pilot.targetQueries)),
    ).subscribe({
      next: readiness => {
        this.pilot.set(readiness); this.setPilotReviewForm(readiness);
        this.notice.set(readiness.rolloutReady ? 'بازبینی ثبت شد و تمام Gateهای Rollout عبور کرده‌اند.' : 'بازبینی Pilot با نسخه فعلی Dataset ثبت شد.');
        this.busy.set('');
      },
      error: error => this.fail(error, 'ثبت بازبینی Pilot انجام نشد.'),
    });
  }

  protected savePilotParticipants(): void {
    const configuration = this.pilotParticipants();
    const pilot = this.pilot();
    if (!configuration || !pilot || !this.permissions.canReviewBiPilot) return;
    const manager = this.parseParticipantKey(this.pilotManagerKey);
    const reportViewer = this.parseParticipantKey(this.pilotReportViewerKey);
    if (manager && reportViewer && manager.userRef === reportViewer.userRef) {
      this.error.set('برای Manager و ReportViewer باید دو کاربر متفاوت Kowsar انتخاب شود.'); return;
    }
    const participants: BiPilotParticipantWriteRequest['participants'] = [];
    if (manager) participants.push({ ...manager, persona: 'Manager' });
    if (reportViewer) participants.push({ ...reportViewer, persona: 'ReportViewer' });
    const request: BiPilotParticipantWriteRequest = {
      datasetKey: configuration.datasetKey,
      definitionVersion: configuration.definitionVersion,
      participants,
      rowVersion: configuration.rowVersion ?? null,
    };
    this.busy.set('pilot-participants'); this.clearMessages();
    this.api.savePilotParticipants(request).pipe(
      switchMap(saved => forkJoin({
        saved: of(saved),
        readiness: this.api.getPilotReadiness(pilot.datasetKey, pilot.windowDays, pilot.targetQueries),
      })),
    ).subscribe({
      next: result => {
        this.pilotParticipants.set(result.saved); this.setPilotParticipantForm(result.saved);
        this.pilot.set(result.readiness); this.setPilotReviewForm(result.readiness);
        this.notice.set('شرکت‌کنندگان Pilot از میان کاربران فعال Kowsar ثبت شدند.'); this.busy.set('');
      },
      error: error => this.fail(error, 'ثبت شرکت‌کنندگان Pilot انجام نشد.'),
    });
  }

  protected participantKey(option: BiPilotParticipantOption): string {
    return `${option.userRef}:${option.departmentRef}`;
  }

  protected persianInteger(value: number): string {
    return value.toLocaleString('fa-IR', { maximumFractionDigits: 0 });
  }

  protected percent(value: number): string { return `${(value * 100).toLocaleString('fa-IR', { maximumFractionDigits: 1 })}٪`; }
  protected statusLabel(value: string): string {
    return ({ Pending: 'در صف', Running: 'در حال اجرا', Succeeded: 'موفق', Failed: 'ناموفق', Cancelled: 'لغوشده' } as Record<string, string>)[value] ?? value;
  }

  protected setupStatusLabel(value: PilotSetupStatus): string {
    return ({ Passed: 'آماده', Pending: 'در انتظار', Blocked: 'مسدود' } as Record<PilotSetupStatus, string>)[value];
  }

  private load(): void {
    this.loading.set(true); this.clearMessages();
    const canViewSalesPilot = this.permissions.isAdmin || this.permissions.hasPermission('REPORT_SALES_VIEW');
    forkJoin({
      catalog: this.api.getCatalog(), health: this.api.getOperationsHealth(this.windowDays()),
      pilot: canViewSalesPilot ? this.api.getPilotReadiness('sales.summary', 90, 100) : of(null), jobs: this.api.getAsyncJobs(),
      pilotParticipants: canViewSalesPilot && this.permissions.canReviewBiPilot ? this.api.getPilotParticipants('sales.summary') : of(null),
      schedules: this.permissions.canManageBiSchedules ? this.api.getSchedules() : of([] as BiSchedule[]),
      snapshots: this.api.getSnapshots(), alerts: this.api.getAlerts(),
    }).subscribe({
      next: result => {
        this.catalog.set(result.catalog); this.health.set(result.health); this.pilot.set(result.pilot); this.setPilotReviewForm(result.pilot);
        this.pilotParticipants.set(result.pilotParticipants); this.setPilotParticipantForm(result.pilotParticipants);
        this.jobs.set(result.jobs); this.schedules.set(result.schedules);
        this.snapshots.set(result.snapshots); this.alerts.set(result.alerts);
        if (!result.catalog.datasets.some(item => item.datasetKey === this.datasetKey)) this.datasetKey = result.catalog.datasets[0]?.datasetKey ?? '';
        this.datasetChanged(); this.loading.set(false);
      },
      error: error => { this.loading.set(false); this.fail(error, 'بارگذاری مرکز عملیات BI انجام نشد.'); },
    });
  }

  private refreshJobs(showError: boolean): void {
    this.api.getAsyncJobs().subscribe({ next: jobs => this.jobs.set(jobs), error: error => { if (showError) this.fail(error, 'به‌روزرسانی Jobها انجام نشد.'); } });
  }

  private loadArtifacts(): void {
    forkJoin({ schedules: this.api.getSchedules(), snapshots: this.api.getSnapshots(), alerts: this.api.getAlerts() }).subscribe({
      next: result => { this.schedules.set(result.schedules); this.snapshots.set(result.snapshots); this.alerts.set(result.alerts); },
      error: error => this.fail(error, 'به‌روزرسانی artifactها انجام نشد.'),
    });
  }

  private query(): BiQueryRequest {
    return { datasetKey: this.datasetKey, fromDate: this.fromDate, toDate: this.toDate, grain: this.grain, departmentRefs: [] };
  }

  private setPilotReviewForm(pilot: BiPilotReadiness | null): void {
    this.pilotRoleStatus = pilot?.review?.roleCoverageStatus ?? 'Pending';
    this.pilotRoleNote = pilot?.review?.roleCoverageNote ?? '';
    this.pilotBusinessStatus = pilot?.review?.businessSignOffStatus ?? 'Pending';
    this.pilotBusinessNote = pilot?.review?.businessSignOffNote ?? '';
    this.pilotDecision = pilot?.review?.decision ?? 'Pending';
  }

  private setPilotParticipantForm(configuration: BiPilotParticipantConfiguration | null): void {
    const manager = configuration?.participants.find(item => item.persona === 'Manager');
    const reportViewer = configuration?.participants.find(item => item.persona === 'ReportViewer');
    this.pilotManagerKey = manager ? `${manager.userRef}:${manager.departmentRef}` : '';
    this.pilotReportViewerKey = reportViewer ? `${reportViewer.userRef}:${reportViewer.departmentRef}` : '';
  }

  private reviewStatusLabel(value: string): string {
    return ({ Approved: 'تأییدشده', Rejected: 'ردشده', Pending: 'در انتظار', ManualVerificationRequired: 'نیازمند بررسی دستی', PendingBusinessOwner: 'در انتظار مالک کسب‌وکار' } as Record<string, string>)[value] ?? value;
  }

  private parseParticipantKey(value: string): { userRef: number; departmentRef: number } | null {
    if (!/^\d+:\d+$/.test(value)) return null;
    const [userRef, departmentRef] = value.split(':').map(Number);
    return userRef > 0 && departmentRef > 0 ? { userRef, departmentRef } : null;
  }

  private validQuery(): boolean {
    if (!this.datasetKey || !/^\d{4}\/\d{2}\/\d{2}$/.test(this.fromDate) || !/^\d{4}\/\d{2}\/\d{2}$/.test(this.toDate) || this.fromDate > this.toDate) {
      this.error.set('Dataset و بازه شمسی معتبر با الگوی ۱۴۰۵/۰۱/۰۱ وارد کنید.'); return false;
    }
    return true;
  }

  private clearMessages(): void { this.error.set(''); this.notice.set(''); }
  private fail(error: any, fallback: string): void {
    this.error.set(error?.error?.error ?? error?.error?.Error ?? fallback); this.busy.set('');
  }
}
