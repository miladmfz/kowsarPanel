import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AttachComponent } from './attach/attach.component';
import { NoteComponent } from './note/note.component';
import { VoiceRecorderComponent } from './voice-recorder/voice-recorder.component';
import { YearMaskDirective } from './directives/year-mask.directive';
import { DateMaskDirective } from './directives/date-mask.directive';
import { EditDeleteCellRenderer } from './ag-grid/edit-delete-cell-btn';
import { ValidateionStateCellRenderer } from './ag-grid/validation-state-label-cell';
import { ConfirmationStateCellRenderer } from './ag-grid/confirmation-state-label-cell';
import { IsCanceledCellRenderer } from './ag-grid/is-canceled-label-cell';
import { VoiceComponent } from './voice/voice.component';
import { VoicePlayerComponent } from './voice-player/voice-player.component';
import { ReportWidgetComponent } from './report-widget/report-widget.component';
import { LoopLastDirective } from './directives/loop-last.directive';
import { AgGridToolsComponent } from './ag-grid-tools/ag-grid-tools.component';
import { GridSearchPanelComponent } from './grid-search-panel/grid-search-panel.component';
import { HasModuleDirective } from './directives/has-module.directive';
import { TaxStateCellRenderer } from './ag-grid/tax-state-label-cell';
import { ClockPickerDirective } from './directives/clock-Picker.directive';
import { DayMaskDirective } from './directives/day-mask.directive';
import { HasPermissionDirective } from './directives/has-permission.directive';
import { HourMaskDirective } from './directives/hour-mask.directive';
import { NullDefaultValueDirective } from './directives/nullDefaultValue.directive';
import { Select2Directive } from './directives/select2.directive';
import { VoiceRecognizerDirective } from './directives/voice-recognizer.directive';
import { D3OrgChartComponent } from './d3-org-chart/d3-org-chart.component';
import { DatatableDirective } from './directives/datatable.directive';
import { AppSharedDataComponent } from './app-shared-data/app-shared-data.component';
import { ImageCellRenderer } from './ag-grid/image-cell-renderer';
import { AgGridModule } from 'ag-grid-angular';
import { JsTreeComponent } from './js-tree-component/js-tree.component';
import { CustomInputComponent } from './custom-controls/custom-input/custom-input.component';
import { CustomSelectComponent } from './custom-controls/custom-select/custom-select.component';
import { CustomCheckboxComponent } from './custom-controls/custom-checkbox/custom-checkbox.component';
import { SelectDateComponent } from './select-date/select-date.component';
import { LicenseManager } from '@ag-grid-enterprise/all-modules';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HotkeyModule } from 'angular2-hotkeys';
import { RouterModule } from '@angular/router';
import { ModalComponent } from './modal/modal.component';
import { LabelButtonComponent } from './custom-buttons/label-button.component';
import { IconButtonComponent } from './custom-buttons/icon-button.component';
import { LabelIconButtonComponent } from './custom-buttons/label-icon-button.component';

@NgModule({
  declarations: [
    HasPermissionDirective,
    HasModuleDirective,
    Select2Directive,
    DatatableDirective,
    ClockPickerDirective,
    HourMaskDirective,
    DayMaskDirective,
    YearMaskDirective,
    DateMaskDirective,
    LoopLastDirective,
    NoteComponent,
    AttachComponent,
    VoiceRecognizerDirective,
    VoiceRecorderComponent,
    ValidateionStateCellRenderer,
    TaxStateCellRenderer,
    ConfirmationStateCellRenderer,
    EditDeleteCellRenderer,
    ImageCellRenderer,
    IsCanceledCellRenderer,
    NullDefaultValueDirective,
    VoiceComponent,
    VoicePlayerComponent,
    ReportWidgetComponent,
    AgGridToolsComponent,
    GridSearchPanelComponent,
    D3OrgChartComponent,
    AppSharedDataComponent,
    JsTreeComponent,
    CustomInputComponent,
    CustomSelectComponent,
    CustomCheckboxComponent,
    SelectDateComponent,
    LabelButtonComponent,
    IconButtonComponent,
    LabelIconButtonComponent,
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
    HasPermissionDirective,
    HasModuleDirective,
    Select2Directive,
    DatatableDirective,
    ClockPickerDirective,
    HourMaskDirective,
    DayMaskDirective,
    YearMaskDirective,
    DateMaskDirective,
    LoopLastDirective,
    NoteComponent,
    AttachComponent,
    VoiceRecognizerDirective,
    VoiceRecorderComponent,
    NullDefaultValueDirective,
    VoiceComponent,
    VoicePlayerComponent,
    ReportWidgetComponent,
    AgGridToolsComponent,
    GridSearchPanelComponent,
    D3OrgChartComponent,
    AppSharedDataComponent,
    JsTreeComponent,
    CustomInputComponent,
    CustomSelectComponent,
    CustomCheckboxComponent,
    SelectDateComponent,
    LabelButtonComponent,
    IconButtonComponent,
    LabelIconButtonComponent,

    ModalComponent
  ]
})
export class PhoenixFrameworkModule {
  constructor() {
    LicenseManager.setLicenseKey("MjAwMDAwMDAwMDAwMA==5a5ea3be8a8aaa9b54ce7186663066431");
  }
}