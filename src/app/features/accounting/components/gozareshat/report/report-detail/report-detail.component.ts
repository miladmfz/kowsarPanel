import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';
import { AllGoodsRptComponent } from './components/AllGoodsRpt/AllGoodsRpt.component';
import { BulletinGroupNameSellRptComponent } from './components/BulletinGroupNameSellRpt/BulletinGroupNameSellRpt.component';
import { BuyStyleMonthlyGoodSellStateRptComponent } from './components/BuyStyleMonthlyGoodSellStateRpt/BuyStyleMonthlyGoodSellStateRpt.component';
import { CustomerForoshRptComponent } from './components/CustomerForoshRpt/CustomerForoshRpt.component';
import { CustomerIdentificationRptComponent } from './components/CustomerIdentificationRpt/CustomerIdentificationRpt.component';
import { FactorTypeMonthlyGoodSellStateRptComponent } from './components/FactorTypeMonthlyGoodSellStateRpt/FactorTypeMonthlyGoodSellStateRpt.component';
import { GoodBulletinGroupSellRptComponent } from './components/GoodBulletinGroupSellRpt/GoodBulletinGroupSellRpt.component';
import { GoodFactorRowsRptComponent } from './components/GoodFactorRowsRpt/GoodFactorRowsRpt.component';
import { GoodFactorRptComponent } from './components/GoodFactorRpt/GoodFactorRpt.component';
import { GoodForoshRptComponent } from './components/GoodForoshRpt/GoodForoshRpt.component';
import { GoodGroupRptComponent } from './components/GoodGroupRpt/GoodGroupRpt.component';
import { GoodHistoryRptComponent } from './components/GoodHistoryRpt/GoodHistoryRpt.component';
import { GoodInStackRptComponent } from './components/GoodInStackRpt/GoodInStackRpt.component';
import { GoodSefareshPointRptComponent } from './components/GoodSefareshPointRpt/GoodSefareshPointRpt.component';
import { LegacyReportComponent } from './components/LegacyReport/legacy-report.component';
import { MonthlyGoodSellStateRptComponent } from './components/MonthlyGoodSellStateRpt/MonthlyGoodSellStateRpt.component';
import { PeriodicCustomerPurchaseSeparateRptComponent } from './components/PeriodicCustomerPurchaseSeparateRpt/PeriodicCustomerPurchaseSeparateRpt.component';
import { PeriodicGoodSellRptComponent } from './components/PeriodicGoodSellRpt/PeriodicGoodSellRpt.component';
import { PeriodicInOutGoodStateRptComponent } from './components/PeriodicInOutGoodStateRpt/PeriodicInOutGoodStateRpt.component';
import { SumofPeriodicGoodSellRptComponent } from './components/SumofPeriodicGoodSellRpt/SumofPeriodicGoodSellRpt.component';
import { isLegacyReportForm } from './legacy-report.contracts';

interface ReportDescriptor {
  ReportCode?: string | number;
  ReportForm?: string;
  ReportTitle?: string;
}

@Component({
  standalone: true,
  selector: 'app-report-detail',
  templateUrl: './report-detail.component.html',
  imports: [
    AllGoodsRptComponent,
    BulletinGroupNameSellRptComponent,
    BuyStyleMonthlyGoodSellStateRptComponent,
    CustomerForoshRptComponent,
    CustomerIdentificationRptComponent,
    FactorTypeMonthlyGoodSellStateRptComponent,
    GoodBulletinGroupSellRptComponent,
    GoodFactorRowsRptComponent,
    GoodFactorRptComponent,
    GoodForoshRptComponent,
    GoodGroupRptComponent,
    GoodHistoryRptComponent,
    GoodInStackRptComponent,
    GoodSefareshPointRptComponent,
    LegacyReportComponent,
    MonthlyGoodSellStateRptComponent,
    PeriodicCustomerPurchaseSeparateRptComponent,
    PeriodicGoodSellRptComponent,
    PeriodicInOutGoodStateRptComponent,
    SumofPeriodicGoodSellRptComponent,
  ],
})
export class ReportDetailComponent implements OnInit {
  private readonly repo = inject(ReportWebApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  readonly reportData = signal<ReportDescriptor | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => this.loadReport(params.get('id') ?? ''));
  }

  isLegacy(reportForm: unknown): reportForm is string {
    return isLegacyReportForm(reportForm);
  }

  private loadReport(reportCode: string): void {
    this.loading.set(true);
    this.notFound.set(false);
    this.reportData.set(null);
    this.repo
      .GetReportsByCode(reportCode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (response: unknown) => {
          const reports =
            response && typeof response === 'object'
              ? (response as { Reports?: unknown }).Reports
              : undefined;
          const report = Array.isArray(reports)
            ? (reports[0] as ReportDescriptor | undefined)
            : undefined;
          this.reportData.set(report ?? null);
          this.notFound.set(!report);
          this.loading.set(false);
        },
        error: () => {
          this.loading.set(false);
          this.notFound.set(true);
          this.notifications.error('خطا در دریافت مشخصات گزارش');
        },
      });
  }
}
