import { CommonModule } from '@angular/common';
import { Component, inject, OnInit, Renderer2, signal } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AgGridBaseComponent } from 'src/app/app-shell/framework-components/ag-grid/base';
import { SharedService } from 'src/app/app-shell/framework-services/shared.service';
import { NotificationService } from 'src/app/app-shell/framework-services/ui/notification.service';
import { BrokerWebApiService } from 'src/app/features/module/services/BrokerWebApi.service';
import { CellActionBrokerDbsetup } from './cell-action-broker-dbsetup';
import { CellActionBrokerPrinter } from './cell-action-broker-printer';
import { AgGridModule } from 'ag-grid-angular';

@Component({
  selector: 'app-broker-app-setting',
  templateUrl: './broker-app-setting.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    AgGridModule,
  ],
})
export class BrokerAppSettingComponent extends AgGridBaseComponent
  implements OnInit {


  private readonly repo = inject(BrokerWebApiService);
  private readonly sharedService = inject(SharedService);
  private readonly notificationService = inject(NotificationService);
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

  Apptype = signal('1')
  isLoading = signal(true)
  KowsarDb_name = signal('')
  KowsarImage_name = signal('')
  AppBroker_Status = signal('')
  AppBasketColumn_Status = signal('')
  BrokerCustomer_Status = signal('')
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

  CallService() {
    this.sharedService.RefreshAllActions$.subscribe(action => {
      if (action === 'refresh') {
        this.refreshpage();
      }
    });
  }





  Config_Declare() {

    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionBrokerDbsetup,

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


    this.column_name_1 = [
      {
        field: 'عملیات',
        pinned: 'left',
        cellRenderer: CellActionBrokerPrinter,

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



  refreshpage() {
    this.Get_Base_data();
  }




  Get_Base_data() {

    this.repo.Web_GetDbsetupObject("BrokerKowsar").subscribe(e => {
      this.items.set(e)

    });

    this.repo.GetAppPrinter(this.Apptype()).subscribe(e => {
      this.Printers.set(e)

    });
    this.GetBasketColumnList();

  }

  onInputChange() {


  }

  SelectDbSetup(singledbsetup) {

    this.selected_des = singledbsetup.Description;
    this.selected_value = singledbsetup.DataValue;
    this.selected_Key = singledbsetup.KeyId;
    this.brokerdbsetup_Modal_Response_show()
  }

  UpdateDbSetup() {

    this.repo.UpdateDbSetup(this.selected_value(), this.selected_Key()).subscribe(e => {
      this.notificationService.succeded();

      this.sharedService.triggerActionAll('refresh');
      this.brokerdbsetup_Modal_Response_close()
    });

  }



  SelectPrinter(singleprinter) {
    this.EditForm_printer.patchValue({
      AppPrinterCode: singleprinter.AppPrinterCode,
      PrinterName: singleprinter.PrinterName,
      PrinterExplain: singleprinter.PrinterExplain,
      GoodGroups: singleprinter.GoodGroups,
      WhereClause: singleprinter.WhereClause,
      PrintCount: singleprinter.PrintCount,
      PrinterActive: singleprinter.PrinterActive,
      FilePath: singleprinter.FilePath,
    });
    this.printerModal_Modal_Response_show()
  }

  Updateprinter() {

    const command = this.EditForm_printer.value
    if (this.EditForm_printer.value.PrinterName !== "") {

      this.repo.UpdatePrinter(command).subscribe(e => {
        this.notificationService.succeded();

        this.sharedService.triggerActionAll('refresh');
        this.printerModal_Modal_Response_close()

      });
    }
  }

  CreateprinterRecord() {
    this.EditForm_printer.reset();
  }






  CreateAppBasketColumn() {


    this.repo.CreateBasketColumn(this.Apptype()).subscribe(e => {

      this.AppBasketColumn_Status.set("AppBasketColumn created")
    });

  }

  BrokerCustomerRefresh() {


    this.repo.BrokerCustomerRefresh().subscribe(e => {
      this.BrokerCustomer_Status.set("AppBasketColumn created")
    });

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



  brokerdbsetup_Modal_Response_show() {
    const modal = this.renderer.selectRootElement('#brokerdbsetup', true);
    this.renderer.addClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'block');
    this.renderer.setAttribute(modal, 'aria-modal', 'true');
    this.renderer.setAttribute(modal, 'role', 'dialog');
  }
  brokerdbsetup_Modal_Response_close() {
    const modal = this.renderer.selectRootElement('#brokerdbsetup', true);
    this.renderer.removeClass(modal, 'show');
    this.renderer.setStyle(modal, 'display', 'none');
    this.renderer.removeAttribute(modal, 'aria-modal');
    this.renderer.removeAttribute(modal, 'role');
  }





}
