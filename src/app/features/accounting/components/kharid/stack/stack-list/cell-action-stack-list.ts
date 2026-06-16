import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: `

    <div class="d-inline-flex align-items-center gap-2">

      <button
        type="button"
        (click)="createChild()"
        class="btn btn-sm btn-outline-primary rounded-pill px-3"
        title="ایجاد زیر شاخه">

        <i class="fas fa-plus-circle me-1"></i>
        ایجاد زیر شاخه

      </button>

      <button
        type="button"
        (click)="UpdateItem()"
        class="btn btn-sm btn-outline-warning rounded-pill px-3"
        title="اصلاح">

        <i class="fas fa-edit me-1"></i>
        اصلاح

      </button>

      <button
        type="button"
        (click)="deleteItem()"
        class="btn btn-sm btn-outline-danger rounded-pill px-3"
        title="حذف">

        <i class="fas fa-trash-alt me-1"></i>
        حذف

      </button>

    </div>

  `,
  standalone: false
})
export class CellActionStackList implements ICellRendererAngularComp {

  params: any;
  canEdit: true;
  canDelete: true;
  canView: true;
  id: 0;

  refresh(params: any): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;

    if (params.canEdit) {
      this.canEdit = params.canEdit;
    }

    if (params.canDelete) {
      this.canDelete = params.canDelete;
    }

    if (params.canView) {
      this.canView = params.canView;
    }

    if (params.data.TaskCode) {
      this.id = params.data.TaskCode;
    }
  }

  createChild() {
    this.params.context.componentParent.createChild(this.params.data);
  }

  deleteItem() {
    this.params.context.componentParent.deleteItem(this.params.data);
  }

  UpdateItem() {
    console.log('UpdateItem');
    this.params.context.componentParent.UpdateItem(this.params.data);
  }
}