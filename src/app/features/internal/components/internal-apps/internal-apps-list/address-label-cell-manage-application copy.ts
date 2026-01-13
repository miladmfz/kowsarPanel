import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
    selector: 'validation-state-cell-renderer',
    template: `

    <span >
        <span class="text-primary" style="padding: 3px">{{adress}}</span>
    </span>
    `,
})
export class AddressCellManageApplicationRenderer implements ICellRendererAngularComp {
    params: any;
    state: null
    adress: any
    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;

        if (params.data) {

            if (params.data.ServerURL != null) {

                this.adress = params.data.ServerURL.match(/\/\/(.*?):/)[1] + " - " + params.data.ServerURL.match(/:(\d+)\//)[1];
            }
        }
    }
}