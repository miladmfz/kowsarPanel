/**
 * ⚡ ag-grid-events.component.ts (نسخه نهایی)
 * ---------------------------------------------------------
 * مدیریت عمومی رویدادهای AG Grid:
 *  - کلیک و دوبار کلیک روی سلول‌ها
 *  - تنظیم خودکار ستون‌ها در زمان resize یا render
 *  - بروزرسانی داده‌ها (refresh)
 *  - کنترل انتخاب سطرها و آماده‌سازی گریدها
 */

import { Directive, HostListener } from '@angular/core';
import type {
    GridApi,
    GridReadyEvent,
    CellClickedEvent,
    CellDoubleClickedEvent,
    FirstDataRenderedEvent
} from 'ag-grid-community';
import { AgGridApiComponent } from './ag-grid-api.component';

@Directive()
export abstract class AgGridEventsComponent extends AgGridApiComponent {
    // =====================================================
    //   مقادیر داخلی برای تشخیص دوبارکلیک و resize
    // =====================================================
    private lastClickedCellId: string | null = null;
    private clickCount = 0;
    private resizeThreshold = 2; // دو بار کلیک برای resize

    // =====================================================
    // 🖱️ مدیریت کلیک و دوبار کلیک
    // =====================================================

    /**    کلیک روی سلول */
    onCellClicked(event: CellClickedEvent): void {
        const clickedCellId = event.column.getId() + '_' + event.rowIndex;

        //    گسترش یا بستن group در صورت وجود
        if (event.node && event.node.group) {
            event.node.setExpanded(!event.node.expanded);
        }

        //    تشخیص دوبار کلیک (resize)
        if (clickedCellId === this.lastClickedCellId) {
            this.clickCount++;
        } else {
            this.clickCount = 1;
            this.lastClickedCellId = clickedCellId;
        }

        if (this.clickCount === this.resizeThreshold) {
            this.resizeColumn(event.column);
            this.clickCount = 0;
        }

        //   قابل override در Component فرزند
        // مثال: if (event.colDef.field === 'عملیات') this.openDetails(event.data);
    }

    /** 🟧 دوبار کلیک روی سلول */
    onCellDoubleClicked(event: CellDoubleClickedEvent): void {
        // جهت override در کامپوننت‌های فرزند
        console.log('  Double click:', event);
    }

    // =====================================================
    // 📐 تنظیم و واکنش به render و resize
    // =====================================================

    /**   گرید آماده شد */
    onGridReady(params: GridReadyEvent): void {
        this._onGridCommonReady(params);
        // کمی تأخیر برای اطمینان از render کامل قبل از تنظیم عرض‌ها
        setTimeout(() => this.sizeToFitAll(), 200);
    }

    /**   اولین بارگذاری داده‌ها */
    onFirstDataRendered(event: FirstDataRenderedEvent): void {
        event.api.sizeColumnsToFit();
    }

    /** 📏 تنظیم خودکار عرض ستون‌ها هنگام resize پنجره */
    @HostListener('window:resize')
    onWindowResize(): void {
        this.sizeToFitAll();
    }

    // =====================================================
    //   ابزار refresh
    // =====================================================

    /** 🔁 رفرش کل گریدها */
    onReloadGrid(): void {
        this.refreshAllGrids();
    }

    // =====================================================
    //   ابزار انتخاب سطرها
    // =====================================================

    /** 🟩 انتخاب همه سطرها */
    selectAllRows(): void {
        this.getActiveGridApis().forEach(api => api.selectAll());
    }

    /** ⬜ لغو انتخاب همه سطرها */
    deselectAllRows(): void {
        this.getActiveGridApis().forEach(api => api.deselectAll());
    }

    // =====================================================
    //   ابزار کمکی
    // =====================================================

    /** 🧱 تنظیم عرض ستون خاص (مثلاً در دوبار کلیک) */
    protected resizeColumn(column: any): void {
        if (!column || !this.gridApi1) return;
        const colId = column.getId();
        const state = this.gridApi1.getColumnState();
        const colState = state.find(c => c.colId === colId);
        if (colState) {
            this.gridApi1.autoSizeColumns([colId]); //   نسخه جدید
        }
    }

    /** 🧱 گرفتن همه GridApi های فعال */
    protected getActiveGridApis(): GridApi[] {
        return [
            this.gridApi1,
            this.gridApi2,
            this.gridApi3,
            this.gridApi4,
            this.gridApi5,
            this.gridApi6
        ].filter((api): api is GridApi => !!api);
    }
}
