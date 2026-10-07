import { Injectable } from '@angular/core';
import type { ColDef, ColumnState, GridApi } from 'ag-grid-community';

export interface AgGridPreferenceSnapshot {
  version: 2;
  columnState: ColumnState[];
  filterModel: unknown;
  captions: Record<string, string>;
  savedAt: string;
}

/**
 * Persists only the presentation state of a grid. Row data is deliberately
 * excluded so business data never ends up in browser storage.
 */
@Injectable({ providedIn: 'root' })
export class AgGridPreferencesService {
  private readonly storagePrefix = 'kowsar.ag-grid.preferences.v1';

  save(api: GridApi, identity: string): boolean {
    const storage = this.getStorage();
    if (!storage || !identity || api.isDestroyed?.()) return false;

    const snapshot: AgGridPreferenceSnapshot = {
      version: 2,
      columnState: api.getColumnState(),
      filterModel: api.getFilterModel(),
      captions: this.readCaptions(api),
      savedAt: new Date().toISOString(),
    };

    try {
      storage.setItem(this.storageKey(identity), JSON.stringify(snapshot));
      return true;
    } catch (error) {
      console.warn('[AgGridPreferences] Unable to save grid state.', error);
      return false;
    }
  }

  restore(api: GridApi, identity: string): boolean {
    const snapshot = this.read(identity);
    if (!snapshot || api.isDestroyed?.()) return false;

    try {
      this.restoreCaptions(api, snapshot.captions);
      api.applyColumnState({
        state: snapshot.columnState,
        applyOrder: true,
      });
      api.setFilterModel(snapshot.filterModel ?? null);
      return true;
    } catch (error) {
      console.warn('[AgGridPreferences] Unable to restore grid state.', error);
      return false;
    }
  }

  remove(identity: string): void {
    const storage = this.getStorage();
    if (!storage || !identity) return;

    try {
      storage.removeItem(this.storageKey(identity));
    } catch (error) {
      console.warn('[AgGridPreferences] Unable to remove grid state.', error);
    }
  }

  has(identity: string): boolean {
    return this.read(identity) !== null;
  }

  private read(identity: string): AgGridPreferenceSnapshot | null {
    const storage = this.getStorage();
    if (!storage || !identity) return null;

    const key = this.storageKey(identity);
    try {
      const raw = storage.getItem(key);
      if (!raw) return null;

      const parsed = JSON.parse(raw) as Partial<AgGridPreferenceSnapshot>;
      if (![1, 2].includes(Number(parsed.version)) || !Array.isArray(parsed.columnState)) {
        storage.removeItem(key);
        return null;
      }

      return {
        version: 2,
        columnState: parsed.columnState,
        filterModel: parsed.filterModel ?? null,
        captions: this.isCaptionMap(parsed.captions) ? parsed.captions : {},
        savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : '',
      };
    } catch (error) {
      try {
        storage.removeItem(key);
      } catch { }
      console.warn('[AgGridPreferences] Invalid grid state was discarded.', error);
      return null;
    }
  }

  private storageKey(identity: string): string {
    return `${this.storagePrefix}:${this.currentUserScope()}:${this.hash(identity)}`;
  }

  private readCaptions(api: GridApi): Record<string, string> {
    const captions: Record<string, string> = {};
    const definitions = (api.getColumnDefs?.() ?? []) as ColDef[];
    definitions.forEach((definition, index) => {
      const columnId = String(definition.colId ?? definition.field ?? `column-${index + 1}`);
      if (typeof definition.headerName === 'string' && definition.headerName.trim()) {
        captions[columnId] = definition.headerName.trim();
      }
    });
    return captions;
  }

  private restoreCaptions(api: GridApi, captions: Record<string, string>): void {
    if (!Object.keys(captions).length) return;
    const definitions = (api.getColumnDefs?.() ?? []) as ColDef[];
    let changed = false;
    const updated = definitions.map((definition, index) => {
      const columnId = String(definition.colId ?? definition.field ?? `column-${index + 1}`);
      const caption = captions[columnId];
      if (!caption || definition.headerName === caption) return definition;
      changed = true;
      return { ...definition, headerName: caption };
    });
    if (changed) api.setGridOption('columnDefs', updated);
  }

  private isCaptionMap(value: unknown): value is Record<string, string> {
    return !!value && typeof value === 'object' && !Array.isArray(value) &&
      Object.values(value).every(item => typeof item === 'string');
  }

  private currentUserScope(): string {
    if (typeof sessionStorage === 'undefined') return 'server';

    const subject =
      sessionStorage.getItem('kowsar.auth_subject') ||
      sessionStorage.getItem('UserId') ||
      sessionStorage.getItem('UserName') ||
      'anonymous';

    return this.hash(subject.replace(/^"|"$/g, ''));
  }

  private hash(value: string): string {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0).toString(36);
  }

  private getStorage(): Storage | null {
    return typeof localStorage === 'undefined' ? null : localStorage;
  }
}
