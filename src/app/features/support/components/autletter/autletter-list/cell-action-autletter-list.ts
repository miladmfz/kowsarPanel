import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

/**
 *   CellActionAutletterList
 * --------------------------------------------------------
 * CellRenderer برای نمایش دکمه‌های عملیات (ویرایش / مشاهده / حذف)
 * در لیست نامه‌های خودکار.
 */
@Component({
  selector: 'cell-action-autletter-list',
  standalone: true,
  template: `
    <div class="d-flex justify-content-center">
      <!--   ویرایش -->
      <button
        type="button"
        class="btn btn-sm btn-outline-primary"
        (click)="onEdit()"
        title="ویرایش"
      >
        <i class="fas fa-edit"></i>
      </button>

      <!--   مشاهده -->
      <button
        type="button"
        class="btn btn-sm btn-outline-secondary mx-1"
        (click)="onView()"
        title="مشاهده"
      >
        <i class="fa fa-eye"></i>
      </button>

      <!--   حذف (نمایش فقط در صورت مجاز بودن) -->
      @if (PhAddress3 === '100') {
        <button
          type="button"
          class="btn btn-sm btn-outline-danger"
          (click)="onDelete()"
          title="حذف"
        >
          <i class="fas fa-trash"></i>
        </button>
      }
    </div>
  `,
})
export class CellActionAutletterList implements ICellRendererAngularComp {
  /** پارامترهای ورودی از AG Grid */
  params: any;
  PhAddress3: string | null = null;

  /** مقداردهی اولیه توسط AG Grid */
  agInit(params: any): void {
    this.params = params;
    this.PhAddress3 = sessionStorage.getItem('PhAddress3');
  }

  /** نیازی به refresh مجدد نیست */
  refresh(): boolean {
    return false;
  }

  /**   ویرایش */
  onEdit(): void {
    this.params?.context?.componentParent?.NavigateToEdit?.(this.params.data);
  }

  /**   مشاهده جزئیات */
  onView(): void {
    this.params?.context?.componentParent?.ViewDetails?.(this.params.data);
  }

  /**   حذف */
  onDelete(): void {
    this.params?.context?.componentParent?.btnDeleteClicked?.(this.params.data);
  }
}
