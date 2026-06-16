import { Component, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 


<span (click)="ShowModal()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" >
  <a >
    <i class="fas fa-edit"></i>
  </a>
  </span>




  `,
  standalone: false
})

export class CellActionFiscalPeriodList implements ICellRendererAngularComp {
  params: any;
  canEdit: true;
  canDelete: true;
  canView: true;
  id: 0;
  ReportForm = signal('')

  refresh(params: any): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;



  }



  ShowModal() {
    this.params.context.componentParent.ShowModal(this.params.data);
  }
}
