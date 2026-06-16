/* ===============================================================
   📘 CellDateMinDate
   توضیحات کلی:
   این کامپوننت به عنوان یک Cell Renderer برای ag-Grid طراحی شده است
   و وظیفه دارد مقدار ستون MinCreationDate را به فرمت تاریخ شمسی (Jalali)
   تبدیل و نمایش دهد.

   ویژگی‌ها:
   - پشتیبانی از فرمت‌های مختلف تاریخ (ISO، میلادی، custom)
   - بررسی اعتبار تاریخ قبل از نمایش
   - بازگرداندن "—" برای تاریخ‌های نامعتبر یا خالی
   =============================================================== */

import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
import moment from "jalali-moment";

@Component({
    selector: 'validation-state-cell-renderer',
    template: `
    <span>
      {{ formatToJalali(MinCreationDate) }}
    </span>
  `,
    standalone: false,
})

export class CellDateMinDate implements ICellRendererAngularComp {
    params: any;
    MinCreationDate: any;

    // ===============================================================
    //    مقداردهی اولیه سل‌ رندرر
    // ===============================================================

    agInit(params: any): void {
        this.params = params;
        if (params?.data?.MinCreationDate) {
            this.MinCreationDate = params.data.MinCreationDate;
        }
    }

    // ===============================================================
    // 🔁 جلوگیری از render غیرضروری
    // ===============================================================

    refresh(): boolean {
        return false;
    }

    // ===============================================================
    // 🗓️ تبدیل تاریخ میلادی یا ISO به شمسی (Jalali)
    // ===============================================================

    formatToJalali(date: string | null | undefined): string {
        if (!date || date === '0001-01-01T00:00:00') return '—';

        let m;

        // 📅 اگر تاریخ فارسی (شمسی) بود
        if (date.includes('ب.ظ') || date.includes('ق.ظ')) {

            // تبدیل PM/AM فارسی به انگلیسی
            date = date
                .replace('ب.ظ', 'PM')
                .replace('ق.ظ', 'AM');

            // پارس تاریخ شمسی
            m = moment(date, 'jDD/jMM/jYYYY hh:mm:ss A', true);

        }
        // 📅 اگر تاریخ میلادی با / بود
        else if (date.includes('/')) {

            m = moment(date, 'M/D/YYYY h:mm:ss A', true);

        }
        // 📅 ISO
        else if (date.includes('T')) {

            m = moment(date, moment.ISO_8601);

        }
        // fallback
        else {

            m = moment(date, 'YYYY-MM-DD HH:mm:ss', true);

        }

        // ❌ نامعتبر
        if (!m.isValid()) return 'نامعتبر';

        // 📅 خروجی شمسی
        return m.locale('fa').format('jYYYY/jMM/jDD HH:mm');
    }
}
