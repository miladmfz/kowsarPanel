import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditDeleteCellRenderer } from './ag-grid/edit-delete-cell-btn';
import { ValidateionStateCellRenderer } from './ag-grid/validation-state-label-cell';
import { ConfirmationStateCellRenderer } from './ag-grid/confirmation-state-label-cell';
import { IsCanceledCellRenderer } from './ag-grid/is-canceled-label-cell';
import { AgGridToolsComponent } from './ag-grid-tools/ag-grid-tools.component';
import { TaxStateCellRenderer } from './ag-grid/tax-state-label-cell';
import { D3OrgChartComponent } from './d3-org-chart/d3-org-chart.component';
import { AppSharedDataComponent } from './app-shared-data/app-shared-data.component';
import { ImageCellRenderer } from './ag-grid/image-cell-renderer';
import { AgGridModule } from 'ag-grid-angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LicenseManager } from '@ag-grid-enterprise/all-modules';

@NgModule({
  declarations: [
    ValidateionStateCellRenderer,
    TaxStateCellRenderer,
    ConfirmationStateCellRenderer,
    EditDeleteCellRenderer,
    ImageCellRenderer,
    IsCanceledCellRenderer,
    AgGridToolsComponent,
    D3OrgChartComponent,
    AppSharedDataComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
  ],
  exports: [
    AgGridToolsComponent,
    D3OrgChartComponent,
    AppSharedDataComponent,

  ]
})
export class PhoenixFrameworkModule {
  constructor() {
    LicenseManager.setLicenseKey("MjAwMDAwMDAwMDAwMA==5a5ea3be8a8aaa9b54ce7186663066431");

  }
}