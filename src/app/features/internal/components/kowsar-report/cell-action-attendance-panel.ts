/* ===============================================================
   📘 CellActionKowsarReport
   توضیحات کلی:
   این کامپوننت یک سل‌ رندرر (Cell Renderer) برای ag-Grid است
   که در هر ردیف دکمه‌ای جهت مشاهده فاکتورها نمایش می‌دهد.
   با کلیک روی دکمه، متد والد (Parent Component) فراخوانی می‌شود
   تا داده‌های مرتبط با CentralRef و LetterRowCode بازیابی گردد.

   ویژگی‌ها:
   - دکمه آیکون‌دار برای نمایش فاکتورها
   - دسترسی به context والد جهت اجرای متد
   - تشخیص BrokerRef و CentralRef از sessionStorage
   =============================================================== */

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: `
    <span
      (click)="getpaneldata_report2()"
      class="btn btn-sm btn-outline-primary"
      data-toggle="tooltip"
      title="نمایش فاکتورها"
    >
      <a>
        <i class="far fa-list-alt"></i>
      </a>
    </span>
  `,
    standalone: false,
})
export class CellActionKowsarReport implements ICellRendererAngularComp {
    params: any;
    data: any;
    BrokerRef: any;
    AttendanceCentralRef: any;
    CentralRef: any;

    // ===============================================================
    //    مقداردهی اولیه سل‌ رندرر
    // ===============================================================
    agInit(params: any): void {
        this.params = params;
        this.data = params.data;

        this.CentralRef = sessionStorage.getItem('CentralRef');

        if (sessionStorage.getItem('PhAddress3') == '100') {
            this.BrokerRef = '';
        } else {
            this.BrokerRef = sessionStorage.getItem('BrokerCode');
        }

        if (params.data.CentralRef) {
            this.AttendanceCentralRef = params.data.CentralRef;
        }
    }

    // ===============================================================
    // 🔁 جلوگیری از render غیرضروری
    // ===============================================================
    refresh(params: any): boolean {
        return true;
    }

    // ===============================================================
    //   فراخوانی متد والد جهت نمایش فاکتورها
    // ===============================================================
    getpaneldata_report2(): void {
        this.params.context.componentParent.getpaneldata_report2(
            this.params.data.CentralRef,
            this.params.data.LetterRowCode
        );
    }
}
