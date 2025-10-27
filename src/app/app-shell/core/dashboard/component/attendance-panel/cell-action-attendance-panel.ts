import { Component } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
    selector: 'edit-delete-cell-renderer',
    template: ` 
       
        <span   (click)="SetLetter_config()" class="btn btn-sm btn-outline-primary" data-toggle="tooltip" title=" تیکت">
            <a >
                <i class=" far fa-list-alt"></i>
            </a>
        </span>

        <ng-container *ngIf="BrokerRef==''"> 
            <span   (click)="ShowHistory()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" title="تاریخچه">
                <a >
                    <i class="fas fa-history"></i>
                </a>
            </span>
        </ng-container>

        <ng-container *ngIf="BrokerRef!=''">   
            <ng-container *ngIf="CentralRef==AttendanceCentralRef">
                <span   (click)="ShowHistory()" class="btn btn-sm btn-outline-primary mx-1" data-toggle="tooltip" title="تاریخچه">
                    <a >
                         <i class="fas fa-history"></i>
                    </a>
                 </span>

             </ng-container>
        </ng-container>

    `,
    standalone: false
})

export class CellActionAttendancePanel implements ICellRendererAngularComp {
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

    SetLetter_config() {
        this.params.context.componentParent.SetLetter_config(this.params.data);
    }

    ShowHistory() {
        this.params.context.componentParent.ShowHistory(this.params.data);
    }






}
