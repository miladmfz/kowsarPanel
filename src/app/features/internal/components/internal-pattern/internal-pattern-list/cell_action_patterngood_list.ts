import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 
<span   (click)="DeleteGoodFromPattern()" class="btn btn-sm btn-outline-danger " data-toggle="tooltip" title="نمایش کالاها">
  <a >
    <i class="fas fa-trash"></i>
  </a>
  </span>

`,
  standalone: false
})
export class CellActionPatternGoodList implements ICellRendererAngularComp {
  params: any;


  refresh(params: any): boolean {
    return true;
  }
  agInit(params: any): void {
    this.params = params;


  }

  DeleteGoodFromPattern() {

    this.params.context.componentParent.DeleteGoodFromPattern(this.params.data);
  }


}



