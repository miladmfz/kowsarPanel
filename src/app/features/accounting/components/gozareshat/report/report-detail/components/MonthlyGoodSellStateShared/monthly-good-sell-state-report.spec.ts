import { provideZonelessChangeDetection, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';
import { BuyStyleMonthlyGoodSellStateRptComponent } from '../BuyStyleMonthlyGoodSellStateRpt/BuyStyleMonthlyGoodSellStateRpt.component';
import { FactorTypeMonthlyGoodSellStateRptComponent } from '../FactorTypeMonthlyGoodSellStateRpt/FactorTypeMonthlyGoodSellStateRpt.component';
import { MonthlyGoodSellStateRptComponent } from '../MonthlyGoodSellStateRpt/MonthlyGoodSellStateRpt.component';
import { MonthlyGoodSellStateReportBaseComponent } from './monthly-good-sell-state-report.base';

describe('MonthlyGoodSellState reports', () => {
  let repo: jasmine.SpyObj<ReportWebApiService>;
  let notification: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    repo = jasmine.createSpyObj<ReportWebApiService>('ReportWebApiService', [
      'GetGridSchemaVisible',
      'FactorTypeMonthlyGoodSellStateRpt',
      'BuyStyleMonthlyGoodSellStateRpt',
      'MonthlyGoodSellStateRpt',
    ]);
    notification = jasmine.createSpyObj<NotificationService>(
      'NotificationService',
      ['error', 'warning'],
    );
    repo.GetGridSchemaVisible.and.returnValue(
      of({
        GridSchemas: [
          {
            FieldName: 'TheGoodCode',
            Caption: 'کد کالا',
            Width: '80',
            Visible: 'True',
            Separator: 'False',
          },
          {
            FieldName: 'FacAmountSell',
            Caption: 'تعداد فروش',
            Width: '100',
            Visible: 'True',
            Separator: 'False',
          },
        ],
      } as never),
    );
    repo.FactorTypeMonthlyGoodSellStateRpt.and.returnValue(
      of({ Reports: [] } as never),
    );
    repo.BuyStyleMonthlyGoodSellStateRpt.and.returnValue(
      of({ Reports: [] } as never),
    );
    repo.MonthlyGoodSellStateRpt.and.returnValue(of({ Reports: [] } as never));

    await TestBed.configureTestingModule({
      imports: [
        FactorTypeMonthlyGoodSellStateRptComponent,
        BuyStyleMonthlyGoodSellStateRptComponent,
        MonthlyGoodSellStateRptComponent,
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
      .overrideComponent(FactorTypeMonthlyGoodSellStateRptComponent, {
        set: { template: '' },
      })
      .overrideComponent(BuyStyleMonthlyGoodSellStateRptComponent, {
        set: { template: '' },
      })
      .overrideComponent(MonthlyGoodSellStateRptComponent, {
        set: { template: '' },
      })
      .compileComponents();
  });

  function createComponent(
    componentType: Type<MonthlyGoodSellStateReportBaseComponent>,
    reportForm: string,
  ): {
    fixture: ComponentFixture<MonthlyGoodSellStateReportBaseComponent>;
    component: MonthlyGoodSellStateReportBaseComponent;
  } {
    const fixture = TestBed.createComponent(componentType);
    const component = fixture.componentInstance;
    component.ReportData = {
      ReportCode: '40',
      ReportForm: reportForm,
      ReportTitle: `عنوان ${reportForm}`,
    };
    fixture.detectChanges();
    return { fixture, component };
  }

  it('routes each report to its matching API with Delphi filters', () => {
    const configurations = [
      {
        component: FactorTypeMonthlyGoodSellStateRptComponent,
        reportForm: 'FactorTypeMonthlyGoodSellStateRpt',
        api: repo.FactorTypeMonthlyGoodSellStateRpt,
      },
      {
        component: BuyStyleMonthlyGoodSellStateRptComponent,
        reportForm: 'BuyStyleMonthlyGoodSellStateRpt',
        api: repo.BuyStyleMonthlyGoodSellStateRpt,
      },
      {
        component: MonthlyGoodSellStateRptComponent,
        reportForm: 'MonthlyGoodSellStateRpt',
        api: repo.MonthlyGoodSellStateRpt,
      },
    ];

    for (const configuration of configurations) {
      const { component } = createComponent(
        configuration.component,
        configuration.reportForm,
      );
      component.EditForm_SearchTarget.patchValue({
        Department: '1,2',
        WithMainCode: true,
      });

      component.loadList();

      expect(configuration.api).toHaveBeenCalledWith(
        jasmine.objectContaining({
          ClassName: configuration.reportForm,
          FromDate: '1405/01/01',
          ToDate: '1405/06/31',
          Department: '1,2',
          WithMainCode: true,
        }),
      );
    }
  });

  it('adds Delphi pivot columns returned by the procedure and calculates totals', () => {
    repo.BuyStyleMonthlyGoodSellStateRpt.and.returnValue(
      of({
        Reports: [
          {
            TheGoodCode: '7',
            FacAmountSell: '2.5',
            SumPriceSell: '1200',
            SumnPriceSell: '1400',
            AllFacAmount: '8',
            '[نقدی]': '2.5',
            '[مبلغ خالص نقدی]': '1200',
          },
          {
            TheGoodCode: '8',
            FacAmountSell: '1.5',
            SumPriceSell: '800',
            SumnPriceSell: '900',
            AllFacAmount: '4',
            '[نقدی]': '1.5',
            '[مبلغ خالص نقدی]': '800',
          },
        ],
      } as never),
    );
    const { component } = createComponent(
      BuyStyleMonthlyGoodSellStateRptComponent,
      'BuyStyleMonthlyGoodSellStateRpt',
    );

    component.loadList();

    expect(component.column_name_1.map((column) => column.field)).toContain(
      '[نقدی]',
    );
    expect(component.column_name_1.map((column) => column.field)).toContain(
      '[مبلغ خالص نقدی]',
    );
    expect(component.totals()).toEqual({
      count: 2,
      periodAmount: 4,
      periodNet: 2000,
      periodGross: 2300,
      allAmount: 12,
    });
    expect(component.chartModel()).toEqual({
      categories: ['7', '8'],
      series: [
        { name: 'تعداد فروش دوره', data: [2.5, 1.5] },
        { name: 'فروش خالص دوره', data: [1200, 800] },
        { name: 'فروش ناخالص دوره', data: [1400, 900] },
      ],
    });
    component.toggleReportView();
    expect(component.showChart()).toBeTrue();
    component.clearFilter();
    expect(component.showChart()).toBeFalse();
  });

  it('does not request a reversed date range', () => {
    const { component } = createComponent(
      MonthlyGoodSellStateRptComponent,
      'MonthlyGoodSellStateRpt',
    );
    component.EditForm_SearchTarget.patchValue({
      FromDate: '1405/07/01',
      ToDate: '1405/06/31',
    });

    component.loadList();

    expect(repo.MonthlyGoodSellStateRpt).not.toHaveBeenCalled();
    expect(notification.warning).toHaveBeenCalled();
  });

  it('exposes a controlled request error', () => {
    repo.FactorTypeMonthlyGoodSellStateRpt.and.returnValue(
      throwError(() => new Error('network')),
    );
    const { component } = createComponent(
      FactorTypeMonthlyGoodSellStateRptComponent,
      'FactorTypeMonthlyGoodSellStateRpt',
    );

    component.loadList();

    expect(component.records()).toEqual([]);
    expect(component.hasLoaded()).toBeTrue();
    expect(component.loading()).toBeFalse();
    expect(component.errorMessage()).toContain('خطا');
    expect(notification.error).toHaveBeenCalled();
  });
});
