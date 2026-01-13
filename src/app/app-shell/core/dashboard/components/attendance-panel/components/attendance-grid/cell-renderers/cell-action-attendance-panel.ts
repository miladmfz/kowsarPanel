/* ===============================================================
   🎯 کامپوننت CellActionAttendancePanel
   توضیحات کلی:
   این کامپوننت به عنوان سل‌ رندرر (Cell Renderer) در گرید حضور کارشناسان استفاده می‌شود.
   وظیفه آن نمایش دکمه‌های عملیاتی هر ردیف است:
   1️⃣ دکمه «تیکت» برای مشاهده یا ایجاد تیکت مربوط به آن ردیف.
   2️⃣ دکمه «تاریخچه» برای نمایش سوابق حضور کارشناس (در شرایط خاص).
   داده‌ها از پارامترهای گرید و sessionStorage گرفته می‌شوند.
   =============================================================== */

import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'cell-action-attendance-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- 🎟️ دکمه تیکت -->
    <button
      type="button"
      class="btn btn-sm btn-outline-primary me-1"
      title="تیکت"
      (click)="setLetterConfig()"
    >
      <i class="far fa-list-alt"></i>
    </button>

    <!-- 🕓 دکمه تاریخچه (برای همه یا شرایط خاص) -->
    <button
      *ngIf="showHistoryButton"
      type="button"
      class="btn btn-sm btn-outline-primary"
      title="تاریخچه"
      (click)="showHistory()"
    >
      <i class="fas fa-history"></i>
    </button>
  `
})
export class CellActionAttendancePanel implements ICellRendererAngularComp {
  private params: any;
  private data: any;

  brokerRef: string = '';
  attendanceCentralRef: string = '';
  centralRef: string = '';

  /** وضعیت دکمه تاریخچه */
  showHistoryButton: boolean = false;

  // ===============================================================
  // 🔹 متدهای AgGrid
  // ===============================================================
  agInit(params: any): void {
    this.params = params;
    this.data = params.data ?? {};

    this.centralRef = sessionStorage.getItem('CentralRef') ?? '';
    this.brokerRef =
      sessionStorage.getItem('PhAddress3') === '100'
        ? ''
        : sessionStorage.getItem('BrokerCode') ?? '';

    this.attendanceCentralRef = this.data?.CentralRef ?? '';

    // 🎯 تعیین نمایش یا عدم نمایش دکمه تاریخچه
    this.showHistoryButton =
      !this.brokerRef ||
      (this.brokerRef && this.centralRef === this.attendanceCentralRef);
  }

  refresh(): boolean {
    return false; // جلوگیری از render مجدد غیرضروری
  }

  // ===============================================================
  // 🔹 اکشن‌ها
  // ===============================================================
  setLetterConfig(): void {
    this.params?.context?.componentParent?.SetLetter_config?.(this.data);
  }

  showHistory(): void {
    this.params?.context?.componentParent?.ShowHistory?.(this.data);
  }
}
