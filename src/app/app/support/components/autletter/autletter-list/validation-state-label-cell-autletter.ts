import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
    selector: 'validation-state-cell-renderer',
    template: `
    <span *ngIf="state == 'True'">
        <span class="bg-soft-warning text-warning" style="padding: 3px">ارجاع</span>
    </span>
    <span *ngIf="state == 'False'">
        <span class="bg-soft-primary text-primary" style="padding: 3px">دیده شده</span>
    </span>
    <span *ngIf="state == ''">
        <span class="btn-soft-danger text-danger" style="padding: 3px">جدید</span>
    </span>`,
})
export class ValidateionStateCellAutletterRenderer implements ICellRendererAngularComp {
    params: any;
    state: null

    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;

        if (params.data) {

            if (params.data.AlarmActive != null) {

                this.state = params.data.AlarmActive;
            }
        }
    }
}