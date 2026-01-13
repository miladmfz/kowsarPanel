/**
 * 📤 ag-grid-export.component.ts (نسخه نهایی و ایمن)
 * ------------------------------------------------------------
 * پشتیبانی از خروجی Excel و CSV با context امن حتی در منوی راست‌کلیک.
 * این نسخه تضمین می‌کند که همیشه api فعال پیدا شود.
 */

import { Directive } from '@angular/core';
import type { GridApi } from 'ag-grid-community';
import { AgGridStateComponent } from './ag-grid-state.component';

@Directive()
export abstract class AgGridExportComponent extends AgGridStateComponent {
    /**
     *   دریافت GridApi فعال از چند مسیر ممکن (params یا gridApiX)
     */
    protected getActiveGrid(params?: any): GridApi | undefined {
        try {
            // اگر از context menu یا event آمده:
            if (params?.api) return params.api as GridApi;

            // در غیر این صورت یکی از gridApiها
            const grids = [
                this.gridApi1,
                this.gridApi2,
                this.gridApi3,
                this.gridApi4,
                this.gridApi5,
                this.gridApi6,
            ].filter((g): g is GridApi => !!g);

            return grids.length ? grids[0] : undefined;
        } catch {
            return undefined;
        }
    }

    /**
     * 📗 خروجی گرفتن از داده‌ها به Excel با استایل سازمانی کوثر
     */
    onExportExcel(params?: any): void {
        const api = this.getActiveGrid(params);
        if (!api) {
            console.error('❌ هیچ Grid فعالی برای خروجی وجود ندارد.');
            return;
        }

        // 🗓️ تاریخ شمسی برای نام فایل
        const today = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
        const fileBaseName = this.childName ? `گزارش ${this.childName}` : 'گزارش کوثر';
        const fileName = `${this.childName || 'KowsarReport'}_${today}.xlsx`;

        const exportParams: any = {
            fileName,
            sheetName: 'Kowsar ERP Report',
            exportMode: 'xlsx',
            columnWidth: 160,

            processCellCallback: (cellParams: any) => {
                if (cellParams.value == null) return '';
                const colId = cellParams.column?.getColId()?.toLowerCase?.() || '';
                if (colId.includes('minute')) return `${cellParams.value} دقیقه`;
                return cellParams.value;
            },

            processHeaderCallback: (headerParams: any) => {
                const header =
                    headerParams.column?.getColDef?.().headerName ??
                    headerParams.column?.getColId() ??
                    '';
                return `💠 ${header}`;
            },

            prependContent: [
                {
                    styleId: 'headerRow',
                    cells: [{ mergeAcross: 7, data: { type: 'String', value: fileBaseName } }],
                },
                {
                    styleId: 'subHeaderRow',
                    cells: [
                        {
                            mergeAcross: 7,
                            data: { type: 'String', value: 'سامانه هوشمند کوثر - نسخه سازمانی' },
                        },
                    ],
                },
            ],

            appendContent: [
                {
                    styleId: 'footerRow',
                    cells: [
                        {
                            mergeAcross: 7,
                            data: {
                                type: 'String',
                                value:
                                    '📅 تاریخ خروجی: ' +
                                    new Date().toLocaleDateString('fa-IR') +
                                    '   ⏰ ساعت: ' +
                                    new Date().toLocaleTimeString('fa-IR'),
                            },
                        },
                    ],
                },
                {
                    styleId: 'footerBrandRow',
                    cells: [
                        {
                            mergeAcross: 7,
                            data: { type: 'String', value: '© Kowsar ERP Systems — All Rights Reserved' },
                        },
                    ],
                },
            ],

            exportStyles: [
                {
                    id: 'headerRow',
                    alignment: { horizontal: 'Center', vertical: 'Center' },
                    font: { bold: true, color: '#FFFFFF', size: 14 },
                    fill: { patternType: 'solid', fgColor: { rgb: '002C6C' } },
                },
                {
                    id: 'subHeaderRow',
                    alignment: { horizontal: 'Center' },
                    font: { italic: true, color: '#FFD700', size: 12 },
                    fill: { patternType: 'solid', fgColor: { rgb: '003580' } },
                },
                {
                    id: 'footerRow',
                    alignment: { horizontal: 'Right' },
                    font: { bold: true, color: '#333333', size: 11 },
                    fill: { patternType: 'solid', fgColor: { rgb: 'E8EAF6' } },
                },
                {
                    id: 'footerBrandRow',
                    alignment: { horizontal: 'Center' },
                    font: { italic: true, color: '#777777', size: 10 },
                },
            ],
        };

        try {
            api.exportDataAsExcel(exportParams);
            console.info(`  خروجی Excel برای ${fileName} ایجاد شد.`);
        } catch (e) {
            console.error('❌ خطا در زمان خروجی Excel:', e);
        }
    }

    /**
     * 📘 خروجی گرفتن از داده‌ها به CSV (سازگار با فارسی)
     */
    onExportCSV(params?: any): void {
        const api = this.getActiveGrid(params);
        if (!api) {
            console.error('❌ هیچ Grid فعالی برای خروجی وجود ندارد.');
            return;
        }

        const today = new Date().toLocaleDateString('fa-IR').replace(/\//g, '-');
        const fileName = `${this.childName || 'KowsarReport'}_${today}.csv`;

        try {
            api.exportDataAsCsv({
                fileName,
                columnSeparator: ',',
                processCellCallback: (cellParams: any) =>
                    cellParams.value != null
                        ? cellParams.value.toString().replace(/,/g, '،')
                        : '',
            });
            console.info(`  خروجی CSV برای ${fileName} ایجاد شد.`);
        } catch (e) {
            console.error('❌ خطا در زمان خروجی CSV:', e);
        }
    }
}
