import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import { ColDef, GridOptions } from 'ag-grid-community';

@Component({
  selector: 'app-dashboard-calls-grid-card',
  standalone: true,
  imports: [CommonModule, FormsModule, AgGridModule],
  template: `
    <div class="col-xl-12">
      <div class="card h-100">
        <div class="card-body">
          <div class="kws-section-title">
            <div>
              <h5>{{ title }}</h5>
              <span>{{ total | number }} رکورد دریافت‌شده</span>
            </div>
            <i [class]="icon"></i>
          </div>

          <div class="kws-grid-note">{{ searchHint }}</div>

          <div class="kws-grid-toolbar">
            <div class="kws-grid-search">
              <i class="mdi mdi-magnify"></i>
              <input
                type="text"
                class="form-control"
                [placeholder]="searchPlaceholder"
                [ngModel]="quickFilter"
                [disabled]="loading"
                (ngModelChange)="quickFilterChange.emit($event)">
            </div>

            <div class="kws-grid-tools">
              <select
                class="form-select form-select-sm"
                [ngModel]="limit"
                (ngModelChange)="limitChange.emit($event)"
                [disabled]="loading">
                @for (item of limitOptions; track item.value) {
                  <option [ngValue]="item.value">{{ item.title }}</option>
                }
              </select>

              <select
                class="form-select form-select-sm"
                [ngModel]="pageSize"
                [disabled]="loading"
                (ngModelChange)="pageSizeChange.emit($event)">
                @for (item of pageSizeOptions; track item.value) {
                  <option [ngValue]="item.value">{{ item.title }}</option>
                }
              </select>

              <button type="button" class="btn btn-sm btn-light" (click)="reload.emit()" [disabled]="loading">
                <i class="mdi mdi-refresh"></i>
              </button>
            </div>
          </div>

          @if (loading) {
            <div class="kws-grid-loading">
              <span class="spinner-border spinner-border-sm"></span>
              {{ loadingText }}
            </div>
          }

          <div class="ag-container kws-ag-box rounded-3 border shadow-sm overflow-hidden" [class.kws-ag-loading]="loading && rowData.length === 0">
            @if (loading && rowData.length === 0) {
              <div class="kws-grid-skeleton-overlay">
                @for (row of skeletonRows; track row) {
                  <span></span>
                }
              </div>
            }

            <ag-grid-angular
              [enableBrowserTooltips]="true"
              [tooltipShowDelay]="200"
              [tooltipHideDelay]="800"
              [columnDefs]="columnDefs"
              [rowData]="rowData"
              [gridOptions]="gridOptions"
              [pagination]="true"
              [paginationPageSize]="pageSize"
              (gridReady)="gridReadyEvent.emit($event)"
              [class]="themeClass + ' w-100 h-100'">
            </ag-grid-angular>
          </div>
        </div>
      </div>
    </div>
  `
})
export class DashboardCallsGridCardComponent {
  readonly skeletonRows = [1, 2, 3, 4, 5, 6, 7, 8];
  @Input() title = '';
  @Input() icon = 'mdi mdi-table';
  @Input() total = 0;
  @Input() searchHint = '';
  @Input() searchPlaceholder = 'جستجو...';
  @Input() loadingText = 'در حال دریافت اطلاعات...';
  @Input() loading = false;
  @Input() quickFilter = '';
  @Input() limit = 5000;
  @Input() pageSize = 20;
  @Input() limitOptions: any[] = [];
  @Input() pageSizeOptions: any[] = [];
  @Input() columnDefs: ColDef[] = [];
  @Input() rowData: any[] = [];
  @Input() gridOptions: GridOptions | any = {};
  @Input() themeClass = '';

  @Output() quickFilterChange = new EventEmitter<string>();
  @Output() limitChange = new EventEmitter<any>();
  @Output() pageSizeChange = new EventEmitter<any>();
  @Output() reload = new EventEmitter<void>();
  @Output() gridReadyEvent = new EventEmitter<any>();
}
