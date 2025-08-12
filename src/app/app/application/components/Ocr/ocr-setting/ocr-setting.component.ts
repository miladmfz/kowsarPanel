import { Component, OnInit, Renderer2 } from '@angular/core';
import { OcrWebApiService } from '../../../services/OcrWebApi.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid-base/ag-grid-base.component';
import { ActivatedRoute, Router } from '@angular/router';
import { NotificationService } from 'src/app/app-shell/framework-services/notification.service';
import { CellActionOcrPrinter } from './cell-action-ocr-printer';
import { CellActionOcrDbsetup } from './cell-action-ocr-dbsetup';
import { ThemeService } from 'src/app/app-shell/framework-services/theme.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-ocr-setting',
  templateUrl: './ocr-setting.component.html',
})
export class OcrSettingComponent extends AgGridBaseComponent
  implements OnInit {



  constructor(
    private repo: OcrWebApiService,
    private readonly router: Router,
    private renderer: Renderer2,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private sharedService: SharedService,
    private readonly notificationService: NotificationService,

    private themeService: ThemeService
  ) {
    super();
  }

  isDarkMode: boolean = false;
  private themeSub!: Subscription;

  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }
  ngOnDestroy() {

    this.themeSub.unsubscribe();

  }




  items: any = [];
  Printers: any = [];
  BasketColumns: any = [];
  AppBasketColumn_Status: string = '';
  Apptype: string = '2';
  selected_des: string = "";
  selected_value: string = "";
  selected_Key: string = "";

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


  override ngOnInit(): void {
    super.ngOnInit();

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });
    this.Config_Declare()
    this.Get_Base_data();

    this.CallService()
  }


  Config_Declare() {

    this.columnDefs = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionOcrDbsetup,

        width: 100,
      },
      {
        field: 'KeyId',
        headerName: 'KeyId',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'KeyValue',
        headerName: 'KeyValue',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'DataValue',
        headerName: 'DataValue',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'Description',
        headerName: 'Description',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
      {
        field: 'SubSystem',
        headerName: 'SubSystem',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150
      },
    ];


    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionOcrPrinter,

        width: 100,
      },
      {
        field: 'PrinterName',
        headerName: 'نام پرینتر',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'PrinterExplain',
        headerName: 'توضیحات',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'GoodGroups',
        headerName: 'گروه کالا',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'WhereClause',
        headerName: 'شروط',
        filter: 'agSetColumnFilter',
        cellClass: 'text-center',
        minWidth: 150,

      },
      {
        field: 'PrintCount',
        headerName: 'نعداد پرینت',
        filter: 'agSetColumnFilter',
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
      this.items = e;

    });
    this.repo.GetAppPrinter(this.Apptype).subscribe(e => {
      this.Printers = e;

    });
    this.GetBasketColumnList();

  }

  CreateAppBasketColumn() {

    this.repo.CreateBasketColumn(this.Apptype).subscribe(e => {
      this.AppBasketColumn_Status = "AppBasketColumn created";
    });

  }

  SelectDbSetup(index) {
    this.selected_des = index.Description;
    this.selected_value = index.DataValue;
    this.selected_Key = index.KeyId;
    this.ocrbsetup_Modal_Response_show()
  }


  UpdateDbSetup() {
    this.repo.UpdateDbSetup(this.selected_value, this.selected_Key).subscribe(e => {
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

    this.repo.GetBasketColumnList(this.Apptype).subscribe(e => {
      this.BasketColumns = e;


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


