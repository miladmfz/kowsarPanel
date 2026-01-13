/**
 *   ag-grid-state.component.ts
 * ---------------------------------------------------------
 * مدیریت وضعیت (State) ستون‌های گرید:
 *  - ذخیره‌سازی تنظیمات ستون‌ها در LocalStorage
 *  - بازیابی و اعمال مجدد آن‌ها
 *  - ریست به حالت اولیه
 *
 * نکات:
 *  - از GridApi برای دسترسی به state ستون‌ها استفاده می‌شود.
 *  - شناسه childName برای تمایز بین گریدهای مختلف الزامی است.
 */

import { Directive } from '@angular/core';
import type { ColumnState, GridApi } from 'ag-grid-community';
import { AgGridApiComponent } from './ag-grid-api.component';

@Directive()
export abstract class AgGridStateComponent extends AgGridApiComponent {
    /** 🧠 نام یونیک برای هر گرید جهت ذخیره state در localStorage */
    protected childName = '';

    /**   لیست گریدهای فعال */
    private get activeGrids(): GridApi[] {
        return [
            this.gridApi1,
            this.gridApi2,
            this.gridApi3,
            this.gridApi4,
            this.gridApi5,
            this.gridApi6,
        ].filter((api): api is GridApi => !!api);
    }

    // =====================================================
    // 💾 ذخیره و بازیابی وضعیت ستون‌ها
    // =====================================================

    /** 💾 ذخیره وضعیت ستون‌ها در LocalStorage */
    saveGridState(): void {
        if (!this.childName) return;

        this.activeGrids.forEach((api, idx) => {
            const key = this._getStorageKey(idx);
            const state = api.getColumnState(); // از GridApi
            try {
                localStorage.setItem(key, JSON.stringify(state));
            } catch (error) {
                console.warn(`  ذخیره state گرید ${idx + 1} انجام نشد`, error);
            }
        });
    }

    /**   بازیابی وضعیت ستون‌ها از LocalStorage */
    restoreGridState(): void {
        if (!this.childName) return;

        this.activeGrids.forEach((api, idx) => {
            const key = this._getStorageKey(idx);
            const saved = localStorage.getItem(key);
            if (saved) {
                try {
                    api.applyColumnState({
                        state: JSON.parse(saved) as ColumnState[],
                        applyOrder: true,
                    });
                } catch (error) {
                    console.warn(`  بازیابی state گرید ${idx + 1} انجام نشد`, error);
                }
            }
        });
    }

    /** 🔁 ریست به وضعیت اولیه و حذف از LocalStorage */
    resetGridState(): void {
        if (!this.childName) return;

        this.activeGrids.forEach((api, idx) => {
            const key = this._getStorageKey(idx);
            localStorage.removeItem(key);
            api.resetColumnState();
        });
    }

    // =====================================================
    // 🧰 ابزار کمکی
    // =====================================================

    /** تولید کلید ذخیره‌سازی مخصوص هر گرید */
    private _getStorageKey(index: number): string {
        return `${this.childName}_grid${index + 1}_columnState`;
    }
}
