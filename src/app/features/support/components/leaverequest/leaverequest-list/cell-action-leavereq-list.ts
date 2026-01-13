/* ===============================================================
  CellActionLeaveReqList
سل‌ رندرر اکشن‌ها برای لیست درخواست‌های مرخصی
عملکردها:
-   ویرایش درخواست
-   مشاهده جزئیات و نظر مدیر
-   حذف درخواست
=============================================================== */

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'cell-action-leavereq-list',
  template: `
    <!--   دکمه ویرایش -->
    <button
      type="button"
      class="btn btn-sm btn-outline-primary"
      (click)="onEdit()"
      title="ویرایش"
    >
      <i class="fas fa-edit"></i>
    </button>

    <!--   دکمه مشاهده جزئیات -->
    <button
      type="button"
      class="btn btn-sm btn-outline-secondary mx-1"
      (click)="onView()"
      title="جزئیات / نظر مدیر"
    >
      <i class="fa fa-eye"></i>
    </button>

    <!--   دکمه حذف -->
    <button
      type="button"
      class="btn btn-sm btn-outline-danger"
      (click)="onDelete()"
      title="حذف"
    >
      <i class="fas fa-trash"></i>
    </button>
  `,
  standalone: false,
})
export class CellActionLeaveReqList implements ICellRendererAngularComp {
  // ---------------------------------------------------------------
  //   ویژگی‌ها و تنظیمات اولیه
  // ---------------------------------------------------------------
  params: any;
  canEdit = true;
  canDelete = true;
  canView = true;
  id = 0;
  phAddress3 = '';

  // ---------------------------------------------------------------
  //   مقداردهی اولیه با داده‌های ردیف
  // ---------------------------------------------------------------
  agInit(params: any): void {
    this.params = params;
    this.phAddress3 = sessionStorage.getItem('PhAddress3') ?? '';

    // مقداردهی بر اساس پارامترهای ورودی
    this.canEdit = params?.canEdit ?? true;
    this.canDelete = params?.canDelete ?? true;
    this.canView = params?.canView ?? true;
    this.id = params?.data?.LeaveRequestCode ?? 0;
  }

  // ---------------------------------------------------------------
  //   عدم نیاز به بازخوانی
  // ---------------------------------------------------------------
  refresh(): boolean {
    return false;
  }

  // ---------------------------------------------------------------
  //   ویرایش درخواست
  // ---------------------------------------------------------------
  onEdit(): void {
    this.params?.context?.componentParent?.NavigateToEdit?.(this.params.data);
  }

  // ---------------------------------------------------------------
  //   مشاهده گردش‌کار / نظر مدیر
  // ---------------------------------------------------------------
  onView(): void {
    this.params?.context?.componentParent?.WorkFlow?.(this.params.data);
  }

  // ---------------------------------------------------------------
  //   حذف درخواست
  // ---------------------------------------------------------------
  onDelete(): void {
    this.params?.context?.componentParent?.btnDeleteClicked?.(this.params.data);
  }
}
