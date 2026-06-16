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
import { Component, inject, Input, OnInit, signal } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { KowsarBaseWebApi } from 'src/app/app-shell/framework-services/base/KowsarBaseWebApi.service';
import { DateSyncService } from 'src/app/app-shell/framework-services/date-sync.service';
import { LeaveRequestWebApiService } from 'src/app/features/automation/services/LeaveRequestWebApi.service';

@Component({
    selector: 'app-leave-grid',
    standalone: true,
    imports: [CommonModule, AgGridModule],
    templateUrl: './leave-grid.component.html',
})
export class LeaveGridComponent extends AgGridBaseComponent implements OnInit {

    // ===============================================================
    //    ورودی‌ها و وضعیت‌ها
    // ===============================================================

    /** 📥 داده ارسال‌شده از Parent (اختیاری) */
    @Input() externalData: any[] | null = null;

    /** 🎨 وضعیت تم */
    @Input() darkMode = false;

    /**   داده اصلی جدول */
    records = signal<any[]>([])

    /**   وضعیت بارگذاری */
    loading = signal(true)

    /** 📅 تاریخ روز جاری */
    ToDayDate = signal('')

    // ===============================================================
    // 🧱 سازنده
    // ===============================================================

    private readonly base_repo = inject(KowsarBaseWebApi);
    private readonly leave_repo = inject(LeaveRequestWebApiService);
    constructor() {
        super();
    }

    // ===============================================================
    // 🚀 اجرای اولیه کامپوننت
    // ===============================================================
    ngOnInit(): void {

        // 📋 تعریف ستون‌ها
        this.column_name_1 = [
            { field: 'CentralName', headerName: 'کارشناس', cellClass: 'text-center', minWidth: 120 },
            { field: 'LeaveStartDate', headerName: 'تاریخ شروع', cellClass: 'text-center', width: 100 },
            { field: 'LeaveEndDate', headerName: 'تاریخ پایان', cellClass: 'text-center', width: 100 },
            { field: 'LeaveStartTime', headerName: 'ساعت شروع', cellClass: 'text-center', width: 70 },
            { field: 'LeaveEndTime', headerName: 'ساعت پایان', cellClass: 'text-center', width: 70 },
        ];

        // 🟢 بررسی ورودی Parent یا بارگذاری از سرور
        this.loadFromServer()
    }

    // ===============================================================
    // 📡 بارگذاری داده از سرور
    // ===============================================================
    private loadFromServer(): void {

        this.base_repo.GetTodeyFromServer().subscribe((data: any) => {

            this.ToDayDate.set(data.Text)

            this.leave_repo.GetLeaveRequestPerson(this.ToDayDate()).subscribe({
                next: (data: any) => {

                    this.records.set(data?.LeaveRequests ?? [])
                    this.loading.set(false)
                    this.updateGridData(1, this.records());
                },
                error: (err) => {
                    console.error('❌ خطا در دریافت مرخصی‌ها:', err);
                    this.records.set([])
                    this.loading.set(false)
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
