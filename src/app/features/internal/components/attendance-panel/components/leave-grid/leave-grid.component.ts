/* ===============================================================
   📘 LeaveGridComponent
   توضیحات کلی:
   این کامپوننت جدول اطلاعات مرخصی کارشناسان را نمایش می‌دهد.
   اگر داده‌ای از Parent رسیده باشد از همان استفاده می‌شود،
   در غیر این صورت با استفاده از DateSyncService تاریخ روز را
   همگام‌سازی کرده و درصورت تغییر، داده‌ها را از سرور واکشی
   و گرید را به‌روزرسانی می‌کند.

   ویژگی‌ها:
   1️⃣ پشتیبانی از تم تاریک و روشن
   2️⃣ قابلیت دریافت داده از Parent (externalData)
   3️⃣ استفاده از ag-Grid برای نمایش داده‌ها
   4️⃣ قابلیت رفرش داده‌ها از Parent Component
   =============================================================== */

import { CommonModule } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { DashboardWebApiService } from 'src/app/app-shell/core/services/dashboard-web-api.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { DateSyncService } from 'src/app/app-shell/framework-services/date-sync.service';
import { LoadingService } from 'src/app/app-shell/framework-services/ui/loading.service';

@Component({
    selector: 'app-leave-grid',
    standalone: true,
    imports: [CommonModule, AgGridModule],
    templateUrl: './leave-grid.component.html',
})
export class LeaveGridComponent extends AgGridBaseComponent implements OnInit {

    // ===============================================================
    // 🟦 ورودی‌ها و وضعیت‌ها
    // ===============================================================

    /** 📥 داده ارسال‌شده از Parent (اختیاری) */
    @Input() externalData: any[] | null = null;

    /** 🎨 وضعیت تم */
    @Input() darkMode = false;

    /**   داده اصلی جدول */
    records: any[] = [];

    /**   وضعیت بارگذاری */
    loading = true;

    /** 📅 تاریخ روز جاری */
    ToDayDate = '';

    // ===============================================================
    // 🧱 سازنده
    // ===============================================================
    private readonly loadingService = inject(LoadingService);
    private readonly repo = inject(DashboardWebApiService);
    private readonly dateSyncService = inject(DateSyncService);

    constructor() {
        super();
    }

    // ===============================================================
    // 🚀 اجرای اولیه کامپوننت
    // ===============================================================
    ngOnInit(): void {

        // 📋 تعریف ستون‌ها
        this.columnDefs1 = [
            { field: 'CentralName', headerName: 'کارشناس', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 120 },
            { field: 'LeaveRequestType', headerName: 'نوع مرخصی', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 120 },
            { field: 'LeaveStartDate', headerName: 'تاریخ شروع', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 120 },
            { field: 'LeaveEndDate', headerName: 'تاریخ پایان', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 120 },
            { field: 'LeaveStartTime', headerName: 'ساعت شروع', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 120 },
            { field: 'LeaveEndTime', headerName: 'ساعت پایان', filter: 'agSetColumnFilter', cellClass: 'text-center', minWidth: 120 },
        ];

        // 🟢 بررسی ورودی Parent یا بارگذاری از سرور
        this.loadFromServer()
    }

    // ===============================================================
    // 📡 بارگذاری داده از سرور
    // ===============================================================
    private loadFromServer(): void {
        this.loadingService.show()
        this.repo.GetTodeyFromServer().subscribe((data: any) => {
            this.loadingService.hide()
            this.ToDayDate = data.Text
            this.loadingService.show()
            this.repo.GetLeaveRequestPerson(this.ToDayDate).subscribe({
                next: (data: any) => {
                    this.loadingService.hide()
                    this.records = data?.LeaveRequests ?? [];
                    this.loading = false;
                    this.updateGridData(1, this.records);
                },
                error: (err) => {
                    console.error('❌ خطا در دریافت مرخصی‌ها:', err);
                    this.records = [];
                    this.loading = false;
                },
            });
        });



    }

    // ===============================================================
    // 📌 تنظیم API هر گرید هنگام آماده شدن
    // ===============================================================
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
    //   رفرش داده از Parent
    // ===============================================================
    public refresh(): void {
        this.loadFromServer();
    }
}
