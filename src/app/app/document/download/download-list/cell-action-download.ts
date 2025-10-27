import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: `

@if (ClassName=='Web_url') {
  <span >
    <a [href]="FilePath"  class="btn btn-sm btn-outline-primary ">
      <i class="fas fa-eye"></i>
    </a>
  </span>
}
@if (ClassName=='Web_download') {
  <span  (click)="btnToDownload()" class="btn btn-sm btn-outline-primary ">
    <a >
      <i class="fas fa-download"></i>
    </a>
  </span>
}
`,
    standalone: false
})

export class CellActionDownload implements ICellRendererAngularComp {
    params: any;
    canEdit: true;
    canDelete: true;
    canView: true;
    id: 0;
    FilePath: string;
    Code: string;

    ClassName: string;
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

        if (params.data.FilePath) {
            this.FilePath = params.data.FilePath;
        }
        if (params.data.ClassName) {
            this.ClassName = params.data.ClassName;
        }
        if (params.data.AttachedFileCode) {
            this.Code = params.data.AttachedFileCode;
        }
    }


    btnToDownload() {
        this.params.context.componentParent.btnToDownload(this.params.data.AttachedFileCode);
    }



}
