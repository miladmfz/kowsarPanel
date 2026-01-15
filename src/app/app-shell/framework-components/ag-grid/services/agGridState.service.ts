/**
 * 💾 agGridState.service.ts
 * -------------------------------
 * ذخیره و بازیابی تنظیمات ستون‌های گرید (Column State)
 * برای هر childName به صورت مجزا.
 */

import { inject, Injectable } from '@angular/core';

import type { GridApi, ColumnState } from 'ag-grid-community';

@Injectable({ providedIn: 'root' })
export class AgGridStateService {
    /** ذخیره وضعیت ستون‌ها */
    saveState(api: GridApi, childName: string): void {
        if (!api || !childName) return;
        const state = api.getColumnState();
        localStorage.setItem(`${childName}_columnState`, JSON.stringify(state));
    }

    /** بازیابی وضعیت ستون‌ها */
    restoreState(api: GridApi, childName: string): boolean {
        const savedState = localStorage.getItem(`${childName}_columnState`);
        if (savedState && api) {
            api.applyColumnState({
                state: JSON.parse(savedState) as ColumnState[],
                applyOrder: true,
            });
            return true;
        }
        return false;
    }

    /** ریست حالت جدول */
    resetState(api: GridApi, childName: string): void {
        localStorage.removeItem(`${childName}_columnState`);
        api.resetColumnState();
    }
}
