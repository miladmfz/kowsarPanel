import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 
  <span   (click)="Set_Good()" class="btn btn-sm btn-outline-info mx-1" data-toggle="tooltip" title="انتخاب">
  <a >
    <i class="fas fa-plus"></i>
  </a>
  </span>


`,
  standalone: false
})
export class CellActionGoodListList implements ICellRendererAngularComp {
  params: any;


  refresh(params: any): boolean {
    return true;
  }
  agInit(params: any): void {
    this.params = params;


  }

  Set_Good() {

    this.params.context.componentParent.Set_Good(this.params.data);
  }


}



