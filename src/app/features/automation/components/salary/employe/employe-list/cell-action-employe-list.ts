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
      class="btn btn-sm btn-outline-primary"
      (click)="NavigateToEdit()"
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
    <!--   دکمه مشاهده جزئیات -->
    <button
      type="button"
      class="btn btn-sm btn-outline-secondary"
      (click)="ShowSalary()"
      title="لیست حقوق"
    >
      <i class="fa fa-list"></i>
    </button>

  `,
  standalone: false,
})
export class CellActionEmployeList implements ICellRendererAngularComp {
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


  onView(): void {
    this.params?.context?.componentParent?.onView?.(this.params.data);
  }

  NavigateToEdit(): void {
    this.params?.context?.componentParent?.NavigateToEdit?.(this.params.data.EmployeeCode);
  }

  ShowSalary(): void {
    this.params?.context?.componentParent?.ShowSalary?.(this.params.data.EmployeeCode);
  }



}
