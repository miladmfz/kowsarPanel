import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

/**
 *   CellStateAutletter
 * ----------------------------------------------------------
 * CellRenderer برای نمایش وضعیت هر نامه (ارجاع، دیده‌شده، جدید)
 * با استفاده از badgeهای رنگی به سبک Minton.
 */
@Component({
  selector: 'validation-state-cell-renderer',
  standalone: true,
  template: `
    @switch (state) {
      @case ('True') {
        <span class="badge bg-soft-warning text-warning px-2 py-1">
          ارجاع
        </span>
      }
      @case ('False') {
        <span class="badge bg-soft-primary text-primary px-2 py-1">
          دیده شده
        </span>
      }
      @default {
        <span class="badge bg-soft-danger text-danger px-2 py-1">
          جدید
        </span>
      }
    }
  `,
})
export class CellStateAutletter implements ICellRendererAngularComp {
  /** داده‌های ورودی از سطر جدول */
  params: any;

  /** وضعیت فعلی سطر */
  state: string | null = null;

  /** مقداردهی اولیه توسط AG Grid */
  agInit(params: any): void {
    this.params = params;
    this.state = params?.data?.AlarmActive ?? '';
  }

  /** بدون نیاز به رندر مجدد */
  refresh(): boolean {
    return false;
  }
}
