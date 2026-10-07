import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 
<span   (click)="GetRolePermissions()" class="btn btn-sm btn-outline-primary " data-toggle="tooltip" title="دسترسی ها">
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
export class CellActionRoleList implements ICellRendererAngularComp {
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

  }

  GetRolePermissions() {

    this.params.context.componentParent.GetRolePermissions(this.params.data);
  }


}



