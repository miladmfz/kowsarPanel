import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 

  <span (click)="NavigateToEdit()" class="btn btn-sm btn-outline-primary ">
  <a >
    <i class="fas fa-edit"></i>
  </a>
  </span>

  <span  (click)="WorkFlow()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" title="اعلان نظر" >
  <a >
    <i class="fa fa-eye"></i>

  </a>
  </span>

  <button (click)="btnDeleteClicked()" class="btn btn-sm btn-outline-danger ">
    <i class="fas fa-trash"></i>
  </button>

  `,
    standalone: false
})

export class CellActionLeaveReqList implements ICellRendererAngularComp {
  params: any;
  canEdit: true;
  canDelete: true;
  canView: true;
  id: 0;
  PhAddress3: any;

  refresh(params: any): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;

    this.PhAddress3 = sessionStorage.getItem("PhAddress3")


    if (params.canEdit) {
      this.canEdit = params.canEdit;
    }
    if (params.canDelete) {
      this.canDelete = params.canDelete;
    }

    if (params.canView) {
      this.canView = params.canView;
    }

    if (params.data.LeaveRequestCode) {
      this.id = params.data.LeaveRequestCode;
    }
  }

  btnDeleteClicked() {
    this.params.context.componentParent.btnDeleteClicked(this.params.data);
  }


  WorkFlow() {
    this.params.context.componentParent.WorkFlow(this.params.data);
  }
  NavigateToEdit() {
    this.params.context.componentParent.NavigateToEdit(this.params.data);
  }


}
