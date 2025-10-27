import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
    selector: 'validation-state-cell-renderer',
    template: `
    @if (state == '0') {
      <span>
        <span class=" text-primary" style="padding: 3px">مشتریان عمده</span>
      </span>
    }
    @if (state == '1') {
      <span>
        <span class="text-primary" style="padding: 3px">بازاریاب</span>
      </span>
    }
    @if (state == '2') {
      <span>
        <span class="text-primary" style="padding: 3px">پردازش و توزیع</span>
      </span>
    }
    @if (state == '3') {
      <span>
        <span class="text-primary" style="padding: 3px">سفارش گیر</span>
      </span>
    }
    @if (state == '4') {
      <span>
        <span class="text-primary" style="padding: 3px">کالایاب</span>
      </span>
    }
    `,
    standalone: false
})
export class ValidateionStateCellManageApplicationRenderer implements ICellRendererAngularComp {
    params: any;
    state: null

    refresh(params: any): boolean {
        return true;
    }

    agInit(params: any): void {
        this.params = params;

        if (params.data) {

            if (params.data.AppType != null) {

                this.state = params.data.AppType;
            }
        }
    }
}