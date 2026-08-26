import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-phonebook-unknown-stats-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kws-unknown-grid-stats" dir="rtl">
      <span class="total">
        <small>کل</small>
        <strong>{{ fa(item?.call_count) }}</strong>
      </span>

      <span class="answered">
        <small>پاسخ</small>
        <strong>{{ fa(item?.answered_count) }}</strong>
      </span>

      <span class="missed">
        <small>بی‌پاسخ</small>
        <strong>{{ fa(item?.missed_count) }}</strong>
      </span>
    </div>
  `
})
export class PhonebookUnknownStatsRendererComponent implements ICellRendererAngularComp {
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

  fa(value: unknown): string {
    return this.vm?.toFaNumber?.(Number(value || 0)) ?? String(value || 0);
  }
}
