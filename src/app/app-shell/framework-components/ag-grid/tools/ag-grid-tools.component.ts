import { Component, inject, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AgGridStateService } from '../services/agGridState.service';

@Component({
  selector: 'ag-grid-tools',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ag-grid-tools.component.html'
})
export class AgGridToolsComponent implements OnInit, OnChanges {

  @Input() name!: string;
  @Input() gridApi: any;
  @Input() gridColumnApi: any;
  @Input() exportPermission?: string;

  hasSavedState = false;
  private readonly agGridStateService = inject(AgGridStateService);
  constructor() { }

  ngOnInit(): void {
    if (this.name && this.gridApi && this.gridColumnApi)
      this.restoreState();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.name && this.gridApi && this.gridColumnApi)
      this.restoreState();
  }

  saveState(): void {
    this.agGridStateService.saveState(this.gridColumnApi, this.name);
    this.hasSavedState = true;
  }

  restoreState(): void {
    this.hasSavedState = this.agGridStateService.restoreState(this.gridColumnApi, this.name);
  }

  resetState(): void {
    this.agGridStateService.resetState(this.gridColumnApi, this.name);
    this.hasSavedState = false;
  }

  onExportExcel(): void {
    this.gridApi?.exportDataAsExcel();
  }

  onExportCSV(): void {
    this.gridApi?.exportDataAsCsv();
  }
}
