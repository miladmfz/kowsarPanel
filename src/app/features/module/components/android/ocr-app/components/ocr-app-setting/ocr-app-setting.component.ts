import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { OcrWebApiService } from 'src/app/features/module/services/OcrWebApi.service';
import { CellActionOcrDbsetup } from './cell-action-ocr-dbsetup';
import { CellActionOcrPrinter } from './cell-action-ocr-printer';
import { AgGridModule } from 'ag-grid-angular';

@Component({
  selector: 'app-ocr-app-setting',
  templateUrl: './ocr-app-setting.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    FormsModule
  ],
})
export class OcrAppSettingComponent extends AgGridBaseComponent
  implements OnInit {


  private readonly repo = inject(OcrWebApiService);
  private readonly sharedService = inject(SharedService);
  private readonly renderer = inject(Renderer2);


  constructor() {
    super();
  }


  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }




  items = signal<any[]>([])
  Printers = signal<any[]>([])
  BasketColumns = signal<any[]>([])
  AppBasketColumn_Status = signal('')
  Apptype = signal('2')
  selected_des = signal('')
  selected_value = signal('')
  selected_Key = signal('')

  EditForm_printer = new FormGroup({
    AppPrinterCode: new FormControl(''),
    PrinterName: new FormControl(''),
    PrinterExplain: new FormControl(''),
    GoodGroups: new FormControl(''),
    WhereClause: new FormControl(''),
    PrintCount: new FormControl(''),
    PrinterActive: new FormControl(''),
    FilePath: new FormControl(''),
  });


  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.Config_Declare()
    this.Get_Base_data();

    this.CallService()
  }


  Config_Declare() {

    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionOcrDbsetup,

        minWidth: 100,
      },
      {
        field: 'KeyId',
        headerName: 'KeyId',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'KeyValue',
        headerName: 'KeyValue',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'DataValue',
        headerName: 'DataValue',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Description',
        headerName: 'Description',

        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'SubSystem',
        headerName: 'SubSystem',

        cellClass: 'text-center',
        minWidth: 150
      },
    ];


    this.columnDefs2 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionOcrPrinter,

        minWidth: 100,
      },
      {
        field: 'PrinterName',
        headerName: 'نام پرینتر',

        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'PrinterExplain',
        headerName: 'توضیحات',

        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'GoodGroups',
        headerName: 'گروه کالا',

        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'WhereClause',
        headerName: 'شروط',

        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'PrintCount',
        headerName: 'نعداد پرینت',

        cellClass: 'text-center',
        minWidth: 150,

      },
    ];



  }

  CallService() {
    this.sharedService.RefreshAllActions$.subscribe(action => {
      if (action === 'refresh') {
        this.refreshpage();
      }
    });
  }

  refreshpage() {
    this.Get_Base_data();
  }




  Get_Base_data() {

    this.repo.Web_GetDbsetupObject("Ocrkowsar").subscribe(e => {
      this.items.set(e)

    });

    this.repo.GetAppPrinter(this.Apptype()).subscribe(e => {
      this.Printers.set(e)

    });
    this.GetBasketColumnList();

  }

  CreateAppBasketColumn() {


    this.repo.CreateBasketColumn(this.Apptype()).subscribe(e => {
      this.AppBasketColumn_Status.set("AppBasketColumn created")
    });

  }

  SelectDbSetup(index) {
    this.selected_des = index.Description;
    this.selected_value = index.DataValue;
    this.selected_Key = index.KeyId;
    this.ocrbsetup_Modal_Response_show()
  }


  UpdateDbSetup() {

    this.repo.UpdateDbSetup(this.selected_value(), this.selected_Key()).subscribe(e => {
      this.sharedService.triggerActionAll('refresh');
      this.ocrbsetup_Modal_Response_close()
    });

  }



  SelectPrinter(index) {
    this.EditForm_printer.patchValue({
      AppPrinterCode: index.AppPrinterCode,
      PrinterName: index.PrinterName,
      PrinterExplain: index.PrinterExplain,
      GoodGroups: index.GoodGroups,
      WhereClause: index.WhereClause,
      PrintCount: index.PrintCount,
      PrinterActive: index.PrinterActive,
      FilePath: index.FilePath,
    });
    this.printerModal_Modal_Response_show()

  }

  Updateprinter() {

    const command = this.EditForm_printer.value
    if (this.EditForm_printer.value.PrinterName !== "") {

      this.repo.UpdatePrinter(command).subscribe(e => {
        this.printerModal_Modal_Response_close()

        this.sharedService.triggerActionAll('refresh');
      });
    }
  }

  CreateprinterRecord() {
    this.EditForm_printer.reset();
  }


  GetBasketColumnList() {


    this.repo.GetBasketColumnList(this.Apptype()).subscribe(e => {
      this.BasketColumns.set(e)


    });

  }


  printerModal_Modal_Response_show() {
    const modal = this.renderer.selectRootElement('#printerModal', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  printerModal_Modal_Response_close() {
    const modal = this.renderer.selectRootElement('#printerModal', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }



  ocrbsetup_Modal_Response_show() {
    const modal = this.renderer.selectRootElement('#ocrbsetup', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  ocrbsetup_Modal_Response_close() {
    const modal = this.renderer.selectRootElement('#ocrbsetup', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }










}


