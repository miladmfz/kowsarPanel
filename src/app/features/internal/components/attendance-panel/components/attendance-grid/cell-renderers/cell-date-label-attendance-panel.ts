/* ===============================================================
   📅 کامپوننت CellDateAttendancePanel
   توضیحات کلی:
   این کامپوننت به‌عنوان Cell Renderer برای نمایش تاریخ حضور در گرید کارشناسان استفاده می‌شود.
   وظیفه آن تبدیل تاریخ میلادی به فرمت جلالی (Jalali) و نمایش آن به‌صورت خوانا در جدول است.
   ویژگی‌ها:
   1️⃣ پشتیبانی از فرمت‌های مختلف تاریخ (ISO و غیر ISO)
   2️⃣ نمایش تاریخ در فرمت جلالی با ساعت
   3️⃣ مدیریت مقادیر خالی یا نامعتبر با نماد "—" یا متن "نامعتبر"
   =============================================================== */

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import moment from 'jalali-moment';

@Component({
  selector: 'cell-date-attendance-panel',
  template: `
    <span [title]="formattedDate" class="text-nowrap d-inline-block">
      {{ formattedDate }}
    </span>
  `,
  styles: [`
    :host ::ng-deep span {
      direction: rtl;
      font-family: inherit;
    }
  `],
})
export class CellDateAttendancePanel implements ICellRendererAngularComp {
  private params: any;
  formattedDate: string = '—';

  // ===============================================================
  //    مقداردهی اولیه AgGrid
  // ===============================================================
  agInit(params: any): void {
    this.params = params;
    const rawDate = params?.data?.AttendanceDate ?? null;
    this.formattedDate = this.formatToJalali(rawDate);
  }

  // ===============================================================
  //    جلوگیری از Refresh غیرضروری
  // ===============================================================
  refresh(): boolean {
    return false;
  }

  // ===============================================================
  //    تبدیل تاریخ میلادی به جلالی
  // ===============================================================
  private formatToJalali(date: string | null | undefined): string {
    if (!date || date === '0001-01-01T00:00:00') return '—';

    const m = moment(date, ['YYYY-MM-DDTHH:mm:ss', 'M/D/YYYY h:mm:ss A'], true);
    if (!m.isValid()) return 'نامعتبر';

    return m.locale('fa').format('jYYYY/jMM/jDD HH:mm');
  }
}
