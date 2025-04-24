import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 

    <ng-container *ngIf="CentralRef==RowExecutorCentralRef">

    
    <span  >
  <a  (click)="Get_Autletterrow_Property()" class="btn btn-sm btn-outline-primary mx-1 " data-toggle="tooltip" title="پشتیبانی">
    <i class="fas fa-edit"></i>
  </a>
  </span>

  
    </ng-container>
    


  `,

})

export class CellActionAutletterRowList implements ICellRendererAngularComp {
    params: any;
    canEdit: true;
    canDelete: true;
    canView: true;
    id: 0;
    CentralRef: any;

    RowExecutorCentralRef: any;
    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;
        this.CentralRef = sessionStorage.getItem("CentralRef")
        if (params.canEdit) {
            this.canEdit = params.canEdit;
        }
        if (params.canDelete) {
            this.canDelete = params.canDelete;
        }

        if (params.canView) {
            this.canView = params.canView;
        }

        if (params.data.LetterRowCode) {
            this.id = params.data.LetterRowCode;
        }
        if (params.data.RowExecutorCentralRef) {
            this.RowExecutorCentralRef = params.data.RowExecutorCentralRef;
        }
    }


    Get_Autletterrow_Property() {
        this.params.context.componentParent.Get_Autletterrow_Property(this.params.data.LetterRowCode, this.params.data.LetterState, this.params.data.LetterPriority);
    }

}
