import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { AgGridStateService } from '../../framework-services/agGridState.service';

@Component({
  selector: 'ag-grid-tools',
  templateUrl: './ag-grid-tools.component.html'
})
export class AgGridToolsComponent implements OnInit, OnChanges {

  @Input() name: string;
  @Input() gridApi;
  @Input() gridColumnApi;
  @Input() exportPermission;
  hasSavedState: boolean = false;

  constructor(private readonly agGridStateService: AgGridStateService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.name && this.gridApi && this.gridColumnApi)
      this.restoreState();
  }

  ngOnInit(): void {
  }

  saveState() {
    this.agGridStateService.saveState(this.gridColumnApi, this.name)
    this.hasSavedState = true;
  }

  restoreState() {
    this.hasSavedState = this.agGridStateService.restoreState(this.gridColumnApi, this.name)
  }

  resetState() {
    this.agGridStateService.resetState(this.gridColumnApi, this.name);
    this.hasSavedState = false;
  }

  onExportExcel() {
    this.gridApi.exportDataAsExcel();
  }

  onExportCSV() {
    this.gridApi.exportDataAsCsv();
  }
}