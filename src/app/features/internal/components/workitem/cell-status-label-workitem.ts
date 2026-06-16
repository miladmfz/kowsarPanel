/* ===============================================================
   🟩 کامپوننت CellStatusAttendancePanel
   =============================================================== */

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cell-status-attendance-panel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span
      class="badge kws-status-badge"
      [ngClass]="badgeClass">

      {{ statusLabel }}

    </span>
  `,
  styles: [`
    .kws-status-badge {
      padding: 6px 12px !important;
      border-radius: 999px;
      font-size: 12px;
      font-weight: 800;
      min-width: 92px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
  `]
})
export class CellStatusWorkItem implements ICellRendererAngularComp {

  private params: any;

  statusLabel: string = '—';

  badgeClass: string = 'bg-secondary text-white';

  agInit(params: any): void {

    this.params = params;

    const status = params?.data?.Status ?? null;

    this.setStatus(status);
  }

  refresh(): boolean {

    return false;
  }

  private setStatus(status: string | number | null): void {

    switch (String(status)) {

      case '4':
        this.statusLabel = 'به تعویق افتاده';
        this.badgeClass = 'bg-danger text-white';
        break;

      case '3':
        this.statusLabel = 'انجام شده';
        this.badgeClass = 'bg-success text-white';
        break;

      case '2':
        this.statusLabel = 'در حال انجام';
        this.badgeClass = 'bg-warning text-dark';
        break;

      case '1':
        this.statusLabel = 'در صف';
        this.badgeClass = 'bg-info text-white';
        break;

      default:
        this.statusLabel = '—';
        this.badgeClass = 'bg-light text-dark';
        break;
    }
  }
}