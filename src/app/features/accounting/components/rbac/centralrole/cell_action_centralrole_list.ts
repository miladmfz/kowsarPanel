import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 
<span   (click)="GetCentralRoles()" class="btn btn-sm btn-outline-primary " data-toggle="tooltip" title="نقش ها ">
  <a >
    <i class="fas fa-edit"></i>
  </a>
  </span>

<!--   
<span   (click)="CheckPort()" class="btn btn-sm btn-outline-primary " data-toggle="tooltip" title="خصوصیت اضافه ">
  <a >
    <i class=" far fa-file-alt"></i>
  </a>
  </span> -->
`,
  standalone: false
})
export class CellActionCentralRoleList implements ICellRendererAngularComp {
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

    if (params.data.ActivationCode) {
      this.id = params.data.ActivationCode;
    }
  }

  GetCentralRoles() {

    this.params.context.componentParent.GetCentralRoles(this.params.data);
  }


}



