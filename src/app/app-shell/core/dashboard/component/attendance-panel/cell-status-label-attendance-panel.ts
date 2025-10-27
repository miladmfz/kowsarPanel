import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
    selector: 'validation-Status-cell-renderer',
    template: `
<!-- عدم حضور -->
@if (Status == '0') {
  <span class="badge bg-danger text-white" style="padding: 3px;">عدم حضور</span>
}

<!-- آزاد -->
@if (Status == '1') {
  <span class="badge bg-success text-white" style="padding: 3px;">آزاد</span>
}

<!-- در حال کار -->
@if (Status == '2') {
  <span class="badge bg-warning text-dark" style="padding: 3px;">در حال کار</span>
}

<!-- ناهار و نماز -->
@if (Status == '3') {
  <span class="badge bg-info text-white" style="padding: 3px;">ناهار و نماز</span>
}

<!-- مرخصی اداری -->
@if (Status == '4') {
  <span class="badge bg-secondary text-white" style="padding: 3px;">مرخصی اداری</span>
}

<!-- قطع برق و اینترنت -->
@if (Status == '5') {
  <span class="badge bg-dark text-white" style="padding: 3px;">قطع برق و اینترنت</span>
}

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

