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
    <button
      type="button"
      class="btn btn-sm btn-outline-primary"
      (click)="NavigateToEdit()"
      title="ویرایش"
    >
      <i class="fas fa-edit"></i>
    </button>



  `,
  standalone: false,
})
export class CellActionMonthSummaryList implements ICellRendererAngularComp {
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


  NavigateToEdit(): void {
    this.params?.context?.componentParent?.NavigateToEdit?.(this.params.data.MonthSummaryCode);
  }


}
