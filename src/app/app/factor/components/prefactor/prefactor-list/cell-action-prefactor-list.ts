import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 

  <span   (click)="NavigateToEdit()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" title="اقلام ">
  <a >
    <i class="  fas fa-shopping-cart"></i>
  </a>
  </span>
  <span  (click)="NavigateTodelete()" class="btn btn-sm btn-outline-danger " data-toggle="tooltip" >
  <a >
    <i class=" fas fa-trash"></i>
  </a>
  </span>
  <!-- <span   (click)="Edit_Customer_Property()" class="btn btn-sm btn-outline-primary " data-toggle="tooltip" title="خصوصیت  ">
  <a >
    <i class=" far fa-file-alt"></i>
  </a>
  </span> -->
  `,
    standalone: false
})

export class CellActionPreFactorList implements ICellRendererAngularComp {
    params: any;
    canEdit: true;
    canDelete: true;
    canView: true;
    id: 0;

    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;
        if (params.canEdit) {
            this.canEdit = params.canEdit;
        }
        if (params.canDelete) {
            this.canDelete = params.canDelete;
        }

        if (params.canView) {
            this.canView = params.canView;
        }

        if (params.data.FactorCode) {
            this.id = params.data.FactorCode;
        }
    }


    NavigateToEdit() {
        this.params.context.componentParent.navigateToEdit(this.params.data.PreFactorCode);
    }
    NavigateTodelete() {
        this.params.context.componentParent.delete(this.params.data);
    }


}
