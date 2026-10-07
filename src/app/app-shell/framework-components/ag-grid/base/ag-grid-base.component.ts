/**
 * Shared AG Grid behavior for Kowsar screens.
 *
 * Grid presentation preferences are user-scoped, persistent, and contain no
 * row data. Every component extending this base receives the same behavior.
 */

import { Directive, inject } from '@angular/core';
import type { ColDef, GridApi, GridOptions, GridReadyEvent } from 'ag-grid-community';
import type { GridSchemaRecord } from 'src/app/app-shell/framework-services/base/base-api.models';
import { AgGridPreferencesService } from '../services/ag-grid-preferences.service';
import { AgGridSettingsDialogService } from '../services/ag-grid-settings-dialog.service';
import '../ag-grid-enterprise-registration';
import { AgGridApiComponent } from './core/ag-grid-api.component';
import { AgGridCoreComponent } from './core/ag-grid-core.component';
import { AgGridEventsComponent } from './core/ag-grid-events.component';
import { AgGridExportComponent } from './core/ag-grid-export.component';
import { AgGridStateComponent } from './core/ag-grid-state.component';

@Directive()
export abstract class AgGridBaseComponent extends AgGridCoreComponent {
  private readonly gridPreferences = inject(AgGridPreferencesService);
  private readonly gridSettingsDialog = inject(AgGridSettingsDialogService);
  protected gridApis: GridApi[] = [];

  private readonly gridIndexByApi = new Map<GridApi, number>();
  private readonly hookedApis = new WeakSet<GridApi>();
  private readonly mutatingStateApis = new WeakSet<GridApi>();
  private readonly saveTimers = new Map<GridApi, ReturnType<typeof setTimeout>>();
  private readonly restoreTimers = new Map<GridApi, ReturnType<typeof setTimeout>>();
  private readonly restoreDeadlines = new WeakMap<GridApi, number>();

  constructor() {
    super();

    this.gridOptions = {
      ...this.gridOptions,
      sideBar: this.gridOptions.sideBar ?? this.createTableSettingsSideBar(),
      getContextMenuItems: (params: any) => this.getCustomContextMenuItems(params),
    };
  }

  override onGridReady(params: GridReadyEvent, index: number = 1): void {
    if (!params?.api) return;

    const gridIndex = this.resolveGridIndex(params.api, index);
    super.onGridReady(params, gridIndex);

    this.gridApis[gridIndex - 1] = params.api;
    this.gridIndexByApi.set(params.api, gridIndex);
    (this as any)[`gridApi${gridIndex}`] = params.api;

    this.installStateListeners(params.api);

    try {
      params.api.setGridOption(
        'getContextMenuItems',
        (menuParams: any) => this.getCustomContextMenuItems(menuParams),
      );
    } catch (error) {
      console.warn('[AgGridBase] Context menu setup failed.', error);
    }

    const pending = (this as any).records;
    const pendingRows = typeof pending === 'function' ? pending() : pending;
    if (Array.isArray(pendingRows) && pendingRows.length > 0) {
      this.updateGridData(gridIndex, pendingRows);
    }

    // Existing screens size columns after gridReady/firstDataRendered. Restore
    // afterwards so an explicitly saved width always wins.
    this.scheduleRestore(params.api, gridIndex, 225);
  }

  protected syncSortedData(
    index: number,
    targetSetter: (data: any[]) => void,
  ): void {
    const api = (this as any)[`gridApi${index}`] as GridApi | undefined;
    if (!api) return;

    const ordered: any[] = [];
    api.forEachNodeAfterFilterAndSort((node: any) => ordered.push(node.data));
    targetSetter(ordered);
  }

  getCustomContextMenuItems = (params: any): any[] => {
    const api = params.api as GridApi | undefined;
    const colId = params.column?.getId?.();
    const menu: any[] = [];

    if (colId) {
      menu.push({
        name: '📏 بهینه‌سازی عرض این ستون',
        action: () => api?.autoSizeColumns?.([colId], false),
      });
    }

    menu.push(
      {
        name: '📐 بهینه‌سازی عرض همه ستون‌ها',
        action: () => api?.autoSizeAllColumns?.(false),
      },
      'separator',
      {
        name: '⚙️ تنظیم جدول',
        action: () => {
          if (api) this.openGridSettings(api);
        },
      },
      {
        name: '💾 ذخیره تنظیمات جدول',
        action: () => {
          if (api) this.saveGridPreference(api);
        },
      },
      {
        name: '↺ بازنشانی تنظیمات جدول',
        action: () => {
          if (api) this.resetGridPreference(api);
        },
      },
      'separator',
      {
        name: '📤 خروجی Excel',
        action: () => {
          const exporter = (this as any).onExportExcel;
          if (typeof exporter === 'function') exporter.call(this, params);
          else api?.exportDataAsExcel?.({ fileName: `${this.gridFileName()}.xlsx` });
        },
      },
      {
        name: '📄 خروجی CSV',
        action: () => {
          const exporter = (this as any).onExportCSV;
          if (typeof exporter === 'function') exporter.call(this, params);
          else api?.exportDataAsCsv?.({ fileName: `${this.gridFileName()}.csv` });
        },
      },
      'separator',
      {
        name: '📋 کپی مقدار سلول',
        action: () => api?.copySelectedRangeToClipboard?.(),
      },
      'copyWithHeaders',
    );

    return menu;
  };

  /** Saves all active grids immediately. State changes are also auto-saved. */
  saveGridState(): void {
    this.activeGrids().forEach((api) => this.saveGridPreference(api));
  }

  /** Re-applies the persisted state for all active grids. */
  restoreGridState(): void {
    this.activeGrids().forEach((api) => {
      const index = this.gridIndexByApi.get(api) ?? 1;
      this.restoreGridPreference(api, index);
    });
  }

  /** Clears persisted settings and returns all active grids to their defaults. */
  resetGridState(): void {
    this.activeGrids().forEach((api) => this.resetGridPreference(api));
  }

  override updateGridData(index: number, data: any[]): void {
    super.updateGridData(index, data);
  }

  override ngOnDestroy(): void {
    this.saveTimers.forEach((timer, api) => {
      clearTimeout(timer);
      this.saveGridPreference(api);
    });
    this.restoreTimers.forEach((timer) => clearTimeout(timer));
    this.saveTimers.clear();
    this.restoreTimers.clear();
    super.ngOnDestroy();
  }

  // Optional methods supplied by mixins and available to templates.
  onExportExcel?(param?: any): void;
  onExportCSV?(param?: any): void;
  onCellClicked?(event: any): void;
  onCellDoubleClicked?(event: any): void;
  onFirstDataRendered?(event: any): void;
  onReloadGrid?(): void;
  refreshAllGrids?(): void;
  sizeToFitAll?(): void;
  clearGrid?(index?: number): void;

  private createTableSettingsSideBar(): GridOptions['sideBar'] {
    return {
      position: 'left',
      toolPanels: [
        {
          id: 'columns',
          labelDefault: 'تنظیم جدول',
          labelKey: 'columns',
          iconKey: 'columns',
          toolPanel: 'agColumnsToolPanel',
          toolPanelParams: {
            suppressRowGroups: true,
            suppressValues: true,
            suppressPivots: true,
            suppressPivotMode: true,
          },
        },
        {
          id: 'filters',
          labelDefault: 'فیلترها',
          labelKey: 'filters',
          iconKey: 'filter',
          toolPanel: 'agFiltersToolPanel',
        },
      ],
    };
  }

  private installStateListeners(api: GridApi): void {
    if (this.hookedApis.has(api)) return;
    this.hookedApis.add(api);

    const save = (event?: any) => {
      if (event?.type === 'columnResized' && event.finished === false) return;
      this.scheduleSave(api);
    };

    const restore = () => {
      const index = this.gridIndexByApi.get(api) ?? 1;
      this.scheduleRestore(api, index, 100);
    };

    const eventApi = api as any;
    [
      'columnMoved',
      'columnVisible',
      'columnResized',
      'columnPinned',
      'sortChanged',
      'filterChanged',
    ].forEach((eventName) => eventApi.addEventListener?.(eventName, save));

    eventApi.addEventListener?.('newColumnsLoaded', restore);
    eventApi.addEventListener?.('firstDataRendered', restore);
    eventApi.addEventListener?.('gridPreDestroyed', () => {
      const timer = this.saveTimers.get(api);
      if (timer) {
        clearTimeout(timer);
        this.saveTimers.delete(api);
        this.saveGridPreference(api);
      }
    });
  }

  private scheduleSave(api: GridApi): void {
    if (this.mutatingStateApis.has(api) || api.isDestroyed?.()) return;

    const current = this.saveTimers.get(api);
    if (current) clearTimeout(current);
    this.saveTimers.set(api, setTimeout(() => {
      this.saveTimers.delete(api);
      this.saveGridPreference(api);
    }, 300));
  }

  private scheduleRestore(api: GridApi, index: number, delay: number): void {
    const deadline = Date.now() + delay;
    const current = this.restoreTimers.get(api);
    const currentDeadline = this.restoreDeadlines.get(api) ?? 0;
    // Keep the later restore. Several legacy templates call sizeColumnsToFit
    // during firstDataRendered, so an earlier restore would be overwritten.
    if (current && currentDeadline >= deadline) return;
    if (current) clearTimeout(current);
    this.restoreDeadlines.set(api, deadline);
    this.restoreTimers.set(api, setTimeout(() => {
      this.restoreTimers.delete(api);
      this.restoreDeadlines.delete(api);
      this.restoreGridPreference(api, index);
    }, delay));
  }

  private saveGridPreference(api: GridApi): void {
    if (this.mutatingStateApis.has(api) || api.isDestroyed?.()) return;
    const index = this.gridIndexByApi.get(api) ?? 1;
    this.gridPreferences.save(api, this.gridIdentity(index));
  }

  private openGridSettings(api: GridApi): void {
    const index = this.gridIndexByApi.get(api) ?? 1;
    const property = index === 1 ? 'column_name_1' : `columnDefs${index}`;
    this.gridSettingsDialog.open({
      api,
      title: this.gridFileName(),
      schemaClassName: this.resolveGridSchemaClassName(),
      getColumnDefs: () => {
        const componentDefinitions = (this as unknown as Record<string, unknown>)[property];
        return Array.isArray(componentDefinitions)
          ? componentDefinitions as ColDef[]
          : (api.getColumnDefs?.() ?? []) as ColDef[];
      },
      setColumnDefs: definitions => {
        (this as unknown as Record<string, unknown>)[property] = definitions;
      },
      createSchemaColumn: schema => this.createSchemaColumn(schema),
      save: () => this.saveGridPreference(api),
      reset: () => this.resetGridPreference(api),
    });
  }

  private createSchemaColumn(schema: GridSchemaRecord): ColDef {
    const width = Number(schema.Width);
    const numeric = this.gridSchemaBoolean(schema.Separator);
    return {
      colId: schema.FieldName,
      field: schema.FieldName,
      headerName: schema.Caption || schema.FieldName,
      width: Number.isFinite(width) && width > 0 ? width : 120,
      minWidth: 60,
      hide: !this.gridSchemaBoolean(schema.Visible),
      sortable: true,
      resizable: true,
      filter: numeric ? 'agNumberColumnFilter' : 'agSetColumnFilter',
      cellClass: 'text-center',
      valueFormatter: numeric ? params => this.customNumberFormatter(params) : undefined,
    };
  }

  private restoreGridPreference(api: GridApi, index: number): void {
    if (api.isDestroyed?.()) return;

    const pendingSave = this.saveTimers.get(api);
    if (pendingSave) {
      clearTimeout(pendingSave);
      this.saveTimers.delete(api);
    }

    this.mutatingStateApis.add(api);
    try {
      this.gridPreferences.restore(api, this.gridIdentity(index));
    } finally {
      this.mutatingStateApis.delete(api);
    }
  }

  private resetGridPreference(api: GridApi): void {
    if (api.isDestroyed?.()) return;

    const index = this.gridIndexByApi.get(api) ?? 1;
    const saveTimer = this.saveTimers.get(api);
    const restoreTimer = this.restoreTimers.get(api);
    if (saveTimer) clearTimeout(saveTimer);
    if (restoreTimer) clearTimeout(restoreTimer);
    this.saveTimers.delete(api);
    this.restoreTimers.delete(api);
    this.restoreDeadlines.delete(api);

    this.gridPreferences.remove(this.gridIdentity(index));
    this.mutatingStateApis.add(api);
    try {
      api.resetColumnState();
      api.setFilterModel(null);
    } finally {
      this.mutatingStateApis.delete(api);
    }
  }

  private gridIdentity(index: number): string {
    const route = typeof window === 'undefined'
      ? 'server'
      : window.location.pathname.replace(/\/+$/, '') || '/';
    const explicitName = String(
      this.childName ||
      (this as any).reportForm ||
      this.constructor?.name ||
      'AgGrid',
    ).trim();

    return `${route}|${explicitName}|grid${index}`;
  }

  private gridFileName(): string {
    return String(this.explicitGridName() || 'KowsarReport');
  }

  private resolveGridSchemaClassName(): string {
    const name = this.explicitGridName().trim();
    if (!name || name === 'AgGrid') return '';
    const classNameSource = (this as unknown as Record<string, unknown>)['ClassName'];
    let explicitClassName = '';
    try {
      explicitClassName = typeof classNameSource === 'function'
        ? String((classNameSource as () => unknown)() ?? '').trim()
        : String(classNameSource ?? '').trim();
    } catch { }
    return explicitClassName === name && /^T/.test(explicitClassName) ? name : `T${name}`;
  }

  private explicitGridName(): string {
    const source = this as unknown as Record<string, unknown>;
    const reportData = source['ReportData'] as { ReportForm?: unknown } | undefined;
    const classNameSource = source['ClassName'];
    let className = '';
    try {
      className = typeof classNameSource === 'function'
        ? String((classNameSource as () => unknown)() ?? '')
        : String(classNameSource ?? '');
    } catch { }
    return String(
      source['reportForm'] ||
      reportData?.ReportForm ||
      className ||
      this.childName ||
      this.constructor?.name?.replace(/Component$/, '') ||
      'AgGrid',
    );
  }

  private gridSchemaBoolean(value: unknown): boolean {
    return value === true || value === 1 || ['true', '1', 'yes'].includes(String(value ?? '').trim().toLowerCase());
  }

  private resolveGridIndex(api: GridApi, requestedIndex?: number): number {
    if (requestedIndex && requestedIndex >= 1 && requestedIndex <= 6) {
      return requestedIndex;
    }

    const knownIndex = this.gridIndexByApi.get(api);
    if (knownIndex) return knownIndex;

    const emptyIndex = [1, 2, 3, 4, 5, 6]
      .find((candidate) => !(this as any)[`gridApi${candidate}`]);
    return emptyIndex ?? 1;
  }

  private activeGrids(): GridApi[] {
    return [
      this.gridApi1,
      this.gridApi2,
      this.gridApi3,
      this.gridApi4,
      this.gridApi5,
      this.gridApi6,
    ].filter((api): api is GridApi => !!api && !api.isDestroyed?.());
  }
}

function applyMixins(derivedCtor: any, baseCtors: any[]): void {
  baseCtors.forEach((baseCtor) => {
    Object.getOwnPropertyNames(baseCtor.prototype).forEach((name) => {
      if (
        name !== 'constructor' &&
        !Object.prototype.hasOwnProperty.call(derivedCtor.prototype, name)
      ) {
        Object.defineProperty(
          derivedCtor.prototype,
          name,
          Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
            Object.create(null),
        );
      }
    });
  });
}

applyMixins(AgGridBaseComponent, [
  AgGridApiComponent,
  AgGridEventsComponent,
  AgGridExportComponent,
  AgGridStateComponent,
]);
