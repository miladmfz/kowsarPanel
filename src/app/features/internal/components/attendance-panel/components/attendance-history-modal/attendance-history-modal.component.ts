/* ===============================================================
   📘 AttendanceHistoryModalComponent
   توضیحات کلی:
   این کامپوننت برای نمایش تاریخچه حضور کارشناسان در قالب مودال طراحی شده است.
   شامل گرید داده‌ها، مدیریت حالت نمایش، فرمت‌دهی وضعیت و تاریخ، 
   و قابلیت محاسبه تعداد رکوردها می‌باشد.

   ویژگی‌ها:
   1️⃣ ورودی داده‌ها و وضعیت نمایش مودال از Parent
   2️⃣ خروجی برای بستن مودال
   3️⃣ استفاده از سیگنال‌ها (Signals) برای داده‌های واکنشی
   4️⃣ فرمت اختصاصی برای تاریخ و وضعیت حضور
   =============================================================== */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';

@Component({
  selector: 'app-attendance-history-modal',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './attendance-history-modal.component.html',
})
export class AttendanceHistoryModalComponent {
  // ===============================================================
  // 🟦 وضعیت نمایش مودال
  // ===============================================================
  private _visible = signal(false);

  @Input() set visible(v: boolean) {
    this._visible.set(v);
  }

  get visibleValue(): boolean {
    return this._visible();
  }

  // ===============================================================
  //   داده‌های تاریخچه
  // ===============================================================
  private _records = signal<any[]>([]);

  @Input() set records(r: any[]) {
    this._records.set(r ?? []);
  }

  get recordsValue(): any[] {
    return this._records();
  }

  // ===============================================================
  //   سایر ورودی‌ها
  // ===============================================================
  @Input() title = 'تاریخچه حضور';
  @Input() darkMode = false;

  // ===============================================================
  // 🔸 خروجی‌ها
  // ===============================================================
  @Output() close = new EventEmitter<void>();

  // ===============================================================
  // 🧮 محاسبه تعداد کل رکوردها
  // ===============================================================
  totalRecords = computed(() => this._records().length);

  // ===============================================================
  // 📋 تنظیمات گرید
  // ===============================================================
  columnDefs: ColDef[] = [
    {
      field: 'AttendanceDate',
      headerName: 'تاریخ و ساعت حضور',
      valueFormatter: this.formatDate,
    },
    {
      field: 'Status',
      headerName: 'وضعیت',
      valueFormatter: this.statusFormatter,
    },
    { field: 'PhFirstName', headerName: 'نام' },
    { field: 'PhLastName', headerName: 'نام خانوادگی' },
  ];

  defaultColDef: ColDef = {
    resizable: true,
    sortable: true,
    filter: true,
    flex: 1,
    cellClass: 'text-center',
  };

  localeText = {
    noRowsToShow: 'هیچ اطلاعاتی برای نمایش وجود ندارد',
  };

  // ===============================================================
  // 🔘 رویداد بستن مودال
  // ===============================================================
  closeModal(): void {
    this.close.emit();
  }

  // ===============================================================
  // 📅 فرمت تاریخ به فارسی
  // ===============================================================
  formatDate(params: any): string {
    if (!params.value) return '';
    const d = new Date(params.value);
    return d.toLocaleString('fa-IR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  // ===============================================================
  // 🟡 فرمت وضعیت حضور
  // ===============================================================
  statusFormatter(params: any): string {
    switch (String(params.value ?? '')) {
      case '0':
        return '❌ عدم حضور';
      case '1':
        return '  آزاد';
      case '2':
        return '🟡 در حال کار';
      case '3':
        return '🕓 ناهار و نماز';
      case '4':
        return '🏖️ مرخصی اداری';
      case '5':
        return '⚡ قطع برق و اینترنت';
      default:
        return '—';
    }
  }
}
