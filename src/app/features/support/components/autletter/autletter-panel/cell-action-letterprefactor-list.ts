import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 


  <span  (click)="NavigateToPreFactor()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" title=" اطلاعات " >
  <a >
    <i class="fa fa-eye"></i>

  </a>
  </span>



  `,
    standalone: false
})

export class CellActionletterPreFactorList implements ICellRendererAngularComp {
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

    if (params.data.LetterCode) {
      this.id = params.data.LetterCode;
    }
  }


  NavigateToPreFactor() {
    this.params.context.componentParent.NavigateToPreFactor(this.params.data.PreFactorCode);
  }


}
