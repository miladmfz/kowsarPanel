import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 

  <!-- <span   (click)="NavigateToEdit()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" title="جزئیات">
  <a >
    <i class="  fas fa-shopping-cart"></i>
  </a>
  </span> -->
    <span  (click)="todelete()" class="btn btn-sm btn-outline-danger " data-toggle="tooltip" >
  <a >
    <i class=" fas fa-trash"></i>
  </a>
  </span> 

  `,
  standalone: false
})

export class CellActionCentralGroupList implements ICellRendererAngularComp {
  params: any;

  id: 0;

  refresh(params: any): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;

    // if (params.data.FactorCode) {
    //     this.id = params.data.FactorCode;
    // }
  }


  NavigateToEdit() {
    this.params.context.componentParent.navigateToEdit(this.params.data);
  }

  todelete() {
    this.params.context.componentParent.deleteCentralGroup(this.params.data);
  }

}
