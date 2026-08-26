import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import type { ICellRendererParams } from 'ag-grid-community';

@Component({
  selector: 'app-phonebook-contact-actions-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="kws-phonebook-grid-actions" dir="rtl">
      <button
        type="button"
        class="kws-grid-action-btn details"
        title="گزارش تماس"
        (click)="openDetails($event)">
        <i class="mdi mdi-chart-timeline-variant"></i>
        <span>گزارش</span>
      </button>

      <button
        type="button"
        class="kws-grid-action-btn edit"
        title="ویرایش مخاطب"
        (click)="openEdit($event)">
        <i class="mdi mdi-pencil-outline"></i>
        <span>ویرایش</span>
      </button>

      <button
        type="button"
        class="kws-grid-action-btn delete"
        title="حذف مخاطب"
        [disabled]="vm?.saving?.()"
        (click)="remove($event)">
        <i class="mdi mdi-trash-can-outline"></i>
        <span>حذف</span>
      </button>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      width: 100%;
      height: 100%;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }

    .kws-phonebook-grid-actions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: .35rem;
      width: 100%;
      min-width: 0;
      white-space: nowrap;
    }

    .kws-grid-action-btn {
      border: 1px solid transparent;
      border-radius: 10px;
      min-height: 32px;
      padding: .3rem .55rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: .25rem;
      font-size: .76rem;
      font-weight: 850;
      line-height: 1;
      white-space: nowrap;
      transition: background .15s ease, border-color .15s ease, color .15s ease;
    }

    .kws-grid-action-btn.details {
      color: #075985;
      background: #f0f9ff;
      border-color: #bae6fd;
    }

    .kws-grid-action-btn.edit {
      color: #1d4ed8;
      background: #eff6ff;
      border-color: #bfdbfe;
    }

    .kws-grid-action-btn.delete {
      color: #b91c1c;
      background: #fef2f2;
      border-color: #fecaca;
    }

    .kws-grid-action-btn:hover:not(:disabled) {
      filter: brightness(.97);
    }

    .kws-grid-action-btn:disabled {
      opacity: .55;
      cursor: not-allowed;
    }

    @media (max-width: 640px) {
      .kws-grid-action-btn span {
        display: none;
      }

      .kws-grid-action-btn {
        min-width: 34px;
        padding-inline: .45rem;
      }
    }
  `]
})
export class PhonebookContactActionsRendererComponent implements ICellRendererAngularComp {
  private params!: ICellRendererParams & { host?: any };

  get vm(): any {
    return this.params?.host?.vm;
  }

  get item(): any {
    return this.params?.data;
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
      this.vm?.openContactDetails(this.item);
    }
  }

  openEdit(event: MouseEvent): void {
    event.stopPropagation();
    if (this.item) {
      this.vm?.openEditModal(this.item);
    }
  }

  remove(event: MouseEvent): void {
    event.stopPropagation();
    if (this.item && !this.vm?.saving?.()) {
      this.vm?.deleteContact(this.item);
    }
  }
}
