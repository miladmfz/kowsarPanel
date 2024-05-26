import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YearMaskDirective } from './directives/year-mask.directive';
import { DateMaskDirective } from './directives/date-mask.directive';
import { EditDeleteCellRenderer } from './ag-grid/edit-delete-cell-btn';
import { ValidateionStateCellRenderer } from './ag-grid/validation-state-label-cell';
import { ConfirmationStateCellRenderer } from './ag-grid/confirmation-state-label-cell';
import { IsCanceledCellRenderer } from './ag-grid/is-canceled-label-cell';
import { ReportWidgetComponent } from './report-widget/report-widget.component';
import { LoopLastDirective } from './directives/loop-last.directive';
import { AgGridToolsComponent } from './ag-grid-tools/ag-grid-tools.component';
import { HasModuleDirective } from './directives/has-module.directive';
import { TaxStateCellRenderer } from './ag-grid/tax-state-label-cell';
import { ClockPickerDirective } from './directives/clock-Picker.directive';
import { DayMaskDirective } from './directives/day-mask.directive';
import { HourMaskDirective } from './directives/hour-mask.directive';
import { NullDefaultValueDirective } from './directives/nullDefaultValue.directive';
import { Select2Directive } from './directives/select2.directive';
import { D3OrgChartComponent } from './d3-org-chart/d3-org-chart.component';
import { DatatableDirective } from './directives/datatable.directive';
import { AppSharedDataComponent } from './app-shared-data/app-shared-data.component';
import { ImageCellRenderer } from './ag-grid/image-cell-renderer';
import { AgGridModule } from 'ag-grid-angular';
import { JsTreeComponent } from './js-tree-component/js-tree.component';
import { LicenseManager } from '@ag-grid-enterprise/all-modules';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HotkeyModule } from 'angular2-hotkeys';
import { RouterModule } from '@angular/router';
import { ModalComponent } from './modal/modal.component';

@NgModule({
  declarations: [
    HasModuleDirective,
    Select2Directive,
    DatatableDirective,
    ClockPickerDirective,
    HourMaskDirective,
    DayMaskDirective,
    YearMaskDirective,
    DateMaskDirective,
    LoopLastDirective,
    ValidateionStateCellRenderer,
    TaxStateCellRenderer,
    ConfirmationStateCellRenderer,
    EditDeleteCellRenderer,
    ImageCellRenderer,
    IsCanceledCellRenderer,
    NullDefaultValueDirective,
    ReportWidgetComponent,
    AgGridToolsComponent,
    D3OrgChartComponent,
    AppSharedDataComponent,
    JsTreeComponent,
    ModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    HotkeyModule.forRoot()
  ],
  exports: [
    HasModuleDirective,
    Select2Directive,
    DatatableDirective,
    ClockPickerDirective,
    HourMaskDirective,
    DayMaskDirective,
    YearMaskDirective,
    DateMaskDirective,
    LoopLastDirective,
    NullDefaultValueDirective,
    ReportWidgetComponent,
    AgGridToolsComponent,
    D3OrgChartComponent,
    AppSharedDataComponent,
    JsTreeComponent,

    ModalComponent
  ]
})
export class PhoenixFrameworkModule {
  constructor() {
    LicenseManager.setLicenseKey("MjAwMDAwMDAwMDAwMA==5a5ea3be8a8aaa9b54ce7186663066431");
  }
}