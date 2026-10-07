import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';
import { GoodFactorRptComponent } from './GoodFactorRpt.component';

describe('GoodFactorRptComponent', () => {
  let fixture: ComponentFixture<GoodFactorRptComponent>;
  let component: GoodFactorRptComponent;
  let repo: jasmine.SpyObj<ReportWebApiService>;
  let notification: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    repo = jasmine.createSpyObj<ReportWebApiService>('ReportWebApiService', [
      'GetGridSchemaVisible',
      'GoodFactorRpt',
    ]);
    notification = jasmine.createSpyObj<NotificationService>(
      'NotificationService',
      ['error', 'warning'],
    );
    repo.GetGridSchemaVisible.and.returnValue(
      of({
        GridSchemas: [
          {
            FieldName: 'Meghdar',
            Caption: 'تعداد',
            Width: '80',
            Visible: 'True',
            Separator: 'True',
          },
        ],
      } as never),
    );
    repo.GoodFactorRpt.and.returnValue(of({ Reports: [] } as never));

    await TestBed.configureTestingModule({
      imports: [GoodFactorRptComponent],
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
      .overrideComponent(GoodFactorRptComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(GoodFactorRptComponent);
    component = fixture.componentInstance;
    component.ReportData = {
      ReportCode: '31',
      ReportForm: 'GoodFactorRpt',
      ReportTitle: 'فاکتورهای کالا',
    };
    fixture.detectChanges();
  });

  it('loads the Delphi grid schema for the report', () => {
    expect(repo.GetGridSchemaVisible).toHaveBeenCalledOnceWith(
      'TGoodFactorRpt',
    );
    expect(component.title()).toBe('فاکتورهای کالا');
    expect(component.column_name_1[0].field).toBe('Meghdar');
  });

  it('sends the Delphi filters and calculates report totals', () => {
    repo.GoodFactorRpt.and.returnValue(
      of({
        Reports: [
          {
            FactorDate: '1405/01/01',
            CustName: 'مشتری اول',
            Meghdar: '2.5',
            nMablagh: '1200',
            MablaghTakhfif: '200',
            Mablagh: '1000',
          },
          {
            FactorDate: '1405/01/02',
            CustName: 'مشتری دوم',
            Meghdar: '1.5',
            nMablagh: '800',
            MablaghTakhfif: '50',
            Mablagh: '750',
          },
        ],
      } as never),
    );
    component.EditForm_SearchTarget.patchValue({
      GoodCode: '7-2',
      CustomerRef: '1908',
      FromDate: '1405/01/01',
      ToDate: '1405/06/31',
    });

    component.loadList();

    expect(repo.GoodFactorRpt).toHaveBeenCalledWith(
      jasmine.objectContaining({
        ClassName: 'GoodFactorRpt',
        GoodCode: '7-2',
        CustomerRef: '1908',
        FromDate: '1405/01/01',
        ToDate: '1405/06/31',
      }),
    );
    expect(component.totals()).toEqual({
      count: 2,
      amount: 4,
      grossPrice: 2000,
      discount: 250,
      netPrice: 1750,
    });
    expect(component.chartModel().series).toEqual([
      { name: 'تعداد', data: [2.5, 1.5] },
      { name: 'ناخالص', data: [1200, 800] },
      { name: 'خالص', data: [1000, 750] },
    ]);
    component.toggleReportView();
    expect(component.showChart()).toBeTrue();
  });

  it('does not request a reversed date range', () => {
    component.EditForm_SearchTarget.patchValue({
      FromDate: '1405/07/01',
      ToDate: '1405/06/31',
    });

    component.loadList();

    expect(repo.GoodFactorRpt).not.toHaveBeenCalled();
    expect(notification.warning).toHaveBeenCalled();
  });

  it('exposes a controlled request error', () => {
    repo.GoodFactorRpt.and.returnValue(throwError(() => new Error('network')));

    component.loadList();

    expect(component.records()).toEqual([]);
    expect(component.hasLoaded()).toBeTrue();
    expect(component.loading()).toBeFalse();
    expect(component.errorMessage()).toContain('خطا');
    expect(notification.error).toHaveBeenCalledOnceWith(
      'خطا در دریافت گزارش فاکتورهای کالا',
    );
  });
});
