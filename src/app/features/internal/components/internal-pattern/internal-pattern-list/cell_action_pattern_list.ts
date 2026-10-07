import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 
  <span   (click)="Edit_Pattern()" class="btn btn-sm btn-outline-warning mx-1" data-toggle="tooltip" title="اصلاح الگو">
  <a >
    <i class="fas fa-edit"></i>
  </a>
  </span>
<span   (click)="ShowGoodFromPattern()" class="btn btn-sm btn-outline-primary " data-toggle="tooltip" title="نمایش کالاها">
  <a >
    <i class="fas fa-file-invoice"></i>
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

  Edit_Pattern() {

    this.params.context.componentParent.Edit_Pattern(this.params.data);
  }


}



