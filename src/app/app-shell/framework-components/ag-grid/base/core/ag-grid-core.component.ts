/**
 * 🧠 ag-grid-core.component.ts (نسخه نهایی سازگار با AG Grid v31+)
 * ---------------------------------------------------------------
 * پایه‌ی تمام تنظیمات عمومی AG Grid در پروژه کوثر.
 *
 * وظایف اصلی:
 *  - تنظیم locale فارسی
 *  - مدیریت theme روشن / تیره از ThemeService
 *  - تعریف gridApi برای حداکثر ۶ جدول مجزا
 *  - تعریف columnDefs1 تا columnDefs6 برای چند گرید همزمان
 *  - تابع عمومی updateGridData برای بارگذاری داده‌ها
 *  - اعمال تنظیمات پیش‌فرض ستون‌ها و localeText
 */

import { Directive, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';
import { localeFA } from '../locale.fa';
import {
    ColDef,
    GridApi,
    GridOptions,
    GridReadyEvent,
} from 'ag-grid-community';

@Directive()
export abstract class AgGridCoreComponent implements OnDestroy {
    // ===============================================================
    // 🌓 Theme & Localization
    // ===============================================================
    protected readonly themeService = inject(ThemeService);
    protected themeSub?: Subscription;

    /** 🎨 کلاس تم برای AG Grid */
    themeClass = 'ag-theme-balham';
    isDarkMode = false;

    /**   ترجمه فارسی پیش‌فرض */
    localeText = localeFA;

    // ===============================================================
    //   تنظیمات پایه ستون و Context
    // ===============================================================
    defaultColDef: ColDef = {
        sortable: true,
        filter: true,
        resizable: true,
        suppressHeaderMenuButton: true,
        suppressSizeToFit: false,
        suppressMovable: false,
        tooltipValueGetter: (params: any) => params.value,
        minWidth: 100,
    };

    /** 🔧 context مشترک بین Componentها */
    context: Record<string, any> = { componentParent: this };

    // ===============================================================
    // 🧱 تعریف ستون‌ها برای چند گرید (۱ تا ۶)
    // ===============================================================
    columnDefs1: ColDef[] = [];
    columnDefs2: ColDef[] = [];
    columnDefs3: ColDef[] = [];
    columnDefs4: ColDef[] = [];
    columnDefs5: ColDef[] = [];
    columnDefs6: ColDef[] = [];

    // ===============================================================
    // 🔩 APIهای گرید برای چند جدول موازی
    // ===============================================================
    gridApi1?: GridApi;
    gridApi2?: GridApi;
    gridApi3?: GridApi;
    gridApi4?: GridApi;
    gridApi5?: GridApi;
    gridApi6?: GridApi;

    // ===============================================================
    //   تنظیمات عمومی گرید
    // ===============================================================
    // [rowSelection]="{ mode: 'singleRow' ,enableClickSelection: false}"

    gridOptions: GridOptions = {
        context: { componentParent: this },
        enableRtl: true,
        animateRows: true,
        pagination: true,
        paginationAutoPageSize: true,

        // rowSelection: {
        //     mode: 'singleRow', // انتخاب تکی
        //     enableClickSelection: false, // جایگزینsuppressRowClickSelection
        // },

        rowHeight: 40,
        headerHeight: 42,
        tooltipShowDelay: 200,
        tooltipHideDelay: 800,
        enableBrowserTooltips: true,
        stopEditingWhenCellsLoseFocus: true,
        suppressFieldDotNotation: true,
        suppressDragLeaveHidesColumns: true,
        suppressHorizontalScroll: false,
        suppressMenuHide: false,
        suppressCellFocus: false,
        suppressColumnVirtualisation: false,
        suppressRowVirtualisation: false,
        domLayout: 'normal',
        localeText: localeFA,

        defaultColDef: {
            flex: 1,
            sortable: true,
            resizable: true,
            filter: 'agTextColumnFilter',
            floatingFilter: true,
            suppressHeaderMenuButton: false,
            tooltipValueGetter: (params: any) => params.value,
            cellStyle: { textAlign: 'center' },
        },

        getContextMenuItems: (params: any) => {
            const colId = params.column?.getId?.();
            const menu: any[] = [];

            // عملیات اختصاصی روی ستون
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

            // ابزارهای عمومی
            menu.push(
                {
                    name: '📤 خروجی Excel',
                    action: () => {
                        try {
                            (this as any)?.onExportExcel?.(params);
                        } catch (e) {
                            console.error('❌ خطا در خروجی Excel:', e);
                        }
                    },
                },
                {
                    name: '  خروجی CSV',
                    action: () => {
                        try {
                            (this as any)?.onExportCSV?.(params);
                        } catch (e) {
                            console.error('❌ خطا در خروجی CSV:', e);
                        }
                    },
                },
                'separator',
                {
                    name: '📋 کپی مقدار سلول',
                    action: () => params.api?.copySelectedRangeToClipboard?.(),
                },
                'copyWithHeaders',
                'separator',
                {
                    name: '  بازنشانی تنظیمات ستون‌ها',
                    action: () => params.columnApi?.resetColumnState?.(),
                }
            );

            return menu;
        },
    };

    // ===============================================================
    // 🔧 سایر تنظیمات عمومی
    // ===============================================================
    /**   تعریف Componentهای سفارشی (Renderer, Editor و غیره) */
    frameworkComponents: Record<string, any> = {};

    /** 💾 نام اختصاصی برای ذخیره State ستون‌ها */
    childName = '';

    // ===============================================================
    //   سازنده و تم
    // ===============================================================
    constructor() {
        this.themeSub = this.themeService.theme$.subscribe((theme) => {
            this.isDarkMode = theme === 'dark';
            this.themeClass = this.isDarkMode
                ? 'ag-theme-balham-dark'
                : 'ag-theme-balham';
        });
    }

    // ===============================================================
    // 🚀 رویداد آماده‌شدن گرید
    // ===============================================================
    onGridReady(params: GridReadyEvent, index: number = 1): void {
        const apiKey = `gridApi${index}` as keyof this;
        (this as any)[apiKey] = params.api;

        const api = params.api as any;

        //   تنظیم layout پایدار برای نسخه‌های جدید AG Grid
        try {
            const gridOptions = api.gridOptionsWrapper?.gridOptions;
            if (gridOptions) gridOptions.domLayout = 'normal';
        } catch (e) {
            console.warn('  تنظیم layout گرید با خطا مواجه شد:', e);
        }

        // ✨ اندازه‌گذاری خودکار ستون‌ها پس از render
        setTimeout(() => {
            try {
                api?.sizeColumnsToFit();
            } catch { }
        }, 150);
    }

    // ===============================================================
    //   به‌روزرسانی داده‌ها
    // ===============================================================
    updateGridData(index: number, data: any[]): void {
        const apiKey = `gridApi${index}` as keyof this;
        const api = (this as any)[apiKey] as GridApi | undefined;
        if (!api) return;

        const safeApi = api as any;

        // نسخه‌های جدید (v31+)
        if (typeof safeApi.setGridOption === 'function') {
            safeApi.setGridOption('rowData', data ?? []);
            return;
        }

        // نسخه‌های قدیمی‌تر
        if (typeof safeApi.setRowData === 'function') {
            safeApi.setRowData(data ?? []);
            return;
        }

        // fallback نهایی
        if (typeof safeApi.applyTransaction === 'function') {
            safeApi.applyTransaction({ add: data ?? [] });
        }
    }

    // ===============================================================
    // 🧹 پاک‌سازی
    // ===============================================================
    ngOnDestroy(): void {
        this.themeSub?.unsubscribe();
    }
}
