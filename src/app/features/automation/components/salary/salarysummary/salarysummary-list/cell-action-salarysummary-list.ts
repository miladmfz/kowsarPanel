/* ===============================================================
  CellActionLeaveReqList
سل‌ رندرر اکشن‌ها برای لیست درخواست‌های مرخصی
عملکردها:
-   ویرایش درخواست
-   مشاهده جزئیات و نظر مدیر
-   حذف درخواست
=============================================================== */

import { Component, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'cell-action-leavereq-list',
  template: `

      <button
      type="button"
      class="btn btn-sm btn-outline-primary mx-1"
      (click)="updateWorkingEmploye()"
      title="ویرایش"
    >
      <i class="fas fa-edit"></i>
    </button>




    <button
      type="button"
      class="btn btn-sm btn-outline-primary"
      (click)="ShowModal()"
      title="نممایش جزئیات"
    >
      <i class="fas fa-eye"></i>
    </button>



  `,
  standalone: false,
})
export class CellActionSalarySummaryList implements ICellRendererAngularComp {
  // ---------------------------------------------------------------
  //   ویژگی‌ها و تنظیمات اولیه
  // ---------------------------------------------------------------
  params: any;
  canEdit = true;
  canDelete = true;
  canView = true;
  id = 0;

  // ---------------------------------------------------------------
  //   مقداردهی اولیه با داده‌های ردیف
  // ---------------------------------------------------------------
  agInit(params: any): void {
    this.params = params;

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

  updateWorkingEmploye(): void {
    this.params?.context?.componentParent?.updateWorkingEmploye?.(this.params.data);
  }

  ShowModal(): void {
    this.params?.context?.componentParent?.ShowModal?.(this.params.data);
  }


}
