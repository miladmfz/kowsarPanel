/* ===============================================================
     AttendanceGridComponent
   توضیحات کلی:
   این کامپوننت وظیفه‌ی نمایش گرید حضور کارشناسان را بر عهده دارد.
   داده‌ها از سرویس DashboardWebApiService خوانده شده و در AgGrid نمایش داده می‌شوند.
   ویژگی‌ها:
   1️⃣ نمایش لیست حضور کارشناسان با جزئیات کامل
   2️⃣ پشتیبانی از تم روشن و تاریک با ThemeService
   3️⃣ به‌روزرسانی واکنشی داده‌ها با استفاده از Signal و Effect
   4️⃣ ارتباط دوطرفه با Parent برای باز کردن تیکت یا تاریخچه حضور
   =============================================================== */

import { CommonModule } from '@angular/common';
import {
    Component,
    Input,
    Output,
    EventEmitter,
    signal,
    effect,
    OnInit,
} from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ThemeService } from 'src/app/app-shell/framework-services/ui/theme.service';

// ===============================================================
//   Cell Renderers
// ===============================================================
import { CellActionAttendancePanel } from './cell-renderers/cell-action-attendance-panel';
import { CellDateAttendancePanel } from './cell-renderers/cell-date-label-attendance-panel';
import { CellNameAttendancePanel } from './cell-renderers/cell-name-label-attendance-panel';
import { CellStatusAttendancePanel } from './cell-renderers/cell-status-label-attendance-panel';

// ===============================================================
//   Services
// ===============================================================
import { DashboardWebApiService } from 'src/app/app-shell/core/services/dashboard-web-api.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';

@Component({
    selector: 'app-attendance-grid',
    standalone: true,
    imports: [CommonModule, AgGridModule],
    templateUrl: './attendance-grid.component.html',
})
export class AttendanceGridComponent extends AgGridBaseComponent implements OnInit {
    /** 🌗 وضعیت تم (Dark / Light) */
    @Input({ required: true }) darkMode = false;

    /** 📤 رویدادهای خروجی برای Parent */
    @Output() openLetter = new EventEmitter<any>();
    @Output() openHistory = new EventEmitter<any>();

    /**   داده‌ها و وضعیت بارگذاری (Reactive Signals) */
    records = signal<any[]>([]);
    loading = signal(true);

    // ===============================================================
    // 🔹 سازنده کلاس و مدیریت Signal‌ها
    // ===============================================================
    constructor(
        private repo: DashboardWebApiService,
    ) {
        super();

        // 💡 هر زمان داده‌ها تغییر کنند → گرید را به‌روزرسانی کن
        effect(() => {
            if (this.gridApi1 && !this.loading()) {
                this.gridApi1.setGridOption('rowData', this.records());
            }
        });
    }

    // ===============================================================
    // 🔹 متد Lifecycle برای آماده‌سازی ستون‌ها و داده‌ها
    // ===============================================================
    ngOnInit(): void {

        // 🧱 تعریف ستون‌های گرید حضور کارشناسان
        this.columnDefs1 = [
            { field: 'عملیات', pinned: 'left', cellRenderer: CellActionAttendancePanel, width: 180 },
            { field: 'کارشناس', cellRenderer: CellNameAttendancePanel, cellClass: 'text-center', minWidth: 120 },
            { field: 'وضعیت حضور', cellRenderer: CellStatusAttendancePanel, cellClass: 'text-center', minWidth: 120 },
            { field: 'تاریخ', cellRenderer: CellDateAttendancePanel, cellClass: 'text-center', minWidth: 120 },
            { field: 'CustNames', headerName: 'مشتری', cellClass: 'text-center', minWidth: 120 },
        ];

        this.refresh();
    }
    override onGridReady(params: any, index: number) {
        super.onGridReady(params, index);

        // ذخیره API درست
        if (index >= 1 && index <= 6) {
            (this as any)[`gridApi${index}`] = params.api;
        }

        // فیت کردن ستون‌ها با تأخیر کوتاه
        setTimeout(() => {
            try {
                if (params.api && !params.api.isDestroyed?.()) {
                    params.api.sizeColumnsToFit();
                }
            } catch { }
        }, 50);
    }

    // ===============================================================
    //   دریافت و بروزرسانی داده‌ها از API
    // ===============================================================
    refresh(): void {
        this.loading.set(true);
        this.repo.AttendanceDashboard().subscribe({
            next: (data: any) => {
                this.records.set(data?.Attendances ?? []);
                this.loading.set(false);
                this.updateGridData(1, this.records());
            },
            error: (err) => {
                console.error('❌ خطا در دریافت اطلاعات حضور:', err);
                this.records.set([]);
                this.loading.set(false);
            },
        });
    }

    // ===============================================================
    // 📨 اکشن‌ها برای Parent Component
    // ===============================================================

    /** 📬 باز کردن تیکت مربوط به کارشناس */
    SetLetter_config(item: any): void {
        this.openLetter.emit(item);
    }

    /** 🕓 نمایش تاریخچه حضور کارشناس */
    ShowHistory(item: any): void {
        this.openHistory.emit(item);
    }
}
