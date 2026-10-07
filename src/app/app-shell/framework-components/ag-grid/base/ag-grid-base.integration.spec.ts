import { Component, provideZonelessChangeDetection } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AgGridAngular } from 'ag-grid-angular';
import type { ColDef, GridApi } from 'ag-grid-community';
import { of } from 'rxjs';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { AgGridBaseComponent } from './ag-grid-base.component';

@Component({
  standalone: true,
  imports: [AgGridAngular],
  template: `
    <div style="width: 760px; height: 420px">
      <ag-grid-angular
        style="width: 100%; height: 100%"
        [class]="themeClass"
        [gridOptions]="gridOptions"
        [columnDefs]="column_name_1"
        [rowData]="rows"
        (gridReady)="onGridReady($event, 1)"
        (firstDataRendered)="gridApi1?.sizeColumnsToFit()"
      ></ag-grid-angular>
    </div>
  `,
})
class RealGridHarnessComponent extends AgGridBaseComponent {
  override childName = 'RealGridHarness';
  override column_name_1: ColDef[] = [
    { field: 'code', headerName: 'کد' },
    { field: 'name', headerName: 'نام کالا' },
    { field: 'quantity', headerName: 'تعداد' },
  ];
  rows = [
    { code: 1, name: 'کالای اول', quantity: 2 },
    { code: 2, name: 'کالای دوم', quantity: 5 },
  ];
}

describe('AgGridBaseComponent real AG Grid integration', () => {
  beforeEach(async () => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('UserName', 'real-grid-user');

    await TestBed.configureTestingModule({
      imports: [RealGridHarnessComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: ThemeService, useValue: { theme$: of('light') } },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('renders rows and headers, opens table settings, and restores a saved layout', async () => {
    let fixture = await createGrid();
    let api = fixture.componentInstance.gridApi1 as GridApi;

    expect(uniqueAttributeCount(fixture, '.ag-header-cell[col-id]', 'col-id')).toBe(3);
    expect(uniqueAttributeCount(
      fixture,
      '.ag-center-cols-container .ag-row[row-index]',
      'row-index',
    )).toBe(2);

    api.openToolPanel('columns');
    await waitUntil(() => api.getOpenedToolPanel() === 'columns');
    expect(fixture.nativeElement.querySelector('.ag-column-panel')).not.toBeNull();

    api.applyColumnState({
      state: [
        { colId: 'name', width: 260 },
        { colId: 'quantity', hide: true },
      ],
      applyOrder: false,
    });
    fixture.componentInstance.saveGridState();
    fixture.destroy();

    fixture = await createGrid();
    api = fixture.componentInstance.gridApi1 as GridApi;
    await waitUntil(() => api.getColumn('quantity')?.isVisible() === false);

    const restoredState = api.getColumnState();
    expect(restoredState.find((column) => column.colId === 'quantity')?.hide).toBeTrue();
    expect(restoredState.find((column) => column.colId === 'name')?.width).toBe(260);
    expect(uniqueAttributeCount(fixture, '.ag-header-cell[col-id]', 'col-id')).toBe(2);
    fixture.destroy();
  });

  async function createGrid(): Promise<ComponentFixture<RealGridHarnessComponent>> {
    const fixture = TestBed.createComponent(RealGridHarnessComponent);
    fixture.detectChanges();
    await waitUntil(() => !!fixture.componentInstance.gridApi1);
    await delay(325);
    fixture.detectChanges();
    return fixture;
  }

  async function waitUntil(predicate: () => boolean, timeout = 3000): Promise<void> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (predicate()) return;
      await delay(25);
    }
    throw new Error('Timed out waiting for the real AG Grid state.');
  }

  function delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
  }

  function uniqueAttributeCount(
    fixture: ComponentFixture<RealGridHarnessComponent>,
    selector: string,
    attribute: string,
  ): number {
    const values = Array.from(
      fixture.nativeElement.querySelectorAll(selector) as NodeListOf<HTMLElement>,
    ).map((element) => element.getAttribute(attribute));
    return new Set(values).size;
  }
});
