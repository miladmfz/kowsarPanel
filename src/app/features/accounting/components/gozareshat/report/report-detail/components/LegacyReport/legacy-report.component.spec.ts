import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';
import {
  isLegacyReportForm,
  LEGACY_REPORT_FORMS,
} from '../../legacy-report.contracts';
import { LegacyReportComponent } from './legacy-report.component';

describe('LegacyReportComponent', () => {
  let fixture: ComponentFixture<LegacyReportComponent>;
  let component: LegacyReportComponent;
  let repo: jasmine.SpyObj<ReportWebApiService>;
  let notifications: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    repo = jasmine.createSpyObj<ReportWebApiService>('ReportWebApiService', [
      'GetGridSchemaVisible',
      'LegacyReport',
    ]);
    notifications = jasmine.createSpyObj<NotificationService>('NotificationService', [
      'error',
      'warning',
    ]);
    repo.GetGridSchemaVisible.and.returnValue(
      of({
        GridSchemas: [
          { FieldName: 'Name', Caption: 'نام', Visible: 'True', Separator: 'False' },
          { FieldName: 'Mablagh', Caption: 'مبلغ', Visible: 'True', Separator: 'True' },
        ],
      } as never),
    );
    repo.LegacyReport.and.returnValue(of({ Reports: [] }));

    await TestBed.configureTestingModule({
      imports: [LegacyReportComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ReportWebApiService, useValue: repo },
        { provide: NotificationService, useValue: notifications },
        {
          provide: AgGridMemoryService,
          useValue: jasmine.createSpyObj<AgGridMemoryService>('AgGridMemoryService', ['get', 'save']),
        },
        { provide: ThemeService, useValue: { theme$: of('light') } },
        {
          provide: SessionStorageService,
          useValue: { activeDate: '1405/06/31', departmentCode: '2' },
        },
      ],
    })
      .overrideComponent(LegacyReportComponent, { set: { template: '' } })
      .compileComponents();

    fixture = TestBed.createComponent(LegacyReportComponent);
    component = fixture.componentInstance;
    component.ReportData = {
      ReportCode: '51',
      ReportForm: 'CashReceiveRpt',
      ReportTitle: 'دریافت‌های نقدی',
    };
    fixture.detectChanges();
  });

  it('loads schema and initializes shared Delphi filters', () => {
    expect(repo.GetGridSchemaVisible).toHaveBeenCalledOnceWith('TCashReceiveRpt');
    expect(component.filterForm.getRawValue()).toEqual(
      jasmine.objectContaining({
        ClassName: 'CashReceiveRpt',
        Department: '2',
        FromDate: '1405/01/01',
        ToDate: '1405/06/31',
      }),
    );
    expect(component.column_name_1.map((column) => column.field)).toEqual(['Name', 'Mablagh']);
  });

  it('covers the complete Delphi report catalog, including forms without the Rpt suffix', () => {
    expect(LEGACY_REPORT_FORMS.size).toBe(132);
    expect(isLegacyReportForm('AccSanadBrowse')).toBeTrue();
    expect(isLegacyReportForm('PurchaseMaxPriceDifference')).toBeTrue();
    expect(isLegacyReportForm('UnknownReport')).toBeFalse();
  });

  it('loads rows, calculates totals, and builds a chart', () => {
    repo.LegacyReport.and.returnValue(
      of({
        Reports: [
          { Name: 'اول', Mablagh: '1,200' },
          { Name: 'دوم', Mablagh: '800' },
        ],
      }),
    );
    component.filterForm.patchValue({ SearchTarget: 'مشتری' });

    component.loadList();

    expect(repo.LegacyReport).toHaveBeenCalledWith(
      'CashReceiveRpt',
      jasmine.objectContaining({ ClassName: 'CashReceiveRpt', SearchTarget: 'مشتری' }),
    );
    expect(component.summaries()).toEqual([
      { field: 'Mablagh', caption: 'مبلغ', value: 2000 },
    ]);
    expect(component.chartModel().categories).toEqual(['اول', 'دوم']);
    expect(component.chartModel().series[0].data).toEqual([1200, 800]);
  });

  it('removes stale schema columns that are absent from real report rows', () => {
    repo.LegacyReport.and.returnValue(
      of({ Reports: [{ Name: 'ط§ظˆظ„', Total: '1200' }] }),
    );

    component.loadList();

    expect(component.column_name_1.map((column) => column.field)).toEqual(['Name']);
    expect(component.records()).toEqual([{ Name: 'ط§ظˆظ„', Total: '1200' }]);
  });

  it('uses the authoritative result schema when an empty report has no GridSchema', () => {
    repo.GetGridSchemaVisible.and.returnValue(of({ GridSchemas: [] } as never));
    repo.LegacyReport.and.returnValue(
      of({
        Reports: [],
        ReportColumns: [
          { FieldName: 'VendorCode', Caption: 'VendorCode', Visible: true, Separator: false },
          { FieldName: 'Total', Caption: 'Total', Visible: true, Separator: true },
        ],
      }),
    );

    const emptyFixture = TestBed.createComponent(LegacyReportComponent);
    const emptyComponent = emptyFixture.componentInstance;
    emptyComponent.ReportData = {
      ReportCode: '150',
      ReportForm: 'VendorFactorRpt',
      ReportTitle: 'Vendor factors',
    };
    emptyFixture.detectChanges();
    emptyComponent.loadList();

    expect(emptyComponent.records()).toEqual([]);
    expect(emptyComponent.column_name_1.map((column) => column.field)).toEqual([
      'VendorCode',
      'Total',
    ]);
  });

  it('rejects a reversed date range before sending a request', () => {
    component.filterForm.patchValue({ FromDate: '1405/07/01', ToDate: '1405/06/31' });
    component.loadList();
    expect(repo.LegacyReport).not.toHaveBeenCalled();
    expect(notifications.warning).toHaveBeenCalled();
  });

  it('exposes endpoint failures as a controlled report error', () => {
    repo.LegacyReport.and.returnValue(throwError(() => new Error('network')));
    component.loadList();
    expect(component.records()).toEqual([]);
    expect(component.hasLoaded()).toBeTrue();
    expect(component.loading()).toBeFalse();
    expect(component.errorMessage()).toContain('خطا');
    expect(notifications.error).toHaveBeenCalledOnceWith('خطا در دریافت گزارش');
  });
});
