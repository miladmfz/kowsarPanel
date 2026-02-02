/* ===============================================================
   📘 CellActionLetterCentral
   توضیحات کلی:
   این کامپوننت به‌عنوان یک سل رندرر در ag-Grid استفاده می‌شود و برای
   نمایش دکمه انتخاب مشتری در هر ردیف از جدول طراحی شده است.

   ویژگی‌ها:
   1️⃣ نمایش دکمه انتخاب مشتری با آیکون کاربر  
   2️⃣ فراخوانی متد مربوط به parent (SetLetterforperson) هنگام کلیک  
   3️⃣ عدم نیاز به رفرش مجدد سل  
   =============================================================== */

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'cell-action-letter-central',
  template: `
    <div class="d-flex justify-content-center align-items-center">
      <button
        class="btn btn-sm btn-outline-primary"
        title="انتخاب مشتری"
        (click)="onSelectPerson()">
        <i class="ri-user-follow-line"></i>
      </button>
    </div>
  `,
  styles: [`
    :host ::ng-deep .btn {
      min-width: 32px;
    }
  `],
  standalone: false
})
export class CellActionLetterCentral implements ICellRendererAngularComp {
  // ===============================================================
  //    متغیرها و مقداردهی اولیه
  // ===============================================================
  private params: any;

  // ===============================================================
  //   متدهای ag-Grid
  // ===============================================================
  agInit(params: any): void {
    this.params = params;
  }

  refresh(): boolean {
    return false; // 🚫 عدم نیاز به رندر مجدد
  }

  // ===============================================================
  // 🖱️ اکشن انتخاب مشتری
  // ===============================================================
  onSelectPerson(): void {
    this.params?.context?.componentParent?.SetLetterforperson(this.params.data);
  }
}
