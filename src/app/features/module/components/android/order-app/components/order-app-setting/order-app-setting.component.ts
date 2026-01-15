import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { OrderWebApiService } from 'src/app/features/module/services/OrderWebApi.service';
import { CellActionOrderDbsetup } from './cell-action-order-dbsetup';
import { CellActionOrderPrinter } from './cell-action-order-printer';
import { catchError, of } from 'rxjs';
import { AgGridModule } from 'ag-grid-angular';

@Component({
  selector: 'app-order-app-setting',
  templateUrl: './order-app-setting.component.html',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
    FormsModule
  ],
})
export class OrderAppSettingComponent extends AgGridBaseComponent
  implements OnInit {

  private readonly repo = inject(OrderWebApiService);
  private readonly sharedService = inject(SharedService);
  private readonly notificationService = inject(NotificationService);
  private readonly renderer = inject(Renderer2);


  constructor() {
    super();
  }



  toggleTheme() {
    this.themeService.toggleTheme(); // از سرویس تم استفاده کن
  }


  items: any = [];
  Printers: any = [];
  BasketColumns: any = [];

  Apptype: string = '3';


  AppBroker_Status: string = '';
  AppBasketColumn_Status: string = '';
  BrokerCustomer_Status: string = '';




  ngOnInit(): void {

    this.themeSub = this.themeService.theme$.subscribe(mode => {
      this.isDarkMode = (mode === 'dark');
    });


    this.Config_Declare()
    this.Get_Base_data();

    this.CallService()
  }



  Config_Declare() {

    this.columnDefs1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionOrderDbsetup,

        minWidth: 100,
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


    this.columnDefs2 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionOrderPrinter,

        minWidth: 100,
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
    this.repo.Web_GetDbsetupObject("OrderKowsar")
      .subscribe(e => {
        this.items = e;

      });
    this.repo.GetAppPrinter(this.Apptype)
      .subscribe(e => {
        this.Printers = e;

      });
    this.GetBasketColumnList();

  }




  selected_des: string = "";
  selected_value: string = "";
  selected_Key: string = "";

  SelectDbSetup(index) {
    this.selected_des = index.Description;
    this.selected_value = index.DataValue;
    this.selected_Key = index.KeyId;
    this.orderdbsetup_Modal_Response_show()
  }


  UpdateDbSetup() {
    this.repo.UpdateDbSetup(this.selected_value, this.selected_Key)
      .subscribe(e => {
        this.orderdbsetup_Modal_Response_close()
        this.sharedService.triggerActionAll('refresh');
      });

  }

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
      this.repo.UpdatePrinter(command).pipe(
        catchError(error => {
          this.notificationService.error('مشکل در برقراری ارتباط', "خطا");
          return of(null); // یا هر مقدار جایگزین
        })).subscribe(e => {
          this.sharedService.triggerActionAll('refresh');
          this.printerModal_Modal_Response_close()
        });
    }
  }

  CreateprinterRecord() {
    this.EditForm_printer.reset();
  }



  CreateAppBasketColumn() {

    this.repo.CreateBasketColumn(this.Apptype)
      .subscribe(e => {
        this.AppBasketColumn_Status = "AppBasketColumn created";
      });

  }



  GetBasketColumnList() {

    this.repo.GetBasketColumnList(this.Apptype)
      .subscribe(e => {
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



  orderdbsetup_Modal_Response_show() {
    const modal = this.renderer.selectRootElement('#orderdbsetup', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  orderdbsetup_Modal_Response_close() {
    const modal = this.renderer.selectRootElement('#orderdbsetup', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }


}
