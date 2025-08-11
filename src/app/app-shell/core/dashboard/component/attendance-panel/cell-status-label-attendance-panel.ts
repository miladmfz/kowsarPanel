import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
    selector: 'validation-Status-cell-renderer',
    template: `
    <span *ngIf="Status == '0'">
        <span class="bg-soft-danger text-danger" style="padding: 3px">عدم حضور</span>
    </span>
    <span *ngIf="Status == '1'">
        <span class="bg-soft-bg-success text-success " style="padding: 3px">آزاد</span>
    </span>
    <span *ngIf="Status == '2'">
        <span class="btn-soft-warning text-dark" style="padding: 3px">در حال کار</span>
    </span>  
      <span *ngIf="Status == '3'">
        <span class="btn-soft-info text-info" style="padding: 3px">مرخصی موقت</span>
    </span>
          <span *ngIf="Status == '4'">
        <span class="btn-soft-info text-secondary" style="padding: 3px">مرخصی اداری</span>
    </span>
    `,
})
export class CellStatusAttendancePanel implements ICellRendererAngularComp {
    params: any;
    Status: null

    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;

        if (params.data) {

            if (params.data.Status != null) {

                this.Status = params.data.Status;
            }
        }
    }
}

