import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 

<span   (click)="ShowGoodFromPattern()" class="btn btn-sm btn-outline-primary " data-toggle="tooltip" title="نمایش کالاها">
  <a >
    <i class="fas fa-file-invoice"></i>
  </a>
  </span>

  <span   (click)="AddGoodsToCustomer()" class="btn btn-sm btn-outline-primary " data-toggle="tooltip" title="اضافه کردن الگو به مشتری">
  <a >
    <i class="fas fa-plus"></i>
  </a>
  </span>


`,
  standalone: false
})
export class CellActionPatternList implements ICellRendererAngularComp {
  params: any;


  refresh(params: any): boolean {
    return true;
  }
  agInit(params: any): void {
    this.params = params;


  }

  ShowGoodFromPattern() {

    this.params.context.componentParent.ShowGoodFromPattern(this.params.data);
  }

  AddGoodsToCustomer() {

    this.params.context.componentParent.AddGoodsToCustomer(this.params.data);
  }


}



