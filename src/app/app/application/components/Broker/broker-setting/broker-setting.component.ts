import { Component, OnInit } from '@angular/core';
import { ApplicationWebApiService } from '../../../services/ApplicationWebApi.service';

@Component({
  selector: 'app-broker-setting',
  templateUrl: './broker-setting.component.html',
})
export class BrokerSettingComponent implements OnInit {

  constructor(private repo: ApplicationWebApiService,) { }
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
    console.log('User input:', this.KowsarDb_name);
    console.log('User input:', this.KowsarImage_name);

  }

  selected_des: string = "";
  selected_value: string = "";
  selected_Key: string = "";

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



  AppPrinterCode: string = "";
  PrinterName: string = "";
  PrinterExplain: string = "";
  GoodGroups: string = "";
  WhereClause: string = "";
  PrintCount: string = "";
  PrinterActive: string = "";
  FilePath: string = "";

  SelectPrinter(index: any) {

    this.AppPrinterCode = this.Printers[index].AppPrinterCode
    this.PrinterName = this.Printers[index].PrinterName
    this.PrinterExplain = this.Printers[index].PrinterExplain
    this.GoodGroups = this.Printers[index].GoodGroups
    this.WhereClause = this.Printers[index].WhereClause
    this.PrintCount = this.Printers[index].PrintCount
    this.PrinterActive = this.Printers[index].PrinterActive
    this.FilePath = this.Printers[index].FilePath


  }

  Updateprinter() {

    if (this.PrinterName !== "") {
      this.repo.UpdatePrinter(
        this.AppPrinterCode,
        this.PrinterName,
        this.PrinterExplain,
        this.GoodGroups,
        this.WhereClause,
        this.PrintCount,
        this.PrinterActive,
        this.FilePath,
        this.Apptype,
      ).subscribe(e => {
        location.reload();
      });

      // Your code here if AppPrinterCode is equal to "0"
    }




  }

  CreateprinterRecord() {
    this.AppPrinterCode = "0"
    this.PrinterName = ""
    this.PrinterExplain = ""
    this.GoodGroups = ""
    this.WhereClause = ""
    this.PrintCount = ""
    this.PrinterActive = ""
    this.FilePath = ""

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
