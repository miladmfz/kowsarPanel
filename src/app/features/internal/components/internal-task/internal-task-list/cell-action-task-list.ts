import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: `

<div class="d-inline-flex align-items-center gap-1">

  <!-- اصلاح -->

  <span
    (click)="navigatetoedit()"
    class="btn btn-sm btn-outline-primary rounded-pill"
    data-toggle="tooltip"
    title="اصلاح">

    <i class="fas fa-edit"></i>

  </span>

  <!-- حذف -->

  <span
    (click)="btnDeleteClicked()"
    class="btn btn-sm btn-outline-warning rounded-pill"
    data-toggle="tooltip"
    title="حذف">

    <i class="fas fa-trash-alt"></i>

  </span>

  <!-- حذف کامل -->

  <span
    (click)="btnDeleteClickedAll()"
    class="btn btn-sm btn-outline-danger rounded-pill"
    data-toggle="tooltip"
    title="حذف کلی با زیر شاخه ها">

    <i class="fas fa-folder-minus"></i>

  </span>

</div>

  `,
  standalone: false
})

export class CellActionTaskList implements ICellRendererAngularComp {

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

  btnDeleteClicked() {

    this.params.context.componentParent.delete(this.params.data.TaskCode);
  }

  btnDeleteClickedAll() {

    this.params.context.componentParent.deleteAll(this.params.data.TaskCode);
  }

  navigatetoedit() {

    this.params.context.componentParent.navigatetoedit(this.params.data);
  }
}