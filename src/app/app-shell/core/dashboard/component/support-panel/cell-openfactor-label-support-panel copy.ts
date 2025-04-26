import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
    selector: 'validation-state-cell-renderer',
    template: `

<span
        [ngClass]="{'text-danger': OpenFactor > 0, 'fw-bold': OpenFactor > 0, 'fs-2': OpenFactor > 0}">
        {{ OpenFactor }}
</span>
    `,
})
export class CellOpenFactorSupportPanel implements ICellRendererAngularComp {
    params: any;
    state: null
    OpenFactor: any;
    PhLastName: any;
    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;

        if (params.data) {


            if (params.data.OpenFactor != null) {

                this.OpenFactor = params.data.OpenFactor;
            }


        }
    }
}


