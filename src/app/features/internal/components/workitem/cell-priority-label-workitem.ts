/* ===============================================================
   🟩 کامپوننت CellPriorityWorkItem
   توضیحات کلی:
   این کامپوننت به‌عنوان Cell Renderer برای نمایش اولویت کار استفاده می‌شود.
   =============================================================== */

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cell-priority-workitem',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="badge kws-priority-badge"
      [ngClass]="badgeClass">

      {{ PriorityLabel }}

    </span>
  `,
  styles: [`
    .kws-priority-badge {
      padding: 6px 12px !important;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      min-width: 82px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CellPriorityWorkItem implements ICellRendererAngularComp {

  private params: any;

  PriorityLabel: string = '—';

  badgeClass: string = 'bg-secondary text-white';

  // ===============================================================
  //    مقداردهی اولیه AgGrid
  // ===============================================================
  agInit(params: any): void {

    this.params = params;

    const priority = params?.data?.Priority ?? null;

    this.setStatus(priority);
  }

  // ===============================================================
  //    جلوگیری از Refresh غیرضروری
  // ===============================================================
  refresh(): boolean {

    return false;
  }

  // ===============================================================
  //    تعیین اولویت و رنگ Badge مربوطه
  // ===============================================================
  private setStatus(priority: string | number | null): void {

    switch (String(priority)) {

      case '1':
        this.PriorityLabel = 'کم';
        this.badgeClass = 'bg-info text-white';
        break;

      case '2':
        this.PriorityLabel = 'معمولی';
        this.badgeClass = 'bg-warning text-dark';
        break;

      case '3':
        this.PriorityLabel = 'زیاد';
        this.badgeClass = 'bg-danger text-white';
        break;

      default:
        this.PriorityLabel = '—';
        this.badgeClass = 'bg-light text-dark';
        break;
    }
  }
}