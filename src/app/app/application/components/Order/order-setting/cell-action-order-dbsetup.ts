import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 

  <span   (click)="SelectDbSetup()" class="btn btn-sm btn-outline-primary " data-toggle="tooltip" title="خصوصیت اضافه ">
  <a >
    <i class="fas fa-info"></i>
  </a>
  </span>
  `,

})

export class CellActionOrderDbsetup implements ICellRendererAngularComp {
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


    SelectDbSetup() {
        this.params.context.componentParent.SelectDbSetup(this.params.data);
    }


}
