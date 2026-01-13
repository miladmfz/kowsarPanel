/**
 * 🧮 grid-funcs.ts
 * ---------------------------------
 * توابع کمکی متداول برای قالب‌بندی داده‌ها در گرید
 */

export function formatNumber(num: any): string {
    if (num == null || isNaN(num)) return '-';
    return Number(num).toLocaleString('fa-IR');
}

export function formatPrice(num: any): string {
    if (num == null || isNaN(num)) return '-';
    return `${Number(num).toLocaleString('fa-IR')} ریال`;
}

export function formatDate(date: string | Date): string {
    if (!date) return '-';
    const d = new Date(date);
    return d.toLocaleDateString('fa-IR');
}

export function isEmpty(value: any): boolean {
    return value === null || value === undefined || value === '';
}
