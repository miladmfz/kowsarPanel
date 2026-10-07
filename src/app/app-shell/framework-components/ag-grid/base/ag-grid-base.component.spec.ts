import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import type { GridApi } from 'ag-grid-community';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { AgGridBaseComponent } from './ag-grid-base.component';
import { AgGridSettingsDialogService } from '../services/ag-grid-settings-dialog.service';

class TestGridComponent extends AgGridBaseComponent { }

describe('AgGridBaseComponent table settings', () => {
  let component: TestGridComponent;
  let api: jasmine.SpyObj<GridApi>;
  let listeners: Record<string, (event?: any) => void>;
  let settingsDialog: jasmine.SpyObj<AgGridSettingsDialogService>;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('UserName', 'grid-test-user');
    listeners = {};
    settingsDialog = jasmine.createSpyObj<AgGridSettingsDialogService>('AgGridSettingsDialogService', ['open']);
    jasmine.clock().install();

    TestBed.configureTestingModule({
      providers: [
        provideZonelessChangeDetection(),
        {
          provide: ThemeService,
          useValue: { theme$: of('light') },
        },
        { provide: AgGridSettingsDialogService, useValue: settingsDialog },
      ],
    });

    component = TestBed.runInInjectionContext(() => new TestGridComponent());
    api = createGridApi();
  });

  afterEach(() => {
    component.ngOnDestroy();
    jasmine.clock().uninstall();
    localStorage.clear();
    sessionStorage.clear();
  });

  it('keeps the base gridReady implementation and returns a usable context menu', () => {
    component.onGridReady({ api } as any, 1);
    jasmine.clock().tick(225);

    expect(api.setGridOption).toHaveBeenCalled();
    const menu = component.getCustomContextMenuItems({ api, column: null });
    expect(Array.isArray(menu)).toBeTrue();

    const settings = menu.find((item: any) => item?.name === '⚙️ تنظیم جدول');
    settings.action();
    expect(settingsDialog.open).toHaveBeenCalled();
  });

  it('auto-saves a changed layout and restores it in a later instance', () => {
    component.onGridReady({ api } as any, 1);
    jasmine.clock().tick(225);
    listeners['columnMoved']?.({ type: 'columnMoved' });
    jasmine.clock().tick(300);
    expect(localStorage.length).toBe(1);

    const secondApi = createGridApi();
    const second = TestBed.runInInjectionContext(() => new TestGridComponent());
    second.onGridReady({ api: secondApi } as any, 1);
    jasmine.clock().tick(225);

    expect(secondApi.applyColumnState).toHaveBeenCalledWith({
      state: [{ colId: 'Name', width: 240, hide: false }],
      applyOrder: true,
    });
    expect(secondApi.setFilterModel).toHaveBeenCalledWith({ Name: { filter: 'کالا' } });
    second.ngOnDestroy();
  });

  it('resets columns, filters, and the persisted preference together', () => {
    component.onGridReady({ api } as any, 1);
    jasmine.clock().tick(225);
    component.saveGridState();
    expect(localStorage.length).toBe(1);

    const menu = component.getCustomContextMenuItems({ api, column: null });
    const reset = menu.find((item: any) => item?.name === '↺ بازنشانی تنظیمات جدول');
    reset.action();

    expect(api.resetColumnState).toHaveBeenCalled();
    expect(api.setFilterModel).toHaveBeenCalledWith(null);
    expect(localStorage.length).toBe(0);
  });

  function createGridApi(): jasmine.SpyObj<GridApi> {
    const gridApi = jasmine.createSpyObj<GridApi>('GridApi', [
      'addEventListener',
      'setGridOption',
      'sizeColumnsToFit',
      'getDisplayedRowCount',
      'getColumnState',
      'getColumnDefs',
      'getFilterModel',
      'applyColumnState',
      'setFilterModel',
      'resetColumnState',
      'refreshHeader',
      'openToolPanel',
      'autoSizeColumns',
      'autoSizeAllColumns',
      'isDestroyed',
      'forEachNodeAfterFilterAndSort',
    ]);
    gridApi.isDestroyed.and.returnValue(false);
    gridApi.getDisplayedRowCount.and.returnValue(0);
    gridApi.getColumnState.and.returnValue([
      { colId: 'Name', width: 240, hide: false },
    ]);
    gridApi.getColumnDefs.and.returnValue([{ field: 'Name', headerName: 'نام' }]);
    gridApi.getFilterModel.and.returnValue({ Name: { filter: 'کالا' } });
    gridApi.addEventListener.and.callFake((eventName: any, handler: any) => {
      listeners[eventName] = handler;
    });
    return gridApi;
  }
});
