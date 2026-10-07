import { provideZonelessChangeDetection, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';
import { AllGoodsRptComponent } from '../AllGoodsRpt/AllGoodsRpt.component';
import { GoodGroupRptComponent } from '../GoodGroupRpt/GoodGroupRpt.component';
import { GoodHistoryRptComponent } from '../GoodHistoryRpt/GoodHistoryRpt.component';
import { GoodInStackRptComponent } from '../GoodInStackRpt/GoodInStackRpt.component';
import { GoodSefareshPointRptComponent } from '../GoodSefareshPointRpt/GoodSefareshPointRpt.component';
import { PeriodicInOutGoodStateRptComponent } from '../PeriodicInOutGoodStateRpt/PeriodicInOutGoodStateRpt.component';
import { InventoryReportBaseComponent } from './inventory-report.base';

describe('Inventory reports', () => {
  let repo: jasmine.SpyObj<ReportWebApiService>;
  let notification: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    repo = jasmine.createSpyObj<ReportWebApiService>('ReportWebApiService', [
      'GetGridSchemaVisible',
      'GetStacks',
      'AllGoodsRpt',
      'GoodInStackRpt',
      'GoodHistoryRpt',
      'GoodGroupRpt',
      'GoodSefareshPointRpt',
      'PeriodicInOutGoodStateRpt',
    ]);
    notification = jasmine.createSpyObj<NotificationService>(
      'NotificationService',
      ['error', 'warning'],
    );
    repo.GetGridSchemaVisible.and.returnValue(
      of({
        GridSchemas: [
          {
            FieldName: 'GoodName',
            Caption: 'نام کالا',
            Width: '180',
            Visible: 'True',
          },
          {
            FieldName: 'Amount',
            Caption: 'تعداد',
            Width: '90',
            Visible: 'True',
          },
        ],
      } as never),
    );
    repo.GetStacks.and.returnValue(
      of({ Stacks: [{ StackCode: 1, Name: 'انبار اصلی' }] } as never),
    );
    repo.AllGoodsRpt.and.returnValue(of({ Reports: [] } as never));
    repo.GoodInStackRpt.and.returnValue(of({ Reports: [] } as never));
    repo.GoodHistoryRpt.and.returnValue(of({ Reports: [] } as never));
    repo.GoodGroupRpt.and.returnValue(of({ Reports: [] } as never));
    repo.GoodSefareshPointRpt.and.returnValue(of({ Reports: [] } as never));
    repo.PeriodicInOutGoodStateRpt.and.returnValue(
      of({ Reports: [] } as never),
    );

    await TestBed.configureTestingModule({
      imports: [
        AllGoodsRptComponent,
        GoodInStackRptComponent,
        GoodHistoryRptComponent,
        GoodGroupRptComponent,
        GoodSefareshPointRptComponent,
        PeriodicInOutGoodStateRptComponent,
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
      ],
    })
      .overrideComponent(AllGoodsRptComponent, { set: { template: '' } })
      .overrideComponent(GoodInStackRptComponent, { set: { template: '' } })
      .overrideComponent(GoodHistoryRptComponent, { set: { template: '' } })
      .overrideComponent(GoodGroupRptComponent, { set: { template: '' } })
      .overrideComponent(GoodSefareshPointRptComponent, {
        set: { template: '' },
      })
      .overrideComponent(PeriodicInOutGoodStateRptComponent, {
        set: { template: '' },
      })
      .compileComponents();
  });

  function createComponent<T extends InventoryReportBaseComponent>(
    componentType: Type<T>,
    reportForm: string,
  ): { fixture: ComponentFixture<T>; component: T } {
    const fixture = TestBed.createComponent(componentType);
    const component = fixture.componentInstance;
    component.ReportData = {
      ReportCode: '70',
      ReportForm: reportForm,
      ReportTitle: `عنوان ${reportForm}`,
    };
    fixture.detectChanges();
    return { fixture, component };
  }

  it('loads AllGoods only on demand and sends its Delphi filters', () => {
    const { component } = createComponent(AllGoodsRptComponent, 'AllGoodsRpt');

    expect(repo.GetGridSchemaVisible).toHaveBeenCalledWith('TAllGoodsRpt');
    expect(repo.AllGoodsRpt).not.toHaveBeenCalled();

    component.EditForm_SearchTarget.patchValue({
      SearchTarget: 'چای',
      Department: '1,2',
      WithMainCode: true,
    });
    component.loadList();

    expect(repo.AllGoodsRpt).toHaveBeenCalledWith(
      jasmine.objectContaining({
        ClassName: 'AllGoodsRpt',
        SearchTarget: 'چای',
        Department: '1,2',
        WithMainCode: true,
      }),
    );
  });

  it('loads stacks and preserves the Delphi active-only default', () => {
    const { component } = createComponent(
      GoodInStackRptComponent,
      'GoodInStackRpt',
    );

    expect(repo.GetStacks).toHaveBeenCalled();
    expect(component.stacks()).toEqual([{ StackCode: 1, Name: 'انبار اصلی' }]);
    expect(component.EditForm_SearchTarget.controls.ActiveState.value).toBe(
      'active',
    );

    component.EditForm_SearchTarget.patchValue({ StackCode: '1' });
    component.loadList();

    expect(repo.GoodInStackRpt).toHaveBeenCalledWith(
      jasmine.objectContaining({ StackCode: '1', ActiveState: 'active' }),
    );
  });

  it('rejects invalid history dates and non-numeric partial good codes', () => {
    const { component } = createComponent(
      GoodHistoryRptComponent,
      'GoodHistoryRpt',
    );

    component.EditForm_SearchTarget.patchValue({
      FromDate: '1405/13/01',
      ToDate: '1405/01/01',
    });
    component.loadList();
    expect(repo.GoodHistoryRpt).not.toHaveBeenCalled();

    component.EditForm_SearchTarget.patchValue({
      FromDate: '1405/01/01',
      ToDate: '1405/12/29',
      GoodCode: 'A-100',
      WithMainCode: false,
    });
    component.loadList();

    expect(repo.GoodHistoryRpt).not.toHaveBeenCalled();
    expect(notification.warning).toHaveBeenCalledTimes(2);
  });

  it('sends all supported GoodHistory filters after validation', () => {
    const { component } = createComponent(
      GoodHistoryRptComponent,
      'GoodHistoryRpt',
    );
    component.EditForm_SearchTarget.patchValue({
      FromDate: '1405/01/01',
      ToDate: '1405/12/29',
      Department: '1,2',
      GoodCode: '100',
      StackCode: '1',
      ProviderCode: '25',
    });

    component.loadList();

    expect(repo.GoodHistoryRpt).toHaveBeenCalledWith(
      jasmine.objectContaining({
        FromDate: '1405/01/01',
        ToDate: '1405/12/29',
        Department: '1,2',
        GoodCode: '100',
        StackCode: '1',
        ProviderCode: '25',
      }),
    );
  });

  it('auto-loads the two reports that Delphi opens immediately', () => {
    createComponent(GoodGroupRptComponent, 'GoodGroupRpt');
    createComponent(GoodSefareshPointRptComponent, 'GoodSefareshPointRpt');

    expect(repo.GoodGroupRpt).toHaveBeenCalledTimes(1);
    expect(repo.GoodSefareshPointRpt).toHaveBeenCalledTimes(1);
  });

  it('sends group/subgroup and periodic stack-grouping options', () => {
    const { component: group } = createComponent(
      GoodGroupRptComponent,
      'GoodGroupRpt',
    );
    repo.GoodGroupRpt.calls.reset();
    group.EditForm_SearchTarget.patchValue({
      GroupCode: '10',
      GoodCode: 'کالای آزمایشی',
      WithMainCode: true,
      IncludeSubgroups: true,
    });
    group.loadList();

    expect(repo.GoodGroupRpt).toHaveBeenCalledWith(
      jasmine.objectContaining({
        GroupCode: '10',
        GoodCode: 'کالای آزمایشی',
        WithMainCode: true,
        IncludeSubgroups: true,
      }),
    );

    const { component: periodic } = createComponent(
      PeriodicInOutGoodStateRptComponent,
      'PeriodicInOutGoodStateRpt',
    );
    periodic.EditForm_SearchTarget.patchValue({
      FromDate: '1405/01/01',
      ToDate: '1405/06/31',
      Department: '3',
      WithMainCode: true,
      WithStackGrouping: true,
    });
    periodic.loadList();

    expect(repo.PeriodicInOutGoodStateRpt).toHaveBeenCalledWith(
      jasmine.objectContaining({
        FromDate: '1405/01/01',
        ToDate: '1405/06/31',
        Department: '3',
        WithMainCode: true,
        WithStackGrouping: true,
      }),
    );
  });

  it('calculates inventory and movement summaries from returned rows', () => {
    repo.AllGoodsRpt.and.returnValue(
      of({
        Reports: [
          { Amount: '2.5', MaxSellPrice: '1000' },
          { Amount: '1.5', MaxSellPrice: '2000' },
        ],
      } as never),
    );
    const { component: allGoods } = createComponent(
      AllGoodsRptComponent,
      'AllGoodsRpt',
    );
    allGoods.loadList();

    expect(allGoods.summaryCards()).toEqual([
      { label: 'تعداد رکورد', value: 2 },
      { label: 'جمع تعداد', value: 4 },
      { label: 'ارزش موجودی به نرخ فروش', value: 5500 },
    ]);

    repo.GoodHistoryRpt.and.returnValue(
      of({
        Reports: [
          { InStack: '10', OutStack: '3', MaxSellPrice: '100' },
          { InStack: '2', OutStack: '4', MaxSellPrice: '200' },
        ],
      } as never),
    );
    const { component: history } = createComponent(
      GoodHistoryRptComponent,
      'GoodHistoryRpt',
    );
    history.loadList();

    expect(history.summaryCards()).toEqual([
      { label: 'تعداد رکورد', value: 2 },
      { label: 'جمع ورودی', value: 7 },
      { label: 'جمع خروجی', value: 2 },
      { label: 'خالص گردش', value: 5 },
      { label: 'ارزش ورودی به نرخ فروش', value: 1400 },
      { label: 'ارزش خروجی به نرخ فروش', value: 1100 },
    ]);
  });

  it('builds report-specific charts and keeps the chart view controlled', () => {
    const { component: allGoods } = createComponent(
      AllGoodsRptComponent,
      'AllGoodsRpt',
    );
    allGoods.records.set([
      { GoodName: 'کالای الف', Amount: '2.5', MaxSellPrice: '1000' },
    ]);
    expect(allGoods.chartModel()).toEqual({
      categories: ['کالای الف'],
      series: [
        { name: 'موجودی', data: [2.5] },
        { name: 'ارزش موجودی به نرخ فروش', data: [2500] },
      ],
    });
    allGoods.toggleReportView();
    expect(allGoods.showChart()).toBeTrue();
    allGoods.clearFilter();
    expect(allGoods.showChart()).toBeFalse();

    const { component: inStack } = createComponent(
      GoodInStackRptComponent,
      'GoodInStackRpt',
    );
    inStack.records.set([
      {
        GoodName: 'کالای ب',
        StackName: 'انبار اصلی',
        Amount: 3,
        MaxSellPrice: 20,
      },
    ]);
    expect(inStack.chartModel()).toEqual({
      categories: ['کالای ب - انبار اصلی'],
      series: [
        { name: 'موجودی', data: [3] },
        { name: 'ارزش موجودی به نرخ فروش', data: [60] },
      ],
    });

    const { component: history } = createComponent(
      GoodHistoryRptComponent,
      'GoodHistoryRpt',
    );
    history.records.set([
      { Date: '1405/01/01', GoodName: 'کالای پ', InStack: 7, OutStack: 2 },
    ]);
    expect(history.chartModel().series).toEqual([
      { name: 'ورودی', data: [7] },
      { name: 'خروجی', data: [2] },
    ]);

    const { component: group } = createComponent(
      GoodGroupRptComponent,
      'GoodGroupRpt',
    );
    group.records.set([
      {
        Name: 'گروه یک',
        GoodName: 'کالای ت',
        Amount: 4,
        MaxSellPrice: 30,
        MinSellPrice: 10,
      },
    ]);
    expect(group.chartModel().series).toEqual([
      { name: 'موجودی', data: [4] },
      { name: 'ارزش فروش', data: [120] },
      { name: 'ارزش خرید', data: [40] },
    ]);

    const { component: orderPoint } = createComponent(
      GoodSefareshPointRptComponent,
      'GoodSefareshPointRpt',
    );
    orderPoint.records.set([
      { GoodName: 'کالای ث', Amount: 1, SefareshPoint: 5, CriticalPoint: 2 },
    ]);
    expect(orderPoint.chartModel().series).toEqual([
      { name: 'موجودی', data: [1] },
      { name: 'نقطه سفارش', data: [5] },
      { name: 'نقطه بحرانی', data: [2] },
    ]);

    const { component: periodic } = createComponent(
      PeriodicInOutGoodStateRptComponent,
      'PeriodicInOutGoodStateRpt',
    );
    periodic.records.set([
      {
        GoodName: 'کالای ج',
        inGoodAmount: 8,
        OutGoodAmount: 3,
        EndPeriodAmount: 5,
        NowAmount: 6,
      },
    ]);
    expect(periodic.chartModel().series).toEqual([
      { name: 'ورودی دوره', data: [8] },
      { name: 'خروجی دوره', data: [3] },
      { name: 'موجودی پایان دوره', data: [5] },
      { name: 'موجودی فعلی', data: [6] },
    ]);
  });

  it('limits charts to twelve rows to keep labels readable', () => {
    const { component } = createComponent(AllGoodsRptComponent, 'AllGoodsRpt');
    component.records.set(
      Array.from({ length: 20 }, (_, index) => ({
        GoodName: `کالا ${index + 1}`,
        Amount: index + 1,
        MaxSellPrice: 1,
      })),
    );

    expect(component.chartModel().categories.length).toBe(12);
    expect(component.chartModel().series[0].data.length).toBe(12);
  });

  it('exposes a controlled request error and clears the loading state', () => {
    repo.PeriodicInOutGoodStateRpt.and.returnValue(
      throwError(() => new Error('network')),
    );
    const { component } = createComponent(
      PeriodicInOutGoodStateRptComponent,
      'PeriodicInOutGoodStateRpt',
    );

    component.loadList();

    expect(component.records()).toEqual([]);
    expect(component.hasLoaded()).toBeTrue();
    expect(component.loading()).toBeFalse();
    expect(component.errorMessage()).toContain('خطا');
    expect(notification.error).toHaveBeenCalled();
  });
});
