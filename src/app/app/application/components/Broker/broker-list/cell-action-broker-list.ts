import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 
      <span   (click)="navigateToDetail()" class="btn btn-sm btn-outline-primary" data-toggle="tooltip" title="گزارشات">
  <a >
    <i class=" far fa-list-alt"></i>
  </a>
  </span>

  `,

})

export class CellActionBrokerList implements ICellRendererAngularComp {
  params: any;
  canEdit: true;
  canDelete: true;
  canView: true;
  BrokerCode: 0;

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

    if (params.data.BrokerCode) {
      this.BrokerCode = params.data.BrokerCode;
    }
  }

  navigateToDetail() {
    this.params.context.componentParent.navigateToDetail(this.params.data.BrokerCode);
  }



}
