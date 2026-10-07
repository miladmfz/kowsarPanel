import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';
import { CustomerIdentificationRptComponent } from './CustomerIdentificationRpt.component';

describe('CustomerIdentificationRptComponent', () => {
  let repo: jasmine.SpyObj<ReportWebApiService>;
  let notification: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    repo = jasmine.createSpyObj<ReportWebApiService>('ReportWebApiService', [
      'GetGridSchemaVisible',
      'CustomerIdentificationRpt',
    ]);
    notification = jasmine.createSpyObj<NotificationService>(
      'NotificationService',
      ['error', 'warning'],
    );
    repo.GetGridSchemaVisible.and.returnValue(
      of({
        GridSchemas: [
          {
            FieldName: 'CustomerCode',
            Caption: 'کد مشتری',
            Width: '80',
            Visible: 'True',
          },
          {
            FieldName: 'CustomerName',
            Caption: 'نام مشتری',
            Width: '140',
            Visible: 'True',
          },
          {
            FieldName: 'AllTypeSumPrice',
            Caption: 'کل خرید',
            Width: '100',
            Visible: 'True',
          },
        ],
      } as never),
    );
    repo.CustomerIdentificationRpt.and.returnValue(
      of({ Reports: [] } as never),
    );

    await TestBed.configureTestingModule({
      imports: [CustomerIdentificationRptComponent],
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
      .overrideComponent(CustomerIdentificationRptComponent, {
        set: { template: '' },
      })
      .compileComponents();
  });

  function createComponent(): {
    fixture: ComponentFixture<CustomerIdentificationRptComponent>;
    component: CustomerIdentificationRptComponent;
  } {
    const fixture = TestBed.createComponent(CustomerIdentificationRptComponent);
    const component = fixture.componentInstance;
    component.ReportData = {
      ReportCode: '60',
      ReportForm: 'CustomerIdentificationRpt',
      ReportTitle: 'اطلاعات مشتریان',
    };
    fixture.detectChanges();
    return { fixture, component };
  }

  it('loads automatically with the Delphi report contract', () => {
    const { component } = createComponent();

    expect(repo.GetGridSchemaVisible).toHaveBeenCalledWith(
      'TCustomerIdentificationRpt',
    );
    expect(repo.CustomerIdentificationRpt).toHaveBeenCalledWith(
      jasmine.objectContaining({
        ClassName: 'CustomerIdentificationRpt',
        Department: '',
      }),
    );
    expect(component.title()).toBe('اطلاعات مشتریان');
  });

  it('sends a selected department and rejects unsafe department text', () => {
    const { component } = createComponent();
    repo.CustomerIdentificationRpt.calls.reset();
    component.EditForm_SearchTarget.patchValue({ Department: '1,2' });

    component.loadList();

    expect(repo.CustomerIdentificationRpt).toHaveBeenCalledWith(
      jasmine.objectContaining({ Department: '1,2' }),
    );

    repo.CustomerIdentificationRpt.calls.reset();
    component.EditForm_SearchTarget.patchValue({
      Department: '1); DROP TABLE Factor;--',
    });
    component.loadList();

    expect(repo.CustomerIdentificationRpt).not.toHaveBeenCalled();
    expect(notification.warning).toHaveBeenCalled();
  });

  it('calculates customer credit totals', () => {
    repo.CustomerIdentificationRpt.and.returnValue(
      of({
        Reports: [
          {
            CustomerCode: 1,
            CustomerName: 'مشتری اول',
            AllTypeSumPrice: '1000',
            aTypeSellSumPrice: '200',
            EtebarCheck: '500',
            MandehEtebar: '300',
          },
          {
            CustomerCode: 2,
            CustomerName: 'مشتری دوم',
            AllTypeSumPrice: '2500',
            aTypeSellSumPrice: '400',
            EtebarCheck: '700',
            MandehEtebar: '300',
          },
        ],
      } as never),
    );

    const { component } = createComponent();

    expect(component.totals()).toEqual({
      count: 2,
      allPurchase: 3500,
      unsettled: 600,
      credit: 1200,
      remainingCredit: 600,
    });
    expect(component.chartModel()).toEqual({
      categories: ['مشتری اول - 1', 'مشتری دوم - 2'],
      series: [
        { name: 'کل خرید خالص', data: [1000, 2500] },
        { name: 'تسویه‌نشده', data: [200, 400] },
        { name: 'مانده اعتبار', data: [300, 300] },
      ],
    });
  });

  it('exposes a controlled load error', () => {
    repo.CustomerIdentificationRpt.and.returnValue(
      throwError(() => new Error('network')),
    );

    const { component } = createComponent();

    expect(component.records()).toEqual([]);
    expect(component.hasLoaded()).toBeTrue();
    expect(component.loading()).toBeFalse();
    expect(component.errorMessage()).toContain('خطا');
    expect(notification.error).toHaveBeenCalled();
  });
});
