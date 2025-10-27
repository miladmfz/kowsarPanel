import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
    selector: 'validation-state-cell-renderer',
    template: `


    <span
[ngClass]="{'text-danger': WithoutRows > 0, 'fw-bold': WithoutRows > 0, 'fs-2': WithoutRows > 0}">
{{ WithoutRows }}
</span>


    `,
    standalone: false
})
export class CellWithoutRowsSupportPanel implements ICellRendererAngularComp {
    params: any;
    state: null
    WithoutRows: any;
    PhLastName: any;
    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;

        if (params.data) {


            if (params.data.WithoutRows != null) {

                this.WithoutRows = params.data.WithoutRows;
            }


        }
    }
}
