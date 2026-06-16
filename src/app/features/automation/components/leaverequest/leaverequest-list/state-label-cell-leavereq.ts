/* ===============================================================
  StateLabelCellLeaveReq
سل‌ رندرر برای نمایش وضعیت گردش‌کار درخواست مرخصی
نمایش وضعیت‌ها به‌صورت Badge رنگی:
- ۰: دیده نشده (آبی)
- ۱: تأیید شده (سبز)
- ۲: رد شده (قرمز)
- ۳: بررسی مجدد (زرد)
=============================================================== */

import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";

@Component({
  selector: 'validation-state-cell-renderer',
  template: `
    <!--    دیده نشده -->
    @if (WorkFlowStatus == '0') {
      <span class="badge bg-info text-white px-3 py-2">دیده نشده</span>
    }

    <!-- 🟩 تایید شده -->
    @if (WorkFlowStatus == '1') {
      <span class="badge bg-success text-white px-3 py-2">تأیید شده</span>
    }

    <!-- 🟥 رد شده -->
    @if (WorkFlowStatus == '2') {
      <span class="badge bg-danger text-white px-3 py-2">رد شده</span>
    }

    <!--   بررسی مجدد -->
    @if (WorkFlowStatus == '3') {
      <span class="badge bg-warning text-dark px-3 py-2">بررسی مجدد</span>
    }
  `,
  standalone: false
})
export class StateLabelCellLeaveReq implements ICellRendererAngularComp {
  // ---------------------------------------------------------------
  //   ویژگی‌ها
  // ---------------------------------------------------------------
  params: any;
  WorkFlowStatus: string | null = null;

  // ---------------------------------------------------------------
  //   مقداردهی اولیه با داده‌های سطر
  // ---------------------------------------------------------------
  agInit(params: any): void {
    this.params = params;
    this.WorkFlowStatus = params?.data?.WorkFlowStatus ?? null;
  }

  // ---------------------------------------------------------------
  //   نیازی به رندر مجدد ندارد
  // ---------------------------------------------------------------
  refresh(): boolean {
    return false;
  }
}
