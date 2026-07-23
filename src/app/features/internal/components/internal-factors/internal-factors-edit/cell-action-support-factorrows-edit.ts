import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 
  <span  (click)="ShowGoodTaskRow_FactorRow()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" title="شرح وظایف">
  <a >
    <i class=" fas fa-info"></i>
  </a>
  </span>
  <span  (click)="DeleteFactorRow()" class="btn btn-sm btn-outline-danger " data-toggle="tooltip" title="حذف ردیف">
  <a >
    <i class=" fas fa-trash"></i>
  </a>
  </span>
  `,
    standalone: false
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


    DeleteFactorRow() {
        this.params.context.componentParent.DeleteFactorRow(this.params.data);
    }


    ShowGoodTaskRow_FactorRow() {
        this.params.context.componentParent.ShowGoodTaskRow_FactorRow(this.params.data);
    }





}
