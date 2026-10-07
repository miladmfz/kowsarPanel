import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-phonebook-unknown-actions-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kws-unknown-grid-actions" dir="rtl">
      <button
        type="button"
        class="kws-unknown-grid-details-btn"
        title="نمایش جزئیات و ریز تماس‌ها"
        aria-label="نمایش جزئیات و ریز تماس‌ها"
        (click)="openDetails($event)">
        <i class="mdi mdi-history"></i>
        <span>جزئیات</span>
      </button>
    </div>
  `
})
export class PhonebookUnknownActionsRendererComponent implements ICellRendererAngularComp {
  private params!: ICellRendererParams & { host?: any };

  get item(): any {
    return this.params?.data;
  }

  get vm(): any {
    return this.params?.host?.vm;
  }

  agInit(params: ICellRendererParams & { host?: any }): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams & { host?: any }): boolean {
    this.params = params;
    return true;
  }

  openDetails(event: MouseEvent): void {
    event.stopPropagation();
    if (this.item) {
      this.vm?.openDetails?.(this.item);
    }
  }
}
