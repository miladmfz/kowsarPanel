import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
    selector: 'validation-Status-cell-renderer',
    template: `
<!-- عدم حضور -->
<span *ngIf="Status == '0'" class="badge bg-danger text-white" style="padding: 3px;">عدم حضور</span>

<!-- آزاد -->
<span *ngIf="Status == '1'" class="badge bg-success text-white" style="padding: 3px;">آزاد</span>

<!-- در حال کار -->
<span *ngIf="Status == '2'" class="badge bg-warning text-dark" style="padding: 3px;">در حال کار</span>

<!-- ناهار و نماز -->
<span *ngIf="Status == '3'" class="badge bg-info text-white" style="padding: 3px;">ناهار و نماز</span>

<!-- مرخصی اداری -->
<span *ngIf="Status == '4'" class="badge bg-secondary text-white" style="padding: 3px;">مرخصی اداری</span>

<!-- قطع برق و اینترنت -->
<span *ngIf="Status == '5'" class="badge bg-dark text-white" style="padding: 3px;">قطع برق و اینترنت</span>

    `,
    standalone: false
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

