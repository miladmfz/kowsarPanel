/**
 * 🧱 ag-grid-base.component.ts (نسخه نهایی بدون خطا)
 * --------------------------------------------------------
 * کلاس پایه نهایی برای تمام componentهای مبتنی بر AG Grid در پروژه کوثر.
 */

import { Directive } from '@angular/core';
import { AgGridApiComponent } from './core/ag-grid-api.component';
import { AgGridEventsComponent } from './core/ag-grid-events.component';
import { AgGridExportComponent } from './core/ag-grid-export.component';
import { AgGridStateComponent } from './core/ag-grid-state.component';
import { AgGridCoreComponent } from './core/ag-grid-core.component';

@Directive()
export abstract class AgGridBaseComponent extends AgGridCoreComponent {
    // --------------------------------------------------------
    //   آماده‌سازی گرید و منوی راست‌کلیک
    // --------------------------------------------------------
    private enterpriseReady = false;

    private async ensureEnterpriseReady(): Promise<void> {
        if (this.enterpriseReady) return;

        const { ModuleRegistry } = await import('ag-grid-community');

        const {
            AllEnterpriseModule,
            LicenseManager,
        } = await import('ag-grid-enterprise');

        LicenseManager.setLicenseKey('MjAwMDAwMDAwMDAwMA==5a5ea3be8a8aaa9b54ce7186663066431');

        ModuleRegistry.registerModules([
            AllEnterpriseModule,
        ]);

        this.enterpriseReady = true;
    }
    override onGridReady(params: any, index?: number): void {
        super.onGridReady(params, index);

        // --- 1) ست کردن اتوماتیک API برای هر grid ---
        if (index) {
            const apiKey = `gridApi${index}`;
            (this as any)[apiKey] = params.api;

            // اگر دیتای قبلاً لود شده وجود دارد → همین‌جا ست کن
            const pending = (this as any).records;
            if (Array.isArray(pending) && pending.length > 0) {
                try {
                    this.updateGridData(index, pending);
                    setTimeout(() => {

                        try {

                            if (
                                params.api &&
                                params.api.getDisplayedRowCount() >= 0
                            ) {

                                params.api.sizeColumnsToFit?.();

                            }

                        } catch { }

                    }, 100);
                } catch { }
            }
        }

        // --- 2) کانتکست منوی سفارشی ---
        if (typeof this.getCustomContextMenuItems === 'function') {
            try {
                params.api.setGridOption?.(
                    'getContextMenuItems',
                    this.getCustomContextMenuItems.bind(this)
                );

                // fallback نسخه قدیمی
                if (params.api.gridOptionsWrapper) {
                    (params.api.gridOptionsWrapper as any).gridOptions.getContextMenuItems =
                        this.getCustomContextMenuItems.bind(this);
                }
            } catch (err) {
                console.warn('  تنظیم getContextMenuItems با خطا مواجه شد:', err);
            }
        }
    }
    protected syncSortedData(
        index: number,
        targetSetter: (data: any[]) => void
    ): void {
        const api = (this as any)[`gridApi${index}`];
        if (!api) return;

        const ordered: any = []
        api.forEachNodeAfterFilterAndSort((node: any) => {
            ordered.push(node.data);
        });

        targetSetter(ordered);
    }

    // --------------------------------------------------------
    // 📜 منوی راست‌کلیک فارسی و ایمن
    // --------------------------------------------------------
    getCustomContextMenuItems = (params: any): any[] => {
        const colId = params.column?.getId?.();
        const menu: any = []

        if (colId) {
            menu.push(
                'separator',
                {
                    name: '📏 بهینه‌سازی عرض ستون',
                    action: () => {
                        try {
                            params.api?.autoSizeColumns?.([colId], false);
                        } catch (e) {
                            console.warn('  AutoSizeColumns skipped:', e);
                        }
                    },
                },
                'separator'
            );
        }

        menu.push(
            {
                name: '📤 خروجی Excel',
                action: () => {
                    try {
                        const fn = (this as any)?.onExportExcel;
                        if (typeof fn === 'function') fn.call(this, params);
                        else
                            params.api?.exportDataAsExcel?.({
                                fileName: `${this?.childName || 'KowsarReport'}.xlsx`,
                            });
                    } catch (e) {
                        console.error('❌ خطا در اجرای خروجی Excel:', e);
                    }
                },
            },
            {
                name: '  خروجی CSV',
                action: () => {
                    try {
                        const fn = (this as any)?.onExportCSV;
                        if (typeof fn === 'function') fn.call(this, params);
                        else
                            params.api?.exportDataAsCsv?.({
                                fileName: `${this?.childName || 'KowsarReport'}.csv`,
                            });
                    } catch (e) {
                        console.error('❌ خطا در اجرای خروجی CSV:', e);
                    }
                },
            },
            'separator',
            {
                name: '📋 کپی مقدار سلول',
                action: () => {
                    try {
                        params.api?.copySelectedRangeToClipboard?.();
                    } catch (e) {
                        console.warn('  copySelectedRangeToClipboard skipped:', e);
                    }
                },
            },
            'copyWithHeaders',
            'separator',
            {
                name: '  بازنشانی تنظیمات ستون‌ها',
                action: () => {
                    try {
                        params.columnApi?.resetColumnState?.();
                    } catch (e) {
                        console.warn('  resetColumnState skipped:', e);
                    }
                },
            }
        );

        return menu();
    };

    // --------------------------------------------------------
    //   امضاهای اختیاری برای template-binding
    // --------------------------------------------------------
    onExportExcel?(param): void;
    onExportCSV?(param): void;
    onCellClicked?(event: any): void;
    onCellDoubleClicked?(event: any): void;
    onFirstDataRendered?(event: any): void;
    onReloadGrid?(): void;
    refreshAllGrids?(): void;
    sizeToFitAll?(): void;
    clearGrid?(index?: number): void;
    override updateGridData(index: number, data: any[]): void {
        // اگر کلاس Core متد اصلی را دارد، صدا بزن
        super.updateGridData?.(index, data);
    }
    constructor() {
        super();
    }
}

/**
 *   تابع استاندارد ترکیب mixinها
 */
function applyMixins(derivedCtor: any, baseCtors: any[]) {
    baseCtors.forEach(baseCtor => {
        Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
            if (name !== 'constructor') {
                Object.defineProperty(
                    derivedCtor.prototype,
                    name,
                    Object.getOwnPropertyDescriptor(baseCtor.prototype, name) ||
                    Object.create(null)
                );
            }
        });
    });
}

/**
 *   ادغام نهایی تمام core-ها در BaseComponent
 */
applyMixins(AgGridBaseComponent, [
    AgGridApiComponent,
    AgGridEventsComponent,
    AgGridExportComponent,
    AgGridStateComponent,
]);
