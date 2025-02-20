import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
    selector: 'validation-state-cell-renderer',
    template: `
    <span *ngIf="state == '0'">
        <span class=" text-primary" style="padding: 3px">company</span>
    </span>
    <span *ngIf="state == '1'">
        <span class="text-primary" style="padding: 3px">broker</span>
    </span>
    <span *ngIf="state == '2'">
        <span class="text-primary" style="padding: 3px">Ocr</span>
    </span>
    <span *ngIf="state == '3'">
        <span class="text-primary" style="padding: 3px">Order</span>
    </span>
    <span *ngIf="state == '4'">
        <span class="text-primary" style="padding: 3px">Search</span>
    </span>
    `,
})
export class ValidateionStateCellManageApplicationRenderer implements ICellRendererAngularComp {
    params: any;
    state: null

    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;

        if (params.data) {

            if (params.data.AppType != null) {

                this.state = params.data.AppType;
            }
        }
    }
}