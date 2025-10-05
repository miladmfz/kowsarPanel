import { AllModules, GridApi, ColumnApi } from '@ag-grid-enterprise/all-modules';
import { ConfirmationStateCellRenderer } from '../ag-grid/confirmation-state-label-cell';
import { EditDeleteCellRenderer } from '../ag-grid/edit-delete-cell-btn';
import { GoToDocumentCellBtnRenderer } from '../ag-grid/go-to-document-cell-btn-renderer';
import { IsCanceledCellRenderer } from '../ag-grid/is-canceled-label-cell';
import { TaxStateCellRenderer } from '../ag-grid/tax-state-label-cell';
import { ValidateionStateCellRenderer } from '../ag-grid/validation-state-label-cell';
import { Component, EventEmitter, HostListener, Inject, Output } from '@angular/core';
import { AppSharedDataComponent } from '../app-shared-data/app-shared-data.component';
import { ImageCellRenderer } from '../ag-grid/image-cell-renderer';
import { AG_GRID_LOCALE_FA } from './locale.fa';
import { Module } from './ag-grid-module';


declare var Swal: any;

@Component({
  selector: 'app-ag-grid-base',
  template: '',
})
export class AgGridBaseComponent extends AppSharedDataComponent {
  public childName: string;
  public;
  modules: Module[] = AllModules;
  public defaultColDef;
  public defaultColDef1;
  CellClickedEven
  resizeTimeout: any;


  public columnDefs: any[];
  public gridApi;
  public gridColumnApi;

  public columnDefs1: any[];
  public gridApi1;
  public gridColumnApi1;

  public columnDefs2: any[];
  public gridApi2;
  public gridColumnApi2;

  public columnDefs3: any[];
  public gridApi3;
  public gridColumnApi3;

  public columnDefs4: any[];
  public gridApi4;
  public gridColumnApi4;

  public columnDefs5: any[];
  public gridApi5;
  public gridColumnApi5;

  public columnDefs6: any[];
  public gridApi6;
  public gridColumnApi6;


  public selectedRows: any[];

  public localeText: any;
  public autoGroupColumnDef;
  public rowGroupPanelShow = 'always';
  public statusBar;
  public pivotPanelShow;
  public frameworkComponents;
  public context;
  @Output() afterGridReady = new EventEmitter<number>();

  constructor(
    @Inject(Boolean) hasPinnedRow = false
  ) {
    super();

    this.defaultColDef = {
      lockVisible: true,
      headerClass: "text-center",
      flex: 1,
      resizable: true,
      filter: true,
      sortable: true,
      enableValue: true,
      enableRowGroup: true,
      enablePivot: true,
      autosizeThiscolumn: true,
      rowSelection: "multiple",
      onCellClicked: () =>
        console.log('Cell was clicked'),

    };


    this.rowGroupPanelShow = 'always';
    this.pivotPanelShow = 'always';

    this.statusBar = {
      statusPanels: [
        {
          statusPanel: 'agTotalAndFilteredRowCountComponent',
          align: 'left',
        },
        {
          statusPanel: 'agTotalRowCountComponent',
          align: 'center',
        },
        { statusPanel: 'agFilteredRowCountComponent' },
        { statusPanel: 'agSelectedRowCountComponent' },
        { statusPanel: 'agAggregationComponent' },
      ],
    };

    this.context = { componentParent: this };
    this.localeText = AG_GRID_LOCALE_FA;




  }

  public rowData: any[];

  private lastClickedCellId: string | null = null;
  private clickCount: number = 0;
  private readonly resizeThreshold: number = 2; // Threshold for double click
  public components: { [p: string]: any } = {
    editDeleteCellRenderer: EditDeleteCellRenderer,
    imageCellRenderer: ImageCellRenderer,
    validationStateCellRenderer: ValidateionStateCellRenderer,
    taxStateCellRenderer: TaxStateCellRenderer,
    confirmationStateCellRenderer: ConfirmationStateCellRenderer,
    isCanceledCellRenderer: IsCanceledCellRenderer,
    goToDocumentCellRenderer: GoToDocumentCellBtnRenderer,
  };


  @HostListener('window:resize', ['$event'])
  onResize() {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      if (this.gridApi) {
        this.gridApi.doLayout();
        this.gridApi.sizeColumnsToFit(); // فقط اگه بخوای ستون‌ها هم مقیاس‌پذیر باشن
      }
      if (this.gridApi1) {
        this.gridApi1.doLayout();
        this.gridApi1.sizeColumnsToFit(); // فقط اگه بخوای ستون‌ها هم مقیاس‌پذیر باشن
      }
      if (this.gridApi2) {
        this.gridApi2.doLayout();
        this.gridApi2.sizeColumnsToFit(); // فقط اگه بخوای ستون‌ها هم مقیاس‌پذیر باشن
      }
      if (this.gridApi3) {
        this.gridApi3.doLayout();
        this.gridApi3.sizeColumnsToFit(); // فقط اگه بخوای ستون‌ها هم مقیاس‌پذیر باشن
      }
      if (this.gridApi4) {
        this.gridApi4.doLayout();
        this.gridApi4.sizeColumnsToFit(); // فقط اگه بخوای ستون‌ها هم مقیاس‌پذیر باشن
      }
      if (this.gridApi5) {
        this.gridApi5.doLayout();
        this.gridApi5.sizeColumnsToFit(); // فقط اگه بخوای ستون‌ها هم مقیاس‌پذیر باشن
      }
      if (this.gridApi6) {
        this.gridApi6.doLayout();
        this.gridApi6.sizeColumnsToFit(); // فقط اگه بخوای ستون‌ها هم مقیاس‌پذیر باشن
      }

    }, 200);
  }


  fireDeleteSwal() {
    return Swal.fire({
      title: 'آیا از حذف این ردیف اطمینان دارید؟',
      text: 'درصورت حذف دیگر قادر به بازیابی ردیف فوق نخواهید بود.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'بله، اطمینان دارم.',
      cancelButtonText: 'خیر',
      confirmButtonClass: 'btn btn-success mx-2',
      cancelButtonClass: 'btn btn-danger',
      buttonsStyling: !1,

    });
  }

  fireDeleteSucceddedSwal() {
    Swal.fire({
      title: 'ردیف فوق با موفقیت حذف شد.',
      type: 'success',
    });
  }

  dismissDeleteSwal(t) {
    t.dismiss === Swal.DismissReason.cancel;
  }

  onClearRange() {
    this.gridApi.clearRangeSelection();
  }

  removeAllFilters() {
    this.gridApi.setFilterModel(null);
  }

  onExportExcel() {
    this.gridApi.exportDataAsExcel();
  }

  onExportCSV() {
    this.gridApi.exportDataAsCsv();
  }

  setColumnsVisible(colName: string, state: boolean) {
    this.gridColumnApi.setColumnsVisible(colName, state);
  }

  onGridReady(params) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
    this.gridApi.hideOverlay();

  }

  onGridReady2(params) {
    this.gridApi2 = params.api;
    this.gridColumnApi2 = params.columnApi;
    this.gridApi2.hideOverlay();

  }

  onGridReady3(params) {
    this.gridApi3 = params.api;
    this.gridColumnApi3 = params.columnApi;
    this.gridApi3.hideOverlay();

  }

  onGridReady4(params) {
    this.gridApi4 = params.api;
    this.gridColumnApi4 = params.columnApi;
    this.gridApi4.hideOverlay();

  }
  onGridReady5(params) {
    this.gridApi5 = params.api;
    this.gridColumnApi5 = params.columnApi;
    this.gridApi5.hideOverlay();

  }

  onGridReady6(params) {
    this.gridApi6 = params.api;
    this.gridColumnApi6 = params.columnApi;
    this.gridApi6.hideOverlay();

  }



  resizeColumn(column: any) {
    if (this.gridColumnApi) {
      const columnId = column.getColId();
      this.gridColumnApi.autoSizeColumn(columnId);
    }
    if (this.gridColumnApi2) {
      const columnId = column.getColId();
      this.gridColumnApi2.autoSizeColumn(columnId);
    }
    if (this.gridColumnApi3) {
      const columnId = column.getColId();
      this.gridColumnApi3.autoSizeColumn(columnId);
    }
    if (this.gridColumnApi4) {
      const columnId = column.getColId();
      this.gridColumnApi4.autoSizeColumn(columnId);
    }
    if (this.gridColumnApi5) {
      const columnId = column.getColId();
      this.gridColumnApi5.autoSizeColumn(columnId);
    }
    if (this.gridColumnApi6) {
      const columnId = column.getColId();
      this.gridColumnApi6.autoSizeColumn(columnId);
    }
  }





  onSelectionChanged(event) {
    this.selectedRows = event.api.getSelectedRows();

  }



  onCellClicked(event) {
    const clickedCellId = event.column.getId() + '_' + event.rowIndex;

    // Only check for clicks on the group cells
    if (event.node && event.node.group) {
      event.node.setExpanded(!event.node.expanded); // Toggle expansion
    }

    // Handle double-click detection
    if (clickedCellId === this.lastClickedCellId) {
      this.clickCount++;
    } else {
      this.clickCount = 1;
      this.lastClickedCellId = clickedCellId;
    }

    console.log(this.clickCount)
    if (this.clickCount === this.resizeThreshold) {
      console.log("true resizze")
      this.resizeColumn(event.column);
      this.clickCount = 0;
    }
  }



  onRowDoubleClicked(event) {
    if (event.node && event.node.group) {
      event.node.setExpanded(!event.node.expanded); // Toggle expansion on double-click
    }
  }




}







