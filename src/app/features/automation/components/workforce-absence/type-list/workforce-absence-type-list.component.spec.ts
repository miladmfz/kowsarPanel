import { provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { CellClickedEvent } from 'ag-grid-community';
import { of, throwError } from 'rxjs';

import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { WORKFORCE_ABSENCE_TYPE_RESPONSE_FIXTURE } from 'src/testing/fixtures/api-response.fixtures';
import { WorkforceAbsenceTypeApiService } from '../../../services/workforce-absence-type-api.service';
import { WorkforceAbsenceTypeRecord } from '../../../models/workforce-absence-type.models';
import { WorkforceAbsenceTypeListComponent } from './workforce-absence-type-list.component';

describe('WorkforceAbsenceTypeListComponent', () => {
  let fixture: ComponentFixture<WorkforceAbsenceTypeListComponent>;
  let component: WorkforceAbsenceTypeListComponent;
  let repo: jasmine.SpyObj<WorkforceAbsenceTypeApiService>;
  let router: jasmine.SpyObj<Router>;
  let notification: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    repo = jasmine.createSpyObj<WorkforceAbsenceTypeApiService>('WorkforceAbsenceTypeApiService', ['list']);
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    notification = jasmine.createSpyObj<NotificationService>('NotificationService', ['error']);
    repo.list.and.returnValue(of(WORKFORCE_ABSENCE_TYPE_RESPONSE_FIXTURE));

    await TestBed.configureTestingModule({
      imports: [WorkforceAbsenceTypeListComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: WorkforceAbsenceTypeApiService, useValue: repo },
        { provide: Router, useValue: router },
        { provide: NotificationService, useValue: notification },
        { provide: ThemeService, useValue: { theme$: of('light') } },
      ],
    })
      .overrideComponent(WorkforceAbsenceTypeListComponent, { set: { template: '' } })
      .compileComponents();
  });

  function createComponent(): void {
    fixture = TestBed.createComponent(WorkforceAbsenceTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('loads the typed API fixture into the reference grid state', () => {
    createComponent();

    expect(repo.list).toHaveBeenCalledOnceWith({ AbsenceTypeCode: '0', OnlyActive: null });
    expect(component.records()).toEqual(WORKFORCE_ABSENCE_TYPE_RESPONSE_FIXTURE.WorkforceAbsenceTypes);
    expect(component.loading()).toBeFalse();
    expect(component.column_name_1.some(column => column.field === 'TypeTitle')).toBeTrue();
  });

  it('shows a controlled error and clears stale records when loading fails', () => {
    repo.list.and.returnValue(throwError(() => new Error('load failure')));

    createComponent();

    expect(component.records()).toEqual([]);
    expect(component.loading()).toBeFalse();
    expect(component.status()).toBe('error');
    expect(component.errorMessage()).toBe('Failed to load workforce absence types.');
    expect(notification.error).toHaveBeenCalledOnceWith('خطا در دریافت انواع درخواست');
  });

  it('navigates to the legacy edit route from the action column', () => {
    createComponent();
    const record = WORKFORCE_ABSENCE_TYPE_RESPONSE_FIXTURE.WorkforceAbsenceTypes[0];

    component.onCellClicked({
      colDef: { field: 'Action' },
      data: record,
    } as CellClickedEvent<WorkforceAbsenceTypeRecord>);

    expect(router.navigate).toHaveBeenCalledOnceWith(
      ['/automation/workforce-absence/type-edit', record.AbsenceTypeCode],
      { state: { type: record } },
    );
  });
});
