

import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
    selector: 'edit-delete-cell-renderer',
    template: `
    <ng-container *ngIf="Imageitem.length > 100">
      <img [src]="Imageitem" alt="No Photo" >
    </ng-container>
    <ng-container *ngIf="Imageitem.length < 100">
      <img src="./assets/images/plugins/loading.gif" alt="No Photo" >
    </ng-container>
  `,
    standalone: false
})
export class CellActionGoodEditImage implements ICellRendererAngularComp {
    params: any;
    Imageitem: string = '';

    agInit(params: any): void {
        this.params = params;

        if (params.data) {
            if (this.params.data.IMG.length < 100) {
                this.GetImage();
            } else {
                this.Imageitem = `data:image;base64,${params.data.IMG}`;
            }
        }
    }

    refresh(params: any): boolean {
        this.params = params;
        // Update Imageitem when refresh is called
        if (params.data) {
            this.Imageitem = `data:image;base64,${params.data.IMG}`;
        }
        return true;
    }

    GetImage() {
        // Call the parent component's function to get the image
        this.params.context.componentParent.GetImageFromKsr("50", this.params.data.KsrImageCode)
            .subscribe((data: any) => {
                // Update the IMG data
                if (this.params.data.KsrImageCode === this.params.data.KsrImageCode) {
                    this.params.data.IMG = data.Text;
                    // Update Imageitem
                    this.Imageitem = `data:image;base64,${data.Text}`;
                    // Manually trigger the refresh to update the cell
                    this.params.api.refreshCells({ rowNodes: [this.params.node] });
                }
            });
    }
}

