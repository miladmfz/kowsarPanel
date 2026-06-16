/**
 * 💾 agGridState.service.ts
 * -------------------------------
 * ذخیره و بازیابی کامل state:
 * Column (includes Sort) + Filter
 */

import { Injectable } from '@angular/core';
import type { GridApi, ColumnState } from 'ag-grid-community';

@Injectable({ providedIn: 'root' })
export class AgGridStateService {

    /** ذخیره وضعیت کامل */
    saveState(api: GridApi, childName: string): void {

        if (!api || !childName) return;

        const state = {

            columnState: api.getColumnState(),

            filterState: api.getFilterModel()

        };

        this.session.setItem(
            `${childName}_gridState`,
            JSON.stringify(state)
        );

    }

    /** بازیابی */
    restoreState(api: GridApi, childName: string): boolean {

        if (!api || !childName) return false;

        const savedState =
            this.session.getString(`${childName}_gridState`);

        if (!savedState) return false;

        const state = JSON.parse(savedState);

        try {

            api.applyColumnState({
                state: state.columnState as ColumnState[],
                applyOrder: true
            });

            api.setFilterModel(
                state.filterState
            );

            return true;

        } catch (err) {

            console.warn(
                'Restore Grid State Error',
                err
            );

            return false;
        }

    }

    /** ریست */
    resetState(api: GridApi, childName: string): void {

        sessionStorage.removeItem(
            `${childName}_gridState`
        );

        api.resetColumnState();

        api.setFilterModel(null);

    }

}