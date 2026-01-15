import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 


<span (click)="showdbsetup()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" >
  <a >
    <i class="fas fa-edit"></i>
  </a>
  </span>



<!-- 
      <span (click)="btnDeleteClicked()" class="btn btn-sm btn-outline-warning mx-1" data-toggle="tooltip" title="حذف  ">
  <a >
    <i class="fas fa-trash"></i>
  </a>
  </span>
  <span (click)="btnDeleteClickedAll()" class="btn btn-sm btn-outline-danger" data-toggle="tooltip" title="حذف کلی با زیر شاخه ها">
  <a >
    <i class="fas fa-trash"></i>
  </a>
  </span> -->


  `,
  standalone: false
})

export class CellActionDbSetupList implements ICellRendererAngularComp {
  params: any;
  canEdit: true;
  canDelete: true;
  canView: true;
  id: 0;
  ReportForm = '';

  refresh(params: any): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;



  }



  showdbsetup() {
    this.params.context.componentParent.showdbsetup(this.params.data);
  }
}
