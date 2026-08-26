import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-phonebook-unknown-number-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kws-unknown-grid-number" dir="ltr">
      <strong>{{ item?.number_raw || '-' }}</strong>

      @if (item?.number_normal && item.number_normal !== item.number_raw) {
        <small>{{ item.number_normal }}</small>
      }
    </div>
  `
})
export class PhonebookUnknownNumberRendererComponent implements ICellRendererAngularComp {
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
