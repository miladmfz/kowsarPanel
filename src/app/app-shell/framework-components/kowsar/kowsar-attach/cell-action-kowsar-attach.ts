/* ===============================================================
  CellActionLeaveReqAttach
کلاس رندر‌کننده سفارشی برای ستون عملیات در جدول پیوست‌های مرخصی.
وظایف:
- نمایش دکمه دانلود فایل پیوست
- نمایش دکمه حذف فایل پیوست
- برقراری ارتباط با والد از طریق context برای اجرای توابع اصلی
=============================================================== */

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: `
    <span
      (click)="DownloadFile()"
      class="btn btn-sm btn-outline-primary mx-1"
      data-toggle="tooltip"
      title="دانلود"
    >
      <a>
        <i class="fa fa-eye"></i>
      </a>
    </span>

    <button
      (click)="btnDeleteClicked()"
      class="btn btn-sm btn-outline-danger"
      title="حذف"
    >
      <i class="fas fa-trash"></i>
    </button>
  `,
  standalone: false,
})
export class CellActionKowsarAttach implements ICellRendererAngularComp {
  //   پارامترهای دریافتی از AG Grid
  params: any;
  canEdit = true;
  canDelete = true;
  canView = true;
  id = 0;

  // 🔁 اجرای مجدد رندر (در اینجا نیازی به تغییر محتوا نیست)
  refresh(params: any): boolean {
    return true;
  }

  //   مقداردهی اولیه سلول
  agInit(params: any): void {
    this.params = params;
  }

  //   حذف فایل
  btnDeleteClicked(): void {
    this.params.context.componentParent.DeleteFile(this.params.data);
  }

  // 📥 دانلود فایل
  DownloadFile(): void {
    this.params.context.componentParent.DownloadFile(this.params.data);
  }
}
