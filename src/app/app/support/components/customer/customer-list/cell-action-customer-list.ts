import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 
<span  >
  <a  (click)="Edit_Customer_Explain()" class="btn btn-sm btn-outline-primary mx-1 " data-toggle="tooltip" title="پشتیبانی">
    <i class="fas fa-edit"></i>
  </a>
  </span>
  <span   (click)="Edit_Customer_Property()" class="btn btn-sm btn-outline-primary " data-toggle="tooltip" title="خصوصیت اضافه ">
  <a >
    <i class=" far fa-file-alt"></i>
  </a>
  </span>
  `,

})

export class CellActionCustomerList implements ICellRendererAngularComp {
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

        if (params.data.CustomerCode) {
            this.id = params.data.CustomerCode;
        }
    }

    Edit_Customer_Explain() {
        this.params.context.componentParent.Edit_Customer_Explain(this.params.data.CustomerCode);
    }


    Edit_Customer_Property() {
        this.params.context.componentParent.Edit_Customer_Property(this.params.data.CustomerCode);
    }

}
