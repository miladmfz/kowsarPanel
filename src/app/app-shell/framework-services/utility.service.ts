import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class UtilityService {
    constructor() { }

    // 🧮 محاسبات عمومی ------------------------------------------------------

    /** بررسی مقدار تهی یا خالی */
    isNullOrEmpty(value: any): boolean {
        return value === null || value === undefined || value === '';
    }

    /** بررسی رشته فقط شامل عدد است */
    isNumeric(value: any): boolean {
        return !isNaN(value - parseFloat(value));
    }

    /** گرد کردن عدد به n رقم اعشار */
    round(value: number, decimals: number = 2): number {
        if (isNaN(value)) return 0;
        const factor = Math.pow(10, decimals);
        return Math.round(value * factor) / factor;
    }

    /** فرمت عدد با جداکننده هزارگان */
    formatNumber(value: any): string {
        if (value === null || value === undefined) return '';
        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    }

    // 📅 تاریخ و زمان -------------------------------------------------------

    /** تاریخ امروز شمسی (ساده، بدون moment یا کتابخانه اضافی) */
    getTodayPersian(): string {
        const date = new Date();
        return date.toLocaleDateString('fa-IR');
    }

    /** تبدیل عدد به تاریخ شمسی */
    toPersianDate(dateString: string | Date): string {
        const date = new Date(dateString);
        return date.toLocaleDateString('fa-IR');
    }

    /** ساعت جاری با فرمت HH:mm:ss */
    getCurrentTime(): string {
        const now = new Date();
        return now.toTimeString().split(' ')[0];
    }

    // 🧾 متن و رشته ---------------------------------------------------------

    /** حذف فاصله‌های اضافی از رشته */
    trimAll(value: string): string {
        return value ? value.trim().replace(/\s+/g, ' ') : '';
    }

    /** حروف اول هر کلمه بزرگ */
    capitalizeWords(value: string): string {
        return value
            ? value
                .split(' ')
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
                .join(' ')
            : '';
    }

    // 🎨 رابط کاربری -------------------------------------------------------

    /** اسکرول به بالا */
    scrollToTop(): void {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    /** اسکرول به عنصر خاص */
    scrollToElement(elementId: string): void {
        const el = document.getElementById(elementId);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // 🔐 ذخیره و بازیابی داده ------------------------------------------------

    /** تبدیل شیء به JSON ایمن */
    toJson(value: any): string {
        try {
            return JSON.stringify(value);
        } catch {
            return '';
        }
    }

    /** پارس JSON با مدیریت خطا */
    fromJson<T>(json: string): T | null {
        try {
            return JSON.parse(json) as T;
        } catch {
            return null;
        }
    }

    //   سایر ابزارها -------------------------------------------------------

    /** تولید شناسه تصادفی (UUID ساده) */
    generateId(prefix: string = 'id'): string {
        return `${prefix}-${Math.random().toString(36).substring(2, 10)}`;
    }

    /** تأخیر (async delay) */
    delay(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }
}
