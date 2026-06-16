import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 

  <span   (click)="NavigateToEdit()" class="btn btn-sm btn-outline-primary" data-toggle="tooltip" title="جزئیات">
  <a >
    <i class="fas fa-eye"></i>
  </a>
  </span>
 <span   (click)="UserConfig()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" title="مدیریت کاربر">
  <a >
    <i class="fas fa-user-cog"></i>
  </a>
  </span>
 <span   (click)="ResetXUserPassword()" class="btn btn-sm btn-outline-primary" data-toggle="tooltip" title="ریست پسورد">
  <a >
    <i class="fas fa-unlock-alt"></i>
  </a>
  </span>


  

  `,
  standalone: false
})

export class CellActionPersonInfoList implements ICellRendererAngularComp {
  params: any;

  id: 0;

  refresh(params: any): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;

    // if (params.data.FactorCode) {
    //     this.id = params.data.FactorCode;
    // }
  }


  NavigateToEdit() {
    this.params.context.componentParent.navigateToEdit(this.params.data);
  }

  ResetXUserPassword() {
    this.params.context.componentParent.ResetXUserPassword(this.params.data);
  }

  UserConfig() {
    this.params.context.componentParent.UserConfig(this.params.data);
  }


}
