import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 
       
        <span   (click)="Show_History_Broker_Factors()" class="btn btn-sm btn-outline-primary" data-toggle="tooltip" title=" نمایش فاکتورها">
            <a >
                <i class=" far fa-list-alt"></i>
            </a>
        </span>



    `,
    standalone: false
})

export class CellActionAttendanceStatePanel implements ICellRendererAngularComp {
    params: any;
    data: any;
    BrokerRef: any;
    AttendanceCentralRef: any;
    CentralRef: any;
    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;
        this.data = params.data

        this.CentralRef = sessionStorage.getItem("CentralRef")

        if (sessionStorage.getItem("PhAddress3") == '100') {
            this.BrokerRef = ''

        } else {
            this.BrokerRef = sessionStorage.getItem("BrokerCode")
        }

        if (params.data.CentralRef) {
            this.AttendanceCentralRef = params.data.CentralRef;
        }
    }

    Show_History_Broker_Factors() {
        this.params.context.componentParent.Show_History_Broker_Factors(this.params.data);
    }



}
