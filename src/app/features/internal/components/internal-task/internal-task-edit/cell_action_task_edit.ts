import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 

  <span (click)="MoveDependencyUp($event)" class="btn btn-sm btn-outline-secondary mx-1" data-toggle="tooltip" title="انتقال به بالا">
    <a><i class="fas fa-arrow-up"></i></a>
  </span>

  <span (click)="MoveDependencyDown($event)" class="btn btn-sm btn-outline-secondary mx-1" data-toggle="tooltip" title="انتقال به پایین">
    <a><i class="fas fa-arrow-down"></i></a>
  </span>

  <span (click)="btnDeleteClicked($event)" class="btn btn-sm btn-outline-danger mx-1" data-toggle="tooltip" title="حذف وابستگی">
    <a><i class="fas fa-trash"></i></a>
  </span>
`,
  standalone: false
})
export class CellActionTaskEdit implements ICellRendererAngularComp {
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

    if (params.data.ActivationCode) {
      this.id = params.data.ActivationCode;
    }
  }

  btnDeleteClicked(event?: MouseEvent) {
    event?.stopPropagation();
    this.params.context.componentParent.btnDeleteClicked(this.params.data);
  }

  MoveDependencyUp(event?: MouseEvent) {
    event?.stopPropagation();
    this.params.context.componentParent.MoveDependencyUp(this.params.data);
  }

  MoveDependencyDown(event?: MouseEvent) {
    event?.stopPropagation();
    this.params.context.componentParent.MoveDependencyDown(this.params.data);
  }
}
