import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
    selector: 'validation-state-cell-renderer',
    template: `


<!-- ارجاع / دیده نشده -->
<span *ngIf="WorkFlowStatus == '0'" class="badge bg-info text-white" style="padding: 5px 10px;">دیده نشده</span>

<!-- تایید شده -->
<span *ngIf="WorkFlowStatus == '1'" class="badge bg-success text-white" style="padding: 5px 10px;">تایید شده</span>

<!-- رد شده -->
<span *ngIf="WorkFlowStatus == '2'" class="badge bg-danger text-white" style="padding: 5px 10px;">رد شده</span>

<!-- بررسی مجدد -->
<span *ngIf="WorkFlowStatus == '3'" class="badge bg-warning text-dark" style="padding: 5px 10px;">بررسی مجدد</span>

    
    `,
    standalone: false
})
export class StateLabelCellLeaveReq implements ICellRendererAngularComp {
    params: any;
    WorkFlowStatus: null

    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;

        if (params.data) {

            if (params.data.WorkFlowStatus != null) {

                this.WorkFlowStatus = params.data.WorkFlowStatus;
            }
        }
    }
}