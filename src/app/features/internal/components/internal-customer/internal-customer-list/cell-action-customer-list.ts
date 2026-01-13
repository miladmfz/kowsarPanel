import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 
      <span   (click)="NavigateToEdit()" class="btn btn-sm btn-outline-primary  " data-toggle="tooltip" title="اصلاح مشتری">
  <a >
    <i class="fas fa-user-edit"></i>
  </a>
  </span>
      <span   (click)="Factor_Customer()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" title="لیست فاکتور">
  <a >
    <i class="fas fa-file-invoice"></i>
  </a>
  </span>


  <span   (click)="Edit_Customer_Property_Explain()" class="btn btn-sm btn-outline-primary mx-1 " data-toggle="tooltip" title=" ویرایش اطلاعات کوثر ">
  <a >
    <i class="fas fa-file-alt"></i>
  </a>
  </span>

    <span   (click)="Show_Customer_Property()" class="btn btn-sm btn-outline-primary mx-1 " data-toggle="tooltip" title="خصوصیت اضافه ">
  <a >
    <i class="fas fa-file-alt"></i>
  </a>
  </span>
  `,
    standalone: false
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



    NavigateToEdit() {
        this.params.context.componentParent.NavigateToEdit(this.params.data.CustomerCode);
    }

    Edit_Customer_Property_Explain() {

        this.params.context.componentParent.Edit_Customer_Property_Explain(this.params.data.CustomerCode);
    }

    Factor_Customer() {
        this.params.context.componentParent.Factor_Customer_Property(this.params.data.CustomerCode);
    }



    Show_Customer_Property() {
        this.params.context.componentParent.Show_Customer_Property(this.params.data.CustomerCode);
    }



}
