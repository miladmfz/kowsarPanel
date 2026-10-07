import { provideZonelessChangeDetection, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';
import { BulletinGroupNameSellRptComponent } from '../BulletinGroupNameSellRpt/BulletinGroupNameSellRpt.component';
import { GoodBulletinGroupSellRptComponent } from '../GoodBulletinGroupSellRpt/GoodBulletinGroupSellRpt.component';
import { PeriodicCustomerPurchaseSeparateRptComponent } from '../PeriodicCustomerPurchaseSeparateRpt/PeriodicCustomerPurchaseSeparateRpt.component';
import { PeriodicGoodSellRptComponent } from '../PeriodicGoodSellRpt/PeriodicGoodSellRpt.component';
import { SumofPeriodicGoodSellRptComponent } from '../SumofPeriodicGoodSellRpt/SumofPeriodicGoodSellRpt.component';
import { PeriodicReportBaseComponent } from './periodic-report.base';

describe('Periodic reports', () => {
  let repo: jasmine.SpyObj<ReportWebApiService>;
  let notification: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    repo = jasmine.createSpyObj<ReportWebApiService>('ReportWebApiService', [
      'GetGridSchemaVisible',
      'SumofPeriodicGoodSellRpt',
      'PeriodicGoodSellRpt',
      'PeriodicCustomerPurchaseSeparateRpt',
      'BulletinGroupNameSellRpt',
      'GoodBulletinGroupSellRpt',
    ]);
    notification = jasmine.createSpyObj<NotificationService>(
      'NotificationService',
      ['error', 'warning'],
    );
    repo.GetGridSchemaVisible.and.returnValue(
      of({
        GridSchemas: [
          {
            FieldName: 'FactorDate',
            Caption: 'تاریخ',
            Width: '80',
            Visible: 'True',
            Separator: 'False',
          },
          {
            FieldName: 'Amount',
            Caption: 'تعداد',
            Width: '80',
            Visible: 'True',
            Separator: 'True',
          },
        ],
      } as never),
    );
    repo.SumofPeriodicGoodSellRpt.and.returnValue(of({ Reports: [] } as never));
    repo.PeriodicGoodSellRpt.and.returnValue(of({ Reports: [] } as never));
    repo.PeriodicCustomerPurchaseSeparateRpt.and.returnValue(
      of({ Reports: [] } as never),
    );
    repo.BulletinGroupNameSellRpt.and.returnValue(of({ Reports: [] } as never));
    repo.GoodBulletinGroupSellRpt.and.returnValue(of({ Reports: [] } as never));

    await TestBed.configureTestingModule({
      imports: [
        SumofPeriodicGoodSellRptComponent,
        PeriodicGoodSellRptComponent,
        PeriodicCustomerPurchaseSeparateRptComponent,
        BulletinGroupNameSellRptComponent,
        GoodBulletinGroupSellRptComponent,
      ],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ReportWebApiService, useValue: repo },
        { provide: NotificationService, useValue: notification },
        {
          provide: AgGridMemoryService,
          useValue: jasmine.createSpyObj<AgGridMemoryService>(
            'AgGridMemoryService',
            ['get', 'save'],
          ),
        },
        { provide: ThemeService, useValue: { theme$: of('light') } },
        {
          provide: SessionStorageService,
          useValue: { activeDate: '1405/06/31' },
        },
      ],
    })
      .overrideComponent(SumofPeriodicGoodSellRptComponent, {
        set: { template: '' },
      })
      .overrideComponent(PeriodicGoodSellRptComponent, {
        set: { template: '' },
      })
      .overrideComponent(PeriodicCustomerPurchaseSeparateRptComponent, {
        set: { template: '' },
      })
      .overrideComponent(BulletinGroupNameSellRptComponent, {
        set: { template: '' },
      })
      .overrideComponent(GoodBulletinGroupSellRptComponent, {
        set: { template: '' },
      })
      .compileComponents();
  });

  function createComponent(
    componentType: Type<PeriodicReportBaseComponent>,
    reportForm: string,
  ): {
    fixture: ComponentFixture<PeriodicReportBaseComponent>;
    component: PeriodicReportBaseComponent;
  } {
    const fixture = TestBed.createComponent(componentType);
    const component = fixture.componentInstance;
    component.ReportData = {
      ReportCode: '50',
      ReportForm: reportForm,
      ReportTitle: `عنوان ${reportForm}`,
    };
    fixture.detectChanges();
    return { fixture, component };
  }

  it('routes all reports with the Delphi monthly range and department filters', () => {
    const configurations = [
      {
        component: SumofPeriodicGoodSellRptComponent,
        reportForm: 'SumofPeriodicGoodSellRpt',
        api: repo.SumofPeriodicGoodSellRpt,
      },
      {
        component: PeriodicGoodSellRptComponent,
        reportForm: 'PeriodicGoodSellRpt',
        api: repo.PeriodicGoodSellRpt,
      },
      {
        component: PeriodicCustomerPurchaseSeparateRptComponent,
        reportForm: 'PeriodicCustomerPurchaseSeparateRpt',
        api: repo.PeriodicCustomerPurchaseSeparateRpt,
      },
      {
        component: BulletinGroupNameSellRptComponent,
        reportForm: 'BulletinGroupNameSellRpt',
        api: repo.BulletinGroupNameSellRpt,
      },
      {
        component: GoodBulletinGroupSellRptComponent,
        reportForm: 'GoodBulletinGroupSellRpt',
        api: repo.GoodBulletinGroupSellRpt,
      },
    ];

    for (const configuration of configurations) {
      const { component } = createComponent(
        configuration.component,
        configuration.reportForm,
      );
      component.EditForm_SearchTarget.patchValue({ Department: '1,2' });

      component.loadList();

      expect(configuration.api).toHaveBeenCalledWith(
        jasmine.objectContaining({
          ClassName: configuration.reportForm,
          FromDate: '1405/01',
          ToDate: '1405/06',
          Department: '1,2',
        }),
      );
    }
  });

  it('sends the annual grouping option from reports that support it', () => {
    const { component } = createComponent(
      BulletinGroupNameSellRptComponent,
      'BulletinGroupNameSellRpt',
    );
    component.EditForm_SearchTarget.patchValue({ IsYear: true });

    component.loadList();

    expect(repo.BulletinGroupNameSellRpt).toHaveBeenCalledWith(
      jasmine.objectContaining({ IsYear: true }),
    );
    expect(component.supportsAnnual).toBeTrue();
  });

  it('calculates amount and price totals from returned rows', () => {
    repo.SumofPeriodicGoodSellRpt.and.returnValue(
      of({
        Reports: [
          {
            FactorDate: '1405/01',
            Amount: '2.5',
            SumPrice: '1000',
            nSumPrice: '1200',
          },
          {
            FactorDate: '1405/02',
            Amount: '1.5',
            SumPrice: '800',
            nSumPrice: '900',
          },
        ],
      } as never),
    );
    const { component } = createComponent(
      SumofPeriodicGoodSellRptComponent,
      'SumofPeriodicGoodSellRpt',
    );

    component.loadList();

    expect(component.totals()).toEqual({
      count: 2,
      amount: 4,
      net: 1800,
      gross: 2100,
    });
    expect(component.chartModel()).toEqual({
      categories: ['1405/01', '1405/02'],
      series: [
        { name: 'تعداد', data: [2.5, 1.5] },
        { name: 'مبلغ خالص', data: [1000, 800] },
        { name: 'مبلغ ناخالص', data: [1200, 900] },
      ],
    });
    component.toggleReportView();
    expect(component.showChart()).toBeTrue();
    component.clearFilter();
    expect(component.showChart()).toBeFalse();
  });

  it('rejects an invalid or reversed month before requesting the API', () => {
    const { component } = createComponent(
      PeriodicGoodSellRptComponent,
      'PeriodicGoodSellRpt',
    );
    component.EditForm_SearchTarget.patchValue({
      FromDate: '1405/13',
      ToDate: '1405/06',
    });

    component.loadList();

    expect(repo.PeriodicGoodSellRpt).not.toHaveBeenCalled();
    expect(notification.warning).toHaveBeenCalled();
  });

  it('exposes a controlled request error', () => {
    repo.PeriodicGoodSellRpt.and.returnValue(
      throwError(() => new Error('network')),
    );
    const { component } = createComponent(
      PeriodicGoodSellRptComponent,
      'PeriodicGoodSellRpt',
    );

    component.loadList();

    expect(component.records()).toEqual([]);
    expect(component.hasLoaded()).toBeTrue();
    expect(component.loading()).toBeFalse();
    expect(component.errorMessage()).toContain('خطا');
    expect(notification.error).toHaveBeenCalled();
  });
});
