import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 
       
        <span   (click)="getpaneldata_report2()" class="btn btn-sm btn-outline-primary" data-toggle="tooltip" title=" نمایش فاکتورها">
            <a >
                <i class=" far fa-list-alt"></i>
            </a>
        </span>



    `,

})

export class CellActionKowsarReport implements ICellRendererAngularComp {
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

    getpaneldata_report2() {
        this.params.context.componentParent.getpaneldata_report2(this.params.data.CentralRef, this.params.data.LetterRowCode);
    }



}
