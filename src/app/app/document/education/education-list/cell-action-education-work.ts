import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 
  <span>
  <a [href]="FilePath"  class="btn btn-sm btn-outline-primary ">
    <i class="fas fa-eye"></i>
  </a>
  </span>
  `,
    standalone: false
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
