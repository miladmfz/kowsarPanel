import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
  selector: 'validation-state-cell-renderer',
  template: `
    @if (IsActive == '0') {
      <span>
        <span class=" text-primary" style="padding: 3px">ابطالی</span>
      </span>
    }
    @if (IsActive == '1') {
      <span>
        <span class="text-primary" style="padding: 3px">فعال</span>
      </span>
    }
    @if (IsActive == '2') {
      <span>
        <span class="text-primary" style="padding: 3px">غیر فعال</span>
      </span>
    }
    
    `,
  standalone: false
})
export class LableIsActiveAppActivation implements ICellRendererAngularComp {
  params: any;
  IsActive: null

  refresh(params: any): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;

    if (params.data) {

      if (params.data.IsActive != null) {

        this.IsActive = params.data.IsActive;
      }
    }
  }
}