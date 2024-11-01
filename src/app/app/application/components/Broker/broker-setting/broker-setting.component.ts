import { Component, OnInit } from '@angular/core';
import { BrokerWebApiService } from '../../../services/BrokerWebApi.service';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-broker-setting',
  templateUrl: './broker-setting.component.html',
})
export class BrokerSettingComponent implements OnInit {

  constructor(private repo: BrokerWebApiService,) { }
  items: any = [];
  Printers: any = [];

  BasketColumns: any = [];

  Apptype: string = '1';
  isLoading: boolean = false;
  KowsarDb_name: string = '';
  KowsarImage_name: string = '';
  AppBroker_Status: string = '';
  AppBasketColumn_Status: string = '';
  BrokerCustomer_Status: string = '';
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




  ngOnInit() {

    this.repo.Web_GetDbsetupObject("BrokerKowsar").subscribe(e => {
      this.items = e;

    });
    this.repo.GetAppPrinter(this.Apptype).subscribe(e => {
      this.Printers = e;

    });
    this.GetBasketColumnList();

  }



  onInputChange() {


  }



  SelectDbSetup(index: any) {
    this.selected_des = this.items[index].Description;
    this.selected_value = this.items[index].DataValue;
    this.selected_Key = this.items[index].KeyId;

  }

  UpdateDbSetup() {
    this.repo.UpdateDbSetup(this.selected_value, this.selected_Key).subscribe(e => {
      location.reload();
    });

  }



  SelectPrinter(index: any) {
    this.EditForm_printer.patchValue({
      AppPrinterCode: this.Printers[index].AppPrinterCode,
      PrinterName: this.Printers[index].PrinterName,
      PrinterExplain: this.Printers[index].PrinterExplain,
      GoodGroups: this.Printers[index].GoodGroups,
      WhereClause: this.Printers[index].WhereClause,
      PrintCount: this.Printers[index].PrintCount,
      PrinterActive: this.Printers[index].PrinterActive,
      FilePath: this.Printers[index].FilePath,
    });
  }

  Updateprinter() {

    const command = this.EditForm_printer.value
    if (this.EditForm_printer.value.PrinterName !== "") {
      this.repo.UpdatePrinter(command).subscribe(e => {
        location.reload();
      });
    }
  }

  CreateprinterRecord() {
    this.EditForm_printer.reset();
  }




  CreateAppbroker() {
    this.isLoading = true
    if (this.KowsarDb_name.length === 0) {
      this.KowsarDb_name = 'KowsarDb'
    }

    if (this.KowsarImage_name.length === 0) {
      this.KowsarImage_name = 'KowsarImage'
    }

    this.repo.CreateAppBroker(this.KowsarDb_name, this.KowsarImage_name).subscribe(e => {
      this.AppBroker_Status = "AppBroker created";
      if (e[0].count > 0) {
        this.AppBasketColumn_Status = "AppBasketColumn created";
        this.isLoading = false

      } else {
        this.AppBasketColumn_Status = "AppBasketColumn  Not created";
        this.isLoading = false

      }


    });

  }

  CreateAppBasketColumn() {

    this.repo.CreateBasketColumn(this.Apptype).subscribe(e => {

      this.AppBasketColumn_Status = "AppBasketColumn created";
    });

  }

  BrokerCustomerRefresh() {

    this.repo.BrokerCustomerRefresh().subscribe(e => {
      this.BrokerCustomer_Status = "AppBasketColumn created";
    });

  }


  GetBasketColumnList() {

    this.repo.GetBasketColumnList(this.Apptype).subscribe(e => {
      this.BasketColumns = e;


    });

  }



}
