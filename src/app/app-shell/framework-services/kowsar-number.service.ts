import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class KowsarNumberService {
  // تبدیل رشته به عدد نرمال (یا null اگر عدد نبود)
  parseKowsarNumber(value: any): number | null {
    if (value === null || value === undefined) return null;

    const raw = String(value).trim();
    if (!raw) return null;

    // اگر حتی یک حرف فارسی یا انگلیسی داشت → متن است، عدد نیست
    if (/[a-zA-Z\u0600-\u06FF]/.test(raw)) {
      return null;
    }

    // فقط اجازه این کاراکترها را داریم:
    // رقم‌ها (فارسی/عربی/لاتین) + جداکننده‌ها + نقطه + منفی
    const allowedPattern = /^[0-9۰-۹٠-٩,\u066C\/.\-]+$/;
    if (!allowedPattern.test(raw)) {
      return null;
    }

    // تبدیل ارقام فارسی/عربی به لاتین
    const normalizeDigits = (s: string) =>
      s
        .replace(/[۰-۹]/g, d => '0123456789'['۰۱۲۳۴۵۶۷۸۹'.indexOf(d)])
        .replace(/[٠-٩]/g, d => '0123456789'['٠١٢٣٤٥٦٧٨٩'.indexOf(d)]);

    const normalized = normalizeDigits(raw);

    // حذف جداکننده‌ها (کاما، /، و ...)
    const cleaned = normalized.replace(/[^0-9.-]/g, '');
    if (!cleaned || cleaned === '-' || cleaned === '.') {
      return null;
    }

    const num = Number(cleaned);
    return isNaN(num) ? null : num;
  }

  // فرمت نهایی برای نمایش (سه‌رقمی + ارقام فارسی)
  formatKowsarNumber(value: any): string {
    const num = this.parseKowsarNumber(value);

    // اگر عدد نیست → همون مقدار اصلی برگرده (یا رشته خالی)
    if (num === null) {
      return value ?? '';
    }

    const parts = num.toString().split('.');
    const intPart = parts[0];
    let decPart = parts[1] || '';

    // جداکننده سه‌رقمی با کامای انگلیسی
    const intWithSep = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // حذف صفرهای اضافی انتهای اعشار
    if (decPart) {
      decPart = decPart.replace(/0+$/, '');
    }

    const toPersianDigits = (s: string) =>
      s.replace(/\d/g, d => '۰۱۲۳۴۵۶۷۸۹'[Number(d)]);

    if (!decPart) {
      return toPersianDigits(intWithSep);
    }

    // ممیز فارسی بین صحیح و اعشار (٫)
    return toPersianDigits(intWithSep) + '٫' + toPersianDigits(decPart);
  }

  // مقایسه برای سورت عددی/متنی
  compareKowsarValues(valueA: any, valueB: any): number {
    const nA = this.parseKowsarNumber(valueA);
    const nB = this.parseKowsarNumber(valueB);

    // اگر هر دو عددند → سورت عددی
    if (nA !== null && nB !== null) {
      return nA - nB;
    }

    // اگر یکی عدد و یکی متن → عدد بالاتر (اول بیاد)
    if (nA !== null && nB === null) return -1;
    if (nA === null && nB !== null) return 1;

    // اگر هر دو متن‌اند → سورت رشته‌ای معمولی (فارسی)
    const sA = valueA == null ? '' : String(valueA);
    const sB = valueB == null ? '' : String(valueB);
    return sA.localeCompare(sB, 'fa');
  }
}
