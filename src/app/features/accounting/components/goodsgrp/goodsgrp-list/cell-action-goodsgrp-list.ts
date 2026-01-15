import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 



<span (click)="navigatetoedit()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" >
  <a >
    <i class="fas fa-edit"></i>
  </a>
  </span>




  `,
  standalone: false
})

export class CellActionGoodsGrpList implements ICellRendererAngularComp {
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




    this.ReportForm = this.params.data.ReportForm
    if (this.params.data.ReportForm) {
      this.canView = params.canView;
    }


  }



  navigatetoedit() {
    this.params.context.componentParent.navigatetoedit(this.params.data);
  }
}
