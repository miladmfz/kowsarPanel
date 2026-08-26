import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AgGridModule } from 'ag-grid-angular';
import type { ColDef, GridOptions } from 'ag-grid-community';
import type { SantralPhonebookComponent } from '../santral-phonebook.component';
import { PhonebookContactActionsRendererComponent } from './phonebook-contact-actions-renderer.component';

@Component({
  selector: 'app-phonebook-contacts-tab',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AgGridModule,
  ],
  template: `
  @if (vm.activeTab() === 'contacts') {

  <div class="phonebook-toolbar">
    <div class="kws-search-box">
      <i class="mdi mdi-magnify"></i>

      <input type="text" class="form-control" placeholder="جستجو بر اساس نام، شماره یا توضیح..."
        [ngModel]="vm.searchText()" (ngModelChange)="vm.onSearchChange($event)" />
    </div>

    <div class="kws-count-box">
      {{ vm.filteredContacts().length }} مخاطب
    </div>
  </div>

  <div class="phonebook-card kws-phonebook-grid-card">

    @if (vm.loadingContacts()) {
      <div class="kws-loading">
        <span class="spinner-border spinner-border-sm"></span>
        در حال دریافت دفتر تلفن...
      </div>
    }

    @if (!vm.loadingContacts() && vm.filteredContacts().length === 0) {
      <div class="kws-empty">
        <i class="mdi mdi-card-account-phone-outline"></i>
        مخاطبی برای نمایش وجود ندارد
      </div>
    }

    @if (!vm.loadingContacts() && vm.filteredContacts().length > 0) {
      <div class="kws-phonebook-grid-note">
        <span>
          <i class="mdi mdi-table-large"></i>
          ستون‌ها قابل مرتب‌سازی، فیلتر، جابه‌جایی و تغییر اندازه هستند.
        </span>
        <span>هر صفحه ۱۱ مخاطب</span>
      </div>

      <div class="kws-phonebook-grid-shell">
        <ag-grid-angular
          class="ag-theme-quartz kws-phonebook-ag-grid"
          [rowData]="vm.filteredContacts()"
          [columnDefs]="columnDefs"
          [defaultColDef]="defaultColDef"
          [gridOptions]="gridOptions"
          [pagination]="true"
          [paginationPageSize]="11"
          [paginationPageSizeSelector]="pageSizeOptions"
          [animateRows]="true"
          [enableRtl]="true">
        </ag-grid-angular>
      </div>
    }

  </div>
  }
  `
})
export class PhonebookContactsTabComponent {
  @Input({ required: true }) vm!: SantralPhonebookComponent;

  readonly pageSizeOptions = [11, 20, 50, 100];

  readonly defaultColDef: ColDef = {
    sortable: true,
    resizable: true,
    filter: true,
    minWidth: 110,
    suppressHeaderMenuButton: false
  };

  readonly columnDefs: ColDef[] = [
    {
      headerName: 'شناسه',
      field: 'Id',
      pinned: 'right',
      width: 92,
      minWidth: 92,
      maxWidth: 115,
      lockPinned: true,
      cellClass: 'kws-ag-id-cell',
      filter: 'agNumberColumnFilter'
    },
    {
      headerName: 'عملیات',
      colId: 'actions',
      pinned: 'right',
      width: 270,
      minWidth: 270,
      maxWidth: 300,
      lockPinned: true,
      sortable: false,
      filter: false,
      resizable: true,
      suppressMovable: true,
      cellClass: 'kws-ag-actions-cell',
      cellRenderer: PhonebookContactActionsRendererComponent,
      cellRendererParams: {
        host: this
      }
    },
    {
      headerName: 'نام مخاطب',
      field: 'Name',
      flex: 1,
      minWidth: 220,
      tooltipField: 'Name',
      cellClass: 'kws-ag-contact-name-cell'
    },
    {
      headerName: 'شماره',
      field: 'Number',
      width: 190,
      minWidth: 170,
      tooltipField: 'Number',
      cellClass: 'kws-ag-phone-number-cell'
    },
    {
      headerName: 'توضیح',
      field: 'Explain',
      flex: 1.5,
      minWidth: 260,
      tooltipField: 'Explain',
      cellClass: 'kws-ag-explain-cell',
      valueFormatter: params => params.value || '-'
    }
  ];

  readonly gridOptions: GridOptions = {
    enableRtl: true,
    rowHeight: 58,
    headerHeight: 48,
    animateRows: true,
    suppressCellFocus: true,
    ensureDomOrder: true,
    pagination: true,
    paginationPageSize: 11,
    paginationPageSizeSelector: this.pageSizeOptions,
    getRowId: params => String(params.data?.Id ?? ''),
    overlayNoRowsTemplate: '<span>مخاطبی برای نمایش وجود ندارد</span>',
    enableBrowserTooltips: true,
    tooltipShowDelay: 250,
    tooltipHideDelay: 1000
  };
}
