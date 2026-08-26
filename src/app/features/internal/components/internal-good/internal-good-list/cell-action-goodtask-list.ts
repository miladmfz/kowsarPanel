import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 

<span (click)="MoveGoodTaskUp($event)" class="btn btn-sm btn-outline-secondary mx-1" data-toggle="tooltip" title="انتقال به بالا">
  <a><i class="fas fa-arrow-up"></i></a>
</span>

<span (click)="MoveGoodTaskDown($event)" class="btn btn-sm btn-outline-secondary mx-1" data-toggle="tooltip" title="انتقال به پایین">
  <a><i class="fas fa-arrow-down"></i></a>
</span>

<span (click)="DeleteTaskFromGood($event)" class="btn btn-sm btn-outline-danger mx-1" data-toggle="tooltip" title="حذف وظیفه">
  <a><i class="fas fa-trash"></i></a>
</span>

  `,
    standalone: false
})

export class CellActionGoodTaskList implements ICellRendererAngularComp {
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

    DeleteTaskFromGood(event?: MouseEvent) {
        event?.stopPropagation();
        this.params.context.componentParent.DeleteTaskFromGood(this.params.data);
    }

    MoveGoodTaskUp(event?: MouseEvent) {
        event?.stopPropagation();
        this.params.context.componentParent.MoveGoodTaskUp(this.params.data);
    }

    MoveGoodTaskDown(event?: MouseEvent) {
        event?.stopPropagation();
        this.params.context.componentParent.MoveGoodTaskDown(this.params.data);
    }
}
