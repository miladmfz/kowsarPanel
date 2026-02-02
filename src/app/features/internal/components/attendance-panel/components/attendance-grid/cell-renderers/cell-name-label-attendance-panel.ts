/* ===============================================================
   🧍‍♂️ کامپوننت CellNameAttendancePanel
   توضیحات کلی:
   این کامپوننت به عنوان Cell Renderer در گرید حضور کارشناسان استفاده می‌شود.
   وظیفه آن نمایش نام و نام خانوادگی کارشناس در هر ردیف است.
   ویژگی‌ها:
   1️⃣ ترکیب نام و نام خانوادگی با رعایت فاصله
   2️⃣ مدیریت مقادیر خالی و نمایش "—" در صورت نبود داده
   3️⃣ تنظیم جهت متن و فونت برای هماهنگی با زبان فارسی
   =============================================================== */

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'cell-name-attendance-panel',
  template: `
    <span class="text-nowrap">
      {{ fullName || '—' }}
    </span>
  `,
  styles: [`
    :host ::ng-deep span {
      direction: rtl;
      font-family: inherit;
    }
  `],
  standalone: false
})
export class CellNameAttendancePanel implements ICellRendererAngularComp {
  private params: any;
  fullName: string = '';

  // ===============================================================
  //    مقداردهی اولیه AgGrid
  // ===============================================================
  agInit(params: any): void {
    this.params = params;
    const data = params?.data ?? {};
    const first = data.PhFirstName?.trim() ?? '';
    const last = data.PhLastName?.trim() ?? '';
    this.fullName = (first + ' ' + last).trim() || '';
  }

  // ===============================================================
  //    جلوگیری از رندر مجدد غیرضروری
  // ===============================================================
  refresh(): boolean {
    return false;
  }
}
