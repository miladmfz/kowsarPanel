import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';
import { GoodFactorRowsRptComponent } from './GoodFactorRowsRpt.component';

describe('GoodFactorRowsRptComponent', () => {
  let fixture: ComponentFixture<GoodFactorRowsRptComponent>;
  let component: GoodFactorRowsRptComponent;
  let repo: jasmine.SpyObj<ReportWebApiService>;
  let notification: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    repo = jasmine.createSpyObj<ReportWebApiService>('ReportWebApiService', [
      'GoodFactorRowsRpt',
    ]);
    notification = jasmine.createSpyObj<NotificationService>(
      'NotificationService',
      ['error', 'warning'],
    );
    repo.GoodFactorRowsRpt.and.returnValue(of({ Reports: [] } as never));

    await TestBed.configureTestingModule({
      imports: [GoodFactorRowsRptComponent],
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
      .overrideComponent(GoodFactorRowsRptComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(GoodFactorRowsRptComponent);
    component = fixture.componentInstance;
    component.ReportData = {
      ReportCode: '32',
      ReportForm: 'GoodFactorRowsRpt',
      ReportTitle: 'اقلام فاکتورهای کالا',
    };
    fixture.detectChanges();
  });

  it('uses the visible Delphi columns instead of the invalid 233-column schema', () => {
    expect(component.title()).toBe('اقلام فاکتورهای کالا');
    expect(component.column_name_1.length).toBe(15);
    expect(component.column_name_1.map((column) => column.field)).toEqual([
      'FactorPrivateCode',
      'FactorDate',
      'PrivateCodeForSort',
      'GoodName',
      'ShowAmount',
      'Price',
      'SumPrice',
      'BulletinGroupName',
      'BulletinGroupSerial',
      'SellPercent',
      'CustomerRef',
      'CustName',
      'OstanName',
      'CityName',
      'ShowComment',
    ]);
  });

  it('sends the Delphi row filters and calculates its two totals', () => {
    repo.GoodFactorRowsRpt.and.returnValue(
      of({
        Reports: [
          { GoodName: 'کالای اول', FacAmount: '2.5', SumPrice: '1200' },
          { GoodName: 'کالای دوم', FacAmount: '1.5', SumPrice: '800' },
        ],
      } as never),
    );
    component.EditForm_SearchTarget.patchValue({
      GoodCode: '7-2',
      CustomerRef: '1908',
      FactorPrivateCode: '2690',
      FromDate: '1405/01/01',
      ToDate: '1405/06/31',
    });

    component.loadList();

    expect(repo.GoodFactorRowsRpt).toHaveBeenCalledWith(
      jasmine.objectContaining({
        ClassName: 'GoodFactorRowsRpt',
        GoodCode: '7-2',
        CustomerRef: '1908',
        FactorPrivateCode: '2690',
        FromDate: '1405/01/01',
        ToDate: '1405/06/31',
      }),
    );
    expect(component.totals()).toEqual({ count: 2, amount: 4, price: 2000 });
    expect(component.chartModel()).toEqual({
      categories: ['کالای اول', 'کالای دوم'],
      series: [
        { name: 'تعداد', data: [2.5, 1.5] },
        { name: 'مبلغ', data: [1200, 800] },
      ],
    });
  });

  it('does not request a reversed date range', () => {
    component.EditForm_SearchTarget.patchValue({
      FromDate: '1405/07/01',
      ToDate: '1405/06/31',
    });

    component.loadList();

    expect(repo.GoodFactorRowsRpt).not.toHaveBeenCalled();
    expect(notification.warning).toHaveBeenCalled();
  });

  it('exposes a controlled request error', () => {
    repo.GoodFactorRowsRpt.and.returnValue(
      throwError(() => new Error('network')),
    );

    component.loadList();

    expect(component.records()).toEqual([]);
    expect(component.hasLoaded()).toBeTrue();
    expect(component.loading()).toBeFalse();
    expect(component.errorMessage()).toContain('خطا');
    expect(notification.error).toHaveBeenCalledOnceWith(
      'خطا در دریافت گزارش اقلام فاکتورهای کالا',
    );
  });
});
