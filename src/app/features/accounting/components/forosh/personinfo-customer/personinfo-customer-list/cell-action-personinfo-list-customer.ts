import { Component, inject, signal } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';
declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 

   @if (Show_adminUser() ) {
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

  }



  

  `,
  standalone: false
})

export class CellActionPersonInfoCustomerList implements ICellRendererAngularComp {
  params: any;
  protected readonly session = inject(SessionStorageService);
  Show_adminUser = signal(false)

  id: 0;

  refresh(params: any): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;
    const IsAdminUser = String(this.session.IsAdminUser ?? '0').trim();
    if (IsAdminUser === '1' || IsAdminUser.toLowerCase() === 'true') {
      this.Show_adminUser.set(true)
    } else {
      this.Show_adminUser.set(false)
    }

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
