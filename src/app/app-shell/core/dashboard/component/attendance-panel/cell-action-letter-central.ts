import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 
       
        <span   (click)="SetLetterforperson()" class="btn btn-sm btn-outline-primary" data-toggle="tooltip" title=" انتخاب">
            <a >
                <i class=" far fa-list-alt"></i>
            </a>
        </span>


    `,

})

export class CellActionLetterCentral implements ICellRendererAngularComp {
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


    }

    SetLetterforperson() {
        this.params.context.componentParent.SetLetterforperson(this.params.data);
    }





}
