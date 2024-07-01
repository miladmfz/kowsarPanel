import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 
  <span  href="https://aparat.com/v/xqi0jy0" class="btn btn-sm btn-outline-primary ">
  <a >
    <i class="fas fa-edit"></i>
  </a>
  </span>
  `,

})

export class CellActionEducation implements ICellRendererAngularComp {
    params: any;
    canEdit: true;
    canDelete: true;
    canView: true;
    id: 0;
    FilePath: string;

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

        if (params.data.FilePath) {
            this.FilePath = params.data.FilePath;
        }
    }

    btnDeleteClicked(arg) {
        this.params.context.componentParent.delete(this.params.data.FilePath);
    }


}
