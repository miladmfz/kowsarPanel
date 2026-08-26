import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-phonebook-unknown-status-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kws-unknown-grid-status" dir="rtl">
      <span
        class="kws-status-badge"
        [class.success]="statusClass === 'success'"
        [class.warning]="statusClass === 'warning'"
        [class.busy]="statusClass === 'busy'"
        [class.danger]="statusClass === 'danger'">
        {{ item?.last_disposition_fa || '-' }}
      </span>

      <small>
        مکالمه آخر:
        <strong>{{ item?.last_billsec_fa || '۰ ثانیه' }}</strong>
      </small>
    </div>
  `
})
export class PhonebookUnknownStatusRendererComponent implements ICellRendererAngularComp {
  private params!: ICellRendererParams & { host?: any };

  get item(): any {
    return this.params?.data;
  }

  get vm(): any {
    return this.params?.host?.vm;
  }

  get statusClass(): string {
    return this.item ? (this.vm?.getUnknownStatusClass?.(this.item) || '') : '';
  }

  agInit(params: ICellRendererParams & { host?: any }): void {
    this.params = params;
  }

  refresh(params: ICellRendererParams & { host?: any }): boolean {
    this.params = params;
    return true;
  }
}
