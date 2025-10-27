import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
    selector: 'image-cell-renderer',
    template: `
        @if (photo) {
          <img src="data:image/jpg;base64,{{photo}}" width="40" />
        } @else {
          <img src="./assets/media/logos/blanklogo.png" width="40" />
        }
        `,
    standalone: false
})
export class ImageCellRenderer implements ICellRendererAngularComp {
    params: any;
    photo;

    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;

        if (params.data) {
            this.photo = params.data.photo;
        }
    }
}