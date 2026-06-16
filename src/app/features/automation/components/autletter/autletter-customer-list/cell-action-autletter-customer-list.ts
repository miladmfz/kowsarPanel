import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { PermissionService } from 'src/app/app-shell/framework-services/storage/PermissionService';
import { SessionStorageService } from 'src/app/app-shell/framework-services/storage/session.storage.service';

/**
 * CellActionAutletterList
 * --------------------------------------------------------
 * نمایش دکمه‌های عملیات (ویرایش / مشاهده / حذف)
 * همراه با نمایش تعداد پیام‌های خوانده‌نشده
 */
@Component({
  selector: 'cell-action-autletter-list',
  standalone: true,
  imports: [CommonModule],
  template: `
<div class="d-flex justify-content-center gap-1">

  <!-- Edit -->
  <button
    type="button"
    class="btn btn-sm kws-action-btn"
    [ngClass]="showConversationBadge
      ? 'kws-action-danger'
      : 'kws-action-primary'"
    (click)="onEdit()"
    title="ویرایش / پیام‌ها"
  >

    <i class="fas fa-comments"></i>

  </button>


</div>
  `,
})
export class CellActionAutletterCustomerList implements ICellRendererAngularComp {
  protected readonly permissionService = inject(PermissionService);
  protected readonly session = inject(SessionStorageService);
  params: any;

  PersonInfoRef: string | null = null;
  PersonInfoRef_letter: string | null = null;
  LoginType: string | null = null;

  ConversationCount: number = 0;

  agInit(params: any): void {
    this.params = params;

    this.PersonInfoRef = this.session.personInfoRef;
    this.LoginType = this.session.loginType;


    this.PersonInfoRef_letter = this.params?.data?.OwnerPersonInfoRef
    this.ConversationCount = Number(
      this.params?.data?.ConversationCount || 0
    );
  }

  refresh(): boolean {
    return false;
  }

  onEdit(): void {
    this.params?.context?.componentParent?.NavigateToEdit?.(this.params.data);
  }


  get showConversationBadge(): boolean {
    if (this.ConversationCount <= 0) return false;

    if (this.LoginType) {
      return true;
    }

    // Person mode
    return this.PersonInfoRef_letter === this.PersonInfoRef;
  }
}