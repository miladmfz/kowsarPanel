import { Directive } from '@angular/core';
import type { GridApi, GridReadyEvent } from 'ag-grid-community';

@Directive()
export abstract class AgGridApiComponent {
    /** آرایه امن برای نگهداری API تمام گریدها */
    protected gridApis: GridApi[] = [];

    gridApi1?: GridApi;
    gridApi2?: GridApi;
    gridApi3?: GridApi;
    gridApi4?: GridApi;
    gridApi5?: GridApi;
    gridApi6?: GridApi;

    // ===============================================================
    // 🔧 تابع مشترک برای تمام گریدها
    // ===============================================================
    protected _onGridCommonReady(params: GridReadyEvent): void {
        if (!params?.api) return;

        // اطمینان از ایجاد آرایه قبل از push
        if (!Array.isArray(this.gridApis)) {
            this.gridApis = [];
        }
        this.gridApis.push(params.api);

        try {
            const gridOptions = (params.api as any).gridOptionsWrapper?.gridOptions;
            if (gridOptions) {
                gridOptions.ensureDomOrder = true;
                gridOptions.suppressColumnMoveAnimation = true;
                gridOptions.domLayout = 'normal';
            }
        } catch { }

        setTimeout(() => {
            try {
                params.api.sizeColumnsToFit();
            } catch { }
        }, 150);
    }

    // ===============================================================
    // 🎯 ثبت onGridReady برای گریدهای ۱ تا ۶
    // ===============================================================
    public onGridReady1(params: GridReadyEvent): void {
        this.gridApi1 = params.api;
        this._onGridCommonReady(params);
        setTimeout(() => this.gridApi1?.sizeColumnsToFit(), 150);
    }

    public onGridReady2(params: GridReadyEvent): void {
        this.gridApi2 = params.api;
        this._onGridCommonReady(params);
        setTimeout(() => this.gridApi2?.sizeColumnsToFit(), 150);
    }

    public onGridReady3(params: GridReadyEvent): void {
        this.gridApi3 = params.api;
        this._onGridCommonReady(params);
        setTimeout(() => this.gridApi3?.sizeColumnsToFit(), 150);
    }

    public onGridReady4(params: GridReadyEvent): void {
        this.gridApi4 = params.api;
        this._onGridCommonReady(params);
        setTimeout(() => this.gridApi4?.sizeColumnsToFit(), 150);
    }

    public onGridReady5(params: GridReadyEvent): void {
        this.gridApi5 = params.api;
        this._onGridCommonReady(params);
        setTimeout(() => this.gridApi5?.sizeColumnsToFit(), 150);
    }

    public onGridReady6(params: GridReadyEvent): void {
        this.gridApi6 = params.api;
        this._onGridCommonReady(params);
        setTimeout(() => this.gridApi6?.sizeColumnsToFit(), 150);
    }

    // ===============================================================
    //   عملگرهای عمومی روی همه گریدها
    // ===============================================================
    public refreshAllGrids(): void {
        this.gridApis?.forEach(api => {
            try {
                api.refreshCells({ force: true });
            } catch { }
        });
    }

    public sizeToFitAll(): void {
        this.gridApis?.forEach(api => {
            try {
                api.sizeColumnsToFit();
            } catch { }
        });
    }

    protected checkAnyGridReady(): boolean {
        return Array.isArray(this.gridApis) && this.gridApis.length > 0;
    }

    // ===============================================================
    // 🧹 پاک‌سازی داده‌ها
    // ===============================================================
    public clearGrid(gridNumber?: number): void {
        if (!this.checkAnyGridReady()) return;

        if (!gridNumber) {
            this.gridApis.forEach(api => {
                try {
                    api.setGridOption?.('rowData', []);
                } catch {
                    (api as any)?.setRowData?.([]);
                }
            });
            return;
        }

        const targetApi = (this as any)[`gridApi${gridNumber}`] as GridApi | undefined;
        if (!targetApi) return;

        try {
            targetApi.setGridOption?.('rowData', []);
        } catch {
            (targetApi as any)?.setRowData?.([]);
        }
    }

    // ===============================================================
    // 🔁 به‌روزرسانی داده‌ها
    // ===============================================================
    public updateGridData(gridNumber: number, data: any[]): void {
        if (!gridNumber || !Array.isArray(data)) return;

        const targetApi = (this as any)[`gridApi${gridNumber}`] as GridApi | undefined;
        if (!targetApi) return;

        try {
            targetApi.setGridOption?.('rowData', data);
        } catch {
            (targetApi as any)?.setRowData?.(data);
        }
    }
}
