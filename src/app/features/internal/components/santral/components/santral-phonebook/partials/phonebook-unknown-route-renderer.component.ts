import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-phonebook-unknown-route-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kws-unknown-grid-route" dir="rtl">
      <span>
        <small>خط ورودی</small>
        <strong>{{ item?.last_did || '-' }}</strong>
      </span>

      <span>
        <small>مقصد</small>
        <strong>{{ item?.last_dst || '-' }}</strong>
      </span>

      <span>
        <small>پاسخگو</small>
        <strong>{{ item?.last_answered_by || '-' }}</strong>
      </span>
    </div>
  `
})
export class PhonebookUnknownRouteRendererComponent implements ICellRendererAngularComp {
  private params!: ICellRendererParams;

  get item(): any {
    return this.params?.data;
  }

  agInit(params: ICellRendererParams): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams): boolean {
    this.params = params;
    return true;
  }
}
