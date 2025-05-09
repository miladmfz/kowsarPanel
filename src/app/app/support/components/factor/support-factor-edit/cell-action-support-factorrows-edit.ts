import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 

  <span  (click)="btnDeleteClicked(2)" class="btn btn-sm btn-outline-danger " data-toggle="tooltip" title="خصوصیت اضافه ">
  <a >
    <i class=" fas fa-trash"></i>
  </a>
  </span>
  `,

})

export class CellActionSupportFactorRowsEdit implements ICellRendererAngularComp {
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
            this.id = params.data.FactorRowCode;
        }
    }


    btnDeleteClicked(arg) {
        this.params.context.componentParent.delete(this.params.data.FactorRowCode);
    }
}
