import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';

import { AgGridMemoryService } from 'src/app/app-shell/framework-components/ag-grid/services/ag-grid-memory.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { ReportWebApiService } from 'src/app/features/accounting/services/GozareshatWebApi/ReportWebApi.service';
import { ReportListComponent } from './report-list.component';

describe('ReportListComponent view state', () => {
  let fixture: ComponentFixture<ReportListComponent>;
  let component: ReportListComponent;
  let repo: jasmine.SpyObj<ReportWebApiService>;
  let notification: jasmine.SpyObj<NotificationService>;
  let gridMemory: jasmine.SpyObj<AgGridMemoryService>;

  beforeEach(async () => {
    repo = jasmine.createSpyObj<ReportWebApiService>('ReportWebApiService', ['GetReports']);
    notification = jasmine.createSpyObj<NotificationService>('NotificationService', ['error']);
    gridMemory = jasmine.createSpyObj<AgGridMemoryService>('AgGridMemoryService', ['get', 'save']);
    repo.GetReports.and.returnValue(of({ Reports: [{ ReportCode: '10', ReportRef: 0, ReportTitle: 'فروش' }] } as never));

    await TestBed.configureTestingModule({
      imports: [ReportListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: Router, useValue: jasmine.createSpyObj<Router>('Router', ['navigate']) },
        { provide: ReportWebApiService, useValue: repo },
        { provide: NotificationService, useValue: notification },
        { provide: AgGridMemoryService, useValue: gridMemory },
        { provide: ThemeService, useValue: { theme$: of('light') } },
      ],
    })
      .overrideComponent(ReportListComponent, { set: { template: '' } })
      .compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(ReportListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads reports once and resolves the loading state', () => {
    createComponent();

    expect(repo.GetReports).toHaveBeenCalledTimes(1);
    expect(component.records().length).toBe(1);
    expect(component.loading()).toBeFalse();
    expect(component.errorMessage()).toBe('');
  });

  it('exposes a controlled error state and notification', () => {
    repo.GetReports.and.returnValue(throwError(() => new Error('network')));
    createComponent();

    expect(component.records()).toEqual([]);
    expect(component.loading()).toBeFalse();
    expect(component.errorMessage()).toContain('امکان دریافت');
    expect(notification.error).toHaveBeenCalledOnceWith('خطا در دریافت فهرست گزارش‌ها');
  });

  it('does not issue a duplicate request after first data render', () => {
    createComponent();
    gridMemory.get.and.returnValue(undefined);

    component.onFirstDataRendered({
      api: {
        isDestroyed: () => false,
        applyColumnState: jasmine.createSpy('applyColumnState'),
        setFilterModel: jasmine.createSpy('setFilterModel'),
      },
    });

    expect(repo.GetReports).toHaveBeenCalledTimes(1);
  });
});
