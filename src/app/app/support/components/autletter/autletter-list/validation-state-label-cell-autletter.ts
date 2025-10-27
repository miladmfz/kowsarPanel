import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
    selector: 'validation-state-cell-renderer',
    template: `
    @if (state == 'True') {
      <span>
        <span class="bg-soft-warning text-warning" style="padding: 3px">ارجاع</span>
      </span>
    }
    @if (state == 'False') {
      <span>
        <span class="bg-soft-primary text-primary" style="padding: 3px">دیده شده</span>
      </span>
    }
    @if (state == '') {
      <span>
        <span class="btn-soft-danger text-danger" style="padding: 3px">جدید</span>
      </span>
    }`,
    standalone: false
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