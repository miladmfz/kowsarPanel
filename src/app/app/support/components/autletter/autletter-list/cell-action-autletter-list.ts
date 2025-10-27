import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 
  <span [routerLink]="[params.editUrl, id]" class="btn btn-sm btn-outline-primary ">
  <a >
    <i class="fas fa-edit"></i>
  </a>
  </span>

  <span  (click)="ShowInfo()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" title="خلاصه اطلاعات " >
  <a >
    <i class="fa fa-eye"></i>

  </a>
  </span>

 <ng-container *ngIf=" PhAddress3 === '100'">
  <button (click)="btnDeleteClicked()" class="btn btn-sm btn-outline-danger ">
    <i class="fas fa-trash"></i>
  </button>
</ng-container>

  `,
    standalone: false
})

export class CellActionAutletterList implements ICellRendererAngularComp {
    params: any;
    canEdit: true;
    canDelete: true;
    canView: true;
    id: 0;
    PhAddress3: any;

    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;

        this.PhAddress3 = sessionStorage.getItem("PhAddress3")


        if (params.canEdit) {
            this.canEdit = params.canEdit;
        }
        if (params.canDelete) {
            this.canDelete = params.canDelete;
        }

        if (params.canView) {
            this.canView = params.canView;
        }

        if (params.data.LetterCode) {
            this.id = params.data.LetterCode;
        }
    }

    btnDeleteClicked() {
        this.params.context.componentParent.delete(this.params.data.LetterCode, this.params.data.RowsCount);
    }


    ShowInfo() {
        this.params.context.componentParent.ShowInfo(this.params.data);
    }


}
