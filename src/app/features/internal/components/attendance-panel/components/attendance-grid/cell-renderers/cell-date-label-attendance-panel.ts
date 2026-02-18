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
  formattedDate: string = '—';

  agInit(params: any): void {
    const rawDate = params?.value ?? params?.data?.AttendanceDate ?? null;
    this.formattedDate = this.formatSmart(rawDate);
  }

  refresh(): boolean {
    return false;
  }

  // ===============================================================
  //  تبدیل هوشمند:
  //  - اگر شمسی بود: تغییر نده
  //  - اگر میلادی بود: به جلالی تبدیل کن
  // ===============================================================
  private formatSmart(input: any): string {
    if (input === null || input === undefined || input === '' || input === '0001-01-01T00:00:00') return '—';

    // اگر Date یا timestamp بود => میلادی فرض می‌کنیم و تبدیل می‌کنیم
    if (input instanceof Date || typeof input === 'number') {
      const m0 = moment(input);
      if (!m0?.isValid?.()) return 'نامعتبر';
      return m0.locale('fa').format('jYYYY/jMM/jDD HH:mm');
    }

    const s = String(input).trim();
    if (!s) return '—';

    // 1) اگر رشته شمسی باشد (سال 13xx/14xx) => همان را نمایش بده
    // نمونه: 28/11/1404 04:39:18 ب.ظ
    // یا: 1404/11/28 ...
    if (this.isJalaliText(s)) {
      return this.normalizePersianAmPm(s);
    }

    // 2) در غیر این صورت: تلاش برای پارس میلادی و تبدیل به جلالی
    const m = moment(
      s,
      [
        moment.ISO_8601 as any,
        'YYYY-MM-DDTHH:mm:ss',
        'YYYY-MM-DDTHH:mm:ss.SSS',
        'YYYY-MM-DD HH:mm:ss',
        'YYYY/MM/DD HH:mm:ss',
        'MM/DD/YYYY HH:mm:ss',
        'M/D/YYYY h:mm:ss A',
        'M/D/YYYY',
      ],
      true
    );

    if (!m?.isValid?.()) return 'نامعتبر';

    return m.locale('fa').format('jYYYY/jMM/jDD HH:mm');
  }

  // ===============================================================
  // تشخیص شمسی در متن:
  // - اگر سال 13xx یا 14xx داخلش باشد
  // - یا الگوی تاریخ شمسی رایج داشته باشد
  // ===============================================================
  private isJalaliText(s: string): boolean {
    // سال شمسی معمولاً 13xx یا 14xx است
    // این regex دنبال 13xx یا 14xx به عنوان بخش سال می‌گردد
    const hasJYear = /(?:^|[\/\-\s])(?:13\d{2}|14\d{2})(?:[\/\-\s]|$)/.test(s);

    // الگوهای رایج شمسی: dd/mm/yyyy یا yyyy/mm/dd
    const looksLikeDate = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{4})|(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/.test(s);

    return hasJYear && looksLikeDate;
  }

  // ===============================================================
  // تمیزکاری AM/PM فارسی (اختیاری ولی قشنگ)
  // ===============================================================
  private normalizePersianAmPm(s: string): string {
    // فقط یکدست‌سازی فاصله‌ها
    return s.replace(/\s+/g, ' ').trim();
  }
}
