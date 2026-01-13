import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ICellRendererAngularComp } from 'ag-grid-angular';
declare var $: any;

@Component({
  selector: 'edit-delete-cell-renderer',
  template: ` 
  <span [routerLink]="[params.editUrl, id]" class="btn btn-sm btn-outline-primary ">
  <a >
    <i class="fas fa-edit"></i>
  </a>
  </span>



  `,
  standalone: true,
  imports: [RouterLink]
})

export class CellActionAutletterPreFactorList implements ICellRendererAngularComp {
  params: any;

  id: 0;
  PhAddress3: any;

  refresh(params: any): boolean {
    return true;
  }

  agInit(params: any): void {
    this.params = params;

    this.PhAddress3 = sessionStorage.getItem("PhAddress3")


    if (params.data.LetterCode) {
      this.id = params.data.LetterCode;
    }
  }



}
