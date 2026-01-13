/**
 *   grid-funcs.ts
 * --------------------------------------------------------
 * مجموعه توابع کمکی عمومی برای استفاده در ستون‌های AG Grid
 */

export const formatNumber = (value: any): string =>
    value == null || value === '' ? '-' : Number(value).toLocaleString('fa-IR');

export const formatPrice = (value: any): string =>
    value == null || value === ''
        ? '-'
        : `${Number(value).toLocaleString('fa-IR')} ریال`;

export const formatPercent = (value: any): string =>
    value == null || value === ''
        ? '-'
        : `${Number(value).toFixed(1)}٪`;

export const formatDate = (value: string | Date): string => {
    if (!value) return '-';
    const date = new Date(value);
    return date.toLocaleDateString('fa-IR');
};

export const toBooleanLabel = (value: any): string =>
    value ? '  بله' : '❌ خیر';
