import { Component } from "@angular/core";
import { ICellRendererAngularComp } from "ag-grid-angular";
declare var $: any;

@Component({
  selector: 'validation-Status-cell-renderer',
  template: `
<!-- عدم حضور -->
@if (SiteType == '0') {
  <span class="badge text-primary" style="padding: 3px;">سایت کوثر</span>
}

<!-- آزاد -->
@if (SiteType == '1') {
  <span class="badge text-primary" style="padding: 3px;">ورد پرس</span>
}

<!-- در حال کار -->
@if (SiteType == '2') {
  <span class="badge text-primary" style="padding: 3px;">الماتک</span>
}

<!-- ناهار و نماز -->
@if (SiteType == '3') {
  <span class="badge text-primary" style="padding: 3px;">وبینه</span>
}

<!-- مرخصی اداری -->
@if (SiteType == '4') {
  <span class="badge text-primary" style="padding: 3px;">رهپویان</span>
}

<!-- قطع برق و اینترنت -->
@if (SiteType == '5') {
  <span class="badge text-primary" style="padding: 3px;">متفرقه</span>
}

`,
  standalone: false
})
export class CellLableWebSite implements ICellRendererAngularComp {
  params: any;
  SiteType: null

  refresh(params: any): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;

    if (params.data) {

      if (params.data.SiteType != null) {

        this.SiteType = params.data.SiteType;
      }
    }
  }
}

