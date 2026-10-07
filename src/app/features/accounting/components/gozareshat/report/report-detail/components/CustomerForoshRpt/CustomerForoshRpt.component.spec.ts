import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';
import { CustomerForoshRptComponent } from './CustomerForoshRpt.component';

describe('CustomerForoshRptComponent', () => {
  let fixture: ComponentFixture<CustomerForoshRptComponent>;
  let component: CustomerForoshRptComponent;
  let repo: jasmine.SpyObj<ReportWebApiService>;
  let notification: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    repo = jasmine.createSpyObj<ReportWebApiService>('ReportWebApiService', [
      'GetGridSchemaVisible',
      'CustomerForoshRpt',
    ]);
    notification = jasmine.createSpyObj<NotificationService>(
      'NotificationService',
      ['error'],
    );
    repo.GetGridSchemaVisible.and.returnValue(
      of({
        GridSchemas: [
          {
            FieldName: 'Teedad',
            Caption: 'تعداد',
            Width: '100',
            Visible: 'True',
            Separator: 'True',
          },
        ],
      } as never),
    );
    repo.CustomerForoshRpt.and.returnValue(of({ Reports: [] } as never));

    await TestBed.configureTestingModule({
      imports: [CustomerForoshRptComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ReportWebApiService, useValue: repo },
        { provide: NotificationService, useValue: notification },
        { provide: ActivatedRoute, useValue: {} },
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
      .overrideComponent(CustomerForoshRptComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerForoshRptComponent);
    component = fixture.componentInstance;
    component.ReportData = {
      ReportCode: '20',
      ReportForm: 'CustomerForoshRpt',
      ReportTitle: 'فروش مشتریان',
    };
    fixture.detectChanges();
  });

  it('loads Delphi columns and builds totals and chart series', () => {
    repo.CustomerForoshRpt.and.returnValue(
      of({
        Reports: [
          {
            CustomerCode: 1,
            FName: 'علی',
            Name: 'رضایی',
            Teedad: '2.5',
            Mablagh: '1000',
            nMablagh: '1200',
            TakhfifPrice: '200',
          },
          {
            CustomerCode: 2,
            FName: 'مریم',
            Name: 'احمدی',
            Teedad: '1.5',
            Mablagh: '800',
            nMablagh: '900',
            TakhfifPrice: '100',
          },
        ],
      } as never),
    );
    component.EditForm_SearchTarget.patchValue({
      FromDate: '1405/01/01',
      ToDate: '1405/06/31',
      Department: '1,2',
    });

    component.loadList();

    expect(repo.GetGridSchemaVisible).toHaveBeenCalledWith(
      'TCustomerForoshRpt',
    );
    expect(repo.CustomerForoshRpt).toHaveBeenCalledWith(
      jasmine.objectContaining({
        ClassName: 'CustomerForoshRpt',
        Department: '1,2',
      }),
    );
    expect(component.totals()).toEqual({
      count: 2,
      amount: 4,
      net: 1800,
      gross: 2100,
      discount: 300,
    });
    expect(component.chartModel()).toEqual({
      categories: ['علی رضایی', 'مریم احمدی'],
      series: [
        { name: 'تعداد', data: [2.5, 1.5] },
        { name: 'مبلغ خالص', data: [1000, 800] },
        { name: 'مبلغ ناخالص', data: [1200, 900] },
      ],
    });
  });

  it('clears state and exposes request errors', () => {
    component.records.set([{ Teedad: 1 }]);
    component.toggleReportView();
    component.clearFilter();
    expect(component.records()).toEqual([]);
    expect(component.showChart()).toBeFalse();

    repo.CustomerForoshRpt.and.returnValue(
      throwError(() => new Error('network')),
    );
    component.loadList();

    expect(component.loading()).toBeFalse();
    expect(component.hasLoaded()).toBeTrue();
    expect(notification.error).toHaveBeenCalled();
  });
});
