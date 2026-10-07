import type { GridApi } from 'ag-grid-community';
import { AgGridPreferencesService } from './ag-grid-preferences.service';

describe('AgGridPreferencesService', () => {
  let service: AgGridPreferencesService;
  let api: jasmine.SpyObj<GridApi>;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    sessionStorage.setItem('UserName', 'user-a');
    service = new AgGridPreferencesService();
    api = jasmine.createSpyObj<GridApi>('GridApi', [
      'getColumnState',
      'getFilterModel',
      'applyColumnState',
      'setFilterModel',
      'getColumnDefs',
      'setGridOption',
      'isDestroyed',
    ]);
    api.isDestroyed.and.returnValue(false);
    api.getColumnState.and.returnValue([
      { colId: 'Amount', width: 180, hide: false },
    ]);
    api.getFilterModel.and.returnValue({ Amount: { filter: 10 } });
    api.getColumnDefs.and.returnValue([{ field: 'Amount', headerName: 'مبلغ' }]);
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  it('persists and restores columns and filters without row data', () => {
    expect(service.save(api, '/reports|GoodFactorRpt|grid1')).toBeTrue();
    expect(localStorage.length).toBe(1);
    expect(localStorage.getItem(localStorage.key(0)!)!).not.toContain('rowData');

    expect(service.restore(api, '/reports|GoodFactorRpt|grid1')).toBeTrue();
    expect(api.applyColumnState).toHaveBeenCalledWith({
      state: [{ colId: 'Amount', width: 180, hide: false }],
      applyOrder: true,
    });
    expect(api.setFilterModel).toHaveBeenCalledWith({ Amount: { filter: 10 } });
    expect(api.setGridOption).not.toHaveBeenCalled();
  });

  it('restores a customized Persian caption together with the column state', () => {
    service.save(api, '/reports|GoodFactorRpt|grid1');
    api.getColumnDefs.and.returnValue([{ field: 'Amount', headerName: 'مبلغ اولیه' }]);

    expect(service.restore(api, '/reports|GoodFactorRpt|grid1')).toBeTrue();
    expect(api.setGridOption).toHaveBeenCalledWith('columnDefs', [
      { field: 'Amount', headerName: 'مبلغ' },
    ]);
  });

  it('isolates preferences by authenticated user', () => {
    service.save(api, '/reports|GoodFactorRpt|grid1');
    sessionStorage.setItem('UserName', 'user-b');

    expect(service.has('/reports|GoodFactorRpt|grid1')).toBeFalse();
    expect(service.restore(api, '/reports|GoodFactorRpt|grid1')).toBeFalse();
  });

  it('removes a saved preference', () => {
    service.save(api, '/reports|GoodFactorRpt|grid1');
    service.remove('/reports|GoodFactorRpt|grid1');

    expect(service.has('/reports|GoodFactorRpt|grid1')).toBeFalse();
    expect(localStorage.length).toBe(0);
  });
});
