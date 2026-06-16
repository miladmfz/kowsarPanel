import { Injectable } from '@angular/core';
import type { ColumnState } from 'ag-grid-community';

export interface GridMemoryState {
    rowData: any[];
    columnDefs: any[];
    columnState: ColumnState[];
    filterState: any;
    scrollTop: number;
}

@Injectable({
    providedIn: 'root'
})
export class AgGridMemoryService {

    private memory = new Map<string, GridMemoryState>();

    // 🔹 ذخیره یا بروزرسانی حافظه Grid
    save(key: string, state: Partial<GridMemoryState>) {
        const existing = this.memory.get(key) || {} as GridMemoryState;
        const merged = { ...existing, ...state };
        this.memory.set(key, merged);
    }

    // 🔹 گرفتن حافظه Grid
    get(key: string): GridMemoryState | null {
        const state = this.memory.get(key) || null;
        return state;
    }

    // 🔹 حذف حافظه Grid
    remove(key: string) {
        this.memory.delete(key);
    }

    // 🔹 پاکسازی کامل حافظه (اختیاری)
    clearAll() {
        this.memory.clear();
    }
}