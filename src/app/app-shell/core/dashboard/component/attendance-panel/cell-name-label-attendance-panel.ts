import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
    selector: 'validation-state-cell-renderer',
    template: `
    <span >
    {{ PhFirstName +' '+ PhLastName|| '-' }}
    </span>
    `,
    standalone: false
})
export class CellNameAttendancePanel implements ICellRendererAngularComp {
    params: any;
    state: null
    PhFirstName: any;
    PhLastName: any;
    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;

        if (params.data) {


            if (params.data.PhFirstName != null) {

                this.PhFirstName = params.data.PhFirstName;
            }

            if (params.data.PhLastName != null) {

                this.PhLastName = params.data.PhLastName;
            }
        }
    }
}