/* ===============================================================
   🟩 کامپوننت CellStatusAttendancePanel
   توضیحات کلی:
   این کامپوننت به‌عنوان Cell Renderer برای نمایش وضعیت حضور کارشناس در گرید استفاده می‌شود.
   وظیفه آن نمایش وضعیت با رنگ و برچسب مناسب است.
   ویژگی‌ها:
   1️⃣ نمایش وضعیت حضور با متن فارسی و رنگ متناسب (Badge)
   2️⃣ پشتیبانی از حالت‌های مختلف وضعیت از ۰ تا ۵
   3️⃣ جلوگیری از رندر مجدد غیرضروری جهت بهبود عملکرد
   =============================================================== */

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cell-status-attendance-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="badge"
      [ngClass]="badgeClass"
      style="padding: 3px;"
    >
      {{ statusLabel }}
    </span>
  `
})
export class CellStatusWorkItem implements ICellRendererAngularComp {
  private params: any;
  statusLabel: string = '—';
  badgeClass: string = 'bg-secondary text-white';

  // ===============================================================
  //    مقداردهی اولیه AgGrid
  // ===============================================================
  agInit(params: any): void {
    this.params = params;
    const status = params?.data?.Status ?? null;
    this.setStatus(status);
  }

  // ===============================================================
  //    جلوگیری از Refresh غیرضروری
  // ===============================================================
  refresh(): boolean {
    return false;
  }

  // ===============================================================
  //    تعیین وضعیت حضور و رنگ Badge مربوطه
  // ===============================================================
  private setStatus(status: string | number | null): void {
    switch (String(status)) {
      case '4':
        this.statusLabel = 'به تعویق افتاده';
        this.badgeClass = 'bg-danger text-white';
        break;
      case '3':
        this.statusLabel = 'انجام شده';
        this.badgeClass = 'bg-success text-white';
        break;
      case '2':
        this.statusLabel = 'در حال انجام';
        this.badgeClass = 'bg-warning text-dark';
        break;
      case '1':
        this.statusLabel = 'در صف';
        this.badgeClass = 'bg-info text-white';
        break;

      default:
        this.statusLabel = '—';
        this.badgeClass = 'bg-light text-dark';
        break;
    }
  }
}
