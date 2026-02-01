import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 



<span (click)="ToEdit()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" >
  <a >
    <i class="fas fa-edit"></i>
  </a>
  </span>


  <span (click)="btnDelete()" class="btn btn-sm btn-outline-danger" data-toggle="tooltip" title="حذف کلی با زیر شاخه ها">
  <a >
    <i class="fas fa-trash"></i>
  </a>
  </span>


  `,
  standalone: false
})

export class CellActionWorkItemList implements ICellRendererAngularComp {
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

  btnDelete() {
    this.params.context.componentParent.delete(this.params.data);
  }

  ToEdit() {
    this.params.context.componentParent.edit(this.params.data);
  }
}
