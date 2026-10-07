import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import type { ColDef, GridApi } from 'ag-grid-community';
import { of } from 'rxjs';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { AgGridSettingsDialogService } from './ag-grid-settings-dialog.service';

describe('AgGridSettingsDialogService', () => {
  let service: AgGridSettingsDialogService;
  let api: jasmine.SpyObj<GridApi>;
  let definitions: ColDef[];
  let baseApi: jasmine.SpyObj<KowsarBaseWebApi>;

  beforeEach(() => {
    definitions = [{ field: 'Name', headerName: 'نام', width: 140 }];
    api = jasmine.createSpyObj<GridApi>('GridApi', [
      'getColumnState', 'setGridOption', 'applyColumnState', 'refreshHeader',
    ]);
    api.getColumnState.and.returnValue([{ colId: 'Name', width: 160, hide: false }]);
    baseApi = jasmine.createSpyObj<KowsarBaseWebApi>('KowsarBaseWebApi', ['GetAllGridSchema']);
    baseApi.GetAllGridSchema.and.returnValue(of({ GridSchemas: [
      { FieldName: 'Name', Caption: 'نام پیش‌فرض', Visible: 'True', Width: 140 },
      { FieldName: 'SecretCode', Caption: 'کد مخفی', Visible: 'False', Width: 90 },
    ] }));
    TestBed.configureTestingModule({ providers: [
      provideZonelessChangeDetection(),
      { provide: KowsarBaseWebApi, useValue: baseApi },
    ] });
    service = TestBed.inject(AgGridSettingsDialogService);
  });

  it('loads hidden GridSchema fields and applies caption, width, visibility and order', () => {
    const save = jasmine.createSpy('save');
    service.open({
      api,
      title: 'کالاها',
      schemaClassName: 'TGood',
      getColumnDefs: () => definitions,
      setColumnDefs: value => definitions = value,
      createSchemaColumn: schema => ({ field: schema.FieldName, headerName: schema.Caption }),
      save,
      reset: jasmine.createSpy('reset'),
    });

    const state = service.state()!;
    expect(baseApi.GetAllGridSchema).toHaveBeenCalledOnceWith('TGood');
    expect(state.columns.map(item => item.field)).toEqual(['Name', 'SecretCode']);
    expect(state.columns[1].visible).toBeFalse();
    service.updateColumns([
      { ...state.columns[1], visible: true, caption: 'شناسه داخلی', width: 120 },
      { ...state.columns[0], visible: false },
    ]);
    service.apply();

    expect(definitions.map(item => item.field)).toEqual(['SecretCode', 'Name']);
    expect(definitions[0]).toEqual(jasmine.objectContaining({ headerName: 'شناسه داخلی', width: 120, hide: false }));
    expect(definitions[1]).toEqual(jasmine.objectContaining({ headerName: 'نام', hide: true }));
    expect(api.applyColumnState).toHaveBeenCalledWith({
      state: [
        { colId: 'SecretCode', width: 120, hide: false },
        { colId: 'Name', width: 160, hide: true },
      ],
      applyOrder: true,
    });
    expect(save).toHaveBeenCalled();
    expect(service.state()).toBeNull();
  });
});
