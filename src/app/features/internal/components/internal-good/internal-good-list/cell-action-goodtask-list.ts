import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 
<span   (click)="DeleteTaskFromGood()" class="btn btn-sm btn-outline-danger " data-toggle="tooltip" title="حذف وظیفه">
  <a >
    <i class="fas fa-trash"></i>
  </a>
  </span>

  `,
    standalone: false
})

export class CellActionGoodTaskList implements ICellRendererAngularComp {
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

        if (params.data.GoodCode) {
            this.id = params.data.GoodCode;
        }
    }
    DeleteTaskFromGood() {
        this.params.context.componentParent.DeleteTaskFromGood(this.params.data);
    }


}
