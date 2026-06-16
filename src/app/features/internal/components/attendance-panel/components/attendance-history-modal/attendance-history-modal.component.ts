/* ===============================================================
   📘 AttendanceHistoryModalComponent
   توضیحات کلی:
   این کامپوننت برای نمایش تاریخچه حضور کارشناسان در قالب مودال طراحی شده است.
   شامل گرید داده‌ها، مدیریت حالت نمایش، فرمت‌دهی وضعیت و تاریخ،
   و قابلیت محاسبه تعداد رکوردها می‌باشد.
   =============================================================== */

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, signal, computed } from '@angular/core';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef } from 'ag-grid-community';
import { CellStatusAttendanceHistoryPanel } from './cell-status-history-attendance-panel';

@Component({
  selector: 'app-attendance-history-modal',
  standalone: true,
  imports: [CommonModule, AgGridModule],
  templateUrl: './attendance-history-modal.component.html',
})
export class AttendanceHistoryModalComponent {

  // ===============================================================
  //    وضعیت نمایش مودال
  // ===============================================================
  private _visible = signal(false);
  themeClass = 'ag-theme-quartz kowsar-ag-grid';
  @Input() set visible(v: boolean) {
    this._visible.set(v);
  }

  get visibleValue(): boolean {
    return this._visible();
  }

  // ===============================================================
  //    داده‌های تاریخچه
  // ===============================================================
  private _records = signal<any[]>([]);

  @Input() set records(r: any[]) {
    this._records.set(r ?? []);
  }

  get recordsValue(): any[] {
    return this._records();
  }

  // ===============================================================
  //    سایر ورودی‌ها
  // ===============================================================
  @Input() title = 'تاریخچه حضور';
  @Input() darkMode = false;

  // ===============================================================
  //    خروجی‌ها
  // ===============================================================
  @Output() close = new EventEmitter<void>();

  // ===============================================================
  //    محاسبه تعداد کل رکوردها
  // ===============================================================
  totalRecords = computed(() => this._records().length);

  // ===============================================================
  //    تنظیمات گرید
  // ===============================================================
  columnDefs: ColDef[] = [
    {
      field: 'AttendanceDate',
      headerName: 'تاریخ و ساعت حضور',
      valueFormatter: this.formatDate,
    },


    { field: 'وضعیت حضور', cellRenderer: CellStatusAttendanceHistoryPanel, cellClass: 'text-center', width: 80 },

    {
      field: 'PhFirstName',
      headerName: 'نام',
    },
    {
      field: 'PhLastName',
      headerName: 'نام خانوادگی',
    },
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
  //    رویداد بستن مودال
  // ===============================================================
  closeModal(): void {
    this.close.emit();
  }

  // ===============================================================
  //    فرمت تاریخ به فارسی
  // ===============================================================
  formatDate(params: any): string {

    if (!params.value) {
      return '';
    }

    const date = new Date(params.value);

    return date.toLocaleString('fa-IR', {
      dateStyle: 'short',
      timeStyle: 'short',
    });
  }

  // ===============================================================
  //    ساخت Badge وضعیت حضور
  // ===============================================================
  styles: [`

    .kws-attendance-wrapper {

        width: 100%;

        height: 100%;

        display: flex;

        align-items: center;

        justify-content: center;
    }

    .kws-attendance-badge {

        padding: 4px 10px;

        border-radius: 20px;

        font-size: 11px;

        font-weight: 700;

        line-height: 1.2;

        white-space: nowrap;

        min-width: 90px;

        text-align: center;

        box-shadow: 0 1px 2px rgba(0,0,0,.08);
    }

`]
  private statusBadgeRenderer(params: any): string {

    const status = this.getStatusInfo(params.value);

    return `
        <div class="kws-attendance-wrapper">

            <span class="kws-attendance-badge ${status.className}">
                ${status.label}
            </span>

        </div>
    `;
  }
  // ===============================================================
  //    تعیین متن و رنگ وضعیت حضور
  // ===============================================================
  private getStatusInfo(status: string | number | null): { label: string; className: string } {

    switch (String(status ?? '')) {

      case '0':
        return {
          label: 'عدم حضور',
          className: 'bg-danger text-white',
        };

      case '1':
        return {
          label: 'آزاد',
          className: 'bg-success text-white',
        };

      case '2':
        return {
          label: 'در حال کار',
          className: 'bg-warning text-dark',
        };

      case '3':
        return {
          label: 'ناهار و نماز',
          className: 'bg-info text-white',
        };

      case '4':
        return {
          label: 'مرخصی اداری',
          className: 'bg-primary text-white',
        };

      case '5':
        return {
          label: 'قطع برق و اینترنت',
          className: 'bg-secondary text-white',
        };

      default:
        return {
          label: '—',
          className: 'bg-light text-dark',
        };
    }
  }
}