import { Component, OnInit } from '@angular/core';
import { ApplicationWebApiService } from '../../../services/ApplicationWebApi.service';

@Component({
  selector: 'app-ocr-setting',
  templateUrl: './ocr-setting.component.html',
})
export class OcrSettingComponent implements OnInit {

  constructor(private repo: ApplicationWebApiService,) { }
  items: any = [];
  Printers: any = [];
  BasketColumns: any = [];
  AppBasketColumn_Status: string = '';
  Apptype: string = '2';
  ngOnInit() {
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


  GetBasketColumnList() {

    this.repo.GetBasketColumnList(this.Apptype).subscribe(e => {
      this.BasketColumns = e;


    });

  }



















}


