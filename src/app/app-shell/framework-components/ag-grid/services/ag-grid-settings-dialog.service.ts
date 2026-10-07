import { Injectable, Injector, signal } from '@angular/core';
import type { ColDef, ColumnState, GridApi } from 'ag-grid-community';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import type { GridSchemaRecord } from 'src/app/app-shell/framework-services/base/base-api.models';

export interface AgGridSettingsColumn {
  id: string;
  field: string;
  caption: string;
  defaultCaption: string;
  width: number;
  defaultWidth: number;
  visible: boolean;
  defaultVisible: boolean;
  source: 'GridSchema' | 'Runtime';
  separator: boolean;
}

export interface AgGridSettingsDialogState {
  title: string;
  schemaClassName: string;
  columns: AgGridSettingsColumn[];
  loading: boolean;
  error: string;
}

export interface AgGridSettingsOpenOptions {
  api: GridApi;
  title: string;
  schemaClassName: string;
  getColumnDefs: () => ColDef[];
  setColumnDefs: (definitions: ColDef[]) => void;
  createSchemaColumn: (schema: GridSchemaRecord) => ColDef;
  save: () => void;
  reset: () => void;
}

@Injectable({ providedIn: 'root' })
export class AgGridSettingsDialogService {
  readonly state = signal<AgGridSettingsDialogState | null>(null);
  private options?: AgGridSettingsOpenOptions;
  private defaultRows: AgGridSettingsColumn[] = [];

  constructor(private readonly injector: Injector) {}

  open(options: AgGridSettingsOpenOptions): void {
    this.options = options;
    const currentRows = this.rowsFromCurrentGrid(options);
    this.defaultRows = currentRows.map(item => ({ ...item }));
    this.state.set({
      title: options.title,
      schemaClassName: options.schemaClassName,
      columns: currentRows,
      loading: !!options.schemaClassName,
      error: '',
    });

    if (!options.schemaClassName) return;
    this.injector.get(KowsarBaseWebApi).GetAllGridSchema(options.schemaClassName).subscribe({
      next: response => {
        if (this.options !== options) return;
        const merged = this.mergeSchemaRows(options, response.GridSchemas ?? []);
        this.defaultRows = merged.defaults.map(item => ({ ...item }));
        this.patch({ columns: merged.columns, loading: false, error: '' });
      },
      error: () => {
        if (this.options !== options) return;
        this.patch({
          loading: false,
          error: 'تعریف کامل GridSchema دریافت نشد؛ ستون‌های فعلی جدول همچنان قابل تنظیم هستند.',
        });
      },
    });
  }

  close(): void {
    this.options = undefined;
    this.defaultRows = [];
    this.state.set(null);
  }

  updateColumns(columns: AgGridSettingsColumn[]): void {
    this.patch({ columns: columns.map(item => ({ ...item })) });
  }

  apply(): void {
    const options = this.options;
    const state = this.state();
    if (!options || !state || state.loading) return;
    this.applyRows(options, state.columns);
    options.save();
    this.close();
  }

  resetToSchema(): void {
    const options = this.options;
    if (!options || !this.defaultRows.length) return;
    options.reset();
    this.applyRows(options, this.defaultRows);
    this.updateColumns(this.defaultRows);
  }

  private applyRows(options: AgGridSettingsOpenOptions, rows: AgGridSettingsColumn[]): void {
    const definitions = options.getColumnDefs();
    const definitionById = new Map(definitions.map((definition, index) => [this.columnId(definition, index), definition]));
    const schemaByField = new Map<string, GridSchemaRecord>();
    rows.filter(row => row.source === 'GridSchema').forEach(row => schemaByField.set(row.field, {
      FieldName: row.field,
      Caption: row.defaultCaption,
      Visible: row.defaultVisible ? 'True' : 'False',
      Width: row.defaultWidth,
      Separator: row.separator ? 'True' : 'False',
    }));

    const updated = rows.map(row => {
      const existing = definitionById.get(row.id);
      const definition = existing ?? options.createSchemaColumn(schemaByField.get(row.field)!);
      return {
        ...definition,
        colId: definition.colId ?? row.id,
        headerName: row.caption.trim() || row.defaultCaption || row.field,
        width: this.safeWidth(row.width),
        hide: !row.visible,
      } satisfies ColDef;
    });

    options.setColumnDefs(updated);
    options.api.setGridOption('columnDefs', updated);
    const state: ColumnState[] = rows.map(row => ({
      colId: row.id,
      width: this.safeWidth(row.width),
      hide: !row.visible,
    }));
    options.api.applyColumnState({ state, applyOrder: true });
    options.api.refreshHeader();
  }

  private rowsFromCurrentGrid(options: AgGridSettingsOpenOptions): AgGridSettingsColumn[] {
    const columnState = options.api.getColumnState();
    const stateById = new Map(columnState.map(item => [item.colId, item]));
    const orderById = new Map(columnState.map((item, index) => [item.colId, index]));
    return options.getColumnDefs().map((definition, index) => {
      const id = this.columnId(definition, index);
      const state = stateById.get(id);
      const width = this.safeWidth(state?.width ?? definition.width ?? definition.minWidth ?? 120);
      const visible = !(state?.hide ?? definition.hide ?? false);
      const caption = String(definition.headerName ?? definition.field ?? id);
      return {
        id,
        field: String(definition.field ?? id),
        caption,
        defaultCaption: caption,
        width,
        defaultWidth: width,
        visible,
        defaultVisible: visible,
        source: 'Runtime' as const,
        separator: false,
      };
    }).sort((left, right) =>
      (orderById.get(left.id) ?? Number.MAX_SAFE_INTEGER) - (orderById.get(right.id) ?? Number.MAX_SAFE_INTEGER));
  }

  private mergeSchemaRows(options: AgGridSettingsOpenOptions, schemas: GridSchemaRecord[]): {
    columns: AgGridSettingsColumn[];
    defaults: AgGridSettingsColumn[];
  } {
    const current = this.rowsFromCurrentGrid(options);
    const currentByField = new Map(current.map(row => [row.field.toLowerCase(), row]));
    const schemaRows = schemas
      .filter(schema => !!String(schema.FieldName ?? '').trim())
      .map(schema => {
        const field = String(schema.FieldName).trim();
        const existing = currentByField.get(field.toLowerCase());
        const defaultWidth = this.safeWidth(schema.Width);
        const defaultVisible = this.toBoolean(schema.Visible);
        return {
          id: existing?.id ?? field,
          field,
          caption: existing?.caption ?? String(schema.Caption || field),
          defaultCaption: String(schema.Caption || field),
          width: existing?.width ?? defaultWidth,
          defaultWidth,
          visible: existing?.visible ?? defaultVisible,
          defaultVisible,
          source: 'GridSchema' as const,
          separator: this.toBoolean(schema.Separator),
        };
      });
    const schemaByField = new Map(schemaRows.map(row => [row.field.toLowerCase(), row]));
    const currentColumns = current.map(row => {
      const schema = schemaByField.get(row.field.toLowerCase());
      return schema ? { ...schema, id: row.id, caption: row.caption, width: row.width, visible: row.visible } : row;
    });
    const currentFields = new Set(current.map(row => row.field.toLowerCase()));
    const hiddenSchemaColumns = schemaRows.filter(row => !currentFields.has(row.field.toLowerCase()));
    const runtimeDefaults = current.filter(row => !schemaByField.has(row.field.toLowerCase()));
    const defaults = [
      ...schemaRows.map(row => ({ ...row, caption: row.defaultCaption, width: row.defaultWidth, visible: row.defaultVisible })),
      ...runtimeDefaults,
    ];
    return { columns: [...currentColumns, ...hiddenSchemaColumns], defaults };
  }

  private patch(patch: Partial<AgGridSettingsDialogState>): void {
    this.state.update(value => value ? { ...value, ...patch } : value);
  }

  private columnId(definition: ColDef, index: number): string {
    return String(definition.colId ?? definition.field ?? `column-${index + 1}`);
  }

  private safeWidth(value: unknown): number {
    const width = Number(value);
    return Number.isFinite(width) ? Math.min(1200, Math.max(60, Math.round(width))) : 120;
  }

  private toBoolean(value: unknown): boolean {
    return value === true || value === 1 || ['true', '1', 'yes'].includes(String(value ?? '').trim().toLowerCase());
  }
}
